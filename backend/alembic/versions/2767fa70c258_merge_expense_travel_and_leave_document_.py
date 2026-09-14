"""Merge expense travel and leave document migrations

Revision ID: 2767fa70c258
Revises: expense_travel_001, add_leave_request_document
Create Date: 2026-09-15 02:12:53.791295
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2767fa70c258'
down_revision: Union[str, None] = ('expense_travel_001', 'add_leave_request_document')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
