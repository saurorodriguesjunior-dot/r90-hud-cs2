# Recursos do HUD

## Placar

- Escudo, nome, lado (CT/TR) e placar de cada time, mais as bolinhas da série.
- No centro: tempo do round, número do round e a fase (FREEZE TIME, BOMBA PLANTADA, DESARMANDO, TIMEOUT...).
- Embaixo: faixa com a sua marca, o campeonato (ou o selo de jogo amador), a série e o mapa.
- Os lados trocam sozinhos depois do round 12 e a cada 3 rounds na prorrogação (MR12/MR3).

## C4

| Momento | O que aparece no lugar do tempo |
| --- | --- |
| Plantando | C4 girando, com "PLANTANDO" e o centro em âmbar |
| Plantada | C4 parada, piscando cada vez mais rápido, e uma barra de contagem embaixo do placar |
| Desarmando | C4 com o alicate cortando, com "DESARMANDO" e o centro em azul |

## Freeze time

Durante a compra, o placar mostra **FREEZE TIME** com a contagem. Embaixo aparece a economia de cada time:

- dinheiro total;
- valor do equipamento;
- bônus que o time ganha se perder o round (1.400 + 500 por derrota seguida, até 3.400).

## Cartões dos jogadores

- Vida com barra, número do slot, nome, dinheiro e K/A/D.
- Arma principal e pistola como ícones: a arma na mão fica acesa e as guardadas, apagadas.
- Granadas, kit de desarme, C4, colete e capacete como ícones.
- O jogador observado ganha contorno dourado. Quem morreu fica apagado.

## Jogador observado

Painel no centro, embaixo: nome, time, K/A/D, kills no round, vida, colete, arma na mão em tamanho grande e munição.

## MVP do round

No fim de cada round, o MVP aparece no meio da tela, na cor do time:

- **Números:** kills, headshots, dano e HP final.
- **Impacto:** 2K, 3K, 4K ou ACE, clutch 1vX (só se venceu e terminou vivo), primeira kill, só headshot e sobreviveu.
- **Motivo:** mais eliminações, plantou a bomba, desarmou a bomba ou venceu o clutch.

O MVP é detectado quando o contador de MVPs do jogador aumenta no jogo.

## Minimapa

Veja [minimapa.md](minimapa.md).

## Veto e patrocinadores

Tela de veto com escudos, picks, bans, decider e lados. Patrocinadores trocam sozinhos no tempo escolhido.

## Visual

- **Paleta:** gradiente azul `#085a9f` → `#0c1722`, azul elétrico `#005ecf` e verde neon `#00f000`. Tudo pode ser mudado no painel.
- **Tipografia:** Saira Semi Condensed, com pesos de 400 a 600.
- **Painéis:** cantos arredondados e relevo, ajustáveis no bloco "Profundidade" do CSS de `public/hud.html` (`--radius`, `--gloss`, `--depth`).
- **Telas:** pensado para 1920 × 1080 e escalável para 1440p.
