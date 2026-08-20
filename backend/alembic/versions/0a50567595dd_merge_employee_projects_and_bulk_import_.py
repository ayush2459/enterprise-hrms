"""merge employee projects and bulk import migrations

Revision ID: 0a50567595dd
Revises: add_employee_projects, be720167a7d7
Create Date: 2026-08-14 07:41:54.562086
"""

from typing import Sequence, Union

from alembic import op


revision: str = "0a50567595dd"
down_revision: Union[str, None] = ("add_employee_projects", "be720167a7d7")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
