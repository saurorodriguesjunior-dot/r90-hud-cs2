# Ícones de armas e itens

Os ícones são silhuetas brancas de perfil, no estilo de menu de compra, desenhadas para o R90 HUD. Eles **não** são os ícones do jogo.

| Arquivo | Conteúdo |
| --- | --- |
| `public/weapons.js` | Silhuetas das armas (`WSHAPES`), a ligação de cada arma a uma silhueta (`WEAPON_SHAPE`) e os recortes das armas curtas (`WVIEW`) |
| `public/shared.js` | Itens: HE, flash, smoke, molotov, incendiária, decoy, kit, C4, colete e capacete (`ICONS`) |

## Usar ícones próprios

Coloque arquivos em `public/icons/weapons/` com o nome da arma no jogo, sem "weapon_". Eles substituem os desenhos e não vão para o repositório.

| Requisito | Valor |
| --- | --- |
| Formato | `.svg` (melhor), `.png` ou `.webp` |
| Fundo | Transparente |
| Cor | Branco chapado |
| Orientação | Cano para a **direita** (o HUD espelha para o time da direita) |
| Tamanho sugerido | 256 × 96 px |

**Nomes aceitos:**

| Tipo | Nomes |
| --- | --- |
| Fuzis | `ak47`, `m4a1`, `m4a1_silencer`, `famas`, `galilar`, `aug`, `sg556` |
| Snipers | `awp`, `ssg08`, `scar20`, `g3sg1` |
| SMGs | `mp9`, `mac10`, `mp7`, `mp5sd`, `ump45`, `p90`, `bizon` |
| Escopetas | `nova`, `xm1014`, `mag7`, `sawedoff` |
| Pesadas | `m249`, `negev` |
| Pistolas | `glock`, `hkp2000`, `usp_silencer`, `p250`, `elite`, `fiveseven`, `tec9`, `cz75a`, `deagle`, `revolver` |
| Outros | `knife`, `taser` |

Use apenas imagens que você tem direito de usar.
