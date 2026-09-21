# ritmo

App pessoal de treino em português, feito para celular, sem login ou servidor de dados. Fichas A/B/C transcritas dos PDFs, vídeos do treinador, registro de cargas e séries, cronômetro, descanso, histórico e gráfico semanal.

## Diário alimentar

Em **Meu perfil**, configure a chave OpenRouter uma vez. Em **Alimentação**, descreva a refeição e suas quantidades. A resposta estima calorias por alimento e salva no dia selecionado, com resumo diário e semanal também na visão geral e na evolução. É possível complementar o relato, corrigir calorias e excluir refeições. Dias sem registros não representam consumo zero. Consumo alimentar e gasto de treino não são usados para inferir déficit calórico.

A chave fica em um registro separado no IndexedDB, fora do código, repositório e backups. As chamadas HTTPS vão diretamente do navegador ao OpenRouter, enviando apenas o relato daquela refeição. O provedor recebe o relato e a conta OpenRouter é cobrada conforme seu uso. Modelo padrão: `openai/gpt-4o-mini`, com JSON Schema, validação local, limite de resposta e timeout de 45 segundos. Não há chamada automática ao abrir o app nem repetição automática de pedidos pagos.

Histórico alimentar funciona offline; novas estimativas exigem internet. Pedidos interrompidos ficam disponíveis para nova tentativa, sem calorias fictícias. Uma correção com erro preserva os valores anteriores. Backups antigos de treino continuam compatíveis; novos backups incluem o diário, sem a chave. A chave local não é criptografada e pode ser removida no perfil.

`node tests/nutrition-browser.mjs` verifica o fluxo completo com respostas da API simuladas, sem gastar créditos. `node tests/browser.mjs` verifica a regressão do treino e cache offline. Ambos usam Chrome local e a versão compilada em `http://localhost:4173/` (ou `TEST_URL`). Nenhuma validação de inferência real é feita sem a chave do usuário.

## Desenvolvimento

Node 22+. Execute `npm ci` e `npm run dev`. `npm test` verifica as regras de tempo, calorias, backups e fichas. `npm run build` gera `dist`.

## Dados e uso offline

Dados ficam no IndexedDB deste navegador/origem, sem sincronização entre aparelhos. Exporte backups no Perfil. Limpar dados do navegador apaga os registros. O cronômetro continua enquanto estiver em execução mesmo ao fechar o app; pause ao interromper o treino. Calorias são estimativas MET (3,5 geral / 6 vigoroso), incluindo os descansos da sessão e excluindo pausas manuais. Fonte: https://pacompendium.com/adult-compendium/ . Cardio usa a aproximação da intensidade global da sessão.

O service worker armazena o app para uso offline após carregamento inicial. Vídeos dependem do YouTube e de internet; cada embed tem link externo alternativo. O link do tríceps unilateral é uma busca, como no PDF. Use o menu do navegador para adicionar à tela inicial.

## Publicação

GitHub Actions publica a pasta `dist` no Pages ao enviar para `main`. Em Settings → Pages, use GitHub Actions como origem. PDFs pessoais ficam fora do repositório; o app contém as fichas transcritas.
