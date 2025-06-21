from typing import Callable

import reflex as rx

def template(
    page: Callable[[], rx.Component]
) -> rx.Component:
    return rx.vstack(
        rx.container(
            page(), 
            width="100%",
        )
    )
