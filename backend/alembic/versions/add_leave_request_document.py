"""add supporting document to leave requests

Revision ID: add_leave_request_document
Revises: f1a2b3c4d5e6
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "add_leave_request_document"
down_revision = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "leave_requests",
        sa.Column(
            "leave_document_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_leave_requests_leave_document_id",
        "leave_requests",
        ["leave_document_id"],
    )

    op.create_foreign_key(
        "fk_leave_requests_leave_document_id",
        "leave_requests",
        "documents",
        ["leave_document_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint(
        "fk_leave_requests_leave_document_id",
        "leave_requests",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_leave_requests_leave_document_id",
        table_name="leave_requests",
    )

    op.drop_column(
        "leave_requests",
        "leave_document_id",
    )
