from abc import ABC, abstractmethod

class NotificationProviderBase(ABC):
    @abstractmethod
    def send_notification(self, recipient: str, title: str, message: str) -> bool:
        pass
