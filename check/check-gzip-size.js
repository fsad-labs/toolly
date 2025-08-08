import fx from 'fs';
import zlib from 'zlib';

const file = "dist/index.js";
const fileBuffer = fx.readFileSync(file);

const gzipSize = zlib.gzipSync(fileBuffer);

console.log(`Original size of ${file}: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
console.log(`Gzip size of ${file}: ${(gzipSize.length / 1024).toFixed(2)} KB`);

