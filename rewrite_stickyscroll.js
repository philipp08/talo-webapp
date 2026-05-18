const fs = require('fs');
const file = 'app/components/StickyScroll.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove VisualCard function
content = content.replace(/\/\* ─── Shared visual wrapper ───[\s\S]*?export const stickyItems/m, 'export const stickyItems');

// Remove visual property from StickyItem interface
content = content.replace(/\s*visual:\s*React\.ReactNode;/g, '');

// Process stickyItems array to remove visual properties.
// Since it's nested JSX inside an array, a simpler regex replacement approach:
// We just replace visual: \(\n(?:.*\n){1,30}?\s*\), with nothing
content = content.replace(/\s*visual:\s*\([\s\S]*?\)(?=,?\n  },)/gm, '');

// Also remove visual rendering from the Right Content (Scrolling) part
content = content.replace(/sm:grid sm:grid-cols-2 items-stretch/g, 'flex flex-col items-center min-h-[340px] text-center');

// Adjust the inner p-7 box
content = content.replace(/<div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-between\\s* gap-8">/, '<div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-between gap-8 items-center max-w-2xl w-full">');

// Delete the visual section from rendering
content = content.replace(/\{\/\* Visual \*\/\}\s*<div className="h-72 sm:h-auto overflow-hidden relative">\s*\{item\.visual\}\s*<\/div>/g, '');

fs.writeFileSync(file, content);
