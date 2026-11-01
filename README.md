# CentralFut — Central de Campeonatos (2026) · V1.7.1

**Sistema INDEPENDENTE do JogosApp.** Administração local de tabelas, resultados, times, rodadas, classificação e mata-matas de quatro competições: Paulistão A1, Libertadores, Copa do Brasil e Brasileiro Série A de 2026.

## Correção da V1.1.1

A versão V1.1.0 apresentava tela em branco ao abrir o `index.html`, pois o `src/bundle.js` incluía um import incompatível com scripts clássicos. O `build.py` agora remove corretamente os imports multilinha, valida o JavaScript com `node --check` e gera o bundle que pode ser carregado diretamente pelo HTML. O aplicativo também funciona quando o navegador bloqueia `localStorage`, embora nesse caso os dados não persistam após fechar a página.

Se estiver atualizando uma pasta anterior, extraia o ZIP em uma **pasta nova** para garantir que o `index.html` e o `src/bundle.js` pertencem à mesma versão. Não abra o HTML dentro da visualização do ZIP; primeiro extraia todos os arquivos.

## Começar em 30 segundos

1. Extraia o ZIP, abra a pasta **Campeonatos-2026**.
2. Abra `index.html` com Chrome, Edge ou Firefox. **Não precisa instalar .NET, Node, banco de dados nem servidor.** O aplicativo utiliza `src/bundle.js`, gerado a partir de módulos JS. Se o navegador restringir o acesso ao `file://`, use um servidor local como indicado adiante.
3. Escolha a competição no menu lateral e navegue pelas abas **Clubes, Jogos, Classificação, Mata-mata, Regulamento e Ajustes**.
4. Na aba **Jogos**, abra um confronto, informe os gols e clique em **Salvar resultado**. Para desempates em eliminatórias, informe também o placar dos pênaltis quando necessário.
5. Quando todos os confrontos estiverem decididos, use **Avançar fase**. O sistema bloqueia a etapa anterior para evitar que o chaveamento fique inconsistente.
6. Faça backup regularmente em **Ajustes → Baixar JSON**. É possível restaurar o JSON no mesmo painel.

## O que já vem preparado

| Torneio | Cadastro inicial | Formato e recursos |
|---|---|---|
| **Paulista A1 2026** | 16 clubes oficiais | 64 confrontos publicados pelo sorteio FPF, organizados em oito rodadas administrativas (mandos/datas ajustáveis); oito avançam; quartos, semi e final (1 ou 2 jogos). Rebaixamento dos dois últimos indicado na classificação. |
| **Libertadores 2026** | **32 clubes oficiais nos grupos**, com opção de **47 inscritos reais** | Inicia com **sorteio administrativo por potes dos 32 classificados de 2026** (96 jogos sem placar). Em **Ajustes**, também é possível voltar à distribuição oficial de 19/03/2026. Em **Ajustes**, pode iniciar pelas três preliminares (6→3, 16→8, 8→4), com clubes e confrontos de entrada da edição de 2026. O sistema mantém o mata-mata e a final única. |
| **Copa do Brasil 2026 — modelo administrativo** | 32 clubes (20 da Série A e 12 da Série B) | Chaveamento simulado da 5ª fase até a final: 32→16→8→4→2→1, sem resultados pré-lançados. Embaralhamento manual dos times da etapa atual. Não reproduz todos os participantes ou sorteios oficiais. |
| **Brasileiro A 2026** | 20 clubes oficiais | Classificação G-4, G-6 condicionado, Sul-Americana indicativa e Z-4. Calendário administrativo gerado em 38 rodadas e 380 partidas; 19 mandos e 19 visitas por equipe, com até dois jogos seguidos fora ou em casa. Refazer calendário por botão, mantendo os outros torneios; esta não é a tabela oficial de datas e mandos da CBF. |

> **Importante:** nenhuma partida tem resultado real pré-carregado. Os dados são para preenchimento administrativo, simulações e acompanhamento manual. A versão reduzida da Copa do Brasil foi solicitada pelo usuário e não corresponde ao cadastro integral oficial da CBF. O sistema **não recebe dados em tempo real** e **não replica automaticamente as tabelas oficiais**.

