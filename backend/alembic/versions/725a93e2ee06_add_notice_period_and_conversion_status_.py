"""add notice period and conversion status v2

Revision ID: 725a93e2ee06
Revises: 9370cce6ed2f
Create Date: 2026-07-28 07:30:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '725a93e2ee06'
down_revision: Union[str, None] = '9370cce6ed2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Postgres requires the enum TYPE to exist before a column can use it —
    # autogenerate doesn't emit this for add_column, only for table creation.
    conversion_status_enum = postgresql.ENUM(
        'NOT_APPLICABLE', 'PENDING', 'APPROVED', 'REJECTED',
        name='conversion_status_enum',
    )
    conversion_status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column('candidates', sa.Column('notice_period_days', sa.Integer(), nullable=True))
    op.add_column('employees', sa.Column('notice_period_days', sa.Integer(), nullable=True))
    op.add_column(
        'employees',
        sa.Column(
            'conversion_status',
            postgresql.ENUM(
                'NOT_APPLICABLE', 'PENDING', 'APPROVED', 'REJECTED',
                name='conversion_status_enum',
                create_type=False,
            ),
            nullable=False,
            server_default='NOT_APPLICABLE',
        ),
    )
    # Drop the server default now that existing rows are backfilled — new
    # rows get their default from the application (SQLAlchemy model), not the DB.
    op.alter_column('employees', 'conversion_status', server_default=None)


def downgrade() -> None:
    op.drop_column('employees', 'conversion_status')
    op.drop_column('employees', 'notice_period_days')
    op.drop_column('candidates', 'notice_period_days')
    postgresql.ENUM(name='conversion_status_enum').drop(op.get_bind(), checkfirst=True)
