
import { Flex, Text, Button, Dialog, TextField } from '@radix-ui/themes';
import { memo } from 'react';

interface Graph {
    grau?: number;
    path?: string
    found?: boolean;
}

interface ModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    graph?: Graph
}

function Modal({ open = false, onOpenChange, graph }: ModalProps) {

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
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