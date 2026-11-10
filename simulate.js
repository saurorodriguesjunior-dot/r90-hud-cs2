// Simulador: envia dados falsos no formato do GSI do CS2 para testar o HUD sem abrir o jogo.
// Uso: node simulate.js   (com o servidor já rodando)
// Opções: SPEED=1 (tempo real; padrão 4), MAP=de_inferno (padrão de_mirage)

const fs = require('fs');
const path = require('path');

const URL_GSI = process.env.GSI_URL || 'http://127.0.0.1:3500/gsi';
const TOKEN = process.env.GSI_TOKEN || 'r90hud-token';
const MAP = process.env.MAP || 'de_mirage';
const SPEED = Number(process.env.SPEED) || 4;

// Coordenadas do mapa (de public/maps/maps.json, gerado por tools/extrair-radares.js)
let INFO = { pos_x: -3230, pos_y: 1713, scale: 5, size: 1024, CTSpawn: [0.28, 0.7], TSpawn: [0.87, 0.36], bombA: [0.54, 0.76], bombB: [0.23, 0.28] };
try {
  const all = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'maps', 'maps.json'), 'utf8'));
  if (all[MAP]) INFO = { ...INFO, ...all[MAP] };
} catch { /* usa os números da Mirage */ }
const toWorld = ([nx, ny], z = 0) => [INFO.pos_x + nx * (INFO.size || 1024) * INFO.scale, INFO.pos_y - ny * (INFO.size || 1024) * INFO.scale, z];
const fmtVec = (v) => v.map((n) => n.toFixed(2)).join(', ');

const CT_NAMES = ['kaze', 'Br4vo', 'nyx', 'Torres', 'leozin'];
const T_NAMES = ['Vulto', 'f1nn', 'Saraiva', 'mkz', 'Duda'];
const CT_GUNS = ['weapon_m4a1_silencer', 'weapon_m4a1', 'weapon_awp', 'weapon_famas', 'weapon_aug'];
const T_GUNS = ['weapon_ak47', 'weapon_ak47', 'weapon_awp', 'weapon_galilar', 'weapon_sg556'];

let round = 0, ctScore = 0, tScore = 0, tick = 0;
let phase = 'freezetime', phaseLeft = 15;
let bomb = { state: 'carried', pos: null, countdown: 0, plantLeft: 0, carrier: null, droppedFor: 0 };
let observed = 0, lastWinner = 'CT';
let losses = { CT: 0, T: 0 };
let site = INFO.bombA;
let grenades = {};
let nadeId = 0;

const players = [...CT_NAMES.map((n, i) => mk(n, 'CT', i + 1, i)), ...T_NAMES.map((n, i) => mk(n, 'T', i === 4 ? 0 : i + 6, i))];

function mk(name, team, slot, i) {
  return {
    steamid: '765611980000000' + String(team === 'CT' ? i + 10 : i + 20),
    name, team, observer_slot: slot, i,
    hp: 100, kills: 0, deaths: 0, assists: 0, money: 800, roundKills: 0, roundHs: 0, roundDmg: 0, mvps: 0, gun: i,
    pos: [0, 0], dir: [1, 0], target: [0, 0],
  };
}

function spawnAll() {
  site = Math.random() < 0.5 ? INFO.bombA : INFO.bombB;
  for (const p of players) {
    const s = p.team === 'CT' ? INFO.CTSpawn : INFO.TSpawn;
    p.pos = [s[0] + (Math.random() - 0.5) * 0.05, s[1] + (Math.random() - 0.5) * 0.05];
    // CTs se dividem entre os bombsites; TRs vão juntos para um deles
    const goal = p.team === 'CT' ? (p.i < 3 ? INFO.bombA : INFO.bombB) : site;
    p.target = [goal[0] + (Math.random() - 0.5) * 0.08, goal[1] + (Math.random() - 0.5) * 0.08];
  }
  const ts = players.filter((p) => p.team === 'T');
  bomb = { state: 'carried', pos: null, countdown: 0, plantLeft: 0, carrier: ts[0].steamid, droppedFor: 0 };
  grenades = {};
}

