"use client";

import React, { useCallback, forwardRef, type ReactNode } from "react";
import {
    useReactFlow,
    useNodeId,
    Handle,
    Position,
    type NodeProps,
} from "@xyflow/react";

import { BaseNode } from "@/components/base-node";
import { Box } from '@radix-ui/themes';
import axios from "axios";
import { env } from "@/config/env";

export type PlaceholderNodeProps = Partial<NodeProps> & {
    children?: ReactNode;
};

export const PlaceholderNode = forwardRef<HTMLDivElement, PlaceholderNodeProps>(
    ({ children }, ref) => {
        const id = useNodeId();
        const { setNodes, setEdges } = useReactFlow();

        const handleClick = useCallback(async () => {
            if (!id) return;

            try {
                const response = await axios.post(`${env.APP_URL}`);
                // Handle the response as needed, for example:
                console.log("Node created:", response.data);

                setEdges((edges) =>
                    edges.map((edge) =>
                        edge.target === id ? { ...edge, animated: false } : edge,
                    ),
                );

                setNodes((nodes) => {
                    const updatedNodes = nodes.map((node) => {
                        if (node.id === id) {
                            // Customize this function to update the node's data as needed.
                            // For example, you can change the label or other properties of the node.

                            return {
                                ...node,
                                data: { ...node.data, label: "Node Teste Name" },
                                type: "nodeAvatar",
                            };
                        }
                        return node;
                    });
                    return updatedNodes;
                });
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error("API error:", error.response?.data || error.message);
                } else {
                    console.error("Unexpected error:", error);
                }
            }
        }, [id, setEdges, setNodes]);

        return (
            <BaseNode
                ref={ref}
                className="w-[150px] border-dashed border-gray-400 bg-card text-center"
                onClick={handleClick}
            >
                <Box>+</Box>
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
            </BaseNode>
        );
    },
);

PlaceholderNode.displayName = "PlaceholderNode";