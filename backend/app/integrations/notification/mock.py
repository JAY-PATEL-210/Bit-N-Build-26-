from app.integrations.notification.base import NotificationProviderBase
from datetime import datetime
import logging

logger = logging.getLogger("AutonomousTravelConcierge.MockNotification")


class MockNotificationProvider(NotificationProviderBase):
    """
    Mock notification provider for demo.
    Logs all notifications to console and stores them in memory
    for audit trail verification.

    Notification format (Section 40):
    1. What happened
    2. What the system did
    3. Current status
    4. What traveler must do
    """

    def __init__(self):
        self._sent_notifications = []

    def send_notification(self, recipient: str, title: str, message: str) -> bool:
        """Send a notification (logged to console for demo)."""
        notification = {
            "type": "NOTIFICATION",
            "recipient": recipient,
            "title": title,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "delivered": True,
        }
        self._sent_notifications.append(notification)

        logger.info(
            "\n╔══════════════════════════════════════════════════╗\n"
            "║  📧 NOTIFICATION SENT                           ║\n"
            "╠══════════════════════════════════════════════════╣\n"
            "║  To:      %-38s ║\n"
            "║  Subject: %-38s ║\n"
            "╠══════════════════════════════════════════════════╣\n"
            "║  %s\n"
            "╚══════════════════════════════════════════════════╝",
            recipient, title, message,
        )

        return True

    def send_escalation(
        self, recipient: str, title: str, message: str, approval_link: str
    ) -> bool:
        """Send an escalation notification requiring traveler action."""
        notification = {
            "type": "ESCALATION",
            "recipient": recipient,
            "title": title,
            "message": message,
            "approval_link": approval_link,
            "timestamp": datetime.utcnow().isoformat(),
            "delivered": True,
        }
        self._sent_notifications.append(notification)

        logger.info(
            "\n╔══════════════════════════════════════════════════╗\n"
            "║  🚨 ESCALATION — ACTION REQUIRED                ║\n"
            "╠══════════════════════════════════════════════════╣\n"
            "║  To:      %-38s ║\n"
            "║  Subject: %-38s ║\n"
            "╠══════════════════════════════════════════════════╣\n"
            "║  %s\n"
            "║  Approval Link: %s\n"
            "╚══════════════════════════════════════════════════╝",
            recipient, title, message, approval_link,
        )

        return True

    def get_sent_notifications(self):
        """Returns all sent notifications (for audit/testing)."""
        return list(self._sent_notifications)

    def clear(self):
        """Clear notification history."""
        self._sent_notifications.clear()
