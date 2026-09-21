# ritmo

App pessoal de treino em português, feito para celular, sem login ou servidor de dados. Fichas A/B/C transcritas dos PDFs, vídeos do treinador, registro de cargas e séries, cronômetro, descanso, histórico e gráfico semanal.

## Desenvolvimento

Node 22+. Execute `npm ci` e `npm run dev`. `npm test` verifica as regras de tempo, calorias, backups e fichas. `npm run build` gera `dist`.

## Dados e uso offline

Dados ficam no IndexedDB deste navegador/origem, sem sincronização entre aparelhos. Exporte backups no Perfil. Limpar dados do navegador apaga os registros. O cronômetro continua enquanto estiver em execução mesmo ao fechar o app; pause ao interromper o treino. Calorias são estimativas MET (3,5 geral / 6 vigoroso), incluindo os descansos da sessão e excluindo pausas manuais. Fonte: https://pacompendium.com/adult-compendium/ . Cardio usa a aproximação da intensidade global da sessão.

O service worker armazena o app para uso offline após carregamento inicial. Vídeos dependem do YouTube e de internet; cada embed tem link externo alternativo. O link do tríceps unilateral é uma busca, como no PDF. Use o menu do navegador para adicionar à tela inicial.

## Publicação

GitHub Actions publica a pasta `dist` no Pages ao enviar para `main`. Em Settings → Pages, use GitHub Actions como origem. PDFs pessoais ficam fora do repositório; o app contém as fichas transcritas.
