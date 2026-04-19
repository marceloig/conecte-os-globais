
import { Flex, Text, Button, Dialog, Heading} from '@radix-ui/themes';
import { memo, useState, useCallback } from 'react';
import { useReactFlow} from '@xyflow/react';
import { shareResult } from '../lib/share';

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

function ModalEndGame({ open = false, onOpenChange, graph }: ModalProps) {
    const { getEdges, addEdges } = useReactFlow();
    const [path, setPath] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

    const handleShare = useCallback(async () => {
        setIsSharing(true);
        try {
            const result = await shareResult(graph!.nodes);
            if (result.status === "copied") {
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
            }
        } finally {
            setIsSharing(false);
        }
    }, [graph]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        const edges = getEdges();
        const connection = [];

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

        for (let nodeIndex = 0; nodeIndex < graph?.nodes.length; nodeIndex++) {
            const element = graph?.nodes[nodeIndex];
            connection.push(element.name);
            connection.push('➔');
        }
        connection.pop();

        setPath(connection.join('\n'));
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
                    <Text size="4" align="center">
                        Você conseguiu conectar os artistas Globais através de suas conexões!
                    </Text>
                    <Text size="4" align="center">
                        {path}
                    </Text>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Fechar
                        </Button>
                    </Dialog.Close>
                    {graph?.found === true && graph?.nodes?.length >= 3 && (
                        <Button onClick={handleShare} disabled={isSharing}>
                            {copyFeedback ? "Copiado!" : "Compartilhar"}
                        </Button>
                    )}
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default memo(ModalEndGame);