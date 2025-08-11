import reflex as rx

class BaseState(rx.State):
    """The app state."""
    _token: dict = rx.SessionStorage()
    _credentials: dict = rx.SessionStorage()
    dialog_opened: bool = False

    @rx.event
    def dialog_open(self):
        self.dialog_opened = not self.dialog_opened
