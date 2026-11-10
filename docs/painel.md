# Painel de controle

Abra http://localhost:3500/admin.html. Tudo é salvo sozinho e aparece no OBS na hora. À direita fica uma **prévia ao vivo** do HUD.

## Partida

| Campo | O que faz |
| --- | --- |
| Tipo de jogo | **Campeonato**: mostra o nome do evento e a série (MD1/MD3/MD5). **Jogo amador**: mostra um selo (ex.: "JOGO AMADOR") e um texto livre. |
| Série | MD1, MD3 ou MD5. Define as bolinhas de mapas vencidos e a ordem do veto. |
| Time A começa de | CT ou TR no primeiro mapa. Depois o HUD troca os lados sozinho. |
| Layout | **Horizontal**: cartões dos jogadores embaixo. **Vertical**: linhas nas laterais. |

## Biblioteca de times

- **Times profissionais:** digite o nome e clique em **Buscar**. Ao escolher um resultado, o nome e o escudo são baixados da [Liquipedia](https://liquipedia.net/counterstrike/) e ficam salvos no seu computador.
- **Times amadores:** preencha o Time A ou B à mão e clique em **Salvar na biblioteca**.
- Para usar um time salvo, clique em **Time A** ou **Time B** no cartão dele.

A HLTV não é usada porque bloqueia programas automáticos.

## Time A e Time B

Nome, sigla (até 5 letras), cor e escudo (PNG, JPG, WEBP ou SVG). Sem escudo, o HUD desenha um escudo com a sigla na cor do time. O Time A fica sempre à esquerda.

## Sua marca

| Campo | Padrão | Onde aparece |
| --- | --- | --- |
| Nome / logo | "Minha Org" | Faixa abaixo do placar |
| Cor principal | `#005ecf` | Linha do placar, destaques |
| Cor de destaque | `#00f000` | Selo amador, série, MVP |
| Fundo, topo do gradiente | `#085a9f` | Todos os painéis |
| Fundo, base do gradiente | `#0c1722` | Todos os painéis |
| Cor CT / TR | `#4fb4ff` / `#ffb02e` | Lado de cada time |
| Transparência | 0,88 | Painéis |

## Veto de mapas

1. Clique em **Gerar ordem MD1/MD3/MD5**.
2. Escolha os mapas conforme o veto acontece e quem começa de CT ou TR.
3. Em **Controles ao vivo**, clique em **Mostrar veto** para exibir a tela de veto no HUD.

## Patrocinadores

Envie os logos, que trocam sozinhos no canto do HUD, embaixo do minimapa.

**Peça ao patrocinador:** 600 × 180 px, PNG com fundo transparente, versão branca ou clara.

## Controles ao vivo

| Botão | O que faz |
| --- | --- |
| HUD | Liga e desliga o HUD inteiro |
| Mostrar veto | Tela de veto por cima de tudo |
| Patrocinadores | Caixa de patrocínio |
| Jogador observado | Painel grande do jogador na câmera |
| Inverter lados | Corrige se os times aparecerem com os lados trocados |
| Trocar Time A ↔ B | Inverte as posições dos times, a série e o veto |
| MVP do round | Destaque do MVP no fim de cada round |
| Testar MVP ▶ | Mostra um MVP de exemplo agora |
| Minimapa | Radar em tempo real |
| Freeze time / economia | Painel de economia durante a compra |
| Placar da série | **+** e **−** para os mapas vencidos |
| Tamanho do minimapa | De 240 a 480 px |
| Tempo do MVP | Quantos segundos o destaque fica na tela |
