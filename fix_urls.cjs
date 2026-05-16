const fs = require('fs');
const path = require('path');

const base = 'C:/Users/JYOTHIS JOSHY/Downloads/AUTOmax-main/AUTOmax-main';

const files = [
  'src/pages/Login.jsx',
  'src/pages/Garage.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/UserProfile.jsx',
  'src/pages/SellCar.jsx',
  'src/components/LiveAuctions.jsx',
  'src/components/HeroSection.jsx',
  'src/components/Navbar.jsx',
];

files.forEach(rel => {
  const fullPath = path.join(base, rel);
  let c = fs.readFileSync(fullPath, 'utf8');

  // Replace all localhost:5000 occurrences with ${API_BASE}
  // Handle both fetch() strings and axios strings (both with and without backticks already)
  c = c.replaceAll("'http://localhost:5000", '`${API_BASE}');
  c = c.replaceAll('"http://localhost:5000', '`${API_BASE}');
  // Fix closing quotes that should now be backticks
  // e.g.  `${API_BASE}/api/cars' → `${API_BASE}/api/cars`
  c = c.replace(/`\$\{API_BASE\}([^`'"\n]*?)'/g, '`${API_BASE}$1`');
  c = c.replace(/`\$\{API_BASE\}([^`'"\n]*?)"/g, '`${API_BASE}$1`');

  // Add import if missing
  if (!c.includes('import API_BASE')) {
    // Use relative path adjustment based on file depth
    const depth = rel.split('/').length - 1; // 1 for pages, 1 for components
    const importPath = depth === 1 ? '../config' : '../config';
    c = c.replace("import React", `import API_BASE from '${importPath}';\nimport React`);
  }

  fs.writeFileSync(fullPath, c, 'utf8');
  console.log('✅ Updated:', rel);
});