function move(p, dt) {
  if (p.hp <= 0) return;
  const dx = p.target[0] - p.pos[0], dy = p.target[1] - p.pos[1];
  const d = Math.hypot(dx, dy);
  const speed = 0.012 * dt;
  if (d > 0.005) {
    const ux = dx / d, uy = dy / d;
    p.pos[0] += ux * Math.min(speed, d) + (Math.random() - 0.5) * 0.004;
    p.pos[1] += uy * Math.min(speed, d) + (Math.random() - 0.5) * 0.004;
    p.dir = [ux, -uy]; // no mundo o eixo Y é invertido em relação à imagem
  } else {
    const a = Math.random() * Math.PI * 2;
    p.dir = [Math.cos(a), Math.sin(a)];
  }
}

function weapons(p) {
  const w = { weapon_0: { name: 'weapon_knife', type: 'Knife', state: 'holstered' } };
  const pistol = p.team === 'CT' ? 'weapon_usp_silencer' : 'weapon_glock';
  w.weapon_1 = { name: pistol, type: 'Pistol', state: 'holstered', ammo_clip: 12, ammo_clip_max: 12, ammo_reserve: 24 };
  if (round > 0) {
    const gun = (p.team === 'CT' ? CT_GUNS : T_GUNS)[p.gun];
    w.weapon_2 = { name: gun, type: gun.includes('awp') ? 'SniperRifle' : 'Rifle', state: 'active', ammo_clip: 20 + (tick % 10), ammo_clip_max: 30, ammo_reserve: 90 };
  } else w.weapon_1.state = 'active';
  w.weapon_3 = { name: 'weapon_smokegrenade', type: 'Grenade', state: 'holstered', ammo_reserve: 1 };
  if (p.gun % 2 === 0) w.weapon_4 = { name: 'weapon_flashbang', type: 'Grenade', state: 'holstered', ammo_reserve: 2 };
  if (p.gun === 1) w.weapon_5 = { name: p.team === 'CT' ? 'weapon_incgrenade' : 'weapon_molotov', type: 'Grenade', state: 'holstered', ammo_reserve: 1 };
  if (bomb.carrier === p.steamid && (bomb.state === 'carried' || bomb.state === 'planting')) {
    w.weapon_6 = { name: 'weapon_c4', type: 'C4', state: bomb.state === 'planting' ? 'active' : 'holstered' };
    if (bomb.state === 'planting') for (const k of Object.keys(w)) if (k !== 'weapon_6') w[k].state = 'holstered';
  }
  return w;
}

