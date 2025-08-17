"use client";

import React, { forwardRef, type ReactNode } from "react";
import {
    Handle,
    Position,
    type NodeProps,
} from "@xyflow/react";

import { BaseNode } from "@/components/base-node";
import { Box } from '@radix-ui/themes';

export type PlaceholderNodeProps = Partial<NodeProps> & {
    children?: ReactNode;
};

export const PlaceholderNode = forwardRef<HTMLDivElement, PlaceholderNodeProps>(
    ({ children }, ref) => {

        return (
            <BaseNode style={{ cursor: 'pointer' }}
                ref={ref}
                className="w-[150px] border-dashed border-gray-400 bg-card text-center"
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