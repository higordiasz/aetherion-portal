# Crônicas de Aetherion — Portal do jogador

Ficha estática responsiva, sem dependências externas. Publicar com Settings → Pages → Deploy from a branch → main / (root). O navegador consulta data.json a cada 20 segundos enquanto a aba estiver visível e oferece atualização manual.

## Sincronização

`data.json` é um snapshot único, autocontido e exclusivamente destinado ao jogador. Atualizar em um único commit da main do portal, após confirmação do checkpoint correspondente da campanha privada. Manter schema 1 e estrutura dos campos; inventário inclui nome, categoria, quantidade, propriedades e limites. Não copiar documentos privados, informações do Mestre, credenciais ou registros não conhecidos pelo jogador. Se a publicação falhar, conservar o snapshot anterior e comunicar a divergência. O portal não altera o estado canônico da campanha.

Dados iniciais: V539 / C747. Imagens canônicas copiadas para assets/.