## Funcionalidades

- Painel por competição com fase atual, progresso e próximos jogos.
- Paulistão com taça própria no ícone e reforço automático dos escudos oficiais dos clubes conhecidos.
- Identidade visual própria para cada campeonato (Paulistão, Libertadores, Copa do Brasil e Brasileirão).
- Logos reais de clubes conhecidos vinculados automaticamente quando disponíveis, com fallback elegante.
- Biblioteca de clubes conhecidos no editor e simulador de acesso da Série B para a Série A no Brasileirão.
- Cadastro e renomeação de participantes, editor de siglas e importação de nomes em lote (um clube por linha).
- Resultados por jogo, edição de data e horário, troca de mando antes do resultado, rodada editável.
- Cartões amarelos e vermelhos nas fases de classificação para desempate.
- Desempate por pênaltis com avanço bloqueado até haver vencedor.
- Classificação com pontos, jogos, vitórias, empates, derrotas, gols pró/contra, saldo e cartões.
- Mata-mata com confronto individual, ida/volta, agregado e classificado.
- Exportação CSV de tabelas e jogos.
- Backup/restauração JSON das quatro competições.
- Visual responsivo com tema escuro.
- Dados isolados no `localStorage` deste navegador/dispositivo.

## Restrições importantes

- Este produto não é um sistema oficial de CBF, FPF ou CONMEBOL, e não substitui tabela detalhada, sorteios ou decisões dos organizadores.
- As regras **são da edição de 2026**; não replique para outra temporada sem revisão.
- A classificação da Libertadores considera pontos, confronto direto (entre empatados: pontos/saldo/gols), saldo geral, gols geral e cartões. Empate absoluto é exibido por nome para estabilidade da interface, mas requer **sorteio/decisão oficial**.
- O Paulistão usa o sorteio de adversários de 2026; o programa criou uma distribuição de oito rodadas coerente, **não a ordem nem os mandos oficiais**. A final aceita um ou dois jogos, conforme o REC e a decisão aplicável.
- A Copa do Brasil utiliza um **modelo administrativo reduzido de 32 times** (20 da Série A + 12 da Série B), começando na 5ª fase. O sorteio aleatório e os confrontos não são a tabela oficial da CBF. O usuário pode sortear novamente somente a fase atual. Placar lançado exige duas confirmações antes de refazer o sorteio; as fases anteriores são preservadas.
- A Libertadores inicia pelos **32 clubes efetivamente classificados para os grupos de 2026**, com sorteio administrativo respeitando potes e países; a configuração oficial pode ser recuperada em Ajustes. O modo **Desde as preliminares** tem os 47 inscritos reais; o avanço entre etapas permite simulações administradas, que não substituem os resultados ou a tabela oficiais. Os confrontos da primeira e segunda fases usam o sorteio de 2026, enquanto os jogos da fase de grupos seguem uma geração administrativa de rodadas (não o calendário oficial). Faça backup antes de alternar o modo.
- A atualização automática dos dados antigos da Libertadores só ocorre para uma versão anterior **com 47 vagas genéricas intactas, sem qualquer resultado**. Se houver edição, os dados são preservados e o carregamento oficial deve ser solicitado em **Ajustes**.
- Esta versão **não possui autenticação, MySQL ou sincronização**. Publicar no GitHub Pages publica o programa; não publica os resultados do seu navegador para todos os visitantes. Para colaboração simultânea, seria necessário acrescentar uma API e um banco de dados.
- Em regulamentos de pontos corridos, penalizações administrativas, pontos perdidos no tribunal e placares de WO não são lançados automaticamente. Para produção oficial, conferir com a respectiva entidade.

## Rodar via servidor local (opcional)

Se preferir usar `http://localhost`:

```bash
cd Campeonatos-2026
python -m http.server 4173
```

Abrir: `http://localhost:4173/`.

## Publicação separada no GitHub Pages

