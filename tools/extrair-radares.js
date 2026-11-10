// Extrai os radares (minimapas) e as coordenadas dos mapas do SEU CS2 instalado.
// Só lê os arquivos do jogo; nada no jogo é alterado.
// Uso: node tools/extrair-radares.js ["C:\caminho\para\Counter-Strike Global Offensive"]
// Gera: public/maps/<mapa>.png (e <mapa>_lower.png) e public/maps/maps.json
// As imagens são da Valve: use só na sua transmissão, não redistribua.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { openVpk } = require('./vpk');

const MAPS = ['de_ancient', 'de_anubis', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_overpass', 'de_train', 'de_vertigo'];
const OUT = path.join(__dirname, '..', 'public', 'maps');

function findGame() {
  const arg = process.argv[2];
  const cands = arg ? [arg] : [];
  const libs = ['C:\\Program Files (x86)\\Steam', 'C:\\Program Files\\Steam', 'D:\\SteamLibrary', 'E:\\SteamLibrary', 'F:\\SteamLibrary', 'D:\\Steam', 'E:\\Steam'];
  try {
    const vdf = fs.readFileSync('C:\\Program Files (x86)\\Steam\\steamapps\\libraryfolders.vdf', 'utf8');
    for (const m of vdf.matchAll(/"path"\s+"([^"]+)"/g)) libs.unshift(m[1].replace(/\\\\/g, '\\'));
  } catch {}
  for (const l of libs) cands.push(path.join(l, 'steamapps', 'common', 'Counter-Strike Global Offensive'));
  for (const c of cands) {
    const vpk = path.join(c, 'game', 'csgo', 'pak01_dir.vpk');
    if (fs.existsSync(vpk)) return vpk;
  }
  throw new Error('Não achei o CS2. Passe a pasta do jogo: node tools/extrair-radares.js "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive"');
}

// Descompactador LZ4 (formato bloco)
function lz4Block(src, outSize) {
  const dst = Buffer.alloc(outSize);
  let s = 0, d = 0;
  while (s < src.length) {
    const token = src[s++];
    let lit = token >> 4;
    if (lit === 15) { let b; do { b = src[s++]; lit += b; } while (b === 255); }
    src.copy(dst, d, s, s + lit); s += lit; d += lit;
    if (s >= src.length) break;
    const off = src[s] | (src[s + 1] << 8); s += 2;
    let len = token & 15;
    if (len === 15) { let b; do { b = src[s++]; len += b; } while (b === 255); }
    len += 4;
    let m = d - off;
    for (let i = 0; i < len; i++) dst[d++] = dst[m++];
  }
  return dst;
}

// Lê uma textura .vtex_c BGRA8888 / RGBA8888 (formato dos radares do CS2)
function decodeVtex(t) {
  const headerSize = t.readUInt32LE(0);
  const blockOff = 8 + t.readUInt32LE(8);
  const n = t.readUInt32LE(12);
  let d = -1;
  for (let i = 0; i < n; i++) {
    const p = blockOff + i * 12;
    if (t.toString('latin1', p, p + 4) === 'DATA') d = p + 4 + t.readUInt32LE(p + 4);
  }
  if (d < 0) throw new Error('Textura sem bloco DATA');
  const w = t.readUInt16LE(d + 20), h = t.readUInt16LE(d + 22), fmt = t[d + 26], mips = t[d + 27];
  if (fmt !== 28 && fmt !== 4) throw new Error(`Formato de textura ${fmt} não suportado`);
  // Tamanho compactado de cada mip (extra data tipo 4)
  const extraOff = d + 32 + t.readUInt32LE(d + 32), extraCount = t.readUInt32LE(d + 36);
  let compressed = null;
  for (let i = 0; i < extraCount; i++) {
    const p = extraOff + i * 12;
    if (t.readUInt32LE(p) === 4) {
      const off = p + 4 + t.readUInt32LE(p + 4);
      const isComp = t.readUInt32LE(off) === 1;
      const sizesAt = off + 4 + t.readUInt32LE(off + 4);
      const count = t.readUInt32LE(off + 8);
      if (isComp) compressed = Array.from({ length: count }, (_, k) => t.readInt32LE(sizesAt + k * 4));
    }
  }
  // Os mips ficam do menor para o maior; o maior (nível 0) é o último
  let pos = headerSize;
  let px;
  for (let m = mips - 1; m >= 0; m--) {
    const mw = Math.max(1, w >> m), mh = Math.max(1, h >> m);
    const raw = mw * mh * 4;
    const size = compressed ? compressed[mips - 1 - m] : raw;
    if (m === 0) px = compressed ? lz4Block(t.subarray(pos, pos + size), raw) : t.subarray(pos, pos + raw);
    pos += size;
  }
  const rgba = Buffer.from(px);
  if (fmt === 28) for (let i = 0; i < rgba.length; i += 4) { const b = rgba[i]; rgba[i] = rgba[i + 2]; rgba[i + 2] = b; }
  return { w, h, rgba };
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function png(w, h, rgba) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const rows = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(rows, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Lê os números do arquivo de overview (KeyValues simples)
function parseOverview(txt) {
  const num = (k) => { const m = new RegExp(`"${k}"\\s+"(-?[\\d.]+)"`, 'i').exec(txt); return m ? Number(m[1]) : undefined; };
  const info = { pos_x: num('pos_x'), pos_y: num('pos_y'), scale: num('scale') };
  // Mapas de dois andares: "verticalsections" { "default" {...} "lower" { "AltitudeMax" ... } }
  const lower = /"lower"\s*(?:\/\/[^\n]*)?\s*\{([^}]*)\}/i.exec(txt);
  if (lower) {
    const max = /"AltitudeMax"\s+"(-?[\d.]+)"/i.exec(lower[1]);
    if (max) info.lowerBelowZ = Number(max[1]);
  }
  // Pontos de referência (0..1 na imagem): spawns e bombsites
  for (const k of ['CTSpawn', 'TSpawn', 'bombA', 'bombB']) {
    const x = num(`${k}_x`), y = num(`${k}_y`);
    if (x !== undefined && y !== undefined) info[k] = [x, y];
  }
  return info;
}

const vpkFile = findGame();
console.log('Lendo', vpkFile);
const vpk = openVpk(vpkFile);
fs.mkdirSync(OUT, { recursive: true });
const result = {};
for (const map of MAPS) {
  const ov = vpk.read(`resource/overviews/${map}.txt`);
  if (!ov) { console.log(`- ${map}: sem overview, pulando`); continue; }
  const info = parseOverview(ov.toString('utf8'));
  for (const [suffix, file] of [['', `${map}_radar_psd`], ['_lower', `${map}_lower_radar_psd`]]) {
    const tex = vpk.read(`panorama/images/overheadmaps/${file}.vtex_c`);
    if (!tex) continue;
    try {
      const { w, h, rgba } = decodeVtex(tex);
      fs.writeFileSync(path.join(OUT, `${map}${suffix}.png`), png(w, h, rgba));
      if (suffix) info.lowerImage = `/maps/${map}_lower.png`; else { info.image = `/maps/${map}.png`; info.size = w; }
    } catch (e) {
      console.log(`- ${map}${suffix}: ${e.message}`);
    }
  }
  result[map] = info;
  console.log(`✓ ${map}`, JSON.stringify(info));
}
fs.writeFileSync(path.join(OUT, 'maps.json'), JSON.stringify(result, null, 2));
console.log(`Pronto: ${Object.keys(result).length} mapas em public/maps`);
