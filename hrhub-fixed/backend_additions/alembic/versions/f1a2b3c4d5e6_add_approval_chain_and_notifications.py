"""add approval chain fields to leave_requests and notifications table

Revision ID: f1a2b3c4d5e6
Revises: <SET_THIS_TO_YOUR_CURRENT_HEAD>
Create Date: 2026-08-24

Run `alembic heads` first and paste the current head revision id into
`down_revision` below before running `alembic upgrade head`.
"""
from alembic import op
import sqlalchemy as sa

revision = "f1a2b3c4d5e6"
down_revision = "<SET_THIS_TO_YOUR_CURRENT_HEAD>"  # <-- replace before running
branch_labels = None
depends_on = None


def upgrade():
    # Approval chain columns on leave_requests. Nullable so existing rows
    # (and any existing single-status flow) keep working unchanged.
    op.add_column("leave_requests", sa.Column("manager_status", sa.String(length=20), nullable=True))
    op.add_column("leave_requests", sa.Column("manager_decided_by", sa.Integer(), nullable=True))
    op.add_column("leave_requests", sa.Column("manager_decided_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("leave_requests", sa.Column("manager_comment", sa.String(length=500), nullable=True))
    op.add_column("leave_requests", sa.Column("hr_status", sa.String(length=20), nullable=True))
    op.add_column("leave_requests", sa.Column("hr_decided_by", sa.Integer(), nullable=True))
    op.add_column("leave_requests", sa.Column("hr_decided_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("leave_requests", sa.Column("hr_comment", sa.String(length=500), nullable=True))

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False, index=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("body", sa.String(length=500), nullable=True),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="general"),
        sa.Column("reference_type", sa.String(length=50), nullable=True),
        sa.Column("reference_id", sa.Integer(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade():
    op.drop_table("notifications")
    for col in [
        "manager_status", "manager_decided_by", "manager_decided_at", "manager_comment",
        "hr_status", "hr_decided_by", "hr_decided_at", "hr_comment",
    ]:
        op.drop_column("leave_requests", col)
