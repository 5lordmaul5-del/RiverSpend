import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await copyFile('web/index.html', 'dist/index.html');
console.log('RiverSpend mobile shell built into dist/.');