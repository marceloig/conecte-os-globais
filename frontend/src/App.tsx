import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import "@radix-ui/themes/styles.css";
import { Box, Container, Flex, Heading, Button } from '@radix-ui/themes';
import NodeAvatar from './components/NodeAvatar';
import {PlaceholderNode} from './components/NewNode';

const initialNodes: Node[] = [
  /* {
    id: '1',
    type: 'nodeAvatar',
    position: { x: 250, y: 25 },
    data: { label: 'Node 1' },
  }, */
  {
    id: "0",
    data: { label: 'Node 1' },
    position: { x: -150, y: 0 },
    type: "newNode",
  },
  {
    id: "1",
    data: {},
    position: { x: 150, y: 0 },
    type: "newNode",
  },
];

const initialEdges: Edge[] = [
  /* { id: '1-2', source: '1', target: '2' }, */
];

const nodeTypes = {
  nodeAvatar: NodeAvatar,
  newNode: PlaceholderNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const addNewNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'nodeAvatar',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 300,
      },
      data: { label: `Node ${nodes.length + 1}` },
    };
    
    setNodes((prevNodes) => [...prevNodes, newNode]);
  }, [nodes.length, setNodes]);

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
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            nodeTypes={nodeTypes}
          >
            <Controls />
            <Panel position="top-left">
              <Button size="3" variant="solid" onClick={addNewNode}>
                Adicionar Nó
              </Button>
            </Panel>
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
