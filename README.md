# DashIFG — Conselho de Classe

Protótipo de acompanhamento de notas e faltas, com React, TypeScript e Vite. Requer Node.js 22.12+ (validado com 24.19) e npm.

```sh
npm ci
npm run dev
```

O servidor de desenvolvimento usa a porta 5173. Para validar: `npm test` e `npm run build`. `npm run preview` serve o build na porta 4173.

## Importação

Clique em **Importar planilha** e selecione um `.xlsx` de até 15 MB. A primeira aba deve ter cabeçalho na primeira linha, com a coluna `Aluno` e, para cada disciplina, as colunas:

`Disciplina - N1`, `Disciplina - F1`, `Disciplina - N2`, `Disciplina - F2`, `Disciplina - N3`, `Disciplina - F3`, `Disciplina - N4`, `Disciplina - F4`, `Disciplina - Média Final`, `Disciplina - Faltas`, `Disciplina - Situação`.

N1–N4 são notas dos quatro bimestres; F1–F4 são suas faltas. Notas devem estar entre 0 e 10 e faltas devem ser inteiros não negativos. Notas abaixo de 6,0 recebem destaque. A média final, as faltas totais e a situação são lidas da planilha e não recalculadas. Campos vazios aparecem como “—”, e vínculos aluno/disciplina inteiramente vazios são ignorados.

Use os filtros e a busca; clique no nome ou na seta de um aluno para consultar seu histórico completo. Os indicadores consideram o aluno, a disciplina, o bimestre e a busca; “Somente atenção” restringe as linhas da tabela. As médias do painel são médias aritméticas simples das notas preenchidas no recorte, sem pesos. A quantidade de alunos em atenção conta cada aluno uma vez. Não se calcula percentual de faltas, pois o arquivo não contém o número de aulas dadas.

## Privacidade e limites

A aplicação inicia com dados inteiramente fictícios. A importação é processada na memória do navegador, sem backend, persistência, telemetria ou envio da planilha. Recarregar a página remove os dados importados. Não inclua planilhas reais no repositório. Este protótipo não possui autenticação nem integração com o sistema acadêmico. Turma e ano letivo não são inferidos do arquivo.

## Publicar no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` testa e publica o site a cada envio para `main`. No GitHub, abra **Settings → Pages → Build and deployment → Source** e escolha **GitHub Actions**. Depois execute o workflow **Publicar dashboard no GitHub Pages** na aba **Actions** (ou envie uma alteração para `main`).

O endereço esperado é `https://roneyifg.github.io/dashifg/`. A publicação usa a base `/dashifg/`, mantendo o desenvolvimento local na raiz. Para verificar esse build localmente:

```sh
npm run build -- --base /dashifg/
npm run preview -- --base /dashifg/
```

O site publicado começa somente com dados fictícios. Nenhuma planilha real deve ser incluída no repositório ou nos artefatos do site. A importação continua sendo local ao navegador de cada pessoa.

## Visão do conselho

A tela inicial apresenta uma matriz de alunos × disciplinas, com nota e faltas do bimestre selecionado (ou resultado final). As notas abaixo de 6,0 recebem destaque e cada aluno tem um contador de disciplinas abaixo da média. A ordenação inicial prioriza esse contador; também é possível ordenar por nome. Empates são resolvidos por ordem alfabética.

Os filtros de aluno, disciplina, período e busca também se aplicam à matriz. O contador considera apenas as disciplinas no recorte. “Somente atenção” seleciona alunos com alguma nota abaixo de 6,0 e preserva suas demais células para comparação. “—” é uma nota sem registro; zero continua sendo zero. “Sem vínculo” identifica a ausência de registro aluno/disciplina na importação e não afirma que o aluno não está matriculado. Clique no nome para abrir o histórico completo. Nomes e cabeçalhos ficam fixos durante a rolagem da matriz.

Na Visão do conselho, **Ver gráfico** abre um gráfico de barras horizontais com os alunos que têm pelo menos uma nota abaixo de 6,0, ordenados pela quantidade de disciplinas (desempate por nome). O gráfico usa o período e os filtros selecionados, preserva zero como nota válida e ignora notas ausentes. No resultado final, usa as médias finais da planilha. Todos os alunos em atenção são exibidos, com rolagem quando necessário. Feche pelo botão, pela tecla Escape ou clicando fora do gráfico.
