// ---------- Ícones de armas ----------
// Silhuetas próprias no estilo de menu de compra: perfil, branco chapado, cano para a direita.
// Não são os ícones da Valve. viewBox 0 0 64 24 (armas curtas recortadas em WVIEW).
// Para usar um ícone seu numa arma, coloque um arquivo em public/icons/weapons/<nome>.svg
// (ou .png/.webp), com o nome do jogo sem "weapon_": ak47.svg, awp.png, usp_silencer.svg...
// Precisa de shared.js carregado antes.

const WSHAPES = {
  // AK-47 / Galil: coronha de madeira inclinada, carregador curvo, alça de mira dianteira
  ak: `<path d="M15.5 8.6 3.2 10.4 1.6 11v4.6l2.2.6 11.7-3.4z"/>
    <path d="M15 7.9c.4-.6 1-.8 1.8-.8H34v5.5H15z"/>
    <path d="M34 8.2h12.5v3.9H34z"/><path d="M33.5 7.1h15.8v1.3H33.5z"/>
    <path d="M46.5 9.1h14v1.4h-14z"/><path d="M59.4 8.6h3v2.4h-3z"/><path d="M54.6 6.2h1.4v3h-1.4z"/>
    <path d="M25.6 12.6h4.8c.5 3.3 1.9 5.6 4 7.1l-2.9 2.2c-3-2.4-4.9-5.4-5.9-9.3z"/>
    <path d="M18.8 12.6h3.6l-1.5 6.2-3.4-.6z"/>
    <path d="M22.4 12.6c.2 1.8 1.2 2.7 2.8 2.8" fill="none" stroke="currentColor" stroke-width=".9"/>`,
  // M4A4 / FAMAS: coronha retrátil, alça de transporte, massa de mira triangular
  m4: `<path d="M2.2 8.6h8.6l.8 1v4.2l-.8.8H5.2L2.2 16.2z"/><path d="M11 9.6h5.4v1.8H11z"/>
    <path d="M16 7.6h17.4v5.6H16z"/><path d="M17.8 5.9h12.4v1.8H17.8z"/><path d="M28.6 4.8h1.6v1.4h-1.6z"/>
    <path d="M33.4 7.8h12.4v4.6H33.4z"/><path d="M43.6 7.8l1.4-3.4h1.5l.4 3.4z"/>
    <path d="M45.8 9.1h12.8v1.4H45.8z"/><path d="M57.6 8.5h3.6v2.6h-3.6z"/>
    <path d="M26.6 13.2h4.4l1 7.4-4.4.4z"/><path d="M19 13.2h3.5l-1.3 5.8-3.4-.4z"/>
    <path d="M22.5 13.2c.2 1.7 1.2 2.6 2.7 2.6" fill="none" stroke="currentColor" stroke-width=".9"/>`,
  // M4A1-S: igual, com silenciador longo
  m4s: `<path d="M2.2 8.6h8.6l.8 1v4.2l-.8.8H5.2L2.2 16.2z"/><path d="M11 9.6h5.4v1.8H11z"/>
    <path d="M16 7.6h17.4v5.6H16z"/><path d="M17.8 5.9h12.4v1.8H17.8z"/>
    <path d="M33.4 7.8h10.4v4.6H33.4z"/><path d="M41.8 7.8l1.2-3.2h1.4l.3 3.2z"/>
    <rect x="43.8" y="8" width="19" height="3.6" rx="1.4"/>
    <path d="M26.6 13.2h4.4l1 7.4-4.4.4z"/><path d="M19 13.2h3.5l-1.3 5.8-3.4-.4z"/>`,
  // AUG / SG 553: bullpup arredondado, luneta, guarda-mato grande
  aug: `<path fill-rule="evenodd" d="M3 9.6c0-1 .8-1.6 1.8-1.6H37l1.4 1.6v3.6H22.6l-1 6.4H17l.6-6.4H4.8C3.8 13.2 3 12.4 3 11.4zM23.4 13.2h8.8l-1.4 4.6h-6.6z"/>
    <path d="M38.4 9.6h21.6v1.6H38.4z"/><path d="M58.6 9.1h3v2.6h-3z"/>
    <path d="M17.4 4.2h15.2l1 1.6v1.2h-17.2V5.8z"/><path d="M20 7h2v1.2h-2zM28 7h2v1.2h-2z"/>
    <path d="M7.4 13.2h4.4l-.6 6.6H7z"/><path d="M35.6 13.2h2.6l-.6 4.6h-2.2z"/>`,
  // AWP: coronha com furo para o polegar, luneta grande, cano longo
  awp: `<path fill-rule="evenodd" d="M1.2 9.8 17.6 8.4v4.4l-3 .8-3.2 3.4-6.4.2-3.8-1.6zM8.4 12.2h3.6l-1.8 2.2H7.2z"/>
    <path d="M17.4 8.4h17v4.2h-17z"/>
    <path d="M34.4 9.2h28v1.5h-28z"/><path d="M61 8.7h2.4v2.5H61z"/>
    <path d="M18.6 5.4l2-.8h1.8l1 1.2h7.6l1.2-1.4h2.6l1.4 1.2v1.8H18.6z"/><path d="M22 7.3h1.6v1.2H22zM30 7.3h1.6v1.2H30z"/>
    <path d="M24 12.6h3.6v4.4H24z"/>`,
  // SSG 08: coronha vazada, luneta, cano fino e bipé recolhido
  ssg: `<path fill-rule="evenodd" d="M1.6 9.8 15.8 9v4.2l-3.2.6-3.4 2.8H4.4l-2.8-1.4zM5 11.6h6.4l-2 2.6H5.4z"/>
    <path d="M15.6 8.8h15.4v3.8H15.6z"/><path d="M31 9.6h31v1.2H31z"/>
    <path d="M17 6.2l1.6-.8h1.4l.8 1h6.4l1-1.2h2l1.2 1v1.6H17z"/>
    <path d="M21.6 12.6h3v3.4h-3z"/><path d="M38 10.8l5 5.4M38.6 10.8l2 5.6" fill="none" stroke="currentColor" stroke-width=".9"/>`,
  // SCAR-20 / G3SG1: semi-automática com luneta e carregador
  auto: `<path d="M1.8 9.4h11.6l2.4-1.2v5.2l-4 .8-6 2.8-4-1z"/>
    <path d="M15.6 7.8h21v5.4h-21z"/><path d="M36.6 8.4h11.4v4.2H36.6z"/>
    <path d="M48 9.3h13v1.5H48z"/><path d="M59.8 8.8h3v2.5h-3z"/>
    <path d="M17.8 4.8l1.6-.8h1.6l.8 1h7.2l1-1.2h2.2l1.2 1v1.8H17.8z"/>
    <path d="M26.4 13.2h4.4l-.2 6.2h-4.4z"/><path d="M19.2 13.2h3.4l-1.4 5.6-3.2-.4z"/>`,
  // MP9 / MAC-10: coronha dobrável de arame, corpo quadrado, empunhadura dianteira
  mp9: `<path fill-rule="evenodd" d="M2.6 6.6h10v1.6H4.4v5.6h8.2v1.6h-10z"/>
    <path d="M12.4 6.4h21.4v6.8H12.4z"/><path d="M33.8 8.2h6.8v2.6h-6.8z"/>
    <path d="M17.8 13.2h4.4v9h-4.4z"/><path d="M29.4 13.2h3.4v5.4h-3.4z"/>
    <path d="M22.2 13.2c.3 1.6 1.4 2.4 3 2.4" fill="none" stroke="currentColor" stroke-width=".9"/>`,
  // MP5-SD / MP7 / UMP-45 / PP-Bizon: coronha, alça de mira, silenciador
  mp5: `<path d="M2.4 8.8h9.6l1.2 1.2v3.2l-1.4.6H6.4l-4 2z"/>
    <path d="M13 8h18.6v4.8H13z"/><path d="M14.6 6.4h14v1.6h-14z"/>
    <rect x="31.6" y="8.2" width="19.6" height="3.6" rx="1.4"/>
    <path d="M24.6 12.8h3.4c.6 3 1.6 5 3 6.4l-2.8 1.4c-1.6-2-3-4.6-3.6-7.8z"/>
    <path d="M17 12.8h3.4L19 18.6l-3.2-.6z"/>`,
  // P90: bullpup volumoso com carregador por cima
  p90: `<path fill-rule="evenodd" d="M4 10.4c0-2 1.4-3.4 3.4-3.4h26.8l3 2.4v5.8l-2 2.6H22.4l-2.4 4h-4.6l1.2-4H7.4c-2 0-3.4-1.4-3.4-3.4zM22 12h7l-1.4 3.8h-5.2z"/>
    <path d="M9 4.8h24.6v2.2H9z"/><path d="M37.2 10h7v2.2h-7z"/><path d="M30 3.4h3v1.6h-3z"/>`,
  // Nova / Sawed-Off: escopeta de bomba
  pump: `<path d="M1.6 10.6 15.4 9.2v4.4l-3.4.6-7 3-3.4-.8z"/>
    <path d="M15.2 8.6h12.6v5H15.2z"/>
    <path d="M27.8 8.8h33.8v2.1H27.8z"/><path d="M27.8 11.2h26v1.8h-26z"/>
    <rect x="34" y="10.6" width="12.6" height="3.6" rx="1.4"/>
    <path d="M18.6 13.6h3.4l-1.4 5-3.2-.4z"/><path d="M58.8 7.4h1.2v1.6h-1.2z"/>`,
  // XM1014 / MAG-7: escopeta automática com coronha de pistola
  autoshot: `<path d="M1.6 9.6h10.6l3.6-1v5.4l-3 .8H7.6l-6 2.4z"/>
    <path d="M15.6 8.4h14.6v5.4H15.6z"/>
    <path d="M30.2 8.6h31.4v2.1H30.2z"/><path d="M30.2 11h24.4v2H30.2z"/>
    <path d="M18.6 13.8h3.6l-1.6 6-3.4-.6z"/><path d="M59.4 7.2h1.4v1.6h-1.4z"/>`,
  // M249 / Negev: metralhadora com caixa de munição e bipé
  mg: `<path d="M1.6 9.4h11.6l2.4-1.2v5.4l-3.4.6-7.6 2.6-3-.8z"/>
    <path d="M15.4 7.2h22.8v6.4H15.4z"/><path d="M17 5.4h14v1.8H17z"/>
    <path d="M38.2 8.2h11v4.6h-11z"/><path d="M49.2 9.3h12v1.5h-12z"/><path d="M60 8.8h2.6v2.5H60z"/>
    <rect x="24" y="13.6" width="9.6" height="6.8" rx="1"/>
    <path d="M18.6 13.6h3.4l-1.4 5.6-3.2-.4z"/>
    <path d="M47.6 12.8l-3.6 7.4M48.6 12.8l3.4 7.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
  // Pistola padrão (Glock, P2000, P250, Five-SeveN, CZ75)
  pistol: `<path d="M20 7.2c0-.6.4-1 1-1h21.6c.6 0 1 .4 1 1v4.6H20z"/>
    <path d="M21 11.8h8.4l-1.6 9.6H19z"/>
    <path fill-rule="evenodd" d="M28.8 11.8h5.6c0 3-1.8 4.4-4.8 4.4l-.4-1.4c1.8 0 3-.8 3.4-2z"/>`,
  // USP-S com silenciador
  usp: `<path d="M14 7.2c0-.6.4-1 1-1h20.4v5.6H14z"/>
    <rect x="35.4" y="7.2" width="15" height="3.8" rx="1.4"/>
    <path d="M15 11.8h8.4l-1.6 9.6H13z"/>
    <path fill-rule="evenodd" d="M22.8 11.8h5.6c0 3-1.8 4.4-4.8 4.4l-.4-1.4c1.8 0 3-.8 3.4-2z"/>`,
  // Desert Eagle: ferrolho grande e triangular
  deagle: `<path d="M16.4 6.6c0-.8.6-1.4 1.4-1.4h25.4l1.8 2v5.6H16.4z"/>
    <path d="M17.4 12.8h9.4l-1.8 10H15.4z"/>
    <path fill-rule="evenodd" d="M26.6 12.8h6c0 3.2-2 4.8-5.2 4.8l-.4-1.4c2 0 3.2-.8 3.6-2.2z"/>`,
  // Tec-9: carregador à frente do gatilho
  tec9: `<path d="M16 7h28v4.6H16z"/><path d="M44 8h4v2.4h-4z"/>
    <path d="M16.6 11.6h6l-1.4 8h-5.6z"/><path d="M29.6 11.6h4.4l1.4 9.4h-4.4z"/>
    <path d="M22.6 11.6c.2 2 1.6 3 3.6 3" fill="none" stroke="currentColor" stroke-width=".9"/>`,
  // Dual Berettas: duas pistolas sobrepostas
  dual: `<path d="M14 9c0-.6.4-1 1-1h19.6v4.4H14z" opacity=".55"/><path d="M15 12.4h7.4l-1.4 8.4h-7.4z" opacity=".55"/>
    <path d="M22 6.4c0-.6.4-1 1-1h21v4.4H22z"/><path d="M23 9.8h7.6l-1.4 8.6h-7.6z"/>
    <path fill-rule="evenodd" d="M30.4 9.8h5.2c0 2.8-1.6 4-4.4 4l-.4-1.2c1.6 0 2.6-.8 3-2z"/>`,
  // R8 Revólver
  revolver: `<path d="M27 7.6h21.4v3.2H27z"/><path d="M46.6 6.4h1.4v1.4h-1.4z"/>
    <rect x="20" y="6.4" width="8.6" height="6.4" rx="1.8"/>
    <path d="M19.4 11.2c1.4 0 2.6.8 3.4 2l1.6 1.2-3.4 8.4h-6.6z"/>
    <path fill-rule="evenodd" d="M25.4 12.4h5c0 2.8-1.6 4-4.4 4l-.4-1.2c1.6 0 2.6-.8 3-2z"/>`,
  // Faca
  knife: `<path d="M27.4 10.4h22.8c4.4 0 8.4.6 11.6 2.2-5.4 1.6-11.6 2-17.4 2H27.4z"/>
    <path d="M25 8.4h2.8v8.4H25z"/>
    <path d="M10.6 10.8h14.4v4.2H11.4c-1.2 0-2-.8-2-2.1 0-1.2.4-2 1.2-2.1z"/>`,
  // Zeus x27
  taser: `<path d="M21 7.6c0-.8.6-1.4 1.4-1.4h17.4l2.2 2.6v3.6H21z"/><path d="M42 8.6h3v2.6h-3z"/>
    <path d="M22 12.4h7l-1.6 8.6h-7z"/>
    <path d="M34.8 3.2 32 8.4h2.8l-2.2 4.6" fill="none" stroke="#ffd23f" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`,
};

const WEAPON_SHAPE = {
  ak47: 'ak', galilar: 'ak',
  m4a1: 'm4', famas: 'm4', m4a1_silencer: 'm4s', m4a1_silencer_off: 'm4',
  aug: 'aug', sg556: 'aug',
  awp: 'awp', ssg08: 'ssg', scar20: 'auto', g3sg1: 'auto',
  mp9: 'mp9', mac10: 'mp9', mp7: 'mp5', mp5sd: 'mp5', ump45: 'mp5', bizon: 'mp5', p90: 'p90',
  nova: 'pump', sawedoff: 'pump', xm1014: 'autoshot', mag7: 'autoshot',
  m249: 'mg', negev: 'mg',
  glock: 'pistol', hkp2000: 'pistol', p250: 'pistol', fiveseven: 'pistol', cz75a: 'pistol',
  usp_silencer: 'usp', usp_silencer_off: 'pistol', tec9: 'tec9', elite: 'dual',
  deagle: 'deagle', revolver: 'revolver', taser: 'taser',
};

// Recorte de cada desenho, para armas curtas ocuparem o espaço todo
const WVIEW = {
  pistol: '17 4 29 19', usp: '12 4 40 19', deagle: '14 4 33 20', revolver: '14 4 36 19',
  tec9: '14 5 36 17', dual: '12 4 34 18', taser: '18 2 29 20', mp9: '1 5 41 18', p90: '2 2 44 20',
  knife: '8 7 56 10',
};

const GRENADE_KEY = { hegrenade: 'HE', flashbang: 'FL', smokegrenade: 'SM', molotov: 'MO', incgrenade: 'IN', decoy: 'DC' };

// Ícones próprios do usuário, listados pelo servidor em /api/weapon-icons
let CUSTOM_WEAPON_ICONS = {};
fetch('/api/weapon-icons').then((r) => r.json()).then((m) => { CUSTOM_WEAPON_ICONS = m || {}; }).catch(() => {});

function weaponKey(raw) {
  const k = (raw || '').replace(/^weapon_/, '');
  if (k.startsWith('knife') || k === 'bayonet') return 'knife';
  return k;
}

// Ícone de uma arma. cls: 'on' (arma na mão), 'off' (guardada), 'big', 'small'
function weaponIcon(raw, cls = '') {
  const key = weaponKey(raw);
  if (!key) return '';
  const title = esc(weaponName(raw));
  if (CUSTOM_WEAPON_ICONS[key]) {
    return `<span class="wico ${cls}" title="${title}"><img src="${esc(CUSTOM_WEAPON_ICONS[key])}" alt=""></span>`;
  }
  if (GRENADE_KEY[key]) return `<span class="wico wico-nade ${cls}" title="${title}">${ICONS[GRENADE_KEY[key]]}</span>`;
  if (key === 'c4') return `<span class="wico wico-nade ${cls}" title="C4">${ICONS.c4}</span>`;
  const shapeId = key === 'knife' ? 'knife' : WEAPON_SHAPE[key] || 'm4';
  const vb = WVIEW[shapeId] || '0 0 64 24';
  return `<span class="wico ${cls}" title="${title}"><svg viewBox="${vb}" fill="currentColor" aria-hidden="true">${WSHAPES[shapeId]}</svg></span>`;
}
