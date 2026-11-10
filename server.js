// R90 HUD — servidor local (Node 18+, sem dependências)
// Recebe os dados do CS2 (Game State Integration), guarda as configurações
// do painel e envia tudo em tempo real para o HUD e o painel (Server-Sent Events).

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3500;
const HOST = process.env.HOST || '127.0.0.1';
const GSI_TOKEN = process.env.GSI_TOKEN || 'r90hud-token';

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const DEFAULT_CONFIG = {
  layout: 'horizontal', // 'horizontal' | 'vertical'
  match: {
    type: 'pro', // 'pro' | 'amador'
    eventName: 'Nome do Campeonato',
    amateurLabel: 'JOGO AMADOR',
    amateurNote: 'Partida amistosa',
    bestOf: 3,
    seriesA: 0,
    seriesB: 0,
    teamAStartsCT: true,
    swapSides: false,
  },
  teamA: { name: 'Time A', short: 'TMA', color: '#2f7bff', logo: '' },
  teamB: { name: 'Time B', short: 'TMB', color: '#ff8a1f', logo: '' },
  brand: {
    orgName: 'Minha Org',
    logo: '',
    primary: '#005ecf', // azul elétrico da live
    accent: '#00f000', // verde neon da live
    ct: '#4fb4ff',
    t: '#ffb02e',
    backgroundTop: '#085a9f', // gradiente dos painéis: topo
    background: '#0c1722', // gradiente dos painéis: base
    text: '#ffffff',
    opacity: 0.88,
  },
  veto: [],
  sponsors: { enabled: true, interval: 8, logos: [] },
  show: { hud: true, veto: false, sponsors: true, observed: true, mvp: true, radar: true, freeze: true },
  radar: { size: 360 }, // largura do minimapa em pixels (tela 1920×1080)
  mvp: { duration: 6 }, // segundos que o destaque de MVP fica na tela
};

function deepMerge(base, extra) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) {
    return extra === undefined ? base : extra;
  }
  const out = { ...base };
  if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
    for (const k of Object.keys(extra)) out[k] = deepMerge(base[k], extra[k]);
  }
  return out;
}

