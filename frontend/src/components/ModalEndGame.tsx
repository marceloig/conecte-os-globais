import { Flex, Text, Button, Dialog, Heading } from '@radix-ui/themes';
import { memo, useState, useCallback } from 'react';
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
    const [isSharing, setIsSharing] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

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
            <Dialog.Content maxWidth="640px">
                <Dialog.Title>Fim de jogo</Dialog.Title>
                <Flex direction="column" gap="3">
                    <Heading size="6" align="center">
                        🏆 PARABÉNS! 🏆
                    </Heading>
                    <Text size="4" align="center">
                        Você conseguiu conectar os artistas Globais através de suas conexões!
                    </Text>
                    <Flex
                        wrap="wrap"
                        align="center"
                        justify="center"
                        gap="2"
                        style={{ rowGap: 8 }}
                    >
                        {(result?.nodes ?? []).map((n, i) => (
                            <Flex key={`${n.name}-${i}`} align="center" gap="2">
                                <span
                                    style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        borderRadius: 9999,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        color: '#fff',
                                        backgroundColor: n.type === 'ator' ? '#3b82f6' : '#f97316',
                                    }}
                                >
                                    {n.name}
                                </span>
                                {i < (result?.nodes?.length ?? 0) - 1 && (
                                    <span style={{ opacity: 0.7, fontSize: 14 }}>➔</span>
                                )}
                            </Flex>
                        ))}
                    </Flex>
                    {typeof result?.grau === 'number' && (
                        <Text size="2" align="center" color="gray">
                            Grau de separação: {result.grau}
                        </Text>
                    )}
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
