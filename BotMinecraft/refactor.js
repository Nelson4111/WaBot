const fs = require('fs');
const path = require('path');

const srcDir = './src/modules';
const dirs = ['combat', 'inventory', 'movement', 'utils', 'storage'];

dirs.forEach(d => {
  const dirPath = path.join(srcDir, d);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

const moves = {
  'MobFarm.js': 'combat/MobFarm.js',
  'GuardMode.js': 'combat/GuardMode.js',
  'AutoEat.js': 'inventory/AutoEat.js',
  'Pathfinder.js': 'movement/Pathfinder.js',
  'AutoAuth.js': 'utils/AutoAuth.js',
  'AutoRespawn.js': 'utils/AutoRespawn.js',
  'AntiAfk.js': 'utils/AntiAfk.js'
};

for (const [file, target] of Object.entries(moves)) {
  const oldPath = path.join(srcDir, file);
  const newPath = path.join(srcDir, target);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Moved ' + file + ' to ' + target);
    
    let content = fs.readFileSync(newPath, 'utf8');
    content = content.replace(/require\('\.\.\/utils/g, "require('../../utils");
    content = content.replace(/require\('\.\.\/config/g, "require('../../config");
    content = content.replace(/require\('\.\.\/services/g, "require('../../services");
    content = content.replace(/require\('\.\.\/core/g, "require('../../core");
    fs.writeFileSync(newPath, content);
  }
}
