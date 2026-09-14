"""add expenses and travel workflow

Revision ID: expense_travel_001
Revises: b16830938f8d
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "expense_travel_001"
down_revision = "b16830938f8d"
branch_labels = None
depends_on = None


def upgrade():

    op.create_table(
        "expense_approval_history",
        sa.Column("request_type", sa.String(20), nullable=False),
        sa.Column("request_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column(
            "performed_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
    )

    op.create_index(
        "ix_expense_approval_history_request_id",
        "expense_approval_history",
        ["request_id"],
    )

    op.create_index(
        "ix_expense_approval_history_request_type",
        "expense_approval_history",
        ["request_type"],
    )

    op.create_table(
        "expenses",
        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(10), nullable=False),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),

        sa.Column("status", sa.String(40), nullable=False),

        sa.Column("manager_status", sa.String(30), nullable=False),
        sa.Column(
            "manager_decided_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("manager_decided_at", sa.DateTime(timezone=True)),
        sa.Column("manager_comment", sa.String(1000)),

        sa.Column("hr_status", sa.String(30), nullable=False),
        sa.Column(
            "hr_decided_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("hr_decided_at", sa.DateTime(timezone=True)),
        sa.Column("hr_comment", sa.String(1000)),

        sa.Column("settlement_status", sa.String(30), nullable=False),
        sa.Column("settled_amount", sa.Numeric(12, 2)),
        sa.Column("settlement_reference", sa.String(150)),
        sa.Column("settled_at", sa.DateTime(timezone=True)),

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_expenses_employee_id",
        "expenses",
        ["employee_id"],
    )

    op.create_index(
        "ix_expenses_status",
        "expenses",
        ["status"],
    )

    op.create_table(
        "travel_requests",
        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("destination", sa.String(255), nullable=False),
        sa.Column("purpose", sa.Text(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("transport", sa.String(100)),
        sa.Column("accommodation", sa.String(255)),
        sa.Column("estimated_cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(10), nullable=False),
        sa.Column("advance_required", sa.Boolean(), nullable=False),
        sa.Column("advance_amount", sa.Numeric(12, 2)),
        sa.Column("notes", sa.Text()),

        sa.Column("status", sa.String(40), nullable=False),

        sa.Column("manager_status", sa.String(30), nullable=False),
        sa.Column(
            "manager_decided_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("manager_decided_at", sa.DateTime(timezone=True)),
        sa.Column("manager_comment", sa.String(1000)),

        sa.Column("hr_status", sa.String(30), nullable=False),
        sa.Column(
            "hr_decided_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("hr_decided_at", sa.DateTime(timezone=True)),
        sa.Column("hr_comment", sa.String(1000)),

        sa.Column("settlement_status", sa.String(30), nullable=False),
        sa.Column("settled_amount", sa.Numeric(12, 2)),
        sa.Column("settlement_reference", sa.String(150)),
        sa.Column("settled_at", sa.DateTime(timezone=True)),

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_travel_requests_employee_id",
        "travel_requests",
        ["employee_id"],
    )

    op.create_index(
        "ix_travel_requests_status",
        "travel_requests",
        ["status"],
    )

    op.create_table(
        "expense_documents",
        sa.Column(
            "expense_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("expenses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "document_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
    )

    op.create_index(
        "ix_expense_documents_expense_id",
        "expense_documents",
        ["expense_id"],
    )

    op.create_index(
        "ix_expense_documents_document_id",
        "expense_documents",
        ["document_id"],
    )

    op.create_table(
        "travel_documents",
        sa.Column(
            "travel_request_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("travel_requests.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "document_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
    )

    op.create_index(
        "ix_travel_documents_travel_request_id",
        "travel_documents",
        ["travel_request_id"],
    )

    op.create_index(
        "ix_travel_documents_document_id",
        "travel_documents",
        ["document_id"],
    )


def downgrade():

    op.drop_table("travel_documents")
    op.drop_table("expense_documents")

    op.drop_index(
        "ix_travel_requests_status",
        table_name="travel_requests",
    )
    op.drop_index(
        "ix_travel_requests_employee_id",
        table_name="travel_requests",
    )
    op.drop_table("travel_requests")

    op.drop_index(
        "ix_expenses_status",
        table_name="expenses",
    )
    op.drop_index(
        "ix_expenses_employee_id",
        table_name="expenses",
    )
    op.drop_table("expenses")

    op.drop_index(
        "ix_expense_approval_history_request_type",
        table_name="expense_approval_history",
    )
    op.drop_index(
        "ix_expense_approval_history_request_id",
        table_name="expense_approval_history",
    )
    op.drop_table("expense_approval_history")
