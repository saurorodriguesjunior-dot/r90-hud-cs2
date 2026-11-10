// Leitor mínimo de VPK v2 (formato de pacotes do Source/Source 2). Só leitura.
const fs = require('fs');
const path = require('path');

function readCString(buf, pos) {
  let end = pos;
  while (buf[end] !== 0) end++;
  return [buf.toString('utf8', pos, end), end + 1];
}

function openVpk(dirFile) {
  const buf = fs.readFileSync(dirFile);
  if (buf.readUInt32LE(0) !== 0x55aa1234) throw new Error('Não é um VPK');
  const version = buf.readUInt32LE(4);
  const treeSize = buf.readUInt32LE(8);
  const headerSize = version === 2 ? 28 : 12;
  const entries = new Map();
  let p = headerSize;
  const treeEnd = headerSize + treeSize;
  while (p < treeEnd) {
    let ext; [ext, p] = readCString(buf, p);
    if (!ext) break;
    while (true) {
      let dir; [dir, p] = readCString(buf, p);
      if (!dir) break;
      while (true) {
        let name; [name, p] = readCString(buf, p);
        if (!name) break;
        const preloadBytes = buf.readUInt16LE(p + 4);
        const archiveIndex = buf.readUInt16LE(p + 6);
        const offset = buf.readUInt32LE(p + 8);
        const length = buf.readUInt32LE(p + 12);
        p += 18;
        const preload = buf.subarray(p, p + preloadBytes);
        p += preloadBytes;
        const full = (dir === ' ' ? '' : dir + '/') + name + (ext === ' ' ? '' : '.' + ext);
        entries.set(full.toLowerCase(), { archiveIndex, offset, length, preload });
      }
    }
  }
  const base = dirFile.replace(/_dir\.vpk$/i, '');
  function read(name) {
    const e = entries.get(name.toLowerCase());
    if (!e) return null;
    let data = Buffer.alloc(0);
    if (e.length) {
      if (e.archiveIndex === 0x7fff) {
        data = buf.subarray(treeEnd + e.offset, treeEnd + e.offset + e.length);
      } else {
        const arc = `${base}_${String(e.archiveIndex).padStart(3, '0')}.vpk`;
        const fd = fs.openSync(arc, 'r');
        data = Buffer.alloc(e.length);
        fs.readSync(fd, data, 0, e.length, e.offset);
        fs.closeSync(fd);
      }
    }
    return Buffer.concat([e.preload, data]);
  }
  return { entries, read };
}

module.exports = { openVpk };
