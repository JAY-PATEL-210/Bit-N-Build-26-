class EventPublisher:
    def __init__(self):
        self.subscribers = []

    def subscribe(self, callback):
        self.subscribers.append(callback)

    def publish(self, event: dict):
        for sub in self.subscribers:
            sub(event)

event_publisher = EventPublisher()
