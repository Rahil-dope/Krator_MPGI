const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filelist = walk(fullPath, filelist);
    } else {
      filelist.push(fullPath);
    }
  });
  return filelist;
}

const files = walk('d:/WORK/Coding/KRATOS/src/app/api')
  .filter(f => f.endsWith('route.ts'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('force-dynamic')) {
    content = 'export const dynamic = "force-dynamic";\n' + content;
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
