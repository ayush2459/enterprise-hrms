from datetime import datetime, timezone
from uuid import UUID
import json

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.enums import RoleEnum
from app.models.expense import Expense
from app.models.expense_approval_history import ExpenseApprovalHistory
from app.models.expense_document import ExpenseDocument
from app.models.travel_request import TravelRequest
from app.models.travel_document import TravelDocument
from app.models.user import User
from app.services.user_employee_resolver import get_employee_for_user
from app.core.redis import redis_client


HR_ROLES = {
    RoleEnum.HR_ADMIN,
    RoleEnum.HR_EXECUTIVE,
    RoleEnum.SYSTEM_ADMIN,
}


class ExpenseTravelService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def employee(self, user: User) -> Employee:
        try:
            return await get_employee_for_user(self.db, user)
        except ValueError as exc:
            raise HTTPException(
                404,
                "No employee profile is linked to this account.",
            ) from exc

    async def employee_by_id(self, employee_id: UUID) -> Employee:
        employee = await self.db.get(Employee, employee_id)
        if not employee:
            raise HTTPException(404, "Employee not found.")
        return employee

    async def publish(self, user_id, event: str, **payload):
        message = {
            "type": "expense_travel",
            "event": event,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **payload,
        }
        try:
            await redis_client.publish(
                f"user:{str(user_id)}",
                json.dumps(message),
            )
        except Exception:
            # Realtime must never break an approval transaction.
            pass

    async def publish_employee(self, employee_id, event: str, **payload):
        employee = await self.employee_by_id(employee_id)
        if employee.user_id:
            await self.publish(employee.user_id, event, **payload)

    async def can_manager_act(self, manager_user: User, employee_id: UUID):
        manager = await self.employee(manager_user)
        employee = await self.employee_by_id(employee_id)
        return employee.reporting_manager_id == manager.id

    async def add_history(
        self,
        request_type,
        request_id,
        action,
        user_id,
        comment=None,
    ):
        self.db.add(
            ExpenseApprovalHistory(
                request_type=request_type,
                request_id=request_id,
                action=action,
                performed_by=user_id,
                comment=comment,
            )
        )

    async def validate_documents(self, document_ids, employee_id):
        if not document_ids:
            return

        from app.models.document import Document

        result = await self.db.execute(
            select(Document).where(
                Document.id.in_(document_ids),
                Document.employee_id == employee_id,
            )
        )

        found = {x.id for x in result.scalars().all()}
        missing = set(document_ids) - found

        if missing:
            raise HTTPException(
                400,
                "One or more documents do not belong to this employee.",
            )

    async def create_expense(self, user, payload):
        employee = await self.employee(user)

        await self.validate_documents(
            payload.document_ids,
            employee.id,
        )

        expense = Expense(
            employee_id=employee.id,
            category=payload.category,
            amount=payload.amount,
            currency=payload.currency,
            expense_date=payload.expense_date,
            description=payload.description,
            status="pending_manager",
            manager_status="pending",
            hr_status="pending",
        )

        self.db.add(expense)
        await self.db.flush()

        for document_id in payload.document_ids:
            self.db.add(
                ExpenseDocument(
                    expense_id=expense.id,
                    document_id=document_id,
                )
            )

        await self.add_history(
            "expense",
            expense.id,
            "submitted",
            user.id,
        )

        await self.db.commit()
        await self.db.refresh(expense)

        if employee.reporting_manager_id:
            manager = await self.db.get(Employee, employee.reporting_manager_id)
            if manager and manager.user_id:
                await self.publish(
                    manager.user_id,
                    "expense_submitted",
                    request_id=str(expense.id),
                    employee_id=str(employee.id),
                )

        await self.publish(
            user.id,
            "expense_submitted",
            request_id=str(expense.id),
        )

        return expense

    async def create_travel(self, user, payload):
        employee = await self.employee(user)

        await self.validate_documents(
            payload.document_ids,
            employee.id,
        )

        travel = TravelRequest(
            employee_id=employee.id,
            destination=payload.destination,
            purpose=payload.purpose,
            start_date=payload.start_date,
            end_date=payload.end_date,
            transport=payload.transport,
            accommodation=payload.accommodation,
            estimated_cost=payload.estimated_cost,
            currency=payload.currency,
            advance_required=payload.advance_required,
            advance_amount=payload.advance_amount,
            notes=payload.notes,
            status="pending_manager",
            manager_status="pending",
            hr_status="pending",
        )

        self.db.add(travel)
        await self.db.flush()

        for document_id in payload.document_ids:
            self.db.add(
                TravelDocument(
                    travel_request_id=travel.id,
                    document_id=document_id,
                )
            )

        await self.add_history(
            "travel",
            travel.id,
            "submitted",
            user.id,
        )

        await self.db.commit()
        await self.db.refresh(travel)

        if employee.reporting_manager_id:
            manager = await self.db.get(Employee, employee.reporting_manager_id)
            if manager and manager.user_id:
                await self.publish(
                    manager.user_id,
                    "travel_submitted",
                    request_id=str(travel.id),
                    employee_id=str(employee.id),
                )

        await self.publish(
            user.id,
            "travel_submitted",
            request_id=str(travel.id),
        )

        return travel

    async def _manager_decision(
        self,
        request,
        request_type,
        user,
        approve,
        comment,
    ):
        if not await self.can_manager_act(user, request.employee_id):
            raise HTTPException(
                403,
                "You can only approve requests from your direct reports.",
            )

        if request.manager_status != "pending":
            raise HTTPException(
                400,
                "This request has already been reviewed by the manager.",
            )

        request.manager_status = "approved" if approve else "rejected"
        request.manager_decided_by = user.id
        request.manager_decided_at = datetime.now(timezone.utc)
        request.manager_comment = comment
        request.status = "pending_hr" if approve else "rejected"

        await self.add_history(
            request_type,
            request.id,
            "manager_approved" if approve else "manager_rejected",
            user.id,
            comment,
        )

        await self.db.commit()
        await self.db.refresh(request)

        await self.publish_employee(
            request.employee_id,
            f"{request_type}_manager_{'approved' if approve else 'rejected'}",
            request_id=str(request.id),
            comment=comment,
        )

        if approve:
            for hr_role in HR_ROLES:
                pass

            await self.publish(
                user.id,
                f"{request_type}_manager_approved",
                request_id=str(request.id),
            )

        return request

    async def manager_expense_decision(self, expense_id, user, approve, comment):
        expense = await self.db.get(Expense, expense_id)
        if not expense:
            raise HTTPException(404, "Expense not found.")
        return await self._manager_decision(
            expense, "expense", user, approve, comment
        )

    async def manager_travel_decision(self, travel_id, user, approve, comment):
        travel = await self.db.get(TravelRequest, travel_id)
        if not travel:
            raise HTTPException(404, "Travel request not found.")
        return await self._manager_decision(
            travel, "travel", user, approve, comment
        )

    async def _clarify(self, request, request_type, user, comment):
        if not await self.can_manager_act(user, request.employee_id):
            raise HTTPException(
                403,
                "You can only request clarification from your direct reports.",
            )

        request.status = "clarification_required"
        request.manager_status = "clarification"
        request.manager_decided_by = user.id
        request.manager_decided_at = datetime.now(timezone.utc)
        request.manager_comment = comment

        await self.add_history(
            request_type,
            request.id,
            "manager_clarification_requested",
            user.id,
            comment,
        )

        await self.db.commit()
        await self.db.refresh(request)

        await self.publish_employee(
            request.employee_id,
            f"{request_type}_clarification_requested",
            request_id=str(request.id),
            comment=comment,
        )

        return request

    async def manager_expense_clarification(self, expense_id, user, comment):
        row = await self.db.get(Expense, expense_id)
        if not row:
            raise HTTPException(404, "Expense not found.")
        return await self._clarify(row, "expense", user, comment)

    async def manager_travel_clarification(self, travel_id, user, comment):
        row = await self.db.get(TravelRequest, travel_id)
        if not row:
            raise HTTPException(404, "Travel request not found.")
        return await self._clarify(row, "travel", user, comment)

    async def _hr_decision(
        self,
        request,
        request_type,
        user,
        approve,
        comment,
    ):
        if user.role not in HR_ROLES:
            raise HTTPException(403, "Only HR/Admin users can perform HR approval.")

        if request.manager_status != "approved":
            raise HTTPException(
                400,
                "Cannot approve at HR level before manager approval.",
            )

        if request.hr_status != "pending":
            raise HTTPException(
                400,
                "This request has already been reviewed by HR.",
            )

        request.hr_status = "approved" if approve else "rejected"
        request.hr_decided_by = user.id
        request.hr_decided_at = datetime.now(timezone.utc)
        request.hr_comment = comment
        request.status = "approved" if approve else "rejected"

        await self.add_history(
            request_type,
            request.id,
            "hr_approved" if approve else "hr_rejected",
            user.id,
            comment,
        )

        await self.db.commit()
        await self.db.refresh(request)

        await self.publish_employee(
            request.employee_id,
            f"{request_type}_hr_{'approved' if approve else 'rejected'}",
            request_id=str(request.id),
            comment=comment,
        )

        return request

    async def hr_expense_decision(self, expense_id, user, approve, comment):
        row = await self.db.get(Expense, expense_id)
        if not row:
            raise HTTPException(404, "Expense not found.")
        return await self._hr_decision(row, "expense", user, approve, comment)

    async def hr_travel_decision(self, travel_id, user, approve, comment):
        row = await self.db.get(TravelRequest, travel_id)
        if not row:
            raise HTTPException(404, "Travel request not found.")
        return await self._hr_decision(row, "travel", user, approve, comment)

    async def _hr_clarify(self, request, request_type, user, comment):
        if user.role not in HR_ROLES:
            raise HTTPException(403, "Only HR/Admin users can request clarification.")

        if request.manager_status != "approved":
            raise HTTPException(
                400,
                "HR clarification is available after manager approval.",
            )

        request.status = "clarification_required"
        request.hr_status = "clarification"
        request.hr_decided_by = user.id
        request.hr_decided_at = datetime.now(timezone.utc)
        request.hr_comment = comment

        await self.add_history(
            request_type,
            request.id,
            "hr_clarification_requested",
            user.id,
            comment,
        )

        await self.db.commit()
        await self.db.refresh(request)

        await self.publish_employee(
            request.employee_id,
            f"{request_type}_hr_clarification_requested",
            request_id=str(request.id),
            comment=comment,
        )

        return request

    async def hr_expense_clarification(self, expense_id, user, comment):
        row = await self.db.get(Expense, expense_id)
        if not row:
            raise HTTPException(404, "Expense not found.")
        return await self._hr_clarify(row, "expense", user, comment)

    async def hr_travel_clarification(self, travel_id, user, comment):
        row = await self.db.get(TravelRequest, travel_id)
        if not row:
            raise HTTPException(404, "Travel request not found.")
        return await self._hr_clarify(row, "travel", user, comment)

    async def _employee_resubmit(
        self,
        request,
        request_type,
        user,
        comment,
    ):
        employee = await self.employee(user)

        if request.employee_id != employee.id:
            raise HTTPException(403, "You can only resubmit your own request.")

        if request.status != "clarification_required":
            raise HTTPException(
                400,
                "This request does not currently require clarification.",
            )

        request.status = "pending_manager"
        request.manager_status = "pending"
        request.manager_decided_by = None
        request.manager_decided_at = None
        request.manager_comment = comment
        request.hr_status = "pending"
        request.hr_decided_by = None
        request.hr_decided_at = None
        request.hr_comment = None

        await self.add_history(
            request_type,
            request.id,
            "resubmitted",
            user.id,
            comment,
        )

        await self.db.commit()
        await self.db.refresh(request)

        if employee.reporting_manager_id:
            manager = await self.db.get(Employee, employee.reporting_manager_id)
            if manager and manager.user_id:
                await self.publish(
                    manager.user_id,
                    f"{request_type}_resubmitted",
                    request_id=str(request.id),
                )

        await self.publish(
            user.id,
            f"{request_type}_resubmitted",
            request_id=str(request.id),
        )

        return request

    async def resubmit_expense(self, expense_id, user, comment):
        row = await self.db.get(Expense, expense_id)
        if not row:
            raise HTTPException(404, "Expense not found.")
        return await self._employee_resubmit(row, "expense", user, comment)

    async def resubmit_travel(self, travel_id, user, comment):
        row = await self.db.get(TravelRequest, travel_id)
        if not row:
            raise HTTPException(404, "Travel request not found.")
        return await self._employee_resubmit(row, "travel", user, comment)

    async def settle(self, request, request_type, user, amount, reference):
        if user.role not in HR_ROLES:
            raise HTTPException(403, "Only HR/Admin users can settle requests.")

        if request.status != "approved":
            raise HTTPException(
                400,
                "Only HR-approved requests can be settled.",
            )

        default_amount = (
            request.amount
            if request_type == "expense"
            else request.estimated_cost
        )

        request.settlement_status = "settled"
        request.settled_amount = amount or default_amount
        request.settlement_reference = reference
        request.settled_at = datetime.now(timezone.utc)
        request.status = "settled"

        await self.add_history(
            request_type,
            request.id,
            "settled",
            user.id,
            reference,
        )

        await self.db.commit()
        await self.db.refresh(request)

        await self.publish_employee(
            request.employee_id,
            f"{request_type}_settled",
            request_id=str(request.id),
            settled_amount=str(request.settled_amount),
            settlement_reference=reference,
        )

        return request

    async def get_expenses_for_user(self, user):
        if user.role in HR_ROLES:
            result = await self.db.execute(
                select(Expense).order_by(Expense.created_at.desc())
            )
        else:
            employee = await self.employee(user)
            result = await self.db.execute(
                select(Expense)
                .where(Expense.employee_id == employee.id)
                .order_by(Expense.created_at.desc())
            )
        return list(result.scalars().all())

    async def get_travel_for_user(self, user):
        if user.role in HR_ROLES:
            result = await self.db.execute(
                select(TravelRequest).order_by(TravelRequest.created_at.desc())
            )
        else:
            employee = await self.employee(user)
            result = await self.db.execute(
                select(TravelRequest)
                .where(TravelRequest.employee_id == employee.id)
                .order_by(TravelRequest.created_at.desc())
            )
        return list(result.scalars().all())

    async def get_manager_expenses(self, user):
        employee = await self.employee(user)
        result = await self.db.execute(
            select(Expense)
            .join(Employee, Expense.employee_id == Employee.id)
            .where(
                Employee.reporting_manager_id == employee.id,
                Expense.manager_status == "pending",
            )
            .order_by(Expense.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_manager_travel(self, user):
        employee = await self.employee(user)
        result = await self.db.execute(
            select(TravelRequest)
            .join(Employee, TravelRequest.employee_id == Employee.id)
            .where(
                Employee.reporting_manager_id == employee.id,
                TravelRequest.manager_status == "pending",
            )
            .order_by(TravelRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_hr_expenses(self, user):
        if user.role not in HR_ROLES:
            raise HTTPException(403, "HR/Admin access required.")

        result = await self.db.execute(
            select(Expense)
            .where(
                Expense.manager_status == "approved",
                Expense.hr_status == "pending",
            )
            .order_by(Expense.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_hr_travel(self, user):
        if user.role not in HR_ROLES:
            raise HTTPException(403, "HR/Admin access required.")

        result = await self.db.execute(
            select(TravelRequest)
            .where(
                TravelRequest.manager_status == "approved",
                TravelRequest.hr_status == "pending",
            )
            .order_by(TravelRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_hr_settlement_expenses(self, user):
        if user.role not in HR_ROLES:
            raise HTTPException(403, "HR/Admin access required.")

        result = await self.db.execute(
            select(Expense)
            .where(
                Expense.hr_status == "approved",
                Expense.status == "approved",
                Expense.settlement_status != "settled",
            )
            .order_by(Expense.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_hr_settlement_travel(self, user):
        if user.role not in HR_ROLES:
            raise HTTPException(403, "HR/Admin access required.")

        result = await self.db.execute(
            select(TravelRequest)
            .where(
                TravelRequest.hr_status == "approved",
                TravelRequest.status == "approved",
                TravelRequest.settlement_status != "settled",
            )
            .order_by(TravelRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def history(self, request_type, request_id):
        result = await self.db.execute(
            select(ExpenseApprovalHistory)
            .where(
                ExpenseApprovalHistory.request_type == request_type,
                ExpenseApprovalHistory.request_id == request_id,
            )
            .order_by(ExpenseApprovalHistory.created_at.asc())
        )
        return list(result.scalars().all())

    async def document_ids(self, request_type, request_id):
        if request_type == "expense":
            result = await self.db.execute(
                select(ExpenseDocument.document_id)
                .where(ExpenseDocument.expense_id == request_id)
            )
        else:
            result = await self.db.execute(
                select(TravelDocument.document_id)
                .where(TravelDocument.travel_request_id == request_id)
            )

        return list(result.scalars().all())
