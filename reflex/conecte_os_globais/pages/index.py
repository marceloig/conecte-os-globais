
import reflex as rx
from rxconfig import config
from typing import Any, Dict, List
import random
from collections import defaultdict
from ..template import template
from ..state import BaseState
from ..components.reactflow import react_flow, background, controls
from ..src.service import GlobalService, NodeService

initial_nodes = [
    {
        'id': 'left#0',
        'data': {'label': 'Left'},
        'position': {'x': 0, 'y': 0},
    },
    {
        'id': 'right#0',
        'data': {'label': 'Right'},
        'position': {'x': 0, 'y': 100},
    },
]

initial_edges = [
    {'id': 'left#0-right#0', 'source': 'left#0', 'target': 'right#0',},
]

class IndexState(BaseState):
    
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    globais: list[str] = []
    obras: list[str] = []
    search_value: str = ""
    record: Dict[str, Any] = {}

    @rx.event
    def add_random_node(self):
        new_node_id = f'{len(self.nodes) + 1}'
        node_type = "default"
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
    def sort_global(self):
        self.clear_graph()
        global_service = GlobalService()
        node_service = NodeService()

        global_left = global_service.get_random_global()
        global_right = global_service.get_random_global()
        node_left = node_service.new_node(id=global_left, label=global_left, data_type="global", x=0)
        node_right = node_service.new_node(id=global_right, label=global_right, data_type="global", x=200)
        
        self.nodes.append(node_left)
        self.nodes.append(node_right)

    
    @rx.event
    def add_node(self):
        global_service = GlobalService()
        self.obras += global_service.get_all_contains_novelas(self.search_value)
        print(self.obras)

    @rx.event
    def clear_graph(self):
        self.nodes = []  # Clear the nodes list
        self.edges = []  # Clear the edges list

    @rx.event
    def find_search_value(self, value: str):
        if len(value) < 3:
            return
        
        self.search_value = value
        global_service = GlobalService()
        
        self.obras = global_service.find_novelas_by_atores(nodes=self.nodes)
        self.globais = global_service.find_atores_by_novelas(nodes=self.nodes)
        
        node_service = NodeService()
        self.record = node_service.filter_records(
            search_value=self.search_value,
            records_atores=self.globais,
            records_novelas=self.obras,
        )
        print(self.record)



    @rx.event
    def on_connect(self, new_edge):
        # Iterate over the existing edges
        for i, edge in enumerate(self.edges):
            # If we find an edge with the same ID as the new edge
            if (edge["id"] == f"e{new_edge['source']}-{new_edge['target']}"):
                # Delete the existing edge
                del self.edges[i]
                break

        # Add the new edge
        self.edges.append(
            {
                "id": f"e{new_edge['source']}-{new_edge['target']}",
                "source": new_edge["source"],
                "target": new_edge["target"],
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
                    "Sortear os Globais",
                    on_click=IndexState.sort_global,
                ),
                rx.button(
                    "Adicionar",
                    on_click=IndexState.add_node,
                ),
                
                rx.button(
                    "Reiniciar",
                    on_click=IndexState.clear_graph,
                ),
            ),
            rx.input(
                rx.input.slot(rx.icon("search")),
                rx.input.slot(
                    rx.icon("x"),
                    justify="end",
                    cursor="pointer",
                    on_click=IndexState.setvar("search_value", ""),
                    display=rx.cond(IndexState.search_value, "flex", "none"),
                ),
                value=IndexState.search_value,
                placeholder="Pesquise aqui...",
                size="3",
                on_change=lambda value: IndexState.find_search_value(value),
            ),
            height="90vh",
            width="100%",
        ),
    )

