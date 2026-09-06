"""add testimonials and technology ordering

Revision ID: dfb069037d93
Revises: 2bcaf5218d0f
Create Date: 2026-08-28 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dfb069037d93'
down_revision: Union[str, Sequence[str], None] = '2bcaf5218d0f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Testimonials table
    op.create_table(
        'testimonials',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_name', sa.String(length=255), nullable=False),
        sa.Column('client_role', sa.String(length=255), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=True),
        sa.Column('client_image', sa.String(length=500), nullable=True),
        sa.Column('review_text', sa.Text(), nullable=False),
        sa.Column('rating', sa.Integer(), server_default='5', nullable=False),
        sa.Column('display_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_testimonials_display_order'), 'testimonials', ['display_order'], unique=False)
    op.create_index(op.f('ix_testimonials_is_active'), 'testimonials', ['is_active'], unique=False)

    # Technology ordering + activation
    op.add_column('technologies', sa.Column('display_order', sa.Integer(), server_default='0', nullable=False))
    op.add_column('technologies', sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False))
    op.create_index(op.f('ix_technologies_display_order'), 'technologies', ['display_order'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_technologies_display_order'), table_name='technologies')
    op.drop_column('technologies', 'is_active')
    op.drop_column('technologies', 'display_order')
    op.drop_index(op.f('ix_testimonials_is_active'), table_name='testimonials')
    op.drop_index(op.f('ix_testimonials_display_order'), table_name='testimonials')
    op.drop_table('testimonials')