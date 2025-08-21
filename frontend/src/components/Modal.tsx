
import { Flex, Text, Button, Dialog, TextField } from '@radix-ui/themes';
import { memo, useCallback } from 'react';
import { useReactFlow, useEdges, type Edge, } from '@xyflow/react';

interface Graph {
    grau?: number;
    nodes?: any;
    found?: boolean;
}

interface ModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    graph?: Graph
}

function Modal({ open = false, onOpenChange, graph }: ModalProps) {
    const { getEdges, addEdges } = useReactFlow();

    const handleOpenChange = useCallback((newOpen: boolean) => {
        const edges = getEdges()
        console.log("[handleOpenChange] executing...", edges)

        for (let index = 0; index < edges.length; index++) {
            const element = graph?.nodes[index];
            const nextElement = graph?.nodes[index + 1];
            let edge = edges[index]
            if(edge.id === `${element.name}-${nextElement.name}`){
                edge.animated = true
            } else if(edge.id === `${nextElement.name}-${element.name}`){
                edge.animated = true
            }

            addEdges(edge);
        }

        onOpenChange?.(newOpen);
    }, [onOpenChange]);


    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Fim de jogo</Dialog.Title>
                <Flex direction="column" gap="3">
                    <Text>Parabéns! Você encontrou uma ligação.</Text>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button>Save</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default memo(Modal);