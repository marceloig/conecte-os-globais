
import { Flex, Text, Button, Dialog, Heading, Strong } from '@radix-ui/themes';
import { memo } from 'react';
import '../index.css'


function ModalHowToPlay() {

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <button className='tv-analog-button'>Como Jogar</button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Como Jogar</Dialog.Title>
                <Flex direction="column" gap="3">
                    <Heading size="6">
                        Conecte os Globais
                    </Heading>
                    <Text>
                        O objetivo do jogo é conectar dois atores globais através de conexões de novelas e atores.
                    </Text>
                    <Text>Clique em <Strong>Novo Jogo</Strong> para começar uma nova partida.
                    Clique no ator para escolher e adicionar uma novela e na novela para adicionar um novo ator.</Text>
                    <Text>Desafie-se a encontrar o caminho mais curto entre os dois atores!</Text>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Fechar
                        </Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default memo(ModalHowToPlay);