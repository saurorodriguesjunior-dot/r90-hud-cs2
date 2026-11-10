# Instalação

> O R90 HUD é gratuito e de código aberto ([licença MIT](../LICENSE)).

## Requisitos

| Item | Versão |
| --- | --- |
| Windows | 10 ou 11 (64 bits) |
| [Node.js](https://nodejs.org) | 18 ou mais nova (a LTS serve) |
| Counter-Strike 2 | Instalado pela Steam |
| OBS Studio | 28 ou mais novo |

O projeto não depende de nenhum pacote do npm: só do Node.

## 1. Ligar o servidor

Dentro da pasta do projeto, dê dois cliques em `iniciar.bat` ou rode:

```bash
npm start
```

O terminal mostra os dois endereços:

| Página | Endereço | Para quê |
| --- | --- | --- |
| Painel de controle | http://localhost:3500/admin.html | Configurar e controlar a transmissão |
| HUD | http://localhost:3500/hud.html | Fonte de navegador do OBS |

Deixe esse terminal aberto durante toda a live.

## 2. Conectar o CS2 (Game State Integration)

1. Copie `gamestate_integration_r90hud.cfg` para:
   ```
   Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg
   ```
2. Feche e abra o CS2 de novo.
3. Entre numa partida como espectador (GOTV/CSTV, demo `.dem` ou servidor). O painel passa a mostrar **CS2 conectado**.

O GSI é um recurso oficial do jogo: o CS2 envia os dados para o servidor local. Nada é lido da memória do jogo e o anti-cheat não é afetado.

## 3. Gerar os radares do minimapa (uma vez)

```bash
npm run radares
```

O script acha o CS2 sozinho nas bibliotecas da Steam, **só lê** os arquivos do jogo e cria `public/maps/` com um PNG por mapa e o `maps.json` de coordenadas. Rode de novo quando um mapa for atualizado.

Se o jogo estiver em outra pasta:

```bash
node tools/extrair-radares.js "D:\SteamLibrary\steamapps\common\Counter-Strike Global Offensive"
```

## 4. Colocar no OBS

1. **Fontes → + → Navegador**.
2. URL: `http://localhost:3500/hud.html`.
3. Largura `1920`, altura `1080`.
4. Deixe essa fonte **acima** da captura do jogo.

## 5. Preparar o CS2 para a transmissão

No console do jogo:

```
cl_draw_only_deathnotices 1
```

Esse comando esconde o HUD do próprio jogo e deixa só o killfeed. Para voltar ao normal, use `cl_draw_only_deathnotices 0`.

## Testar sem o jogo

Com o servidor ligado, em outro terminal:

```bash
npm run simular
```

O simulador envia uma partida falsa na Mirage: 10 jogadores andando no mapa, compras, granadas, bomba plantada e MVPs.

| Variável | Padrão | Exemplo |
| --- | --- | --- |
| `SPEED` | `4` | `SPEED=1` deixa no tempo real |
| `MAP` | `de_mirage` | `MAP=de_inferno` |

## Opções do servidor

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `PORT` | `3500` | Porta do servidor. Se mudar, mude também o `uri` no `.cfg`. |
| `HOST` | `127.0.0.1` | Use `0.0.0.0` para abrir o painel pelo celular na mesma rede. O painel não tem senha, então use só em rede de confiança. |
| `GSI_TOKEN` | `r90hud-token` | Senha que o CS2 envia ao servidor. Se mudar, mude também no `.cfg`. |
