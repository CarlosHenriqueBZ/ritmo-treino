# Design aprovado — ritmo

Aplicativo pessoal, em português, prioritariamente móvel, com visual claro em verde, lilás e pêssego, fonte DM Sans, cartões arredondados e transições discretas. Navegação inferior no celular e lateral no desktop.

Quatro telas: visão geral, fichas A/B/C, evolução e perfil. Exercícios, séries, repetições, intervalos e links transcritos dos três PDFs. Vídeos combinados aparecem juntos. A ficha A inclui bíceps. A sessão ativa persiste ao recarregar; séries e cargas são salvas imediatamente. Finalização grava histórico e atualiza a sugestão A/B/C.

IndexedDB contém perfil, cargas, sessão e histórico. Exportação/importação JSON validada. App estático Vite com service worker e manifesto, publicado pelo GitHub Actions no Pages. Calorias aproximadas por MET, peso e duração; sem alegação de medição. Nenhum backend, autenticação ou telemetria.

Verificação: regras de tempo, semana, calorias e importação; teste de fluxo no navegador com reinício, finalização e viewport móvel; build e publicação.

## Diário alimentar

Extensão solicitada: uma quinta aba Alimentação, com chat por dia, estimativa por alimento pelo OpenRouter, edição de calorias, complementação de relatos, exclusão e gráficos de consumo semanal na visão geral e evolução. O consumo não é subtraído do exercício para representar déficit energético.

Estado versão 2 acrescenta `meals`; migração e importação preservam treinos da versão 1. Refeições guardam data civil local, descrição, resposta, itens e estado da análise. Somente registros concluídos entram nos totais. Resultados atrasados de uma análise não sobrescrevem um backup restaurado. Falhas não causam repetição automática de chamadas.

Credencial em registro IndexedDB separado, configurada pelo usuário no perfil, nunca no repositório público ou exportação. Integração direta HTTPS com resposta estruturada validada localmente; apenas o relato da refeição é enviado. Modelo OpenRouter GPT-4o-mini. Textos retornados são escapados antes da exibição. Casos de rede, autenticação, créditos, rate limit e resposta malformada são apresentados no diário para nova tentativa.
