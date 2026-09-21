# Design aprovado — ritmo

Aplicativo pessoal, em português, prioritariamente móvel, com visual claro em verde, lilás e pêssego, fonte DM Sans, cartões arredondados e transições discretas. Navegação inferior no celular e lateral no desktop.

Quatro telas: visão geral, fichas A/B/C, evolução e perfil. Exercícios, séries, repetições, intervalos e links transcritos dos três PDFs. Vídeos combinados aparecem juntos. A ficha A inclui bíceps. A sessão ativa persiste ao recarregar; séries e cargas são salvas imediatamente. Finalização grava histórico e atualiza a sugestão A/B/C.

IndexedDB contém perfil, cargas, sessão e histórico. Exportação/importação JSON validada. App estático Vite com service worker e manifesto, publicado pelo GitHub Actions no Pages. Calorias aproximadas por MET, peso e duração; sem alegação de medição. Nenhum backend, autenticação ou telemetria.

Verificação: regras de tempo, semana, calorias e importação; teste de fluxo no navegador com reinício, finalização e viewport móvel; build e publicação.
