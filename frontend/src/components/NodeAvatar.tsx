
import { Box, Card, Flex, Avatar, Text, Button, Popover, Table, ScrollArea } from '@radix-ui/themes';
import { BookmarkIcon, PlusIcon } from '@radix-ui/react-icons';
import { Handle, Position } from '@xyflow/react';
import React, { memo, useState, useEffect } from 'react';
import { env } from "@/config/env";
import axios from "axios";


function NodeAvatar(props: any) {
    const [response, setResponse] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post(`${env.APP_URL}`);
                console.log("NodeAvatar created:", res.data);
                setResponse(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

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
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>{props.data.type === 'ator' ? 'Novelas' : 'Atores'}</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <ScrollArea type="always" scrollbars="vertical" style={{ height: 100 }}>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>Danilo Sousa <Button size="1">
                                    <PlusIcon />
                                </Button></Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </ScrollArea>
                </Table.Root>
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

export default memo(NodeAvatar);