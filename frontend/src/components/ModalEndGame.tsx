import { Flex, Text, Button, Dialog, Heading } from '@radix-ui/themes';
import { memo, useState, useCallback, useEffect } from 'react';
import { shareResult, type GameNode } from '../lib/share';
import type { ShortestPathResult } from '@/lib/graph';

interface ModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    result?: ShortestPathResult | null;
}

/**
 * ModalEndGame — modal de vitória. Mudança vs. versão ReactFlow:
 *  - não usa mais `useReactFlow` para animar arestas (o board Cytoscape anima a
 *    classe `.path` por conta própria); recebe o `result` do pathfinding local.
 *  - monta o texto do caminho ("A ➔ Novela ➔ B") a partir de `result.nodes`.
 *  - o compartilhamento (share.ts) é preservado integralmente.
 */
function ModalEndGame({ open = false, onOpenChange, result }: ModalProps) {
    const [path, setPath] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

    useEffect(() => {
        if (!result?.nodes?.length) {
            setPath('');
            return;
        }
        setPath(result.nodes.map((n) => n.name).join('\n➔\n'));
    }, [result]);

    const handleShare = useCallback(async () => {
        if (!result?.nodes) return;
        setIsSharing(true);
        try {
            const nodes: GameNode[] = result.nodes.map((n) => ({ name: n.name, type: n.type }));
            const outcome = await shareResult(nodes);
            if (outcome.status === "copied") {
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
            }
        } finally {
            setIsSharing(false);
        }
    }, [result]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Fim de jogo</Dialog.Title>
                <Flex direction="column" gap="3">
                    <Heading size="6" align="center">
                        🏆 PARABÉNS! 🏆
                    </Heading>
                    <Text size="4" align="center">
                        Você conseguiu conectar os artistas Globais através de suas conexões!
                    </Text>
                    <Text size="4" align="center" style={{ whiteSpace: 'pre-line' }}>
                        {path}
                    </Text>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Fechar
                        </Button>
                    </Dialog.Close>
                    {result?.found === true && (result?.nodes?.length ?? 0) >= 3 && (
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
