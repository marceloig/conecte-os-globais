"""Welcome to Reflex! This file outlines the steps to create a basic app."""

import reflex as rx
from rxconfig import config
import logging
logging.basicConfig(level=logging.INFO)

app = rx.App(
    theme=rx.theme(
        radius="large",
    )
)