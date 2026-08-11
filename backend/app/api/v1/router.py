from fastapi import APIRouter

from app.api.v1.endpoints import (
    account,
    admin,
    attendance,
    auth,
    bgv,
    dashboard,
    documents,
    employees,
    events,
    insurance,
    leaves,
    onboarding,
    payroll,
    performance,
    policies,
    recruitment,
    teams,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(account.router)
api_router.include_router(admin.router)
api_router.include_router(employees.router)
api_router.include_router(documents.router)
api_router.include_router(bgv.router)
api_router.include_router(policies.router)
api_router.include_router(teams.router)
api_router.include_router(recruitment.router)
api_router.include_router(onboarding.router)
api_router.include_router(insurance.router)
api_router.include_router(performance.router)
api_router.include_router(payroll.router)
api_router.include_router(attendance.router)
api_router.include_router(leaves.router)
api_router.include_router(dashboard.router)
api_router.include_router(events.router)
