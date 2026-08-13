"""add employee offboarding fields

Revision ID: dc39ff5da6ab
Revises: efd2c22655ec
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "dc39ff5da6ab"
down_revision: Union[str, None] = "efd2c22655ec"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the enum required by the new Employee model.
    offboard_reason_enum = sa.Enum(
        "RESIGNATION",
        "TERMINATION",
        "CONTRACT_END",
        "RETIREMENT",
        "ABANDONMENT",
        "OTHER",
        name="offboard_reason_enum",
    )

    offboard_reason_enum.create(op.get_bind(), checkfirst=True)

    # Add the new fields expected by the Employee model.
    op.add_column(
        "employees",
        sa.Column(
            "offboard_reason",
            sa.Enum(
                "RESIGNATION",
                "TERMINATION",
                "CONTRACT_END",
                "RETIREMENT",
                "ABANDONMENT",
                "OTHER",
                name="offboard_reason_enum",
            ),
            nullable=True,
        ),
    )

    op.add_column(
        "employees",
        sa.Column(
            "offboarded_at",
            sa.Date(),
            nullable=True,
        ),
    )

    # Preserve existing separation information.
    op.execute(
        """
        UPDATE employees
        SET offboarded_at = separation_date
        WHERE separation_date IS NOT NULL
        """
    )

    # Map existing free-text separation reasons into the new enum.
    op.execute(
        """
        UPDATE employees
        SET offboard_reason =
            CASE
                WHEN separation_reason ILIKE '%resign%' THEN 'RESIGNATION'::offboard_reason_enum
                WHEN separation_reason ILIKE '%terminat%' THEN 'TERMINATION'::offboard_reason_enum
                WHEN separation_reason ILIKE '%contract%' THEN 'CONTRACT_END'::offboard_reason_enum
                WHEN separation_reason ILIKE '%retir%' THEN 'RETIREMENT'::offboard_reason_enum
                WHEN separation_reason ILIKE '%abandon%' THEN 'ABANDONMENT'::offboard_reason_enum
                WHEN separation_reason IS NOT NULL THEN 'OTHER'::offboard_reason_enum
                ELSE NULL
            END
        WHERE separation_reason IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_column("employees", "offboarded_at")
    op.drop_column("employees", "offboard_reason")

    op.execute("DROP TYPE IF EXISTS offboard_reason_enum")
