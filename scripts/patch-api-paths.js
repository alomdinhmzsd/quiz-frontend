const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(fullPath);
    }
  });
};

walk(targetDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const updated = content.replace(
    /axios\.get\(\s*([`'"])(\/api\/[^`'"]+?)\1/g,
    (match, quote, path) =>
      `axios.get(\`${process.env.REACT_APP_API_URL}${path}\`)`
  );
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf-8');
    console.log(`✅ Patched: ${filePath}`);
  }
});
