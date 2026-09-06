"""add testing credentials to projects

Revision ID: a1b2c3d4e5f6
Revises: dfb069037d93
Create Date: 2026-08-31 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'dfb069037d93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add testing_email and testing_password columns to projects."""
    op.add_column('projects', sa.Column('testing_email', sa.String(length=255), nullable=True))
    op.add_column('projects', sa.Column('testing_password', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Remove testing_email and testing_password columns from projects."""
    op.drop_column('projects', 'testing_password')
    op.drop_column('projects', 'testing_email')
