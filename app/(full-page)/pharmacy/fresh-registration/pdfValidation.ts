/**
 * Client-side PDF validation.
 * Returns an error message string on failure, or null when the file is acceptable.
 */
export async function validatePdfFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bytes = new Uint8Array(e.target?.result as ArrayBuffer);

        if (bytes.length < 5) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // 1. Valid PDF signature
        const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
        if (!header.startsWith("%PDF-")) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // Decode as latin1 — preserves all byte values 0–255 without alteration
        const raw = new TextDecoder("latin1").decode(bytes);

        // 2. Structural integrity — must terminate with %%EOF
        if (!raw.includes("%%EOF")) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // 2b. Cross-reference table integrity
        // startxref must exist with a positive offset that falls within the file
        const startxrefMatch = raw.match(/startxref[\r\n\s]+(\d+)/);
        const xrefOffset = startxrefMatch ? parseInt(startxrefMatch[1], 10) : -1;
        if (xrefOffset <= 0 || xrefOffset >= bytes.length) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }
        // Must have either a traditional xref+trailer OR a PDF 1.5+ cross-reference stream
        const hasTraditionalXref = /\bxref\b/.test(raw) && /\btrailer\b/.test(raw);
        const hasCrossRefStream  = /\/Type[\s\r\n]*\/XRef/.test(raw);
        if (!hasTraditionalXref && !hasCrossRefStream) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // 3. Encrypted / password-protected
        if (/\/Encrypt[\s<(\/\[]/.test(raw)) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // 4. Embedded JavaScript
        if (/\/JavaScript[\s<(\/\[]/.test(raw) || /\/JS[\s<(\/\[]/.test(raw)) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // 5. Launch actions
        if (/\/Launch[\s<(\/\[]/.test(raw)) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // 6. Embedded files
        if (/\/EmbeddedFile[\s<(\/\[]/.test(raw)) {
          resolve("The uploaded PDF contains unsupported or potentially unsafe content.");
          return;
        }

        // 7. Whitespace-only content streams
        // Collect all stream bodies; if every byte is whitespace or null, the file is blank
        {
          const wsStreamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
          const parts: string[] = [];
          let wsMatch;
          while ((wsMatch = wsStreamRe.exec(raw)) !== null) parts.push(wsMatch[1]);
          const combined = parts.join("");
          if (combined.length > 0 && /^[\s\x00]*$/.test(combined)) {
            resolve("The uploaded PDF appears to be blank. Please upload a valid document.");
            return;
          }
        }

        // 8. Blank content detection
        // Every PDF with real visible content references fonts (text) or image XObjects.
        const hasFont  = /\/Font[\s<(\/\[]/.test(raw);
        const hasImage = /\/Subtype[\s\r\n]*\/Image/.test(raw);

        if (!hasFont && !hasImage) {
          // Fallback: scan uncompressed content streams for actual drawing operators
          const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
          let hasOps = false;
          let m;
          while ((m = streamRe.exec(raw)) !== null) {
            const content = m[1].trim();
            if (content.length > 0 && !/^[\sqQ\r\n]*$/.test(content)) {
              hasOps = true;
              break;
            }
          }
          if (!hasOps) {
            resolve("The uploaded PDF appears to be blank. Please upload a valid document.");
            return;
          }
        }

        resolve(null); // all checks passed
      } catch {
        resolve(null); // allow upload if validation itself cannot complete
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}