Crie **um repositório próprio** (ex.: `CampeonatosApp`), sem usar o repositório do `JogosApp`. Copie o conteúdo da pasta `Campeonatos-2026/` para a raiz do novo repositório. A configuração `.github/workflows/pages.yml` envia os arquivos estáticos ao GitHub Pages. Em **Settings → Pages**, use **Source: GitHub Actions**. Cada `push` na `main` pode disparar a publicação no domínio próprio desse novo repositório, sem afetar `gakutsu.github.io/JogosApp/`.

O código utiliza caminhos relativos para suportar um caminho de subpasta (`https://usuario.github.io/CampeonatosApp/`). O fluxo `pages.yml` **não** faz commit ou deploy sozinho enquanto não for publicado em um repositório com Pages habilitado.

## Arquitetura e manutenção

```
Campeonatos-2026/
├── index.html                 # Página inicial, abre diretamente
├── src/
│   ├── bundle.js              # Aplicação pronta para o navegador
│   ├── app.js                 # Interface + estado local + importação/exportação
│   ├── competition.js         # Motor de regras, rodadas, classificação e mata-mata
│   └── style.css              # Interface responsiva
├── tests/competition.test.js  # Testes automatizados de competição
├── tests/ui-bundle.test.cjs    # Teste de inicialização da interface
├── assets/                    # Capturas locais de desenvolvimento
├── .github/workflows/pages.yml
├── package.json               # Somente scripts auxiliares, sem dependências
├── build.py                   # Regera bundle.js a partir dos dois módulos
└── README.md
```

Para alterar os módulos, edite `src/app.js` e/ou `src/competition.js` e execute `python build.py` para atualizar o `src/bundle.js` antes da publicação.

Para executar os testes com **Node 20+**:

```bash
npm test
```

Não há `npm install` nem `npm run build` necessário. Os testes cobrem 4 torneios, configuração das fases, pênaltis, classificação, progressões e inicialização do bundle offline.

## Documentos consultados (2026)

- FPF · REC Paulistão A1 2026: https://futebolpaulista.com.br/Repositorio/Competicao/Regulamento/1551/1551_639002025107690404.pdf
- CONMEBOL · Manual Libertadores 2026: https://cdn.conmebol.com/wp-content/uploads/2025/12/CL-2026-Manual-de-Clubes-POR.pdf
- CONMEBOL · Grupos sorteados 2026: https://gol.conmebol.com/libertadores/pt-br/news/rumo-gloria-eterna-este-sao-os-grupos-da-conmebol-libertadores-2026
- CBF · REC Copa do Brasil 2026: https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/REC_Copa_do_Brasil_2026_66989a5426.pdf
- CBF · Série A 2026: https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-a/2026
- CBF · REC Brasileiro Série A 2026: https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/REC_Brasileiro_Serie_A_2026_c984f8cf05.pdf

**Versão:** 1.7.0 · **Data-base normativa:** 2026-11-01.


## Ajustes da versão 1.1.3

- Ajuste dos escudos faltantes do Paulistão: Novorizontino, Mirassol, Velo Clube, Portuguesa, Noroeste, Primavera e Capivariano.
- Atualização automática dos escudos em dados já salvos no navegador.


## Ajustes da versão 1.1.4

- Paulistão com identidade visual reforçada com base nas referências enviadas (taça e pôster oficial).
- Velo Clube com escudo oficial local incorporado ao projeto.


## Ajustes da versão 1.1.5

- Substituído o escudo incorreto do Velo Clube pelo escudo fornecido pelo usuário, preservando símbolos e cores e removendo somente o fundo branco externo.
- Escudo incluído localmente em `assets/velo-clube-oficial-v2.png` para funcionar sem depender de sites de terceiros.
- Atualização automática do caminho do escudo nos dados já salvos no navegador, sem excluir resultados, clubes ou tabelas.


## Ajustes da versão 1.2.0 — Paulistão

