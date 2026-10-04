import { useCallback, useRef, useState } from 'react';
import "@radix-ui/themes/styles.css";
import { Box, Button, Container, Flex } from '@radix-ui/themes';
import GameBoard, { type GameBoardHandle } from './components/GameBoard';
import ModalEndGame from './components/ModalEndGame';
import ModalHowToPlay from './components/ModalHowToPlay';
import FuzzyText from './components/FuzzyText';
import TvStaticBackground from './components/TvStaticBackground';
import { env } from "@/config/env";
import { getRandomAtor, type ShortestPathResult } from "@/lib/graph";
import axios from "axios";
import './index.css'

/**
 * App — loop de jogo PRESERVADO. Mudanças vs. versão ReactFlow:
 *  - O tabuleiro agora é <GameBoard> (Cytoscape) em vez de <ReactFlow>.
 *  - "Novo jogo" sorteia 2 atores LOCALMENTE (getRandomAtor), e só busca a IMAGEM
 *    de cada um no backend TMDB (preservado) — antes o /atores/random fazia as duas
 *    coisas no backend (Neo4j + TMDB).
 *  - A verificação de caminho acontece dentro do GameBoard (findFilterShortestPath
 *    local) e sobe pelo callback onWin.
 */
function App() {
  const boardRef = useRef<GameBoardHandle>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [result, setResult] = useState<ShortestPathResult | null>(null);
  const [isLoadingNewGame, setIsLoadingNewGame] = useState(false);

  /** busca só a imagem do ator no backend TMDB (preservado) */
  const fetchAtorImg = useCallback(async (name: string): Promise<string> => {
    try {
      const res = await axios.get(`${env.VITE_API_ENDPOINT}/api/v1/atores/${name}`);
      return res.data.img ?? "";
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      return "";
    }
  }, []);

  const newGame = useCallback(async () => {
    setIsLoadingNewGame(true);
    try {
      // sorteio local dos 2 atores (substitui 2x GET /atores/random do Neo4j)
      let left = getRandomAtor();
      let right = getRandomAtor();
      while (right === left) right = getRandomAtor();

      const [leftImg, rightImg] = await Promise.all([
        fetchAtorImg(left),
        fetchAtorImg(right),
      ]);

      boardRef.current?.reset(
        { name: left, type: "ator", img: leftImg, direction: "left" },
        { name: right, type: "ator", img: rightImg, direction: "right" },
      );
      setResult(null);
    } finally {
      setIsLoadingNewGame(false);
    }
  }, [fetchAtorImg]);

  const handleWin = useCallback((r: ShortestPathResult) => {
    setResult(r);
    setOpenDialog(r.found);
  }, []);

  return (
    <Container size="4">
      <Flex direction="column">
        <Box>
          <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={0.6}
            enableHover={true}
            fontSize={32}
          >Conecte os Globais
          </FuzzyText>
        </Box>
        <Box
          width="100%"
          height="90vh"
        >
          <div className="tv-screen-wrapper">
            <TvStaticBackground />
            <div className="tv-scanlines" />
            <GameBoard ref={boardRef} onWin={handleWin} />
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4 }}>
              <ModalHowToPlay />
            </div>
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 4 }}>
              <Button onClick={newGame} loading={isLoadingNewGame} variant='classic' color='amber'>
                {isLoadingNewGame ? 'Carregando...' : 'Novo jogo'}
              </Button>
            </div>
          </div>
          <ModalEndGame open={openDialog} onOpenChange={setOpenDialog} result={result} />
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
