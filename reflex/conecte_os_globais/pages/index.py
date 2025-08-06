
import reflex as rx
from rxconfig import config
from typing import Any, Dict, List
import random
from collections import defaultdict
from ..template import template
from ..state import BaseState
from ..components.reactflow import react_flow, background, controls
from ..src.service import GlobalService, ReactFlowService
import logging

logger = logging.getLogger(__name__)

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
    atores: list[Dict[str, Any]] = []
    novelas: list[Dict[str, Any]] = []
    search_value: str = ""
    item: Dict[str, Any] = None
    records: List[Dict[str, Any]] = []
    source_ator: str = ""
    target_ator: str = ""
    
    @rx.event
    def sort_ator(self):
        self.clear_graph()
        global_service = GlobalService()
        node_service = ReactFlowService()

        self.source_ator = global_service.get_random_global()
        self.target_ator = global_service.get_random_global()
        node_left = node_service.new_node(id=self.source_ator, label=self.source_ator, data_type="ator", x_initial=100, y_initial=-200, direction="left")
        node_right = node_service.new_node(id=self.target_ator, label=self.target_ator, data_type="ator", x_initial=100, y_initial=100, direction="right")
        
        self.nodes.append(node_left)
        self.nodes.append(node_right)
        self.get_records()  

    @rx.event
    def clear_graph(self):
        self.nodes = []  # Clear the nodes list
        self.edges = []  # Clear the edges list
        self.records = []  # Clear the records list

    def get_records(self) -> List[Dict[str, Any]]:
        global_service = GlobalService()
        
        self.novelas = global_service.find_novelas_by_atores(nodes=self.nodes)
        self.atores = global_service.find_atores_by_novelas(nodes=self.nodes)

        logger.info("Grafo Novelas: %s", self.novelas)
        logger.info("Grafo Atores: %s", self.atores)
        self.records = self.novelas + self.atores
        
        return self.records
    
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
    def add_node(self):
        global_service = GlobalService()

        if [node for node in self.nodes if node['id'] == self.search_value]:
            logger.info("Node already exists")
            return

        self.item = global_service.find_item(
            search_value=self.search_value,
            records_atores=self.atores,
            records_novelas=self.novelas,
        )
        print(self.item)
        flow_service = ReactFlowService()
        source_node = [node for node in self.nodes if node['id'] == self.item['source']][0]
        new_node = flow_service.new_node(
            id=self.item['target'], 
            label=self.item['target'], 
            data_type=self.item['type'], 
            x_initial=source_node['position']['x'], 
            y_initial=source_node['position']['y'], 
            direction=source_node['data']['direction']
            )
        new_edge = flow_service.new_edge(source=self.item['source'], target=self.item['target'])
        self.nodes.append(new_node)
        self.edges.append(new_edge)
        self.get_records()
        self.validate_path()

    def validate_path(self):
        global_service = GlobalService()
        if len(self.nodes) < 2:
            return

        atores = [node['id'] for node in self.nodes if node['data']['type'] == 'ator']
        novelas = [node['id'] for node in self.nodes if node['data']['type'] == 'novela']
        
        if not atores or not novelas:
            return
        
        path = global_service.find_filter_shortest_path(
            initial_atores=[self.source_ator, self.target_ator], 
            atores=atores, 
            novelas=novelas
        )
        
        logger.info("Shortest Path: %s", path)

    @rx.event
    def on_nodes_change(self, changes: List[Dict[str, Any]]) -> None:
        """
        Handler equivalente ao onNodesChange do ReactFlow
        Este é o método que você chamaria nos eventos de mudança dos nós
        """
        self.apply_node_changes(changes)
    
    def apply_node_changes(self, changes: List[Dict[str, Any]]) -> None:
        """
        Aplica mudanças aos nós, equivalente ao applyNodeChanges do ReactFlow
        """
        current_nodes = self.nodes.copy()
        
        for change in changes:
            change_type = change.get("type")
            node_id = change.get("id")
            
            if change_type == "position":
                # Atualiza posição do nó
                for i, node in enumerate(current_nodes):
                    if node.get("id") == node_id:
                        if "position" not in current_nodes[i]:
                            current_nodes[i]["position"] = {}
                        current_nodes[i]["position"].update(change.get("position", {}))
                        break
                        
            elif change_type == "dimensions":
                # Atualiza dimensões do nó
                for i, node in enumerate(current_nodes):
                    if node.get("id") == node_id:
                        current_nodes[i]["width"] = change.get("dimensions", {}).get("width")
                        current_nodes[i]["height"] = change.get("dimensions", {}).get("height")
                        break
                        
            elif change_type == "select":
                # Atualiza seleção do nó
                for i, node in enumerate(current_nodes):
                    if node.get("id") == node_id:
                        current_nodes[i]["selected"] = change.get("selected", False)
                        break
                        
            elif change_type == "remove":
                # Remove nó
                current_nodes = [node for node in current_nodes if node.get("id") != node_id]
                
            elif change_type == "add":
                # Adiciona novo nó
                new_node = change.get("item", {})
                current_nodes.append(new_node)
                
            elif change_type == "reset":
                # Reseta todos os nós
                current_nodes = change.get("items", [])
        
        self.nodes = current_nodes

def show_records(record: Dict[str, Any]) -> rx.Component:
    """Show a customer in a table row."""
    return rx.table.row(
        rx.table.cell(record.get("novela")),
        rx.table.cell(record.get("ator")),
    )
    
@rx.page(route="/")
@template 
def index_page() -> rx.Component:
    # Welcome Page (Index)
    return rx.box(
        rx.vstack(
            rx.heading("Conecte os Globais", size="9"),
            rx.text(
                'Descubra como dois atores da Globo estão conectados através de novelas.'
            ),
            rx.text(
                'Construa novas conexões digitando os nomes das novelas e atores conectados aos que já estão no seu painel' 
            ),
            rx.text(
                'Desafie-se a encontrar o caminho mais curto!',
            ),
            rx.hstack(
                rx.button(
                    "Sortear os Globais",
                    on_click=IndexState.sort_ator,
                ),

                rx.button(
                    "Reiniciar",
                    on_click=IndexState.clear_graph,
                ),
            ),
            react_flow(
                background(),
                controls(),
                nodes_draggable=True,
                on_connect=lambda e0: IndexState.on_connect(e0),
                on_nodes_change=lambda e0: IndexState.on_nodes_change(e0),
                nodes=IndexState.nodes,
                edges=IndexState.edges,
                fit_view=True,
                only_render_visible_elements=True
            ),
            rx.hstack(
                rx.input(
                    value=IndexState.search_value,
                    on_change=IndexState.set_search_value,
                    placeholder="Cole aqui o nome da novela ou ator...",
                    size="3",
                    width="50%",
                ),
                rx.button(
                    "Adicionar",
                    on_click=IndexState.add_node,
                ),
                width="100%",
            ),
            rx.scroll_area(
                rx.table.root(
                    rx.table.header(
                        rx.table.row(
                            rx.table.column_header_cell("Novela"),
                            rx.table.column_header_cell("Ator"),
                        ),
                    ),
                    rx.table.body(
                        rx.foreach(
                            IndexState.records, show_records
                        )
                    ),
                    width="100%",
                ),
                type="always",
                style={"height": 300},
            ),
            height="100vh",
            width="100%",
        ),
    )

