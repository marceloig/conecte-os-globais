
import { Flex, Text, Button, Dialog, Heading, Badge} from '@radix-ui/themes';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { memo, useCallback } from 'react';
import { useReactFlow} from '@xyflow/react';

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
        const edges = getEdges();
        console.log("[handleOpenChange] executing...", graph, open);

        for (let index = 0; index < edges.length; index++) {
            let edge = edges[index];
            for (let nodeIndex = 0; nodeIndex < graph?.nodes.length - 1; nodeIndex++) {
                const element = graph?.nodes[nodeIndex];
                const nextElement = graph?.nodes[nodeIndex + 1];

                if (edge.id === `${element.name}-${nextElement.name}`) {
                    edge.animated = true;
                    break;
                } else if (edge.id === `${nextElement.name}-${element.name}`) {
                    edge.animated = true;
                    break;
                }

            }
            addEdges(edge);
        }

        onOpenChange?.(newOpen);
    }, [open]);


    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Fim de jogo</Dialog.Title>
                <Flex direction="column" gap="3">
                    <Heading size="6" align="center">
                        🏆 PARABÉNS! 🏆
                    </Heading>
                    <Badge size="3" variant="solid" color="yellow">
                        <StarFilledIcon />
                        CONEXÃO ENCONTRADA!
                    </Badge>

                    <Text size="4" align="center">
                        Você conseguiu conectar os artistas Globais através de suas conexões!
                    </Text>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Fechar
                        </Button>
                    </Dialog.Close>
                    {/* <Dialog.Close>
                        <Button>Compartilhar</Button>
                    </Dialog.Close> */}
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default memo(Modal);