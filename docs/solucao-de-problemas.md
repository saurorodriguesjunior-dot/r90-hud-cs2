# Solução de problemas

| Problema | O que fazer |
| --- | --- |
| O painel mostra "Aguardando CS2" | Confira se o `.cfg` está em `...\game\csgo\cfg`, reinicie o CS2 e entre numa partida como espectador. |
| Mudei a porta e parou | Use a mesma porta na variável `PORT` e no `uri` do `.cfg`. |
| Os times aparecem com os lados trocados | Clique em **Inverter lados** no painel. |
| O minimapa diz "Radar não encontrado" | Rode `npm run radares`. Se o CS2 estiver em outra pasta, passe o caminho para o script. |
| Os jogadores aparecem fora do lugar no radar | O mapa pode ter sido atualizado. Rode `npm run radares` de novo. |
| O dano do MVP aparece como "—" | Em algumas versões, o CS2 não envia o dano do round no modo espectador. O resto funciona normalmente. |
| Não aparece killfeed no HUD | O killfeed vem do próprio jogo. Use `cl_draw_only_deathnotices 1`. |
| A busca de times falha | A Liquipedia limita os pedidos. Espere alguns segundos e tente de novo. |
| As fontes aparecem diferentes | O OBS precisa de internet para carregar a fonte do Google Fonts. |
| O HUD fica cortado no OBS | A fonte de navegador precisa ter exatamente 1920 × 1080. |
