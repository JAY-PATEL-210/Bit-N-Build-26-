from app.integrations.notification.base import NotificationProviderBase

class MockNotificationProvider(NotificationProviderBase):
    def send_notification(self, recipient: str, title: str, message: str) -> bool:
        print(f"[MOCK NOTIFICATION] To: {recipient} | {title}: {message}")
        return True
