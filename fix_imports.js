import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

function fixImports(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to find relative imports without extensions
  // It looks for: from './something' or from '../something'
  // and ensures it doesn't already have an extension
  const regex = /from '(\.\.?\/[^']+)(?<!\.js)(?<!\.css)(?<!\.scss)(?<!\.json)'/g;
  let newContent = content.replace(regex, "from '$1.js'");
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed imports in ${filePath}`);
  }
}

console.log('Starting import fix...');
walk('src', fixImports);
if (fs.existsSync('server.ts')) {
  fixImports('server.ts');
}
console.log('Finished import fix.');