- Classificação com aparência editorial específica do Paulistão: tabela mais limpa, identidade roxo/azul com dourado, destaque do líder e indicadores de progresso.
- Separação visual dos **oito primeiros (zona das quartas)**, **seis intermediários** e **dois últimos (zona de rebaixamento)**. Enquanto a primeira fase não terminar, essas posições são sinalizadas como **provisórias**.
- Filtros interativos para ver a tabela completa, somente o G8 ou apenas as duas posições finais.
- Seleção de qualquer clube na tabela ou nos cards para abrir sua **ficha de campanha**, com posição, pontos, vitórias, gols pró, saldo e oito jogos da primeira fase. Atalho para a lista de jogos do clube.
- Substituição da listagem simples de participantes por **16 cards aprimorados**, com os escudos, potes, posição e link de campanha; edição individual preservada.
- Chaveamento exclusivo do Paulistão, mostrando desde o começo o percurso **quartas → semifinal → final**, sem inventar classificados ou resultados. À medida que as fases avançam, os confrontos reais são exibidos, com placares, agregados, pênaltis quando existentes e vencedor.
- Regras esportivas, banco local do navegador, todas as demais competições, configurações do GitHub Pages e escudo local atualizado do Velo Clube foram mantidos.

**Nota visual:** os painéis refletem o estilo gráfico das imagens de referência fornecidas pelo usuário, mas não representam material oficial da Federação Paulista de Futebol. Os resultados exibidos são lançados pelo administrador e não são sincronizados automaticamente com a entidade.


## Ajuste da versão 1.2.1 — Hero do Paulistão

- Removido exclusivamente do hero do Paulistão o card que exibia "PAULISTÃO", a taça ilustrada e o texto "Design dedicado".
- Título, textos, identificação temática, fundo com a imagem do troféu, navegação e demais funcionalidades permanecem.
- As outras competições preservam o layout anterior de seus respectivos heros.


## Atualização V1.3.0 — Libertadores 2026

- **Modo inicial:** 32 clubes oficiais em 8 grupos com 4 equipes, confirmados no sorteio de 19/03/2026. Sem resultados fictícios.
- **Modo preliminares:** todos os 47 inscritos reais, diferenciando 6 que iniciaram na primeira fase, 13 que entraram na segunda e 28 que entraram diretamente nos grupos. A primeira e a segunda fases têm os confrontos do sorteio real de 2026, com entradas dinâmicas dos classificados; os resultados seguem em branco.
- **Painel temático:** identidade azul-marinho e dourado, cards interativos por grupo, países, escudos associados, acesso à classificação por grupo e filtros A–H ou todos.
- **Ajustes → Participantes oficiais 2026:** alterna entre os dois modos, solicitando confirmação; somente a Libertadores é reiniciada.
- **Migração segura:** substitui automaticamente apenas antigas vagas genéricas não editadas da Libertadores. Dados personalizados, jogos e classificações das demais competições são preservados.
- **Escudos:** a maioria dos brasões da Libertadores é carregada por links externos de catálogo e pode precisar de acesso à internet. Se um provedor não responder, o aplicativo mostra a sigla do clube sem interromper a navegação.

### Grupos confirmados no sorteio de 19 de março de 2026

| Grupo | Clubes |
|---|---|
| A | Flamengo, Estudiantes, Cusco, Independiente Medellín |
| B | Nacional (URU), Universitario, Coquimbo Unido, Deportes Tolima |
| C | Fluminense, Bolívar, Deportivo La Guaira, Independiente Rivadavia |
| D | Boca Juniors, Cruzeiro, Universidad Católica (Chile), Barcelona (EQU) |
| E | Peñarol, Corinthians, Independiente Santa Fe, Platense |
| F | Palmeiras, Cerro Porteño, Junior Barranquilla, Sporting Cristal |
| G | LDU Quito, Lanús, Always Ready, Mirassol |
| H | Independiente del Valle, Libertad, Rosario Central, Universidad Central |

