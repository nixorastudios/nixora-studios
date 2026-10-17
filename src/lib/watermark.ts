export type WatermarkType = 'visible' | 'invisible' | 'both';
const encoder = new TextEncoder();
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
/** PNG tEXt attribution is removable metadata, not an authentication signature. */
export function addPngAttribution(png: Uint8Array, attribution: string): Uint8Array {
  const header = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!header.every((byte, index) => png[index] === byte)) throw new Error('Expected a PNG image.');
  let offset = 8;
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  while (offset + 12 <= png.length) {
    const length = view.getUint32(offset);
    if (offset + length + 12 > png.length) throw new Error('Invalid PNG chunk.');
    const type = new TextDecoder().decode(png.slice(offset + 4, offset + 8));
    if (type === 'IEND') {
      const data = encoder.encode(`NIXORA Attribution\0${attribution}`);
      const chunk = new Uint8Array(data.length + 12);
      const chunkView = new DataView(chunk.buffer);
      chunkView.setUint32(0, data.length);
      chunk.set(encoder.encode('tEXt'), 4); chunk.set(data, 8);
      chunkView.setUint32(chunk.length - 4, crc32(chunk.slice(4, -4)));
      const output = new Uint8Array(png.length + chunk.length);
      output.set(png.slice(0, offset)); output.set(chunk, offset); output.set(png.slice(offset), offset + chunk.length);
      return output;
    }
    offset += length + 12;
  }
  throw new Error('Missing PNG end chunk.');
}
/** Browser-only export. Pass owner attribution explicitly; no private identity is bundled. */
export async function addWatermark(file: File, type: WatermarkType = 'both', ownerAttribution = 'NIXORA STUDIOS'): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('Watermarks currently support images only.');
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image export is unavailable.');
    ctx.drawImage(bitmap, 0, 0);
    if (type !== 'invisible') {
      ctx.font = `bold ${Math.max(10, Math.floor(bitmap.width / 35))}px sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      const margin = Math.max(4, Math.floor(bitmap.width / 45));
      const label = 'NIXORA STUDIOS';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.strokeText(label, canvas.width - margin, canvas.height - margin, canvas.width - margin * 2);
      ctx.fillText(label, canvas.width - margin, canvas.height - margin, canvas.width - margin * 2);
    }
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image export failed.')), 'image/png'));
    let bytes = new Uint8Array(await blob.arrayBuffer());
    if (type !== 'visible') bytes = addPngAttribution(bytes, ownerAttribution);
    return new File([bytes], `${file.name.replace(/\.[^.]+$/, '')}-nixora.png`, { type: 'image/png' });
  } finally { bitmap.close(); }
}
