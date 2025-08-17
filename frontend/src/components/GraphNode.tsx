
import { Box, Card, Flex, Avatar, Text, Button, Popover, Table, ScrollArea } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import {
    Handle, Position, useReactFlow, useNodeId,
    type Node, type Edge,
} from '@xyflow/react';
import React, { memo, useState, useEffect, useCallback } from 'react';
import { env } from "@/config/env";
import axios from "axios";

function GraphNode(props: any) {
    const [rows, setRows] = useState([]);
    const { getNodes, addNodes, addEdges } = useReactFlow();

    const nodeId = useNodeId();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentNodes = getNodes();
                let url = `${env.APP_URL}/api/v1/atores/${props.data.label}/novelas`;
                let data_type = 'novela';
                if (props.data.type == 'novela') {
                    url = `${env.APP_URL}/api/v1/novelas/${props.data.label}/atores`;
                    data_type = 'ator';
                }
                const res = await axios.get(url);

                const rows = res.data.map((item: any) => ({
                    data: {
                        type: data_type,
                        label: item.name
                    }
                }));
                const sourceNodes = currentNodes.filter((currentNode: any) => {
                    return rows.some((row: any) => row.data.label === currentNode.data.label);
                });
                for (const sourceNode of sourceNodes) {
                    const newEdge: Edge = {
                        id: `${sourceNode.id}-${nodeId}`,
                        source: sourceNode.id,
                        target: nodeId || '',
                        animated: false,
                    };
                    addEdges(newEdge);
                }
                const filter_rows = rows.filter((row: any) => {
                    return !currentNodes.some((node: Node) => node.data.label === row.data.label);
                });
                setRows(filter_rows);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const addNewGraphNode = useCallback((sourceNode: any, row: any) => {

        const newNode: Node = {
            id: row.data.label,
            type: 'graphNode',
            position: {
                x: sourceNode.positionAbsoluteX,
                y: sourceNode.positionAbsoluteY + 100,
            },
            data: {
                label: row.data.label,
                type: row.data.type
            },
        };
        addNodes(newNode);

    }, [addNodes]);

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={{ cursor: 'pointer' }}>
                    <Handle type="source" position={Position.Bottom} />
                    <Handle type="target" position={Position.Top} />
                    <Card>
                        <Flex gap="3" align="center">
                            <Avatar
                                size="3"
                                src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
                                radius="full"
                                fallback="T"
                            />
                            <Box>
                                <Text as="div" size="2" weight="bold">
                                    {props.data.label}
                                </Text>
                            </Box>
                        </Flex>
                    </Card>
                </Box>
            </Popover.Trigger>

            <Popover.Content>
                <ScrollArea type="always" scrollbars="vertical" style={{ height: 200 }}>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>{props.data.type === 'ator' ? 'Novelas' : 'Atores'}</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {rows.map((row: any, index: number) => (
                                <Table.Row key={index}>
                                    <Table.Cell>{row.data.label}</Table.Cell>
                                    <Table.Cell>
                                        <Popover.Close>
                                            <Button size="1" onClick={() => addNewGraphNode(props, row)}>
                                                <PlusIcon />
                                            </Button>
                                        </Popover.Close>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </ScrollArea>
                <Flex gap="3" mt="3" justify="end">
                    <Popover.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Popover.Close>
                </Flex>
            </Popover.Content>
        </Popover.Root>
    );
}

export default memo(GraphNode);