"""create_payments_table
Revision ID: 006
Revises: 005
Create Date: 2025-01-15 12:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create ENUMs
    op.execute("CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refund_pending', 'refunded', 'cancelled')")
    op.execute("CREATE TYPE payment_method_enum AS ENUM ('bank_card', 'yoomoney', 'qiwi', 'sbp', 'sberbank', 'tinkoff', 'subscription')")
    op.execute("CREATE TYPE refund_reason_enum AS ENUM ('consultation_cancelled', 'lawyer_no_show', 'client_request', 'poor_service', 'technical_issue', 'duplicate_payment', 'fraudulent', 'other')")
    
    op.create_table('payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('consultation_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False, server_default='RUB'),
        sa.Column('status', sa.Enum('pending', 'processing', 'succeeded', 'failed', 'refund_pending', 'refunded', 'cancelled', name='payment_status_enum'), nullable=False, server_default='pending'),
        sa.Column('payment_method', sa.Enum('bank_card', 'yoomoney', 'qiwi', 'sbp', 'sberbank', 'tinkoff', 'subscription', name='payment_method_enum'), nullable=False),
        sa.Column('external_payment_id', sa.String(length=255), nullable=True),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('refund_amount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('refund_reason', sa.Enum('consultation_cancelled', 'lawyer_no_show', 'client_request', 'poor_service', 'technical_issue', 'duplicate_payment', 'fraudulent', 'other', name='refund_reason_enum'), nullable=True),
        sa.Column('refund_reason_comment', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('refunded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_payments_id', 'payments', ['id'])
    op.create_index('ix_payments_user_id', 'payments', ['user_id'])
    op.create_index('ix_payments_consultation_id', 'payments', ['consultation_id'])
    op.create_index('ix_payments_subscription_id', 'payments', ['subscription_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])
    op.create_index('ix_payments_external_payment_id', 'payments', ['external_payment_id'])
    op.create_index('idx_payments_user_status', 'payments', ['user_id', 'status'])

def downgrade() -> None:
    op.drop_index('idx_payments_user_status', table_name='payments')
    op.drop_index('ix_payments_external_payment_id', table_name='payments')
    op.drop_index('ix_payments_status', table_name='payments')
    op.drop_index('ix_payments_subscription_id', table_name='payments')
    op.drop_index('ix_payments_consultation_id', table_name='payments')
    op.drop_index('ix_payments_user_id', table_name='payments')
    op.drop_index('ix_payments_id', table_name='payments')
    op.drop_table('payments')
    op.execute("DROP TYPE refund_reason_enum")
    op.execute("DROP TYPE payment_method_enum")
    op.execute("DROP TYPE payment_status_enum")
