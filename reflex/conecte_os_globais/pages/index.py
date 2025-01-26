
import reflex as rx
from rxconfig import config
from typing import Any, Dict, List
import random
from collections import defaultdict
from ..template import template
from ..state import BaseState
from ..components.reactflow import react_flow, background, controls

initial_nodes = [
    {
        'id': 'left#1',
        'data': {'label': 'Left'},
        'position': {'x': 0, 'y': 0},
    },
    {
        'id': 'right#1',
        'data': {'label': 'Right'},
        'position': {'x': 0, 'y': 100},
    },
]

initial_edges = [
    {'id': 'left#1-right#1', 'source': 'left#1', 'target': 'right#1',},
]

class IndexState(BaseState):
    
    nodes: List[Dict[str, Any]] = initial_nodes
    edges: List[Dict[str, Any]] = initial_edges

    @rx.event
    def add_random_node(self):
        new_node_id = f'{len(self.nodes) + 1}'
        node_type = random.choice(["default"])
        # Label is random number
        label = new_node_id
        x = random.randint(0, 500)
        y = random.randint(0, 500)

        new_node = {
            "id": new_node_id,
            "type": node_type,
            "data": {"label": label},
            "position": {"x": x, "y": y},
            "draggable": True,
        }
        self.nodes.append(new_node)

    @rx.event
    def clear_graph(self):
        self.nodes = []  # Clear the nodes list
        self.edges = []  # Clear the edges list

    @rx.event
    def on_connect(self, new_edge):
        # Iterate over the existing edges
        for i, edge in enumerate(self.edges):
            # If we find an edge with the same ID as the new edge
            if (
                edge["id"]
                == f"e{new_edge['source']}-{new_edge['target']}"
            ):
                # Delete the existing edge
                del self.edges[i]
                break

        # Add the new edge
        self.edges.append(
            {
                "id": f"e{new_edge['source']}-{new_edge['target']}",
                "source": new_edge["source"],
                "target": new_edge["target"],
                "label": random.choice(
                    ["+", "-", "*", "/"]
                ),
                "animated": True,
            }
        )

    @rx.event
    def on_nodes_change(self, node_changes: List[Dict[str, Any]]):
        # Receives a list of Nodes in case of events like dragging
        map_id_to_new_position = defaultdict(dict)

        # Loop over the changes and store the new position
        for change in node_changes:
            if (
                change["type"] == "position"
                and change.get("dragging") == True
            ):
                map_id_to_new_position[
                    change["id"]
                ] = change["position"]

        # Loop over the nodes and update the position
        for i, node in enumerate(self.nodes):
            if node["id"] in map_id_to_new_position:
                new_position = map_id_to_new_position[
                    node["id"]
                ]
                self.nodes[i]["position"] = new_position

    
@rx.page(route="/")
@template 
def index_page() -> rx.Component:
    # Welcome Page (Index)
    return rx.box(
        rx.vstack(
            rx.heading("Welcome to Reflex!", size="9"),
            rx.text(
                "Get started by editing ",
                rx.code(f"{config.app_name}/{config.app_name}.py"),
                size="5",
            ),
            react_flow(
                background(),
                controls(),
                nodes_draggable=True,
                nodes_connectable=True,
                on_connect=lambda e0: IndexState.on_connect(e0),
                on_nodes_change=lambda e0: IndexState.on_nodes_change(
                    e0
                ),
                nodes=IndexState.nodes,
                edges=IndexState.edges,
                fit_view=True,
            ),
            rx.hstack(
                rx.button(
                    "Clear graph",
                    on_click=IndexState.clear_graph,
                ),
                rx.button(
                    "Add node",
                    on_click=IndexState.add_random_node,
                ),
            ),
            height="90vh",
            width="100%",
        ),
    )

