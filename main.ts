// The Owl That Read Itself — entrypoint for make.fun ai-excited-01.
//
// What this program does, in plain words: the picture that belongs to this
// entry lives next to this file as entry.png. This script checks that the
// picture is really there and really a picture, then places a copy of it in
// the grader's output folder so the judge sees exactly those bytes.
//
// The output folder comes from MAKEFUN_OUTPUT_DIR when it is set (that is
// how the entry is run outside the grader's container); otherwise the
// program uses /output, which is where the grader looks.
//
// Nothing here reaches the network and nothing is generated at run time:
// the image is a fixed asset of this repository, and this script is only
// the honest courier that carries it to the output folder.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTRY_NAME = 'entry.png';
const MAX_BYTES = 1024 * 1024;

// First bytes of the two image shapes the gate accepts. A PNG starts with
// 89 50 4E 47; a JPEG starts with FF D8 FF. Anything else is not an image
// the gate would take, so the script stops instead of handing it on.
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

function die(reason) {
  console.error(`entry failed: ${reason}`);
  process.exit(1);
}

function kindOf(bytes) {
  const startsWith = (magic) => magic.every((byte, i) => bytes[i] === byte);
  if (startsWith(PNG_MAGIC)) return 'PNG';
  if (startsWith(JPEG_MAGIC)) return 'JPEG';
  return null;
}

// Read the pixel size straight out of the image header, so a picture that
// is wider or taller than the 1024 gate can be caught here instead of
// failing later in front of the judge. A PNG keeps its width and height in
// the IHDR chunk (bytes 16 to 23, big-endian). A JPEG hides them in the
// first frame header (SOF0 or SOF2): after the marker and its length come
// one precision byte, then height, then width, each two bytes big-endian.
function dimensionsOf(bytes, kind) {
  if (kind === 'PNG') {
    if (bytes.length < 24) return null;
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    return { width, height };
  }
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      const height = bytes.readUInt16BE(offset + 5);
      const width = bytes.readUInt16BE(offset + 7);
      return { width, height };
    }
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }
  return null;
}

function run() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, ENTRY_NAME);
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  const target = join(outputDir, ENTRY_NAME);

  if (!existsSync(source)) {
    die(`${ENTRY_NAME} is missing from the repository directory ${here}`);
  }

  const size = statSync(source).size;
  if (size === 0) {
    die(`${ENTRY_NAME} is empty`);
  }
  if (size > MAX_BYTES) {
    die(`${ENTRY_NAME} is ${size} bytes, over the 1 MiB gate`);
  }

  const bytes = readFileSync(source);
  const kind = kindOf(bytes);
  if (kind === null) {
    die(`${ENTRY_NAME} is neither a PNG nor a JPEG by its first bytes`);
  }

  const dims = dimensionsOf(bytes, kind);
  if (dims === null) {
    die(`${ENTRY_NAME} has no readable size in its header`);
  }
  if (dims.width === 0 || dims.height === 0 || dims.width > 1024 || dims.height > 1024) {
    die(`${ENTRY_NAME} is ${dims.width}x${dims.height}, outside the 1024x1024 gate`);
  }

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(target, bytes);

  const written = statSync(target).size;
  if (written !== size) {
    die(`wrote ${written} bytes but the source holds ${size}`);
  }
  console.log(`wrote ${resolve(target)} (${size} bytes, ${kind}, ${dims.width}x${dims.height})`);
}

run();
