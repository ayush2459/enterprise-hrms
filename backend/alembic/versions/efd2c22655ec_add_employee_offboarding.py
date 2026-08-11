"""add employee offboarding (resigned/terminated statuses + separation fields)

Revision ID: efd2c22655ec
Revises: 725a93e2ee06
Create Date: 2026-08-11 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'efd2c22655ec'
down_revision: Union[str, None] = '725a93e2ee06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ALTER TYPE ... ADD VALUE cannot run inside the transaction block
    # Alembic normally wraps migrations in — Postgres requires it to be
    # committed on its own before any row can use the new value.
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE employee_status_enum ADD VALUE IF NOT EXISTS 'RESIGNED'")
        op.execute("ALTER TYPE employee_status_enum ADD VALUE IF NOT EXISTS 'TERMINATED'")

    op.add_column('employees', sa.Column('separation_date', sa.Date(), nullable=True))
    op.add_column('employees', sa.Column('separation_reason', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('employees', 'separation_reason')
    op.drop_column('employees', 'separation_date')
    # Postgres has no ALTER TYPE ... DROP VALUE; leaving the enum labels in
    # place on downgrade is the standard workaround (they just go unused).
