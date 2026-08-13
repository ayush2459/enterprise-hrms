"""sync employee profile fields

Revision ID: e49899d7875b
Revises: dc39ff5da6ab
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e49899d7875b"
down_revision: Union[str, None] = "dc39ff5da6ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---------------------------------------------------------
    # Holidays
    # ---------------------------------------------------------
    op.create_table(
        "holidays",
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("is_optional", sa.Boolean(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_holidays_date",
        "holidays",
        ["date"],
        unique=False,
    )

    # ---------------------------------------------------------
    # Employee Assets
    # ---------------------------------------------------------
    op.create_table(
        "assets",
        sa.Column("employee_id", sa.UUID(), nullable=False),
        sa.Column("asset_type", sa.String(length=60), nullable=False),
        sa.Column("asset_name", sa.String(length=255), nullable=False),
        sa.Column("serial_number", sa.String(length=120), nullable=True),
        sa.Column("assigned_date", sa.Date(), nullable=True),
        sa.Column("returned_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["employee_id"],
            ["employees.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_assets_employee_id",
        "assets",
        ["employee_id"],
        unique=False,
    )

    # ---------------------------------------------------------
    # Additional Employee Profile Fields
    # ---------------------------------------------------------
    op.add_column(
        "employees",
        sa.Column(
            "mobile_number",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "employees",
        sa.Column(
            "bank_account_number",
            sa.String(length=40),
            nullable=True,
        ),
    )

    op.add_column(
        "employees",
        sa.Column(
            "bank_ifsc",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "employees",
        sa.Column(
            "bank_name",
            sa.String(length=120),
            nullable=True,
        ),
    )

    op.add_column(
        "employees",
        sa.Column(
            "pf_number",
            sa.String(length=40),
            nullable=True,
        ),
    )

    # ---------------------------------------------------------
    # IMPORTANT:
    #
    # Keep separation_date and separation_reason.
    #
    # They contain existing HR data and are intentionally
    # retained during the upgrade for backward compatibility.
    # ---------------------------------------------------------


def downgrade() -> None:
    # Remove newly added employee fields.
    op.drop_column("employees", "pf_number")
    op.drop_column("employees", "bank_name")
    op.drop_column("employees", "bank_ifsc")
    op.drop_column("employees", "bank_account_number")
    op.drop_column("employees", "mobile_number")

    # Remove assets.
    op.drop_index(
        "ix_assets_employee_id",
        table_name="assets",
    )
    op.drop_table("assets")

    # Remove holidays.
    op.drop_index(
        "ix_holidays_date",
        table_name="holidays",
    )
    op.drop_table("holidays")
