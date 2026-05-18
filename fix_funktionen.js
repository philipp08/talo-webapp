const fs = require('fs');
const file = 'app/funktionen/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The visual is wrapped in:
// {/* Visual */}
// <div className={`${visualClass} ...`}>
//   <div className="w-full h-full ...">
//     {item.visual}
//   </div>
// </div>

content = content.replace(/\{\/\*\s*Visual\s*\*\/\}\s*<div[\s\S]*?\{item\.visual\}\s*<\/div>\s*<\/div>/g, '');

fs.writeFileSync(file, content);
