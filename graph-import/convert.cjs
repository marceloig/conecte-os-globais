// This script converts novelas_corrigido.csv to AWS Neptune compatible format
const fs = require('fs');
const Papa = require('papaparse');

// Read the input file
const inputFile = 'novelas_corrigido.csv';
const fileContent = fs.readFileSync(inputFile, 'utf8');

// Parse the CSV
const parsedData = Papa.parse(fileContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
});

// Helper function to create node IDs
function createNeptuneId(prefix, name) {
  return `${prefix}_${name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
}

// Create collections to store unique nodes
let novelaNodes = new Map();
let atorNodes = new Map();
let edges = [];

// Process each row in the input CSV
parsedData.data.forEach(row => {
  if (!row.novela || !row.ator) return;
  
  const novelaId = createNeptuneId('novela', row.novela);
  const atorId = createNeptuneId('ator', row.ator);
  
  // Add novela node if not already added
  if (!novelaNodes.has(novelaId)) {
    novelaNodes.set(novelaId, {
      '~id': novelaId,
      '~label': 'Novela',
      name: row.novela
    });
  }
  
  // Add ator node if not already added
  if (!atorNodes.has(atorId)) {
    atorNodes.set(atorId, {
      '~id': atorId,
      '~label': 'Ator',
      name: row.ator
    });
  }
  
  // Add edge between ator and novela
  edges.push({
    '~id': `${atorId}_acted_in_${novelaId}`,
    '~from': atorId,
    '~to': novelaId,
    '~label': 'ACTED_IN',
    personagem: row.personagem || null
  });
});

// Helper function to convert objects to CSV format
function formatForNeptune(objects) {
  // Get all possible headers
  const allHeaders = new Set();
  objects.forEach(obj => {
    Object.keys(obj).forEach(key => allHeaders.add(key));
  });
  const headers = Array.from(allHeaders);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...objects.map(obj => 
      headers.map(header => {
        const value = obj[header];
        if (value === null || value === undefined) return '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

// Generate the Neptune-compatible CSV files
const novelaNodesCSV = formatForNeptune(Array.from(novelaNodes.values()));
const atorNodesCSV = formatForNeptune(Array.from(atorNodes.values()));
const edgesCSV = formatForNeptune(edges);

// Write the files
fs.writeFileSync('novelas_nodes.csv', novelaNodesCSV);
fs.writeFileSync('atores_nodes.csv', atorNodesCSV);
fs.writeFileSync('relationships.csv', edgesCSV);

console.log(`Conversion complete:
- ${novelaNodes.size} novela nodes written to novelas_nodes.csv
- ${atorNodes.size} ator nodes written to atores_nodes.csv
- ${edges.length} relationships written to relationships.csv`);