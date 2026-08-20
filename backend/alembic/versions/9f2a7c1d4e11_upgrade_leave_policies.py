"""upgrade leave types to smart configurable leave policies

Revision ID: 9f2a7c1d4e11
Revises: 7968b33e5033
Create Date: 2026-08-14
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f2a7c1d4e11"
down_revision: Union[str, None] = "7968b33e5033"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    existing_columns = {
        column["name"]
        for column in sa.inspect(bind).get_columns("leave_types")
    }

    columns = [
        ("eligibility_gender", sa.String(length=20)),
        ("is_paid", sa.Boolean()),
        ("carry_forward_allowed", sa.Boolean()),
        ("max_carry_forward_days", sa.Integer()),
        ("encashment_allowed", sa.Boolean()),
        ("requires_document", sa.Boolean()),
        ("requires_reason", sa.Boolean()),
        ("min_days", sa.Integer()),
        ("max_days", sa.Integer()),
        ("advance_notice_days", sa.Integer()),
        ("is_active", sa.Boolean()),
    ]

    defaults = {
        "eligibility_gender": "all",
        "is_paid": True,
        "carry_forward_allowed": False,
        "max_carry_forward_days": 0,
        "encashment_allowed": False,
        "requires_document": False,
        "requires_reason": False,
        "min_days": 1,
        "max_days": 365,
        "advance_notice_days": 0,
        "is_active": True,
    }

    for name, column_type in columns:
        if name not in existing_columns:
            op.add_column(
                "leave_types",
                sa.Column(
                    name,
                    column_type,
                    nullable=False,
                    server_default=sa.text(
                        str(defaults[name]).lower()
                        if isinstance(defaults[name], bool)
                        else f"'{defaults[name]}'"
                        if isinstance(defaults[name], str)
                        else str(defaults[name])
                    ),
                ),
            )

    # Remove temporary server defaults after existing rows have been populated.
    for name, _ in columns:
        op.alter_column(
            "leave_types",
            name,
            server_default=None,
        )

    # Seed only missing standard organization leave policies.
    # Existing leave types are preserved.
    #
    # Do not use a bound parameter in both INSERT and LOWER() here.
    # asyncpg can infer conflicting parameter types in that situation.
    seed_sql = sa.text(
        """
        INSERT INTO leave_types (
            id,
            name,
            annual_quota_days,
            eligibility_gender,
            is_paid,
            carry_forward_allowed,
            max_carry_forward_days,
            encashment_allowed,
            requires_document,
            requires_reason,
            min_days,
            max_days,
            advance_notice_days,
            is_active
        )
        SELECT
            gen_random_uuid(),
            CAST(:name AS VARCHAR(60)),
            :quota,
            CAST(:gender AS VARCHAR(20)),
            :paid,
            :carry_forward,
            :max_carry,
            :encashment,
            :document,
            :reason,
            :min_days,
            :max_days,
            :notice,
            TRUE
        WHERE NOT EXISTS (
            SELECT 1
            FROM leave_types
            WHERE LOWER(name) = LOWER(CAST(:name AS VARCHAR(60)))
        )
        """
    )

    defaults_to_seed = [
        ("Paid Time Off", 15, "all", True, True, 30, False, False, False, 1, 365, 0),
        ("Loss of Pay", 365, "all", False, False, 0, False, False, True, 1, 365, 0),
        ("Maternity Leave", 182, "female", True, False, 0, False, True, True, 1, 182, 0),
        ("Pregnancy Leave", 30, "female", True, False, 0, False, True, True, 1, 30, 0),
        ("Menstrual Leave", 12, "female", True, False, 0, False, False, False, 1, 3, 0),
        ("Miscarriage Leave", 42, "female", True, False, 0, False, True, True, 1, 42, 0),
        ("Paternity Leave", 15, "male", True, False, 0, False, True, True, 1, 15, 0),
        ("Adoption Leave", 30, "all", True, False, 0, False, True, True, 1, 90, 0),
        ("Marriage Leave", 5, "all", True, False, 0, False, False, True, 1, 5, 7),
        ("Bereavement Leave", 5, "all", True, False, 0, False, False, True, 1, 5, 0),
        ("Compensatory Off", 12, "all", False, False, 0, False, False, True, 1, 2, 0),
        ("Medical Leave", 12, "all", True, False, 0, False, True, True, 1, 365, 0),
        ("Study Leave", 10, "all", False, False, 0, False, True, True, 1, 365, 7),
        ("Sabbatical Leave", 180, "all", False, False, 0, False, True, True, 1, 365, 30),
        ("Special Leave", 10, "all", True, False, 0, False, False, True, 1, 365, 0),
    ]

    for (
        name,
        quota,
        gender,
        paid,
        carry_forward,
        max_carry,
        encashment,
        document,
        reason,
        min_days,
        max_days,
        notice,
    ) in defaults_to_seed:
        bind.execute(
            seed_sql,
            {
                "name": name,
                "quota": quota,
                "gender": gender,
                "paid": paid,
                "carry_forward": carry_forward,
                "max_carry": max_carry,
                "encashment": encashment,
                "document": document,
                "reason": reason,
                "min_days": min_days,
                "max_days": max_days,
                "notice": notice,
            },
        )


def downgrade() -> None:
    columns = [
        "is_active",
        "advance_notice_days",
        "max_days",
        "min_days",
        "requires_reason",
        "requires_document",
        "encashment_allowed",
        "max_carry_forward_days",
        "carry_forward_allowed",
        "is_paid",
        "eligibility_gender",
    ]

    for column in columns:
        op.drop_column("leave_types", column)