function packet() {
  const all = {};
  for (const p of players) {
    all[p.steamid] = {
      name: p.name, observer_slot: p.observer_slot, team: p.team,
      state: {
        health: p.hp, armor: p.hp > 0 ? 100 : 0, helmet: round > 0, defusekit: p.team === 'CT' && p.gun < 3,
        flashed: 0, burning: 0, money: p.money, round_kills: p.roundKills, round_killhs: p.roundHs,
        round_totaldmg: p.roundDmg, equip_value: round > 0 ? 3700 + p.gun * 300 : 800,
      },
      match_stats: { kills: p.kills, assists: p.assists, deaths: p.deaths, mvps: p.mvps, score: p.kills * 2 },
      weapons: weapons(p),
      position: fmtVec(toWorld(p.pos)), forward: fmtVec([p.dir[0], p.dir[1], 0]),
    };
  }
  const alive = players.filter((p) => p.hp > 0);
  const obs = alive[observed % Math.max(1, alive.length)] || players[0];
  const carrier = players.find((p) => p.steamid === bomb.carrier);
  const bombPos = bomb.pos ? bomb.pos : carrier ? carrier.pos : INFO.TSpawn;
  const bombOut = { state: bomb.state, position: fmtVec(toWorld(bombPos)) };
  if (bomb.state === 'planted' || bomb.state === 'defusing') bombOut.countdown = bomb.countdown.toFixed(1);
  if (bomb.state === 'carried' || bomb.state === 'planting') bombOut.player = bomb.carrier;

  const gl = {};
  for (const [id, g] of Object.entries(grenades)) {
    if (g.type === 'smoke') gl[id] = { owner: g.owner, position: fmtVec(toWorld(g.pos)), velocity: '0, 0, 0', lifetime: '5', effecttime: g.left.toFixed(1), type: 'smoke' };
    else gl[id] = { owner: g.owner, lifetime: '3', type: 'inferno', flames: Object.fromEntries(g.flames.map((f, k) => [`f${k}`, fmtVec(toWorld(f))])) };
  }

  return {
    provider: { name: 'Counter-Strike 2', appid: 730, version: 14000, steamid: '0', timestamp: Math.floor(Date.now() / 1000) },
    map: {
      mode: 'competitive', name: MAP, phase: 'live', round,
      team_ct: { score: ctScore, consecutive_round_losses: losses.CT, timeouts_remaining: 1, matches_won_this_series: 0 },
      team_t: { score: tScore, consecutive_round_losses: losses.T, timeouts_remaining: 1, matches_won_this_series: 0 },
      num_matches_to_win_series: 0,
    },
    round: {
      phase: phase === 'over' ? 'over' : phase === 'freezetime' ? 'freezetime' : 'live',
      ...(bomb.state === 'planted' || bomb.state === 'defusing' ? { bomb: 'planted' } : {}),
      ...(phase === 'over' ? { win_team: lastWinner } : {}),
    },
    phase_countdowns: { phase, phase_ends_in: phaseLeft.toFixed(1) },
    bomb: bombOut,
    grenades: gl,
    player: { steamid: obs.steamid, name: obs.name, observer_slot: obs.observer_slot, team: obs.team, activity: 'playing' },
    allplayers: all,
    auth: { token: TOKEN },
  };
}

function endRound(winner) {
  lastWinner = winner;
  if (winner === 'CT') { ctScore++; losses.T++; losses.CT = 0; } else { tScore++; losses.CT++; losses.T = 0; }
  const mvp = players.filter((p) => p.team === winner).sort((a, b) => b.roundKills - a.roundKills || b.roundDmg - a.roundDmg)[0];
  if (mvp) mvp.mvps++;
  phase = 'over'; phaseLeft = 7;
}

