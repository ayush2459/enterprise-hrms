from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.expense import Expense
from app.models.travel_request import TravelRequest
from app.models.user import User
from app.schemas.expense import (
    ApprovalHistoryRead,
    ExpenseClarification,
    ExpenseCreate,
    ExpenseDecision,
    ExpenseRead,
    ExpenseSettlement,
)
from app.schemas.travel import (
    TravelClarification,
    TravelCreate,
    TravelDecision,
    TravelRead,
    TravelSettlement,
)
from app.services.expense_service import ExpenseTravelService, HR_ROLES

router = APIRouter(prefix="/expenses", tags=["expenses-and-travel"])


async def _expense_read(service, expense):
    data = ExpenseRead.model_validate(expense)
    data.document_ids = await service.document_ids("expense", expense.id)
    return data


async def _travel_read(service, travel):
    data = TravelRead.model_validate(travel)
    data.document_ids = await service.document_ids("travel", travel.id)
    return data


@router.post("", response_model=ExpenseRead, status_code=201)
async def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    return await _expense_read(
        svc,
        await svc.create_expense(current_user, payload),
    )


@router.get("", response_model=list[ExpenseRead])
async def list_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_expenses_for_user(current_user)
    return [await _expense_read(svc, x) for x in rows]


@router.get("/manager/pending", response_model=list[ExpenseRead])
async def manager_pending_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_manager_expenses(current_user)
    return [await _expense_read(svc, x) for x in rows]


@router.get("/hr/pending", response_model=list[ExpenseRead])
async def hr_pending_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_hr_expenses(current_user)
    return [await _expense_read(svc, x) for x in rows]


@router.get("/hr/settlement-pending", response_model=list[ExpenseRead])
async def hr_settlement_pending_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_hr_settlement_expenses(current_user)
    return [await _expense_read(svc, x) for x in rows]


@router.post("/{expense_id}/manager-decision", response_model=ExpenseRead)
async def manager_expense_decision(
    expense_id: UUID,
    payload: ExpenseDecision,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.manager_expense_decision(
        expense_id,
        current_user,
        payload.approve,
        payload.comment,
    )
    return await _expense_read(svc, row)


@router.post("/{expense_id}/manager-clarification", response_model=ExpenseRead)
async def manager_expense_clarification(
    expense_id: UUID,
    payload: ExpenseClarification,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.manager_expense_clarification(
        expense_id,
        current_user,
        payload.comment,
    )
    return await _expense_read(svc, row)


@router.post("/{expense_id}/hr-decision", response_model=ExpenseRead)
async def hr_expense_decision(
    expense_id: UUID,
    payload: ExpenseDecision,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.hr_expense_decision(
        expense_id,
        current_user,
        payload.approve,
        payload.comment,
    )
    return await _expense_read(svc, row)


@router.post("/{expense_id}/hr-clarification", response_model=ExpenseRead)
async def hr_expense_clarification(
    expense_id: UUID,
    payload: ExpenseClarification,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.hr_expense_clarification(
        expense_id,
        current_user,
        payload.comment,
    )
    return await _expense_read(svc, row)


@router.post("/{expense_id}/resubmit", response_model=ExpenseRead)
async def resubmit_expense(
    expense_id: UUID,
    payload: ExpenseClarification,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.resubmit_expense(
        expense_id,
        current_user,
        payload.comment,
    )
    return await _expense_read(svc, row)


@router.post("/{expense_id}/settle", response_model=ExpenseRead)
async def settle_expense(
    expense_id: UUID,
    payload: ExpenseSettlement,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    expense = await db.get(Expense, expense_id)

    if not expense:
        raise HTTPException(404, "Expense not found.")

    row = await svc.settle(
        expense,
        "expense",
        current_user,
        payload.settled_amount,
        payload.settlement_reference,
    )
    return await _expense_read(svc, row)


@router.post("/travel", response_model=TravelRead, status_code=201)
async def create_travel(
    payload: TravelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    return await _travel_read(
        svc,
        await svc.create_travel(current_user, payload),
    )


@router.get("/travel", response_model=list[TravelRead])
async def list_travel(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_travel_for_user(current_user)
    return [await _travel_read(svc, x) for x in rows]


@router.get("/travel/manager/pending", response_model=list[TravelRead])
async def manager_pending_travel(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_manager_travel(current_user)
    return [await _travel_read(svc, x) for x in rows]


@router.get("/travel/hr/pending", response_model=list[TravelRead])
async def hr_pending_travel(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_hr_travel(current_user)
    return [await _travel_read(svc, x) for x in rows]


@router.get("/travel/hr/settlement-pending", response_model=list[TravelRead])
async def hr_settlement_pending_travel(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    rows = await svc.get_hr_settlement_travel(current_user)
    return [await _travel_read(svc, x) for x in rows]


@router.post("/travel/{travel_id}/manager-decision", response_model=TravelRead)
async def manager_travel_decision(
    travel_id: UUID,
    payload: TravelDecision,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.manager_travel_decision(
        travel_id,
        current_user,
        payload.approve,
        payload.comment,
    )
    return await _travel_read(svc, row)


@router.post("/travel/{travel_id}/manager-clarification", response_model=TravelRead)
async def manager_travel_clarification(
    travel_id: UUID,
    payload: TravelClarification,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.manager_travel_clarification(
        travel_id,
        current_user,
        payload.comment,
    )
    return await _travel_read(svc, row)


@router.post("/travel/{travel_id}/hr-decision", response_model=TravelRead)
async def hr_travel_decision(
    travel_id: UUID,
    payload: TravelDecision,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.hr_travel_decision(
        travel_id,
        current_user,
        payload.approve,
        payload.comment,
    )
    return await _travel_read(svc, row)


@router.post("/travel/{travel_id}/hr-clarification", response_model=TravelRead)
async def hr_travel_clarification(
    travel_id: UUID,
    payload: TravelClarification,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.hr_travel_clarification(
        travel_id,
        current_user,
        payload.comment,
    )
    return await _travel_read(svc, row)


@router.post("/travel/{travel_id}/resubmit", response_model=TravelRead)
async def resubmit_travel(
    travel_id: UUID,
    payload: TravelClarification,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    row = await svc.resubmit_travel(
        travel_id,
        current_user,
        payload.comment,
    )
    return await _travel_read(svc, row)


@router.post("/travel/{travel_id}/settle", response_model=TravelRead)
async def settle_travel(
    travel_id: UUID,
    payload: TravelSettlement,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = ExpenseTravelService(db)
    travel = await db.get(TravelRequest, travel_id)

    if not travel:
        raise HTTPException(404, "Travel request not found.")

    row = await svc.settle(
        travel,
        "travel",
        current_user,
        payload.settled_amount,
        payload.settlement_reference,
    )
    return await _travel_read(svc, row)


@router.get("/history/{request_type}/{request_id}", response_model=list[ApprovalHistoryRead])
async def request_history(
    request_type: str,
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if request_type not in {"expense", "travel"}:
        raise HTTPException(
            400,
            "request_type must be expense or travel.",
        )

    svc = ExpenseTravelService(db)
    return await svc.history(request_type, request_id)
