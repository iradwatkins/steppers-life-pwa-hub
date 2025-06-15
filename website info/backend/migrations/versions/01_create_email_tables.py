"""Create email tables

Revision ID: 01_create_email_tables
Revises: 
Create Date: 2023-07-25 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid


# revision identifiers, used by Alembic.
revision = '01_create_email_tables'
down_revision = None
branch_labels = None
depends_on = None


def generate_uuid():
    return str(uuid.uuid4())


def upgrade() -> None:
    # Create email_templates table
    op.create_table(
        'email_templates',
        sa.Column('id', sa.String(), primary_key=True, index=True, default=generate_uuid),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('html_content', sa.Text(), nullable=False),
        sa.Column('text_content', sa.Text(), nullable=True),
        sa.Column('category', sa.String(), nullable=False, default="marketing"),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('variables', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create email_segments table
    op.create_table(
        'email_segments',
        sa.Column('id', sa.String(), primary_key=True, index=True, default=generate_uuid),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('filter_criteria', sa.JSON(), nullable=True),
        sa.Column('recipient_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create email_campaigns table
    op.create_table(
        'email_campaigns',
        sa.Column('id', sa.String(), primary_key=True, index=True, default=generate_uuid),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('template_id', sa.String(), sa.ForeignKey("email_templates.id"), nullable=False),
        sa.Column('segment_id', sa.String(), sa.ForeignKey("email_segments.id"), nullable=True),
        sa.Column('event_id', sa.String(), nullable=True),
        sa.Column('scheduled_at', sa.DateTime(), nullable=True),
        sa.Column('sent_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), default="draft"),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create email_logs table
    op.create_table(
        'email_logs',
        sa.Column('id', sa.String(), primary_key=True, index=True, default=generate_uuid),
        sa.Column('to_email', sa.String(), nullable=False),
        sa.Column('from_email', sa.String(), nullable=False),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('template_id', sa.String(), sa.ForeignKey("email_templates.id"), nullable=True),
        sa.Column('campaign_id', sa.String(), sa.ForeignKey("email_campaigns.id"), nullable=True),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('sent_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('delivered_at', sa.DateTime(), nullable=True),
        sa.Column('opened_at', sa.DateTime(), nullable=True),
        sa.Column('clicked_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
    )
    
    # Create email_preferences table
    op.create_table(
        'email_preferences',
        sa.Column('user_id', sa.String(), primary_key=True, index=True),
        sa.Column('marketing_emails', sa.Boolean(), default=True),
        sa.Column('event_reminders', sa.Boolean(), default=True),
        sa.Column('ticket_confirmations', sa.Boolean(), default=True),
        sa.Column('newsletter', sa.Boolean(), default=True),
        sa.Column('promotions', sa.Boolean(), default=True),
        sa.Column('account_notifications', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create automated_email_reports table
    op.create_table(
        'automated_email_reports',
        sa.Column('id', sa.String(), primary_key=True, index=True, default=generate_uuid),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('recipients', sa.JSON(), nullable=False),
        sa.Column('report_type', sa.String(), nullable=False),
        sa.Column('frequency', sa.String(), nullable=False),
        sa.Column('next_run', sa.DateTime(), nullable=True),
        sa.Column('last_run', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('automated_email_reports')
    op.drop_table('email_preferences')
    op.drop_table('email_logs')
    op.drop_table('email_campaigns')
    op.drop_table('email_segments')
    op.drop_table('email_templates') 