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
