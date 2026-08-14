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
    op.add_column("employees", sa.Column("offer_letter_status", sa.String(length=120), nullable=True))
    op.add_column("employees", sa.Column("onboarding_email_status", sa.String(length=120), nullable=True))
    op.add_column("employees", sa.Column("appraisal_letter_status", sa.String(length=120), nullable=True))
    op.add_column("employees", sa.Column("bonus_payout_status", sa.String(length=120), nullable=True))
    op.add_column("employees", sa.Column("promotion_letter_status", sa.String(length=120), nullable=True))
    op.add_column("employees", sa.Column("resignation_email_status", sa.String(length=120), nullable=True))
    op.add_column("employees", sa.Column("resignation_acceptance_status", sa.String(length=120), nullable=True))
    op.add_column("employees", sa.Column("experience_relieving_letter_status", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("employees", "experience_relieving_letter_status")
    op.drop_column("employees", "resignation_acceptance_status")
    op.drop_column("employees", "resignation_email_status")
    op.drop_column("employees", "promotion_letter_status")
    op.drop_column("employees", "bonus_payout_status")
    op.drop_column("employees", "appraisal_letter_status")
    op.drop_column("employees", "onboarding_email_status")
    op.drop_column("employees", "offer_letter_status")
