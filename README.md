# Crônicas de Aetherion — Portal do jogador

Ficha estática responsiva, sem dependências externas. Publicar com Settings → Pages → Deploy from a branch → main / (root). O navegador consulta data.json a cada 20 segundos enquanto a aba estiver visível e oferece atualização manual.

## Sincronização

`data.json` é um snapshot único, autocontido e exclusivamente destinado ao jogador. Atualizar em um único commit da main do portal, após confirmação do checkpoint correspondente da campanha privada. Manter schema 1 e estrutura dos campos; inventário inclui nome, categoria, quantidade, propriedades e limites. Não copiar documentos privados, informações do Mestre, credenciais ou registros não conhecidos pelo jogador. Se a publicação falhar, conservar o snapshot anterior e comunicar a divergência. O portal não altera o estado canônico da campanha.

Dados iniciais: V539 / C747. Imagens canônicas copiadas para assets/.

## Aba Combate

A aba `#combat` organiza ações, magias permanentes, técnicas, consumíveis e habilidades a partir do snapshot canônico, sem escrita de dados, rolagens ou ativação de efeitos. Os valores de acerto são referências condicionais à cena; apenas uma maestria pertinente por teste. Protótipos continuam no Grimório.

## Layout compacto

A ficha ocupa exatamente a altura dinâmica da viewport (`100dvh`), sem rolagem global. A navegação horizontal, recursos, painel de atributos e índice de maestrias ficam fixos; a rolagem ocorre somente nos painéis internos. Em telas estreitas, maestrias continuam disponíveis na aba e os atributos viram uma faixa compacta. As ações de combate, magias, inventário e pesquisas usam detalhes expansíveis. Não altera data.json nem regras da campanha.
