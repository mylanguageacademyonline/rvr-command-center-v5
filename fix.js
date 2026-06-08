const fs = require('fs');
const path = require('path');
const dirs = [
  path.join(process.cwd(), 'src/components/dashboards'),
  path.join(process.cwd(), 'src/components/ui')
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.startsWith('"') && content.endsWith('"')) {
        console.log('Fixing: ' + filePath);
        try {
          const unescaped = JSON.parse(content);
          fs.writeFileSync(filePath, unescaped);
        } catch(e) {
          console.error('Failed to parse ' + filePath, e);
        }
      }
    }
  }
}