**Fontes adicionais:**
- CONMEBOL — participantes dos grupos: https://gol.conmebol.com/libertadores/pt-br/news/sorteio-da-fase-de-grupos-da-conmebol-libertadores-2026-data-horario-classificados-potes-e
- Associação do Futebol Argentino — grupos sorteados: https://www.afa.com.ar/geo/posts/asi-quedaron-los-grupos-de-la-copa-libertadores-2026
- Calendário preliminar publicado: https://www.directvsports.com/futbol/conmebol-confirmo-el-fixture-de-la-fase-preliminar-de-la-copa-libertadores-2026-20260122-0042.html

**Importante:** este aplicativo gerencia placares lançados pelo usuário, não consulta os resultados da temporada em tempo real.


## Ajustes da versão 1.3.1

- Libertadores com opção de embaralhar os 32 clubes da fase de grupos conforme o regulamento (um clube por pote, restrição de país e exceção para classificados da fase 3).
- Libertadores passa a abrir por padrão no modo de grupos embaralhados regulamentares, preservando a opção de voltar aos grupos oficiais.
- Correção do escudo oficial do Libertad.


## Ajustes da versão 1.3.2 — Sorteio e escudos da Libertadores

- Corrigido o botão **Grupos embaralhados** na aba Ajustes: ele agora gera efetivamente um novo sorteio, com confirmação e aviso após sucesso. Ao estar ativo, passa a se chamar **Embaralhar novamente**.
- O sorteio usa os 32 classificados de 2026 distribuídos em quatro potes, um representante de cada pote em cada grupo, observando o impedimento de clubes do mesmo país, exceto classificados da terceira fase preliminar.
- Restaurar os **grupos oficiais** em Ajustes agora funciona e a configuração escolhida permanece salva ao fechar e reabrir o aplicativo. Nenhum resultado das outras competições é apagado.
- Substituídos os links quebrados de **Universitario de Deportes** e **Platense** por arquivos vetoriais oficiais referenciados no Wikimedia Commons. Eles precisam de internet para carregar; o aplicativo mantém a sigla como alternativa.
- Escudos corrigidos são atualizados também para clubes das partidas salvas anteriormente, sem substituir placares já registrados.


## Versão 1.3.3 — Identidade visual da Libertadores

- Redesenho **exclusivo da Libertadores** em preto profundo e dourado metálico, com iluminação lateral, inspirado na referência fornecida.
- Hero com taça dourada e a assinatura “La Gloria Eterna”, mantendo título e descrição legíveis em desktop e celular.
- Nova paleta nos cards dos oito grupos, classificação, menus, filtros, botões, configurações e mata-mata.
- Recursos preservados: sorteio de grupos, grupos oficiais, preliminares, placares, exportação, backup e demais competições.
- Elementos gráficos locais em `assets/libertadores-trofeu.webp` e `assets/libertadores-ambient.webp`, derivados da imagem de referência enviada, não dependentes de conexão.


## Versão 1.3.4 — Identidade azul do Paulistão

- O tema do Paulistão foi redesenhado a partir da referência fornecida: azul elétrico intenso, polígonos angulares, tipografia branca e pequeno detalhe vermelho.
- Novo fundo vetorial local em `assets/paulistao-electric-bg.svg`, sem textos duplicados nem dependência de internet.
- Hero com o título visual **PAULISTÃO** e identificação **Campeonato Paulista · Série A1**; o card ilustrativo antigo não foi reintroduzido.
- Classificação, grupos de informações, filtros, cards, mata-mata e estados interativos foram harmonizados com a nova identidade.
- Destaques esportivos em verde (quartas) e vermelho (rebaixamento) continuam diferenciados.
- Os temas Libertadores, Copa do Brasil e Brasileirão, assim como dados, clubes, escudos, resultados e backups, permanecem preservados.


## Versão 1.4.0 — Libertadores Premium

