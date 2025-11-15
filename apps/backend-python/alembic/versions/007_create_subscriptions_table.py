"""create_subscriptions_table
Revision ID: 007
Revises: 006
Create Date: 2025-01-15 12:01:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create ENUM
    op.execute("CREATE TYPE subscription_plan_enum AS ENUM ('free', 'basic', 'pro', 'enterprise')")
    
    op.create_table('subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('plan', sa.Enum('free', 'basic', 'pro', 'enterprise', name='subscription_plan_enum'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('auto_renew', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('consultations_used', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_subscriptions_id', 'subscriptions', ['id'])
    op.create_index('ix_subscriptions_user_id', 'subscriptions', ['user_id'])
    op.create_index('ix_subscriptions_plan', 'subscriptions', ['plan'])
    op.create_index('ix_subscriptions_end_date', 'subscriptions', ['end_date'])
    op.create_index('idx_subscriptions_active_user', 'subscriptions', ['user_id'], unique=True, postgresql_where=sa.text('is_active = true'))
    op.create_index('idx_subscriptions_expiring', 'subscriptions', ['end_date', 'is_active', 'auto_renew'])

def downgrade() -> None:
    op.drop_index('idx_subscriptions_expiring', table_name='subscriptions')
    op.drop_index('idx_subscriptions_active_user', table_name='subscriptions')
    op.drop_index('ix_subscriptions_end_date', table_name='subscriptions')
    op.drop_index('ix_subscriptions_plan', table_name='subscriptions')
    op.drop_index('ix_subscriptions_user_id', table_name='subscriptions')
    op.drop_index('ix_subscriptions_id', table_name='subscriptions')
    op.drop_table('subscriptions')
    op.execute("DROP TYPE subscription_plan_enum")
