from abc import ABC, abstractmethod


class NotificationProviderBase(ABC):
    """Abstract base class for notification providers."""

    @abstractmethod
    def send_notification(self, recipient: str, title: str, message: str) -> bool:
        """
        Send a notification to the traveler.

        Notification format (Section 40):
        1. What happened (disruption description)
        2. What the system did (autonomous action taken)
        3. Current status (booking status)
        4. What traveler must do (next steps, if any)
        """
        pass

    @abstractmethod
    def send_escalation(
        self, recipient: str, title: str, message: str, approval_link: str
    ) -> bool:
        """Send an escalation notification requiring traveler action."""
        pass