- **Tabela renovada:** oito tabelas responsivas com escudos, país, partidas disputadas, pontuação e saldo de gols.
- **Zonas de classificação:** duas vagas por grupo para as oitavas, terceiro colocado para os playoffs da Sul-Americana e quarto eliminado. Enquanto faltarem jogos do grupo, as posições e zonas são marcadas como **provisórias**; não há classificação definitiva antecipada.
- **Cards dos clubes:** fichas premium com escudo, bandeira, país, grupo, pote, jogos concluídos, pontos, vitórias e saldo de gols, com acesso aos jogos ou ao editor.
- **Chaveamento editorial:** 8 chaves de oitavas, 4 de quartas, 2 de semifinais e uma final. As vagas futuras aparecem como indefinidas até a progressão real dos jogos cadastrados. Os confrontos gerados exibem os times, agregados e desempates cadastrados, além do atalho de jogos por chave.
- **Tema exclusivo:** preservada a identidade preto e ouro da Libertadores, com refinamento de bordas, tipografia e cartões, sem alterar a identidade azul do Paulistão ou as outras competições.
- **Persistência:** placares, clubes, grupos sorteados e backups existentes não são reiniciados pela atualização.
- **Aviso:** o sistema é independente e **não é um painel oficial da CONMEBOL**; os resultados e confrontos administrados não são sincronizados com o torneio real.


## Versão 1.5.0 — Copa do Brasil com nova identidade

- A **Copa do Brasil** recebeu uma identidade visual exclusiva inspirada na referência enviada: verde profundo, dourado, azul e padrões geométricos locais em `assets/copa-brasil-ref.png` e `assets/copa-brasil-emblem.png`.
- O hero, os cards, botões, painéis, listas de clubes, partidas e o mata-mata da Copa ganharam acabamento mais próximo de uma competição oficial.
- A competição passou a iniciar em um **formato administrativo enxuto com 32 clubes**, avançando da **5ª fase** até a final.
- Para manter o chaveamento de 32 equipes, a base padrão agora usa os **20 participantes da Série A** e **12 clubes da Série B** atual, todos já cadastrados com nomes e escudos.
- A migração automática da Copa é aplicada apenas quando a versão antiga ainda não tinha resultados lançados; dados editados manualmente continuam preservados.
- Paulistão, Libertadores e Brasileirão permanecem intactos, com suas identidades e funcionalidades preservadas.


## Versão 1.5.1 — Correção de escudos

- Corrigidos os escudos oficiais de **Remo**, **Ceará**, **Athletic Club** e **Avaí**.
- As referências passaram a usar arquivos oficiais do Wikimedia Commons, mais estáveis do que os slugs anteriores.
- A rotina de migração agora também atualiza automaticamente esses quatro clubes em dados salvos antigos quando encontrar links quebrados.
- Testes automatizados adicionados para garantir a correção e a persistência dos escudos.


## Versão 1.6.0 — Copa do Brasil Premium

- **Classificação por confronto:** visualização detalhada das chaves com escudos e marcação de classificados e eliminados após a resolução de cada confronto.
- **Cards dos clubes:** 32 cartões temáticos com divisão, escudo, situação, partidas, vitórias, gols e saldo; filtros de todos/classificados/em disputa/eliminados.
- **Mata-mata exclusivo:** mapa visual com 16 confrontos da fase de 32, oito das oitavas, quatro das quartas, duas semifinais e a final. Enquanto uma fase não é gerada, as vagas aparecem como “A definir”.
- **Sorteio manual:** botão “Refazer sorteio da fase” ou “Embaralhar times” em Visão geral, Clubes, Jogos, Tabelas, Mata-mata e Ajustes. Embaralha todos os participantes da fase ativa, sem alterar os nomes dos clubes, IDs ou outras competições.
- **Segurança dos resultados:** se houver qualquer resultado lançado na fase ativa, o sistema exige **duas confirmações** para recriar os jogos; os resultados, datas e pênaltis **da fase atual** serão descartados. Faça backup JSON em Ajustes antes de utilizar. Fases anteriores ficam intactas.
- **Visual:** verde profundo, dourado e detalhes em azul, aproveitando a arte de referência enviada. O design é temático; não deve ser confundido com uma interface licenciada ou oficial da CBF.
- **Testes:** novas coberturas para sorteios consecutivos, avanço de fases, preservação de outras competições, status de qualificação e atalhos para os confrontos.


