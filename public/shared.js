// Funções usadas pelo HUD e pelo painel.

const MAPS = [
  ['de_ancient', 'Ancient'],
  ['de_anubis', 'Anubis'],
  ['de_dust2', 'Dust II'],
  ['de_inferno', 'Inferno'],
  ['de_mirage', 'Mirage'],
  ['de_nuke', 'Nuke'],
  ['de_overpass', 'Overpass'],
  ['de_train', 'Train'],
  ['de_vertigo', 'Vertigo'],
];

function mapName(id) {
  const found = MAPS.find(([k]) => k === id);
  if (found) return found[1];
  return (id || '').replace(/^de_|^cs_/, '').replace(/^\w/, (c) => c.toUpperCase());
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const WEAPON_NAMES = {
  ak47: 'AK-47', m4a1: 'M4A4', m4a1_silencer: 'M4A1-S', awp: 'AWP', aug: 'AUG', sg556: 'SG 553',
  famas: 'FAMAS', galilar: 'Galil AR', ssg08: 'SSG 08', scar20: 'SCAR-20', g3sg1: 'G3SG1',
  mp9: 'MP9', mac10: 'MAC-10', mp7: 'MP7', mp5sd: 'MP5-SD', ump45: 'UMP-45', p90: 'P90', bizon: 'PP-Bizon',
  nova: 'Nova', xm1014: 'XM1014', mag7: 'MAG-7', sawedoff: 'Sawed-Off', m249: 'M249', negev: 'Negev',
  glock: 'Glock-18', hkp2000: 'P2000', usp_silencer: 'USP-S', p250: 'P250', elite: 'Dual Berettas',
  fiveseven: 'Five-SeveN', tec9: 'Tec-9', cz75a: 'CZ75', deagle: 'Desert Eagle', revolver: 'R8',
  taser: 'Zeus', knife: 'Faca', c4: 'C4',
};

function weaponName(raw) {
  const k = (raw || '').replace(/^weapon_/, '');
  if (k.startsWith('knife') || k === 'bayonet') return 'Faca';
  return WEAPON_NAMES[k] || k.toUpperCase();
}

const GRENADES = {
  hegrenade: 'HE', flashbang: 'FL', smokegrenade: 'SM', molotov: 'MO', incgrenade: 'IN', decoy: 'DC',
};

// Separa as armas de um jogador do GSI em primária, secundária, granadas, C4 e a arma ativa.
function playerWeapons(p) {
  const out = { primary: null, secondary: null, grenades: [], bomb: false, active: null, taser: false };
  for (const w of Object.values(p.weapons || {})) {
    const key = (w.name || '').replace(/^weapon_/, '');
    if (w.state === 'active') out.active = w;
    if (w.type === 'C4') out.bomb = true;
    else if (w.type === 'Grenade') {
      for (let i = 0; i < (w.ammo_reserve || 1); i++) out.grenades.push(GRENADES[key] || 'GR');
    } else if (w.type === 'Pistol') out.secondary = w;
    else if (key === 'taser') out.taser = true;
    else if (w.type && w.type !== 'Knife') out.primary = w;
  }
  return out;
}

// Em qual lado (CT ou T) o Time A está agora.
// MR12: troca depois do round 12; na prorrogação (MR3) troca a cada 3 rounds,
// mantendo no início da prorrogação o lado do segundo tempo.
function teamASide(cfg, game) {
  const r = Number(game?.map?.round) || 0;
  let swaps = r < 12 ? 0 : r < 24 ? 1 : 1 + Math.floor((r - 24) / 3);
  if (cfg.match.swapSides) swaps += 1;
  const start = cfg.match.teamAStartsCT ? 'CT' : 'T';
  return swaps % 2 === 0 ? start : start === 'CT' ? 'T' : 'CT';
}

function other(side) {
  return side === 'CT' ? 'T' : 'CT';
}

// Escudo padrão (SVG) com a sigla do time, usado quando não há logo.
function shieldSvg(short, color) {
  const txt = esc((short || '?').slice(0, 4).toUpperCase());
  const size = txt.length > 3 ? 22 : 28;
  return `<svg viewBox="0 0 100 116" class="shield-svg" aria-hidden="true">
    <path d="M50 3 L95 18 V58 C95 86 74 104 50 113 C26 104 5 86 5 58 V18 Z" fill="${esc(color)}" stroke="rgba(255,255,255,.85)" stroke-width="4"/>
    <path d="M50 14 L84 25 V58 C84 79 69 93 50 101 C31 93 16 79 16 58 V25 Z" fill="rgba(0,0,0,.22)"/>
    <text x="50" y="66" text-anchor="middle" font-family="Saira Semi Condensed, Arial Narrow, sans-serif" font-weight="600" font-size="${size}" fill="#fff">${txt}</text>
  </svg>`;
}

function teamShield(team) {
  if (team.logo) return `<img class="shield-img" src="${esc(team.logo)}" alt="">`;
  return shieldSvg(team.short || team.name, team.color);
}

function hexToRgb(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [13, 15, 23];
}

function applyTheme(cfg, el = document.documentElement) {
  const b = cfg.brand;
  const [r, g, bl] = hexToRgb(b.background);
  const [r2, g2, b2] = hexToRgb(b.backgroundTop || b.background);
  const grad = (a) => `linear-gradient(180deg, rgba(${r2},${g2},${b2},${a}) 0%, rgba(${r},${g},${bl},${a}) 100%)`;
  el.style.setProperty('--panel-grad', grad(b.opacity));
  el.style.setProperty('--panel-grad-opaque', grad(1));
  el.style.setProperty('--primary', b.primary);
  el.style.setProperty('--accent', b.accent);
  el.style.setProperty('--ct', b.ct);
  el.style.setProperty('--t', b.t);
  el.style.setProperty('--text', b.text);
  el.style.setProperty('--panel', `rgba(${r},${g},${bl},${b.opacity})`);
  el.style.setProperty('--panel-solid', b.background);
  el.style.setProperty('--teamA', cfg.teamA.color);
  el.style.setProperty('--teamB', cfg.teamB.color);
}

// Ícones dos itens (SVG próprios, 24×24, pintados com currentColor)
const ICONS = {
  // Granada de fragmentação: corpo "abacaxi" com gomos, alavanca e argola
  HE: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 3.4h4.4v2.4H9.4z" fill="currentColor"/><path d="M13.6 3.8h2.6c.8 0 1.4.6 1.4 1.4v5.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="7.6" cy="4.4" r="1.7" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8.6 6.2h6l.8 1.2c2.4 1.4 3.8 3.8 3.8 6.6 0 4.4-3.4 7.8-7.6 7.8S4 18.4 4 14c0-2.8 1.4-5.2 3.8-6.6z" fill="currentColor"/><path d="M11.6 7.4v13.8M5.6 11.4h12M4.6 15h14M5.6 18.6h12" stroke="rgba(0,0,0,.35)" stroke-width="1"/></svg>',
  // Flashbang: lata com raio vazado
  FL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2.4h6v2.2H9z" fill="currentColor"/><path d="M15 3h1.8c.6 0 1 .4 1 1v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path fill-rule="evenodd" d="M7.6 5.2h8.8c.6 0 1 .4 1 1V21c0 .6-.4 1-1 1H7.6c-.6 0-1-.4-1-1V6.2c0-.6.4-1 1-1zm5.2 3.4-3.6 5.6h2.4l-1.2 5 3.8-6.2h-2.4z" fill="currentColor"/></svg>',
  // Smoke: lata lisa com tampa e faixa
  SM: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2.4h6v2.2H9z" fill="currentColor"/><path d="M15 3h1.8c.6 0 1 .4 1 1v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><rect x="6.6" y="5.2" width="10.8" height="16.8" rx="1.6" fill="currentColor"/><path d="M6.6 9.4h10.8M6.6 17.6h10.8" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><circle cx="9.4" cy="13.4" r=".9" fill="rgba(0,0,0,.35)"/><circle cx="12" cy="13.4" r=".9" fill="rgba(0,0,0,.35)"/><circle cx="14.6" cy="13.4" r=".9" fill="rgba(0,0,0,.35)"/></svg>',
  // Molotov: garrafa com pano em chamas
  MO: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.2 8.4h3.6v2.4c2.2 1 3.6 3.2 3.6 5.6V21c0 .6-.4 1-1 1H7.6c-.6 0-1-.4-1-1v-4.6c0-2.4 1.4-4.6 3.6-5.6z" fill="currentColor"/><path d="M9.8 6.6h4.4v2.2H9.8z" fill="currentColor"/><path d="M12 .8c2 1.8 2.8 3.4 2.4 4.8a2.4 2.4 0 0 1-4.6.1c-.2-1 .2-1.8.8-2.5.2.9.6 1.4 1.1 1.4.5-1.1.6-2.3.3-3.8z" fill="#ff8a2a"/><path d="M7.4 15.6h9.2" stroke="rgba(0,0,0,.3)" stroke-width="1.6"/></svg>',
  // Incendiária: lata com chama
  IN: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2.4h6v2.2H9z" fill="currentColor"/><rect x="6.6" y="5.2" width="10.8" height="16.8" rx="1.6" fill="currentColor"/><path d="M12 8.8c2.4 2.2 3.3 4 3 5.8a3 3 0 0 1-6 0c-.2-1.2.2-2.2 1-3 .2 1 .6 1.6 1.3 1.7.6-1.3.8-2.6.7-4.5z" fill="#ff8a2a"/></svg>',
  // Decoy: lata com ondas de som
  DC: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 3.4h5.6v2.2H6.4z" fill="currentColor"/><rect x="4.6" y="6" width="9.2" height="16" rx="1.6" fill="currentColor"/><path d="M4.6 10.4h9.2M4.6 17.4h9.2" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><path d="M16.2 10.6a4.4 4.4 0 0 1 0 6.6M18.8 8.4a7.6 7.6 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  // Kit de desarme: alicate com cabos laranja
  kit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 2.2c1.4 1 2.4 3 3 5.4M15.4 2.2c-1.4 1-2.4 3-3 5.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="9.4" r="2" fill="currentColor"/><path d="M11 11c-1.2 3-3 6.6-5.4 10.4M13 11c1.2 3 3 6.6 5.4 10.4" fill="none" stroke="#e07a2e" stroke-width="3" stroke-linecap="round"/></svg>',
  // C4: bloco de explosivo com visor e teclado
  c4: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.4" y="3" width="17.2" height="19" rx="2" fill="currentColor"/><rect x="5.6" y="5" width="12.8" height="4.4" rx=".8" fill="rgba(0,0,0,.55)"/><path d="M7 7.2h1.6M9.6 7.2h1.6M12.2 7.2h1.6" stroke="#ff4040" stroke-width="1.2"/><g fill="rgba(0,0,0,.45)"><rect x="6" y="11" width="3" height="2.2" rx=".4"/><rect x="10.5" y="11" width="3" height="2.2" rx=".4"/><rect x="15" y="11" width="3" height="2.2" rx=".4"/><rect x="6" y="14.4" width="3" height="2.2" rx=".4"/><rect x="10.5" y="14.4" width="3" height="2.2" rx=".4"/><rect x="15" y="14.4" width="3" height="2.2" rx=".4"/><rect x="6" y="17.8" width="3" height="2.2" rx=".4"/><rect x="10.5" y="17.8" width="3" height="2.2" rx=".4"/><rect x="15" y="17.8" width="3" height="2.2" rx=".4"/></g></svg>',
  // Colete à prova de balas
  armor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 2.4h2.6c.2 1.4 1 2.2 2 2.2s1.8-.8 2-2.2h2.6l.6 4.4 2.8 1.2v12.4c0 .8-.6 1.4-1.4 1.4H6.4c-.8 0-1.4-.6-1.4-1.4V8l2.8-1.2z" fill="currentColor"/><path d="M5 12.4h14M12 4.6v17.4" stroke="rgba(0,0,0,.3)" stroke-width="1"/></svg>',
  // Capacete
  helmet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.6 16.6C2.6 10.4 6.8 5.4 12.4 5.4c5 0 9 4 9 9.4v1.8h-6.4l-1.4 2.8H2.6z" fill="currentColor"/><path d="M15 16.6v-4.8M3.6 13.6h11.4" stroke="rgba(0,0,0,.3)" stroke-width="1.1"/></svg>',
};

const ITEM_NAMES = { HE: 'HE', FL: 'Flash', SM: 'Smoke', MO: 'Molotov', IN: 'Incendiária', DC: 'Decoy', kit: 'Kit de desarme', c4: 'C4', armor: 'Colete', helmet: 'Capacete' };

function icon(key, cls = '') {
  return `<span class="ico ico-${key} ${cls}" title="${ITEM_NAMES[key] || key}">${ICONS[key] || ''}</span>`;
}

function armorIcons(st) {
  if (!(st.armor > 0)) return '';
  return icon('armor') + (st.helmet ? icon('helmet') : '');
}
