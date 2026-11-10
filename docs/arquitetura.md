# Arquitetura

```
CS2 ──POST /gsi (JSON, a cada ~0,1 s)──▶ server.js :3500 ──SSE /events──▶ hud.html  (OBS)
                                              ▲            └──────────────▶ admin.html (painel)
                                              └── /api/* (configuração, uploads, times, testes)
```

- **Servidor:** Node 18+, sem dependências. Escuta só em `127.0.0.1` por padrão.
- **Tempo real:** Server-Sent Events (SSE). Não usa WebSocket nem bibliotecas.
- **Dados salvos:** `data/config.json` (configuração), `data/teams.json` (biblioteca) e `data/uploads/` (imagens).

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `server.js` | Recebe o GSI, guarda a configuração e os uploads, cuida da biblioteca de times e da Liquipedia, e transmite tudo por SSE |
| `public/hud.html` | O HUD: palco fixo de 1920 × 1080, escalado para caber |
| `public/admin.html` | O painel de controle |
| `public/shared.js` | Mapas, armas, lados, escudo padrão, tema e ícones de itens |
| `public/weapons.js` | Ícones das armas |
| `simulate.js` | Partida falsa no formato do GSI |
| `tools/vpk.js` | Leitor de pacotes VPK v2 (só leitura) |
| `tools/extrair-radares.js` | Gera os radares e as coordenadas a partir do CS2 instalado |
| `gamestate_integration_r90hud.cfg` | Configuração do GSI para a pasta `cfg` do jogo |

## API do servidor

| Método e rota | Descrição |
| --- | --- |
| `POST /gsi` | Recebe os dados do CS2. Exige `auth.token` igual a `GSI_TOKEN`. |
| `GET /events` | SSE com os eventos `config`, `game` e `mvptest` |
| `GET /api/config` | Devolve a configuração atual |
| `POST /api/config` | Salva a configuração e avisa todos os clientes |
| `POST /api/upload` | `{ dataUrl }` com PNG, JPG, WEBP ou SVG em base64, até 8 MB. Devolve `{ url }`. |
| `GET /api/status` | `{ gsiConnected, lastGsiAt, clients }` |
| `GET /api/teams` | Lista a biblioteca de times |
| `POST /api/teams` | Salva um time feito à mão |
| `DELETE /api/teams/:id` | Remove um time da biblioteca |
| `GET /api/liquipedia/search?q=` | Busca times na Liquipedia |
| `POST /api/liquipedia/import` | `{ title }`: baixa o nome e o escudo |
| `GET /api/weapon-icons` | Lista os ícones próprios de `public/icons/weapons` |
| `POST /api/test/mvp` | Faz o HUD mostrar um MVP de exemplo |

## Dados do GSI usados

| Campo | Uso |
| --- | --- |
| `map.name`, `map.round`, `map.team_ct/t.score`, `consecutive_round_losses` | Placar, mapa, troca de lados, bônus de derrota |
| `phase_countdowns.phase`, `phase_ends_in` | Tempo e fase. O tempo é interpolado no navegador. |
| `round.phase`, `round.win_team`, `round.bomb` | Fim do round, vencedor e motivo do MVP |
| `bomb.state`, `bomb.countdown`, `bomb.position` | C4 no placar e no minimapa |
| `player.steamid` | Jogador observado |
| `allplayers[steamid].state` | Vida, colete, capacete, kit, dinheiro, `round_kills`, `round_killhs`, `round_totaldmg`, `equip_value` |
| `allplayers[steamid].match_stats` | K/A/D e `mvps` (para detectar o MVP) |
| `allplayers[steamid].weapons` | Armas, arma na mão, munição, granadas e C4 |
| `allplayers[steamid].position`, `forward` | Minimapa |
| `grenades` | Smokes (`effecttime`) e fogo (`inferno.flames`) |

## Segurança

- **GSI:** só aceita dados com o token certo.
- **Uploads:** aceita apenas imagens, com nome aleatório e limite de tamanho.
- **Arquivos:** os arquivos servidos ficam presos às pastas `public/` e `data/uploads/`, sem acesso fora delas.
- **Textos:** nomes de jogadores e textos do painel passam por escape antes de entrar no HTML.
- **Rede:** o painel não tem senha. Por isso o servidor escuta só no próprio computador, a não ser que você use `HOST=0.0.0.0`.