## Versão 1.7.0 — Brasileirão Série A Premium

- **Visual:** tema exclusivo verde-escuro, iluminação de estádio, detalhes de troféu e elementos da imagem fornecida pelo usuário, disponíveis localmente em `assets/brasileirao-2026-ambiente.webp` e `assets/brasileirao-2026-trofeu.webp`.
- **Classificação interativa:** tabela de 20 clubes com escudos, pontos, partidas, vitórias, saldo e filtros G-4, G-6, Sul-Americana e Z-4. O G-4 (1º–4º) dá acesso direto à Libertadores, o 5º disputa a fase preliminar, e o 6º depende do repasse de vagas; a zona da Sul-Americana é indicativa e pode mudar com as demais competições. As quatro últimas equipes representam o Z-4. A classificação permanece provisória até o fechamento da 38ª rodada.
- **Cards de clubes:** os vinte participantes aparecem com escudos, classificação, pontos, vitórias, saldo, botão para visualizar jogos e edição. Mantida a opção de simular acesso da Série B.
- **Calendário inteligente:** botão **Refazer calendário** nas telas da competição. Reordena os 20 clubes aleatoriamente em um turno e returno de 38 rodadas, dez jogos por rodada, 19 jogos como mandante e 19 como visitante por clube, **sem três mandos ou visitas consecutivos**. O returno repete todos os confrontos com mando invertido. Os calendários gerados não reproduzem sorteio, mandos, restrições de estádio ou datas oficiais da CBF.
- **Segurança:** se houver placares ou datas registrados, o botão exige duas confirmações explícitas antes de apagar esses dados **somente do Brasileirão**. Sem registros, há uma confirmação. O backup JSON é recomendado antes de refazer o calendário. Os clubes e as outras três competições não são modificados.
- **Migração:** calendários antigos vazios (sem placares, datas nem avanço) são convertidos para o novo formato, preservando o cadastro de clubes. Calendários editados com dados são mantidos até o usuário solicitar o sorteio.
- **Sem mata-mata:** ocultada a aba Mata-mata somente no Brasileirão; Libertadores, Paulistão e Copa do Brasil mantêm seus respectivos chaveamentos.
- **Testes:** testes adicionais para 38 rodadas, alternância de mandos, 380 partidas, 100 sorteios, filtros, cards, persistência e segurança das confirmações.

**Vagas continentais:** distribuição conforme o Regulamento Específico da Série A 2026, sujeita a redistribuição de vagas da Copa do Brasil e das competições CONMEBOL. A exibição não constitui homologação oficial.


## Versão 1.7.1 — Paulistão: refazer calendário

- **Embaralhar e refazer calendário** disponível em Visão geral, Clubes, Jogos, Tabelas e Ajustes do Paulistão.
- Gera 8 rodadas de 8 jogos, mantendo os **64 confrontos da lista de adversários prevista para 2026**: cada um dos 16 clubes enfrenta seus oito adversários, com 4 mandos e 4 visitas e no máximo 2 jogos consecutivos em casa ou fora.
- O sorteio altera a ordem das rodadas e, quando possível, a composição das rodadas por ciclos alternados; os pares de adversários continuam os mesmos. **Não representa o calendário oficial de datas ou mandos da FPF.**
- Se houver resultados ou datas, duas confirmações são exigidas antes de substituir as 64 partidas. Os placares, cartões e horários **somente da primeira fase do Paulistão** são descartados após confirmar; os clubes e as demais competições são preservados. Faça backup antes de refazer o calendário.
- O botão fica **bloqueado quando o mata-mata já foi gerado**, protegendo classificados e as fases finais. Mandos e rodadas dos jogos da fase inicial não podem ser alterados isoladamente; use o gerador para manter a alternância.
- Calendários antigos que não contenham resultados nem datas podem ser reorganizados automaticamente; trabalhos registrados permanecem intactos até autorização explícita.
- Adicionados testes de validação de confrontos, mandos equilibrados, 200 sorteios, persistência, confirmação, bloqueio do mata-mata e migração segura.
