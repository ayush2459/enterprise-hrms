"""add HR process tracking fields

Revision ID: 7968b33e5033
Revises: 0a50567595dd
Create Date: 2026-08-14 08:35:53.116173
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7968b33e5033'
down_revision: Union[str, None] = '0a50567595dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    existing_columns = {
        column["name"]
        for column in sa.inspect(bind).get_columns("employees")
    }

    columns = [
        ("offer_letter_status", sa.String(length=120)),
        ("onboarding_email_status", sa.String(length=120)),
        ("appraisal_letter_status", sa.String(length=120)),
        ("bonus_payout_status", sa.String(length=120)),
        ("promotion_letter_status", sa.String(length=120)),
        ("resignation_email_status", sa.String(length=120)),
        ("resignation_acceptance_status", sa.String(length=120)),
        ("experience_relieving_letter_status", sa.String(length=120)),
    ]

    for name, column_type in columns:
        if name not in existing_columns:
            op.add_column(
                "employees",
                sa.Column(name, column_type, nullable=True),
            )

def downgrade() -> None:
    op.drop_column("employees", "experience_relieving_letter_status")
    op.drop_column("employees", "resignation_acceptance_status")
    op.drop_column("employees", "resignation_email_status")
    op.drop_column("employees", "promotion_letter_status")
    op.drop_column("employees", "bonus_payout_status")
    op.drop_column("employees", "appraisal_letter_status")
    op.drop_column("employees", "onboarding_email_status")
    op.drop_column("employees", "offer_letter_status")
