"""add employee projects

Revision ID: add_employee_projects
Revises: e49899d7875b
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "add_employee_projects"
down_revision = "e49899d7875b"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "employee_projects",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),

        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),

        sa.Column(
            "project_name",
            sa.String(length=200),
            nullable=False,
        ),

        sa.Column(
            "project_code",
            sa.String(length=100),
            nullable=True,
        ),

        sa.Column(
            "client_name",
            sa.String(length=200),
            nullable=True,
        ),

        sa.Column(
            "role",
            sa.String(length=150),
            nullable=True,
        ),

        sa.Column(
            "project_manager",
            sa.String(length=200),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="active",
        ),

        sa.Column(
            "start_date",
            sa.Date(),
            nullable=True,
        ),

        sa.Column(
            "end_date",
            sa.Date(),
            nullable=True,
        ),

        sa.Column(
            "allocation_percentage",
            sa.Integer(),
            nullable=False,
            server_default="100",
        ),

        sa.Column(
            "technologies",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "responsibilities",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "achievements",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "remarks",
            sa.Text(),
            nullable=True,
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

        sa.ForeignKeyConstraint(
            ["employee_id"],
            ["employees.id"],
            ondelete="CASCADE",
        ),
    )

    op.create_index(
        "ix_employee_projects_employee_id",
        "employee_projects",
        ["employee_id"],
    )


def downgrade():
    op.drop_index(
        "ix_employee_projects_employee_id",
        table_name="employee_projects",
    )

    op.drop_table("employee_projects")