function loadConfig() {
  try {
    return deepMerge(DEFAULT_CONFIG, JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')));
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

let config = loadConfig();

// ---------- Biblioteca de times (data/teams.json) ----------
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
let teams = [];
try { teams = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf8')); } catch { teams = []; }
function saveTeams() { fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2)); }

const TEAM_COLORS = ['#2f7bff', '#ff8a1f', '#e6165a', '#3ddc84', '#a855f7', '#ffd23f', '#14b8a6', '#ef4444'];

function makeShort(name) {
  const clean = name
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .replace(/\b(team|esports?|e-sports|gaming|club|clan)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || name;
  if (clean.length <= 5) return clean.toUpperCase();
  const words = clean.split(/\s+/);
  if (words.length > 1) return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  return clean.slice(0, 4).toUpperCase();
}

// ---------- Liquipedia (API pública, com limite de 1 pedido a cada 2 s) ----------
// A HLTV bloqueia acesso automatizado, então os times vêm da Liquipedia.
// Dados e escudos: Liquipedia (CC-BY-SA). Cada time é baixado uma vez e fica salvo.
const LP_API = 'https://liquipedia.net/counterstrike/api.php';
const LP_UA = 'R90HUD/1.0 (CS2 broadcast overlay; local use)';
let lpQueue = Promise.resolve();
let lpLast = 0;

function lpFetch(url) {
  const run = lpQueue.then(async () => {
    const wait = Math.max(0, lpLast + 2100 - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lpLast = Date.now();
    const res = await fetch(url, { headers: { 'User-Agent': LP_UA, 'Accept-Encoding': 'gzip' } });
    if (!res.ok) throw new Error(`Liquipedia respondeu ${res.status}`);
    return res;
  });
  lpQueue = run.catch(() => {});
  return run;
}

async function lpSearch(q) {
  const u = `${LP_API}?action=opensearch&format=json&namespace=0&limit=12&search=${encodeURIComponent(q)}`;
  const [, titles] = await (await lpFetch(u)).json();
  return (titles || []).filter((t) => !t.includes('/'));
}

async function lpImportTeam(title) {
  const u = `${LP_API}?action=query&format=json&redirects=1&prop=revisions&rvprop=content&rvslots=main&rvsection=0&titles=${encodeURIComponent(title)}`;
  const j = await (await lpFetch(u)).json();
  const page = Object.values(j.query?.pages || {})[0];
  const text = page?.revisions?.[0]?.slots?.main?.['*'] || '';
  if (!/\{\{Infobox team/i.test(text)) throw new Error('Essa página não é de um time.');
  const field = (k) => (new RegExp(`\\|\\s*${k}\\s*=([^\\n|]*)`, 'i').exec(text)?.[1] || '').trim();
  const name = field('name') || page.title;
  // O HUD tem fundo escuro, então prefere a versão "darkmode" do escudo.
  const file = field('imagedark') || field('image');

  let logo = '';
  if (file) {
    const iu = `${LP_API}?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=256&titles=${encodeURIComponent('File:' + file)}`;
    const ij = await (await lpFetch(iu)).json();
    const info = Object.values(ij.query?.pages || {})[0]?.imageinfo?.[0];
    const imgUrl = info?.thumburl || info?.url;
    if (imgUrl) {
      const img = await lpFetch(imgUrl);
      const type = (img.headers.get('content-type') || '').split(';')[0];
      if (UPLOAD_TYPES[type]) {
        const fname = 'lp-' + crypto.randomBytes(6).toString('hex') + UPLOAD_TYPES[type];
        fs.writeFileSync(path.join(UPLOAD_DIR, fname), Buffer.from(await img.arrayBuffer()));
        logo = `/uploads/${fname}`;
      }
    }
  }

  const existing = teams.find((t) => t.source === 'liquipedia' && t.page === page.title);
  if (existing) {
    existing.name = name;
    if (logo) existing.logo = logo;
    saveTeams();
    return existing;
  }
  const team = {
    id: crypto.randomBytes(6).toString('hex'),
    name,
    short: makeShort(name),
    color: TEAM_COLORS[teams.length % TEAM_COLORS.length],
    logo,
    source: 'liquipedia',
    page: page.title,
  };
  teams.push(team);
  saveTeams();
  return team;
}
let game = null; // último pacote do GSI
let lastGsiAt = 0;
const clients = new Set();

function broadcast(type, payload) {
  const msg = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) res.write(msg);
}

function saveConfig() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('payload grande demais'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const UPLOAD_TYPES = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

function serveFile(res, baseDir, relPath) {
  const filePath = path.normalize(path.join(baseDir, relPath));
  if (!filePath.startsWith(baseDir + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Não encontrado');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const route = url.pathname;

  try {
    // Dados do CS2
    if (req.method === 'POST' && route === '/gsi') {
      const body = JSON.parse(await readBody(req, 2 * 1024 * 1024));
      if (!body.auth || body.auth.token !== GSI_TOKEN) {
        res.writeHead(401);
        return res.end();
      }
      delete body.auth;
      delete body.previously;
      delete body.added;
      game = body;
      lastGsiAt = Date.now();
      broadcast('game', game);
      res.writeHead(200);
      return res.end();
    }

    // Tempo real para HUD e painel
    if (req.method === 'GET' && route === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.write(`event: config\ndata: ${JSON.stringify(config)}\n\n`);
      if (game) res.write(`event: game\ndata: ${JSON.stringify(game)}\n\n`);
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    if (route === '/api/config') {
      if (req.method === 'GET') return sendJson(res, 200, config);
      if (req.method === 'POST') {
        const incoming = JSON.parse(await readBody(req, 1024 * 1024));
        config = deepMerge(DEFAULT_CONFIG, incoming);
        saveConfig();
        broadcast('config', config);
        return sendJson(res, 200, config);
      }
    }

    // Biblioteca de times
    if (route === '/api/teams') {
      if (req.method === 'GET') return sendJson(res, 200, teams);
      if (req.method === 'POST') {
        // Salva um time feito à mão (ex.: time amador)
        const t = JSON.parse(await readBody(req, 64 * 1024));
        const name = String(t.name || '').trim().slice(0, 60);
        if (!name) return sendJson(res, 400, { error: 'Dê um nome ao time.' });
        const logo = typeof t.logo === 'string' && t.logo.startsWith('/uploads/') ? t.logo : '';
        const data = {
          name,
          short: String(t.short || makeShort(name)).slice(0, 5).toUpperCase(),
          color: /^#[\da-f]{6}$/i.test(t.color) ? t.color : TEAM_COLORS[0],
          logo,
        };
        const found = teams.find((x) => x.source === 'manual' && x.name.toLowerCase() === name.toLowerCase());
        if (found) Object.assign(found, data);
        else teams.push({ id: crypto.randomBytes(6).toString('hex'), ...data, source: 'manual' });
        saveTeams();
        return sendJson(res, 200, teams);
      }
    }
    if (req.method === 'DELETE' && route.startsWith('/api/teams/')) {
      const id = route.slice('/api/teams/'.length);
      teams = teams.filter((t) => t.id !== id);
      saveTeams();
      return sendJson(res, 200, teams);
    }
    if (req.method === 'GET' && route === '/api/liquipedia/search') {
      const q = (url.searchParams.get('q') || '').trim();
      if (q.length < 2) return sendJson(res, 200, []);
      try {
        return sendJson(res, 200, await lpSearch(q));
      } catch (e) {
        return sendJson(res, 502, { error: 'Não consegui falar com a Liquipedia: ' + e.message });
      }
    }
    if (req.method === 'POST' && route === '/api/liquipedia/import') {
      const { title } = JSON.parse(await readBody(req, 4096));
      try {
        const team = await lpImportTeam(String(title || ''));
        return sendJson(res, 200, { team, teams });
      } catch (e) {
        return sendJson(res, 502, { error: e.message });
      }
    }

    // Ícones de armas próprios em public/icons/weapons (ex.: ak47.svg) → { ak47: "/icons/weapons/ak47.svg" }
    if (req.method === 'GET' && route === '/api/weapon-icons') {
      const dir = path.join(PUBLIC_DIR, 'icons', 'weapons');
      const map = {};
      try {
        for (const f of fs.readdirSync(dir)) {
          const ext = path.extname(f).toLowerCase();
          if (['.svg', '.png', '.webp'].includes(ext)) map[path.basename(f, ext).toLowerCase()] = `/icons/weapons/${encodeURIComponent(f)}`;
        }
      } catch { /* pasta vazia ou inexistente */ }
      return sendJson(res, 200, map);
    }

    // Botão "Testar MVP" do painel: pede ao HUD para mostrar o destaque agora
    if (req.method === 'POST' && route === '/api/test/mvp') {
      broadcast('mvptest', {});
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && route === '/api/status') {
      return sendJson(res, 200, {
        gsiConnected: Date.now() - lastGsiAt < 5000,
        lastGsiAt,
        clients: clients.size,
      });
    }

    // Upload de imagens (escudos, logos, patrocinadores) em base64
    if (req.method === 'POST' && route === '/api/upload') {
      const { dataUrl } = JSON.parse(await readBody(req, 8 * 1024 * 1024));
      const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(dataUrl || '');
      if (!m || !UPLOAD_TYPES[m[1]]) {
        return sendJson(res, 400, { error: 'Use PNG, JPG, WEBP ou SVG.' });
      }
      const name = crypto.randomBytes(8).toString('hex') + UPLOAD_TYPES[m[1]];
      fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(m[2], 'base64'));
      return sendJson(res, 200, { url: `/uploads/${name}` });
    }

    if (req.method === 'GET' && route.startsWith('/uploads/')) {
      return serveFile(res, UPLOAD_DIR, route.slice('/uploads/'.length));
    }

    if (req.method === 'GET') {
      if (route === '/') {
        res.writeHead(302, { Location: '/admin.html' });
        return res.end();
      }
      return serveFile(res, PUBLIC_DIR, decodeURIComponent(route));
    }

    res.writeHead(405);
    res.end();
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
});

// Mantém as conexões SSE vivas
setInterval(() => {
  for (const res of clients) res.write(': ping\n\n');
}, 15000);

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  R90 HUD rodando');
  console.log(`  Painel de controle: http://localhost:${PORT}/admin.html`);
  console.log(`  HUD (fonte de navegador do OBS): http://localhost:${PORT}/hud.html`);
  console.log('');
});
