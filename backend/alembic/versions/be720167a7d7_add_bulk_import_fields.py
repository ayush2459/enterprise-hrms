"""add mobile number, bank account, and PF details to employees

Revision ID: be720167a7d7
Revises: efd2c22655ec
Create Date: 2026-08-13 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "be720167a7d7"
down_revision: Union[str, None] = "efd2c22655ec"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("mobile_number", sa.String(length=20), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("bank_account_holder_name", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("bank_account_number", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("bank_ifsc_code", sa.String(length=20), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("bank_name", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("pf_number", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("offer_letter_status", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("onboarding_email_status", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("appraisal_letter_status", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("bonus_payout_status", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("promotion_letter_status", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("resignation_email_status", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("resignation_acceptance_status", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column(
            "experience_relieving_letter_status",
            sa.String(length=120),
            nullable=True,
        ),
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
    op.drop_column("employees", "pf_number")
    op.drop_column("employees", "bank_name")
    op.drop_column("employees", "bank_ifsc_code")
    op.drop_column("employees", "bank_account_number")
    op.drop_column("employees", "bank_account_holder_name")
    op.drop_column("employees", "mobile_number")
