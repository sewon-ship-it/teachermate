import fs from 'fs';

const files = fs.readdirSync('.');
console.log('Root files:', files.filter(f => f.endsWith('.csv') || f.endsWith('.xlsx') || f.endsWith('.txt')));

const docFiles = fs.existsSync('docs') ? fs.readdirSync('docs') : [];
console.log('Docs files:', docFiles);
