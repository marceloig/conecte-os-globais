import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  applyNodeChanges,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeChange,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import "@radix-ui/themes/styles.css";
import { Box, Container, Flex, Heading, Button } from '@radix-ui/themes';
import GraphNode from './components/GraphNode';
import Modal from './components/Modal';
import { PlaceholderNode } from './components/NewNode';
import { env } from "@/config/env";
import axios from "axios";
import { id } from 'zod/v4/locales';

const initialNodes: Node[] = [
  {
    id: "0",
    data: { direction: 'left' },
    position: { x: -150, y: 0 },
    type: "newNode",
  },
  {
    id: "1",
    data: { direction: 'right' },
    position: { x: 150, y: 0 },
    type: "newNode",
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = {
  graphNode: GraphNode,
  newNode: PlaceholderNode,
};

function App() {
  const [nodes, setNodes, getNodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [openDialog, setOpenDialog] = useState(false);
  const [graph, setGraph] = useState({});

  const newGame = useCallback(async () => {
            try {
                const response_1 = await axios.get(`${env.APP_URL}/api/v1/atores/random`);
                const response_2 = await axios.get(`${env.APP_URL}/api/v1/atores/random`);
                // Handle the response as needed, for example:
                console.log("Random Ator:", response_1.data);
                console.log("Random Ator:", response_2.data);
                const ator_left = response_1.data;
                const ator_right = response_2.data;

                setNodes([
                    {
                        id: ator_left.name,
                        data: { label: ator_left.name, type: 'graphNode', direction: 'left' },
                        position: { x: -150, y: 0 },
                        type: "graphNode",
                    },
                    {
                        id: ator_right.name,
                        data: { label: ator_right.name, type: 'graphNode', direction: 'right' },
                        position: { x: 150, y: 0 },
                        type: "graphNode",
                    }
                ]);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error("API error:", error.response?.data || error.message);
                } else {
                    console.error("Unexpected error:", error);
                }
            }
        }, [setNodes]);

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nds) => {
        if (nodes.length > 2 && changes[0].type === 'dimensions') {
          console.warn("Enough nodes to execute shortest path");
          const fetchData = async () => {
            try {
              let url = `${env.APP_URL}/api/v1/graph/shortest_path`;
              const filterNodes = nodes.filter((node: Node) => node.type === 'graphNode');
              const graphNodes = filterNodes.map((node: Node) => ({
                type: node.data.type,
                name: node.data.label,
              }));
              if (graphNodes.length < 3) {
                console.warn("Not enough nodes to create a path");
                return;
              }

              const res = await axios.post(url, {
                initial_nodes: graphNodes.slice(0, 2),
                nodes: graphNodes,
              });
              const graph = res.data
              setGraph(graph)
              setOpenDialog(graph.found);
            } catch (error) {
              console.error(error);
            }
          };
          fetchData();
        }
        return applyNodeChanges(changes, nds)
      }

      );
    },
    [nodes.length]
  );

  return (
    <Container size="4" p="4">
      <Flex direction="column">
        <Box>
          <Heading>Conecte os Globais</Heading>
        </Box>

        <Box
          width="100%"
          height="90vh"
        >
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              nodeTypes={nodeTypes}
              debug={false}
            >
              <Controls />
              <Panel position="top-left">
                <Button onClick={newGame}>Novo jogo</Button>
              </Panel>
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
            <Modal open={openDialog} onOpenChange={setOpenDialog} graph={graph} />
          </ReactFlowProvider>
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
