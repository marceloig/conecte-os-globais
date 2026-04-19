"use client";

import { forwardRef } from "react";
import {
    Handle,
    Position,
    type NodeProps,
} from "@xyflow/react";

import { Box, Flex } from '@radix-ui/themes';

export type PlaceholderNodeProps = Partial<NodeProps>;

export const PlaceholderNode = forwardRef<HTMLDivElement, PlaceholderNodeProps>(
    ({}, ref) => {

        return (
            <Box ref={ref} style={{ cursor: 'pointer' }}>
                <Flex direction="column" align="center" gap="1">
                    <Box
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.8)',
                            border: '2px dashed rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 24,
                        }}
                    >
                        +
                    </Box>
                </Flex>
                <Handle
                    type="target"
                    style={{ visibility: "hidden" }}
                    position={Position.Top}
                    isConnectable={false}
                />
                <Handle
                    type="source"
                    style={{ visibility: "hidden" }}
                    position={Position.Bottom}
                    isConnectable={false}
                />
            </Box>
        );
    },
);

PlaceholderNode.displayName = "PlaceholderNode";