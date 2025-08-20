
import { Flex, Text, Button, Dialog, TextField } from '@radix-ui/themes';
import { memo, useCallback } from 'react';
import { useReactFlow, type Edge, } from '@xyflow/react';

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
    const { addEdges } = useReactFlow();

    const handleOpenChange = useCallback((newOpen: boolean) => {
        console.log("[handleOpenChange] executing...", graph)

        for (let index = 0; index < graph?.nodes.length - 1; index++) {
            const element = graph?.nodes[index];
            const nextElement = graph?.nodes[index + 1];
            const newEdge: Edge = {
                id: `${element.name}-${nextElement.name}`,
                source: element.name,
                target: nextElement.name || '',
                animated: true,
            };
            addEdges(newEdge);
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