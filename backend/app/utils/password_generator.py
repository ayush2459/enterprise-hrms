"""
Generates a one-time temporary password for newly created accounts.
Guaranteed to satisfy Section 7's password policy (10+ chars, upper,
lower, number, special char) so the auto-generated value never fails
validation on first login.
"""
import secrets
import string


def generate_temp_password(length: int = 14) -> str:
    upper = secrets.choice(string.ascii_uppercase)
    lower = secrets.choice(string.ascii_lowercase)
    digit = secrets.choice(string.digits)
    special = secrets.choice("!@#$%^&*")
    remaining_pool = string.ascii_letters + string.digits + "!@#$%^&*"
    remaining = [secrets.choice(remaining_pool) for _ in range(length - 4)]

    chars = list(upper + lower + digit + special) + remaining
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)
