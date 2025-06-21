// Importar biblioteca para processamento de CSV
import Papa from 'papaparse';
import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler o arquivo CSV
const fileContent = await readFile('novelas_corrigido.csv', { encoding: 'utf8' });
const arquivoSaida = path.join(__dirname, 'novelas_opencypher.cypher');

// Processar o CSV
const parsedData = Papa.parse(fileContent, {
  header: true,
  skipEmptyLines: true
});

// Coletar valores únicos para cada tipo de nó
const novelas = new Set();
const atores = new Set();
const personagens = new Set();

// Registrar relacionamentos únicos (para evitar duplicação)
const relacionamentos = new Set();

parsedData.data.forEach(row => {
  if (row.novela && row.novela.trim() !== '') {
    novelas.add(row.novela);
  }
  
  if (row.ator && row.ator.trim() !== '') {
    atores.add(row.ator);
  }
  
  if (row.personagem && row.personagem.trim() !== '') {
    personagens.add(row.personagem);
  }
  
  // Registrar relação ator-personagem
  if (row.ator && row.personagem && row.ator.trim() !== '' && row.personagem.trim() !== '') {
    relacionamentos.add(`ATOR_PERSONAGEM:${row.ator}|${row.personagem}`);
  }
  
  // Registrar relação personagem-novela
  if (row.personagem && row.novela && row.personagem.trim() !== '' && row.novela.trim() !== '') {
    relacionamentos.add(`PERSONAGEM_NOVELA:${row.personagem}|${row.novela}`);
  }
});

// Função para escapar aspas em strings
function escapeString(str) {
  return str.replace(/"/g, '\\"');
}

// Criar arquivo de saída
let cypherCommands = [];

// 1. Adicionar constraints (para garantir unicidade)
cypherCommands.push('// CONSTRAINTS DE UNICIDADE');
cypherCommands.push('CREATE CONSTRAINT novela_nome_unique IF NOT EXISTS FOR (n:Novela) REQUIRE n.nome IS UNIQUE;');
cypherCommands.push('CREATE CONSTRAINT ator_nome_unique IF NOT EXISTS FOR (a:Ator) REQUIRE a.nome IS UNIQUE;');
cypherCommands.push('CREATE CONSTRAINT personagem_nome_unique IF NOT EXISTS FOR (p:Personagem) REQUIRE p.nome IS UNIQUE;');
cypherCommands.push('');

// 2. Comandos para criar nós de Novelas
cypherCommands.push('// CRIAÇÃO DE NÓS DE NOVELA');
Array.from(novelas).forEach(novela => {
  cypherCommands.push(`CREATE (:Novela {nome: "${escapeString(novela)}"});`);
});
cypherCommands.push('');

// 3. Comandos para criar nós de Atores
cypherCommands.push('// CRIAÇÃO DE NÓS DE ATOR');
Array.from(atores).forEach(ator => {
  cypherCommands.push(`CREATE (:Ator {nome: "${escapeString(ator)}"});`);
});
cypherCommands.push('');

// 4. Comandos para criar nós de Personagens
cypherCommands.push('// CRIAÇÃO DE NÓS DE PERSONAGEM');
Array.from(personagens).forEach(personagem => {
  cypherCommands.push(`CREATE (:Personagem {nome: "${escapeString(personagem)}"});`);
});
cypherCommands.push('');

// 5. Comandos para criar relacionamentos Ator-Personagem
cypherCommands.push('// CRIAÇÃO DE RELACIONAMENTOS ATOR-PERSONAGEM');
Array.from(relacionamentos)
  .filter(rel => rel.startsWith('ATOR_PERSONAGEM:'))
  .forEach(rel => {
    const [ator, personagem] = rel.replace('ATOR_PERSONAGEM:', '').split('|');
    cypherCommands.push(`MATCH (a:Ator {nome: "${escapeString(ator)}"}), (p:Personagem {nome: "${escapeString(personagem)}"}) CREATE (a)-[:INTERPRETOU]->(p);`);
  });
cypherCommands.push('');

// 6. Comandos para criar relacionamentos Personagem-Novela
cypherCommands.push('// CRIAÇÃO DE RELACIONAMENTOS PERSONAGEM-NOVELA');
Array.from(relacionamentos)
  .filter(rel => rel.startsWith('PERSONAGEM_NOVELA:'))
  .forEach(rel => {
    const [personagem, novela] = rel.replace('PERSONAGEM_NOVELA:', '').split('|');
    cypherCommands.push(`MATCH (p:Personagem {nome: "${escapeString(personagem)}"}), (n:Novela {nome: "${escapeString(novela)}"}) CREATE (p)-[:APARECEU_EM]->(n);`);
  });

// Verificar estatísticas de conversão
console.log(`Estatísticas da conversão:
- ${novelas.size} novelas únicas
- ${atores.size} atores únicos
- ${personagens.size} personagens únicos
- ${relacionamentos.size} relacionamentos únicos
- ${cypherCommands.length} comandos Cypher gerados`);

// Verificar tamanho do arquivo resultante
const cypherContent = cypherCommands.join('\n');
console.log(`Tamanho do arquivo resultante: ${cypherContent.length} caracteres`);

// Exibir as primeiras 10 linhas do arquivo para verificação
console.log('\nPrimeiras 10 linhas do arquivo gerado:');
cypherCommands.slice(0, 10).forEach(line => console.log(line));

// Demonstrar os comandos para os primeiros 3 nós de cada tipo
console.log('\nExemplos de comandos para nós:');
console.log('Novelas (3 primeiras):');
cypherCommands.filter(cmd => cmd.startsWith('CREATE (:Novela')).slice(0, 3).forEach(cmd => console.log(cmd));

console.log('\nAtores (3 primeiros):');
cypherCommands.filter(cmd => cmd.startsWith('CREATE (:Ator')).slice(0, 3).forEach(cmd => console.log(cmd));

console.log('\nPersonagens (3 primeiros):');
cypherCommands.filter(cmd => cmd.startsWith('CREATE (:Personagem')).slice(0, 3).forEach(cmd => console.log(cmd));

console.log('\nRelacionamentos (3 primeiros de cada tipo):');
console.log('Ator-Personagem:');
cypherCommands.filter(cmd => cmd.startsWith('MATCH (a:Ator')).slice(0, 3).forEach(cmd => console.log(cmd));

console.log('\nPersonagem-Novela:');
cypherCommands.filter(cmd => cmd.startsWith('MATCH (p:Personagem')).slice(0, 3).forEach(cmd => console.log(cmd));

// Preparar para exportar o arquivo completo
const outputCypher = cypherContent;
console.log(`💾 Escrevendo arquivo de saída: ${arquivoSaida}`);
    await writeFile(arquivoSaida, outputCypher);

// Retornar um indicador de sucesso
console.log("\nArquivo openCypher gerado com sucesso!");