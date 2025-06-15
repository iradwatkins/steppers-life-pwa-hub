"""Email Marketing Service for SteppersLife

This service handles email marketing campaigns, including:
- Creating and managing email templates
- Managing recipient segments
- Scheduling and sending campaigns
- Tracking email performance
"""

import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pydantic import EmailStr

from app.models.email import EmailTemplate, EmailSegment, EmailCampaign, EmailLog, AutomatedEmailReport
from app.schemas.email import EmailTemplate as EmailTemplateSchema
from app.schemas.email import EmailSegment as EmailSegmentSchema
from app.schemas.email import EmailCampaign as EmailCampaignSchema
from app.schemas.email import EmailRecipient, EmailRequest, BulkEmailRequest, EmailStats
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)


class EmailMarketingService:
    """Service for managing email marketing campaigns"""
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
    
    # Template Management
    
    def get_templates(self, skip: int = 0, limit: int = 100) -> List[EmailTemplate]:
        """Get all email templates"""
        return self.db.query(EmailTemplate).offset(skip).limit(limit).all()
    
    def get_template(self, template_id: str) -> Optional[EmailTemplate]:
        """Get an email template by ID"""
        return self.db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    
    def create_template(self, template: EmailTemplateSchema) -> EmailTemplate:
        """Create a new email template"""
        db_template = EmailTemplate(
            name=template.name,
            description=template.description,
            subject=template.subject,
            html_content=template.html_content,
            text_content=template.text_content,
            category=template.category,
            is_active=template.is_active,
            variables=template.variables,
        )
        self.db.add(db_template)
        self.db.commit()
        self.db.refresh(db_template)
        return db_template
    
    def update_template(self, template_id: str, template: EmailTemplateSchema) -> Optional[EmailTemplate]:
        """Update an existing email template"""
        db_template = self.get_template(template_id)
        if not db_template:
            return None
        
        for field, value in template.dict(exclude_unset=True).items():
            setattr(db_template, field, value)
        
        self.db.commit()
        self.db.refresh(db_template)
        return db_template
    
    def delete_template(self, template_id: str) -> bool:
        """Delete an email template"""
        db_template = self.get_template(template_id)
        if not db_template:
            return False
        
        self.db.delete(db_template)
        self.db.commit()
        return True
    
    # Segment Management
    
    def get_segments(self, skip: int = 0, limit: int = 100) -> List[EmailSegment]:
        """Get all email segments"""
        return self.db.query(EmailSegment).offset(skip).limit(limit).all()
    
    def get_segment(self, segment_id: str) -> Optional[EmailSegment]:
        """Get an email segment by ID"""
        return self.db.query(EmailSegment).filter(EmailSegment.id == segment_id).first()
    
    def create_segment(self, segment: EmailSegmentSchema) -> EmailSegment:
        """Create a new email segment"""
        db_segment = EmailSegment(
            name=segment.name,
            description=segment.description,
            filter_criteria=segment.filter_criteria,
            recipient_count=segment.recipient_count or 0,
        )
        self.db.add(db_segment)
        self.db.commit()
        self.db.refresh(db_segment)
        return db_segment
    
    def update_segment(self, segment_id: str, segment: EmailSegmentSchema) -> Optional[EmailSegment]:
        """Update an existing email segment"""
        db_segment = self.get_segment(segment_id)
        if not db_segment:
            return None
        
        for field, value in segment.dict(exclude_unset=True).items():
            setattr(db_segment, field, value)
        
        self.db.commit()
        self.db.refresh(db_segment)
        return db_segment
    
    def delete_segment(self, segment_id: str) -> bool:
        """Delete an email segment"""
        db_segment = self.get_segment(segment_id)
        if not db_segment:
            return False
        
        self.db.delete(db_segment)
        self.db.commit()
        return True
    
    # Campaign Management
    
    def get_campaigns(self, skip: int = 0, limit: int = 100) -> List[EmailCampaign]:
        """Get all email campaigns"""
        return self.db.query(EmailCampaign).offset(skip).limit(limit).all()
    
    def get_campaign(self, campaign_id: str) -> Optional[EmailCampaign]:
        """Get an email campaign by ID"""
        return self.db.query(EmailCampaign).filter(EmailCampaign.id == campaign_id).first()
    
    def create_campaign(self, campaign: EmailCampaignSchema) -> EmailCampaign:
        """Create a new email campaign"""
        db_campaign = EmailCampaign(
            name=campaign.name,
            description=campaign.description,
            template_id=campaign.template_id,
            segment_id=campaign.segment_id,
            event_id=campaign.event_id,
            scheduled_at=campaign.scheduled_at,
            status=campaign.status,
        )
        self.db.add(db_campaign)
        self.db.commit()
        self.db.refresh(db_campaign)
        return db_campaign
    
    def update_campaign(self, campaign_id: str, campaign: EmailCampaignSchema) -> Optional[EmailCampaign]:
        """Update an existing email campaign"""
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign:
            return None
        
        for field, value in campaign.dict(exclude_unset=True).items():
            setattr(db_campaign, field, value)
        
        self.db.commit()
        self.db.refresh(db_campaign)
        return db_campaign
    
    def delete_campaign(self, campaign_id: str) -> bool:
        """Delete an email campaign"""
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign:
            return False
        
        self.db.delete(db_campaign)
        self.db.commit()
        return True
    
    # Email Sending
    
    def send_campaign_email(self, campaign_id: str) -> bool:
        """Send an email campaign"""
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign or db_campaign.status not in ["draft", "scheduled"]:
            return False
        
        # Get template
        db_template = self.get_template(db_campaign.template_id)
        if not db_template or not db_template.is_active:
            return False
        
        # Get recipients
        recipients = self._get_campaign_recipients(db_campaign)
        if not recipients:
            return False
        
        # Update campaign status
        db_campaign.status = "sending"
        db_campaign.sent_at = datetime.utcnow()
        self.db.commit()
        
        try:
            # Send emails
            for recipient in recipients:
                # Apply template variables if provided
                subject = db_template.subject
                html_content = db_template.html_content
                text_content = db_template.text_content
                
                if recipient.variables:
                    # Apply variable substitution
                    for var_name, var_value in recipient.variables.items():
                        placeholder = f"{{{{{var_name}}}}}"
                        subject = subject.replace(placeholder, str(var_value))
                        html_content = html_content.replace(placeholder, str(var_value))
                        if text_content:
                            text_content = text_content.replace(placeholder, str(var_value))
                
                # Create email request
                email_request = EmailRequest(
                    to=recipient.email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content,
                    category=db_template.category,
                )
                
                # Send email
                result = self.email_service._send_email(
                    to_email=recipient.email,
                    subject=subject,
                    body=text_content or "Please enable HTML to view this email.",
                    html_body=html_content
                )
                
                # Log email
                self._log_email(
                    to_email=recipient.email,
                    subject=subject,
                    template_id=db_template.id,
                    campaign_id=db_campaign.id,
                    category=db_template.category,
                    status="sent" if result else "failed",
                    error_message=None if result else "Failed to send email",
                )
            
            # Update campaign status
            db_campaign.status = "sent"
            self.db.commit()
            return True
        
        except Exception as e:
            logger.error(f"Error sending campaign {campaign_id}: {str(e)}")
            # Update campaign status
            db_campaign.status = "failed"
            self.db.commit()
            return False
    
    def schedule_campaign(self, campaign_id: str, scheduled_at: datetime) -> bool:
        """Schedule an email campaign for later sending"""
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign or db_campaign.status != "draft":
            return False
        
        db_campaign.scheduled_at = scheduled_at
        db_campaign.status = "scheduled"
        self.db.commit()
        return True
    
    def cancel_campaign(self, campaign_id: str) -> bool:
        """Cancel a scheduled email campaign"""
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign or db_campaign.status != "scheduled":
            return False
        
        db_campaign.status = "cancelled"
        self.db.commit()
        return True
    
    # Campaign Analytics
    
    def get_campaign_stats(self, campaign_id: str) -> EmailStats:
        """Get statistics for an email campaign"""
        db_campaign = self.get_campaign(campaign_id)
        if not db_campaign:
            return EmailStats()
        
        logs = self.db.query(EmailLog).filter(EmailLog.campaign_id == campaign_id).all()
        
        total_sent = len(logs)
        total_delivered = len([log for log in logs if log.status in ["delivered", "opened", "clicked"]])
        total_opened = len([log for log in logs if log.status in ["opened", "clicked"]])
        total_clicked = len([log for log in logs if log.status == "clicked"])
        total_bounced = len([log for log in logs if log.status == "bounced"])
        total_failed = len([log for log in logs if log.status == "failed"])
        
        return EmailStats(
            total_sent=total_sent,
            total_delivered=total_delivered,
            total_opened=total_opened,
            total_clicked=total_clicked,
            total_bounced=total_bounced,
            total_failed=total_failed,
            delivery_rate=total_delivered / total_sent if total_sent > 0 else 0,
            open_rate=total_opened / total_delivered if total_delivered > 0 else 0,
            click_rate=total_clicked / total_opened if total_opened > 0 else 0,
            bounce_rate=total_bounced / total_sent if total_sent > 0 else 0,
            period_start=min([log.sent_at for log in logs]) if logs else None,
            period_end=max([log.sent_at for log in logs]) if logs else None,
        )
    
    # Automated Email Reports
    
    def get_automated_reports(self, skip: int = 0, limit: int = 100) -> List[AutomatedEmailReport]:
        """Get all automated email reports"""
        return self.db.query(AutomatedEmailReport).offset(skip).limit(limit).all()
    
    def get_automated_report(self, report_id: str) -> Optional[AutomatedEmailReport]:
        """Get an automated email report by ID"""
        return self.db.query(AutomatedEmailReport).filter(AutomatedEmailReport.id == report_id).first()
    
    def create_automated_report(self, report: dict) -> AutomatedEmailReport:
        """Create a new automated email report"""
        db_report = AutomatedEmailReport(
            name=report["name"],
            description=report.get("description"),
            recipients=report["recipients"],
            report_type=report["report_type"],
            frequency=report["frequency"],
            next_run=self._calculate_next_run(report["frequency"]),
            is_active=report.get("is_active", True),
        )
        self.db.add(db_report)
        self.db.commit()
        self.db.refresh(db_report)
        return db_report
    
    def update_automated_report(self, report_id: str, report: dict) -> Optional[AutomatedEmailReport]:
        """Update an existing automated email report"""
        db_report = self.get_automated_report(report_id)
        if not db_report:
            return None
        
        for field, value in report.items():
            setattr(db_report, field, value)
        
        # Recalculate next run if frequency changed
        if "frequency" in report:
            db_report.next_run = self._calculate_next_run(report["frequency"])
        
        self.db.commit()
        self.db.refresh(db_report)
        return db_report
    
    def delete_automated_report(self, report_id: str) -> bool:
        """Delete an automated email report"""
        db_report = self.get_automated_report(report_id)
        if not db_report:
            return False
        
        self.db.delete(db_report)
        self.db.commit()
        return True
    
    def run_automated_report(self, report_id: str) -> bool:
        """Run an automated email report immediately"""
        db_report = self.get_automated_report(report_id)
        if not db_report or not db_report.is_active:
            return False
        
        # Generate report data
        report_data = self._generate_report_data(db_report.report_type)
        
        # Create email template
        template = self._get_report_template(db_report.report_type)
        
        # Send email to each recipient
        for recipient in db_report.recipients:
            try:
                # Personalize subject and content
                subject = template["subject"].replace("{{name}}", recipient.get("name", ""))
                html_content = template["html_content"]
                text_content = template.get("text_content", "")
                
                # Apply report data to template
                for key, value in report_data.items():
                    html_content = html_content.replace(f"{{{{{key}}}}}", str(value))
                    text_content = text_content.replace(f"{{{{{key}}}}}", str(value))
                
                # Send email
                result = self.email_service._send_email(
                    to_email=recipient["email"],
                    subject=subject,
                    body=text_content,
                    html_body=html_content
                )
                
                # Log email
                self._log_email(
                    to_email=recipient["email"],
                    subject=subject,
                    template_id=None,  # No template ID for dynamically generated reports
                    campaign_id=None,
                    category="notification",
                    status="sent" if result else "failed",
                    error_message=None if result else "Failed to send email",
                )
            
            except Exception as e:
                logger.error(f"Error sending report {report_id} to {recipient['email']}: {str(e)}")
        
        # Update report last run and next run
        db_report.last_run = datetime.utcnow()
        db_report.next_run = self._calculate_next_run(db_report.frequency)
        self.db.commit()
        
        return True
    
    # Helper methods
    
    def _get_campaign_recipients(self, campaign: EmailCampaign) -> List[EmailRecipient]:
        """Get recipients for a campaign"""
        # Implementation depends on how segments are defined
        # For now, return a sample list
        if campaign.segment_id:
            db_segment = self.get_segment(campaign.segment_id)
            if not db_segment:
                return []
            
            # Get recipients based on segment criteria
            # This is a mock implementation
            recipients = [
                EmailRecipient(email="user1@example.com", name="User 1", variables={"firstName": "User", "lastName": "One"}),
                EmailRecipient(email="user2@example.com", name="User 2", variables={"firstName": "User", "lastName": "Two"}),
            ]
            return recipients
        
        # If no segment, return empty list
        return []
    
    def _log_email(self, to_email: str, subject: str, template_id: Optional[str], campaign_id: Optional[str],
                  category: str, status: str, error_message: Optional[str] = None) -> EmailLog:
        """Log an email send"""
        db_log = EmailLog(
            to_email=to_email,
            from_email=self.email_service.config.SMTP_FROM_EMAIL,
            subject=subject,
            template_id=template_id,
            campaign_id=campaign_id,
            category=category,
            status=status,
            error_message=error_message,
        )
        self.db.add(db_log)
        self.db.commit()
        self.db.refresh(db_log)
        return db_log
    
    def _calculate_next_run(self, frequency: str) -> datetime:
        """Calculate the next run time for an automated report"""
        now = datetime.utcnow()
        
        if frequency == "daily":
            return now + timedelta(days=1)
        elif frequency == "weekly":
            return now + timedelta(days=7)
        elif frequency == "monthly":
            # Simple approach - add 30 days
            return now + timedelta(days=30)
        else:
            # Default to daily
            return now + timedelta(days=1)
    
    def _generate_report_data(self, report_type: str) -> Dict[str, Any]:
        """Generate data for a report"""
        # Implementation depends on report type
        # For now, return sample data
        if report_type == "sales":
            return {
                "totalSales": 12500,
                "period": "Last 7 days",
                "topProducts": "T-shirts, Event Tickets, Workshop Passes",
                "salesGrowth": "+15%",
            }
        elif report_type == "attendance":
            return {
                "totalAttendees": 450,
                "checkInRate": "87%",
                "topEvents": "Dance Workshop, Salsa Night, Steppers Showcase",
                "comparedToLast": "+5%",
            }
        elif report_type == "performance":
            return {
                "avgRating": 4.7,
                "reviewCount": 125,
                "topPerformers": "Instructor A, Instructor B, Instructor C",
                "improvementAreas": "Check-in process, Parking, Sound system",
            }
        else:
            return {}
    
    def _get_report_template(self, report_type: str) -> Dict[str, str]:
        """Get template for a report"""
        # Implementation depends on report type
        # For now, return sample templates
        if report_type == "sales":
            return {
                "subject": "Sales Report for {{name}} - {{period}}",
                "html_content": """
                <h1>Sales Report</h1>
                <p>Here's your sales report for {{period}}:</p>
                <ul>
                    <li><strong>Total Sales:</strong> ${{totalSales}}</li>
                    <li><strong>Growth:</strong> {{salesGrowth}}</li>
                    <li><strong>Top Products:</strong> {{topProducts}}</li>
                </ul>
                <p>View your full report in the dashboard.</p>
                """,
                "text_content": """
                Sales Report
                
                Here's your sales report for {{period}}:
                
                - Total Sales: ${{totalSales}}
                - Growth: {{salesGrowth}}
                - Top Products: {{topProducts}}
                
                View your full report in the dashboard.
                """
            }
        elif report_type == "attendance":
            return {
                "subject": "Attendance Report - {{period}}",
                "html_content": """
                <h1>Attendance Report</h1>
                <p>Here's your attendance report for {{period}}:</p>
                <ul>
                    <li><strong>Total Attendees:</strong> {{totalAttendees}}</li>
                    <li><strong>Check-in Rate:</strong> {{checkInRate}}</li>
                    <li><strong>Top Events:</strong> {{topEvents}}</li>
                    <li><strong>Compared to Last Period:</strong> {{comparedToLast}}</li>
                </ul>
                <p>View your full report in the dashboard.</p>
                """,
                "text_content": """
                Attendance Report
                
                Here's your attendance report for {{period}}:
                
                - Total Attendees: {{totalAttendees}}
                - Check-in Rate: {{checkInRate}}
                - Top Events: {{topEvents}}
                - Compared to Last Period: {{comparedToLast}}
                
                View your full report in the dashboard.
                """
            }
        else:
            return {
                "subject": "Report for {{name}}",
                "html_content": "<h1>Report</h1><p>Here's your report.</p>",
                "text_content": "Report\n\nHere's your report."
            } 