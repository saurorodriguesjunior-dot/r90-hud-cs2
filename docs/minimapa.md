# Minimapa

O minimapa fica no canto superior esquerdo e mostra só o mapa, com o fundo quase transparente.

## O que aparece

| Elemento | Como aparece |
| --- | --- |
| Jogador | Bolinha na cor do lado, com o número do slot e uma seta para onde ele olha |
| Jogador observado | Anel verde em volta |
| Morto | ✕ no lugar onde morreu |
| Portador da C4 | Quadradinho vermelho na bolinha |
| C4 caída | Ícone branco da C4 |
| C4 plantada | Ícone vermelho piscando |
| Smoke | Círculo cinza com o tamanho real da smoke |
| Molotov / incendiária | Pontos de fogo laranja |
| Andar de baixo (Nuke, Vertigo, Train) | Bolinha tracejada e mais transparente |

## De onde vêm os radares

O script `tools/extrair-radares.js` usa o leitor `tools/vpk.js` para abrir o `pak01_dir.vpk` do seu CS2 e:

1. lê `resource/overviews/<mapa>.txt`: `pos_x`, `pos_y`, `scale`, os andares e os spawns;
2. lê `panorama/images/overheadmaps/<mapa>_radar_psd.vtex_c`: uma textura BGRA8888 compactada com LZ4;
3. salva `public/maps/<mapa>.png` (e `<mapa>_lower.png`) e o `public/maps/maps.json`.

Mapas suportados: Ancient, Anubis, Dust II, Inferno, Mirage, Nuke, Overpass, Train e Vertigo.

## Conversão de coordenadas

Para uma posição do jogo `(X, Y)` num radar de 1024 px:

```
x_imagem = (X - pos_x) / scale
y_imagem = (pos_y - Y) / scale
```

A direção da seta é `-atan2(forward.y, forward.x)`.

## Avisos

- As imagens dos radares são da Valve. Elas ficam só no seu computador (estão no `.gitignore`) e servem para a sua transmissão. Não redistribua.
- Se aparecer "Radar não encontrado", rode `npm run radares`.