function step(dt) {
  tick++;
  phaseLeft -= dt;
  for (const [id, g] of Object.entries(grenades)) { g.left -= dt; if (g.left <= 0) delete grenades[id]; }

  if (phase === 'freezetime') {
    if (phaseLeft <= 0) { phase = 'live'; phaseLeft = 115; }
    return;
  }
  if (phase === 'over') {
    if (phaseLeft <= 0) {
      round++;
      if (round === 12) {
        [ctScore, tScore] = [tScore, ctScore];
        for (const p of players) p.team = p.team === 'CT' ? 'T' : 'CT';
      }
      if (ctScore >= 13 || tScore >= 13) { round = 0; ctScore = 0; tScore = 0; }
      for (const p of players) { p.hp = 100; p.roundKills = 0; p.roundHs = 0; p.roundDmg = 0; p.money = Math.min(16000, p.money + 2400); }
      spawnAll();
      phase = 'freezetime'; phaseLeft = 15;
    }
    return;
  }

  for (const p of players) move(p, dt);

  // Granadas de vez em quando entre os dois times
  if (Math.random() < 0.06 && Object.keys(grenades).length < 4) {
    const thrower = players.filter((p) => p.hp > 0)[Math.floor(Math.random() * 10)];
    if (thrower) {
      const at = [thrower.target[0] + (Math.random() - 0.5) * 0.1, thrower.target[1] + (Math.random() - 0.5) * 0.1];
      if (Math.random() < 0.6) grenades[++nadeId] = { type: 'smoke', owner: thrower.steamid, pos: at, left: 18 };
      else grenades[++nadeId] = { type: 'inferno', owner: thrower.steamid, left: 7, flames: Array.from({ length: 7 }, () => [at[0] + (Math.random() - 0.5) * 0.03, at[1] + (Math.random() - 0.5) * 0.03]) };
    }
  }

  // Dano aleatório
  if (Math.random() < 0.25) {
    const alive = players.filter((p) => p.hp > 0);
    const victim = alive[Math.floor(Math.random() * alive.length)];
    const enemies = alive.filter((p) => p.team !== victim.team);
    if (victim && enemies.length) {
      const attacker = enemies[Math.floor(Math.random() * enemies.length)];
      const dmg = Math.min(victim.hp, 20 + Math.floor(Math.random() * 60));
      victim.hp -= dmg;
      attacker.roundDmg += dmg;
      if (victim.hp === 0) {
        attacker.kills++; attacker.roundKills++; victim.deaths++;
        if (Math.random() < 0.5) attacker.roundHs++;
        if (bomb.carrier === victim.steamid && bomb.state !== 'planted') { bomb.state = 'dropped'; bomb.pos = [...victim.pos]; bomb.droppedFor = 0; bomb.plantLeft = 0; }
      }
    }
  }

  // Bomba: caída → outro TR pega; perto do bombsite → planta (3,2 s) → plantada (40 s)
  if (bomb.state === 'dropped') {
    bomb.droppedFor += dt;
    const t = players.find((p) => p.team === 'T' && p.hp > 0);
    if (t && bomb.droppedFor > 4) { bomb.state = 'carried'; bomb.carrier = t.steamid; bomb.pos = null; }
  }
  const carrier = players.find((p) => p.steamid === bomb.carrier);
  if (bomb.state === 'carried' && carrier && carrier.hp > 0 && Math.hypot(carrier.pos[0] - site[0], carrier.pos[1] - site[1]) < 0.06) {
    bomb.state = 'planting'; bomb.plantLeft = 3.2;
  }
  if (bomb.state === 'planting') {
    if (!carrier || carrier.hp <= 0) { bomb.state = 'dropped'; bomb.pos = carrier ? [...carrier.pos] : [...site]; bomb.droppedFor = 0; }
    else if ((bomb.plantLeft -= dt) <= 0) {
      bomb.state = 'planted'; bomb.pos = [...carrier.pos]; bomb.countdown = 40;
      phase = 'bomb'; phaseLeft = 40;
      for (const p of players) if (p.team === 'CT') p.target = [site[0] + (Math.random() - 0.5) * 0.05, site[1] + (Math.random() - 0.5) * 0.05];
    }
  }
  if (bomb.state === 'planted' || bomb.state === 'defusing') {
    bomb.countdown = Math.max(0, bomb.countdown - dt);
    const ctNear = players.some((p) => p.team === 'CT' && p.hp > 0 && Math.hypot(p.pos[0] - bomb.pos[0], p.pos[1] - bomb.pos[1]) < 0.02);
    bomb.state = ctNear ? 'defusing' : 'planted';
    phase = ctNear ? 'defuse' : 'bomb';
  }

  if (Math.random() < 0.12) observed++;
  const ctAlive = players.some((p) => p.team === 'CT' && p.hp > 0);
  const tAlive = players.some((p) => p.team === 'T' && p.hp > 0);
  const planted = bomb.state === 'planted' || bomb.state === 'defusing';
  if (planted && bomb.countdown <= 0) { bomb.state = 'exploded'; return endRound('T'); }
  if (planted && !ctAlive) return endRound('T');
  if (!ctAlive) return endRound('T');
  if (!tAlive && !planted) return endRound('CT');
  if (phaseLeft <= 0 && !planted) return endRound('CT');
}

async function send() {
  try {
    await fetch(URL_GSI, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(packet()) });
  } catch (e) {
    console.error('Servidor não respondeu:', e.message);
  }
}

spawnAll();
console.log(`Simulando ${MAP} em ${URL_GSI} (velocidade ${SPEED}x). Ctrl+C para parar.`);
setInterval(() => { step(0.25 * SPEED); send(); }, 250);
send();
