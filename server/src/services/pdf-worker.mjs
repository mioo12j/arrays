// Standalone PDF text extractor using the modern, maintained pdfjs-dist.
// Run as a short-lived child process so any parser issue stays isolated from
// the long-running API server. Usage:  node pdf-worker.mjs <file>
// Prints extracted text to stdout; exits non-zero with a message on stderr.
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  process.stderr.write('no file argument');
  process.exit(2);
}

try {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(file));
  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
    // No worker in Node: run on the main thread of this child process.
  }).promise;

  let out = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    // Reconstruct rough line breaks from text item vertical positions.
    let lastY = null;
    for (const item of content.items) {
      const y = item.transform ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) out += '\n';
      else if (out && !out.endsWith('\n')) out += ' ';
      out += item.str;
      lastY = y;
    }
    out += '\n';
  }
  process.stdout.write(out);
  process.exit(0);
} catch (err) {
  process.stderr.write(err?.message || 'pdf parse failed');
  process.exit(1);
}
