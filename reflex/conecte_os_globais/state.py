import reflex as rx

class BaseState(rx.State):
    """The app state."""
    _token: dict = rx.SessionStorage()
    _credentials: dict = rx.SessionStorage()