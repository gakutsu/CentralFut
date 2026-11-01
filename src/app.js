import {
  KEYS, INFO, COPA_COUNTS, groups, BR, SERIE_B_OPTIONS, CLUB_LIBRARY,
  LIB_COUNTRY_LABELS, libCountry,
  createCompetition, createLibertadoresOfficialGroups, createLibertadoresDrawnGroups,
  played, standings, activeMatches, stageLabel, stageFor,
  currentStage, nextStage, roundsByMatches, advance, winnerOfTie, redrawCopaStage, redrawBrasileiraoCalendar, validateBrasileiraoCalendar, redrawPaulistaCalendar, validatePaulistaCalendar,
  champion, stageWinners, stageComplete,
  clubMeta, applyClubIdentity
} from './competition.js';

const STORAGE_KEY = 'centralfut-campeonatos-2026';
const $ = (s, root=document) => root.querySelector(s);
const escMap = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const h = value => String(value ?? '').replace(/[&<>"']/g, m => escMap[m]);

const defaultData = Object.fromEntries(KEYS.map(k => [k, k==='libertadores' ? createLibertadoresDrawnGroups() : createCompetition(k)]));
let state = loadState();
let selectedStage = null;
let selectedRound = null;
let modal = null;
let toast = '';
let filter = '';
let rankingFilter = 'all';
let brRankingFilter = 'all';
let libGroupFilter = 'all';
let libMatchGroup = 'all';
let libTieFilter = '';
let copaStatusFilter = 'all';

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {version:1, active:'paulista', tab:'overview', data: defaultData};
    const parsed = JSON.parse(raw);
    if(parsed?.version !== 1 || !parsed.data) throw new Error('estado inválido');
    for(const key of KEYS){
      if(!parsed.data[key]?.teams || !parsed.data[key]?.matches) parsed.data[key] = key==='libertadores' ? createLibertadoresDrawnGroups() : createCompetition(key);
    }
    const lib = parsed.data.libertadores;
    // Migrate only the untouched template with 47 placeholder teams. Never overwrite
    // teams edited by the user, recorded results, or advanced competition stages.
    if(lib?.teams?.length === 47 && lib.teams.every(t=>t.placeholder) &&
       lib.matches?.every(m=>!played(m)) && !lib.advanced?.length){
      parsed.data.libertadores = createLibertadoresDrawnGroups();
    }
    const copa = parsed.data.copa;
    if(copa && copa.teams?.length !== 32 && copa.matches?.every(m=>!played(m)) && (!copa.advanced || !copa.advanced.length)){
      parsed.data.copa = createCompetition('copa');
    }
    const paulista=parsed.data.paulista;
    // Migrar apenas calendário antigo sem resultados, datas ou fases avançadas:
    // nunca apagar trabalho salvo nem trocar os IDs dos clubes.
    if(paulista?.teams?.length===16 && paulista.matches?.length===64 &&
       paulista.matches.every(m=>!played(m)&&!m.date) &&
       !(paulista.advanced||[]).length &&
       !validatePaulistaCalendar(paulista.matches,paulista.teams)){
      redrawPaulistaCalendar(paulista);
    }
    const br=parsed.data.brasileirao;
    // Atualiza apenas calendários antigos ainda intactos: não toca em resultados,
    // horários ou avanços, e preserva os IDs atuais dos clubes.
    if(br?.teams?.length===20 && br.matches?.length===380 &&
       br.matches.every(m=>!played(m)&&!m.date) &&
       !(br.advanced||[]).length &&
       !validateBrasileiraoCalendar(br.matches,br.teams.map(t=>t.id))){
      redrawBrasileiraoCalendar(br);
    }
    if(parsed.active==='brasileirao' && parsed.tab==='bracket')parsed.tab='standings';
    enrichAllCompetitions(parsed.data);
    return {
      version:1,
      active: KEYS.includes(parsed.active) ? parsed.active : 'paulista',
      tab: parsed.tab || 'overview',
      data: parsed.data
    };
  } catch {
    return {version:1, active:'paulista', tab:'overview', data: enrichAllCompetitions(defaultData)};
  }
}
function save(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Estado permanece disponível em memória. */ } }
function get(){ return state.data[state.active]; }
function requestNotice(message, isError=false){
  toast = message;
  render();
  const el = $('.toast');
  if(el && isError) el.classList.add('is-error');
  clearTimeout(requestNotice.timer);
  requestNotice.timer = setTimeout(() => { toast=''; render(); }, 2800);
}

function mutate(fn){
  try { fn(); save(); render(); }
  catch(err){ requestNotice(err?.message || 'Não foi possível concluir a operação.', true); }
}

function hydrateKnownLogos(competition){
  if(!competition?.teams) return competition;
  const forceRefresh = new Set(['Novorizontino','Mirassol','Velo Clube','Portuguesa','Noroeste','Primavera','Capivariano','Universitario','Platense','Remo','Ceará','Athletic Club','Avaí']);
  for(const team of competition.teams){
    const knownCountry=libCountry(team.name || '');
    if(competition.key==='libertadores' && knownCountry && !team.country) team.country=knownCountry;
    const meta = clubMeta(team.name || '');
    if(!meta) continue;
    const needsLogo = !team.logo || /placehold|^data:|^$/i.test(String(team.logo));
    const needsShort = !team.short || String(team.short).trim().length < 2;
    const shouldRefreshLogo = forceRefresh.has(team.name) || (String(team.logo || '').includes('assets.footylogos.com') && team.logo !== meta.logo);
    if(needsLogo || needsShort || shouldRefreshLogo){
      const prevShort = team.short;
      applyClubIdentity(team, team.name);
      if(!needsShort && prevShort) team.short = prevShort;
    }
  }
  return competition;
}
function enrichAllCompetitions(data){
  for(const key of KEYS){ if(data[key]) hydrateKnownLogos(data[key]); }
  return data;
}

function info(c){ return INFO[c.key]; }
function t(c,id){ return c.teams.find(team => team.id === id); }
function tName(c,id){ return t(c,id)?.name || 'Clube'; }
function tShort(c,id){ return t(c,id)?.short || 'CLB'; }
function tLogo(c,id){ return t(c,id)?.logo || ''; }
function stageList(c){
  if(c.key==='copa' && c.mode==='reduced-2026') return ['copa5','copa6','copa7','copa8','copa9'];
  const list=[];
  for(let i=0;i<12;i++){ const s = stageFor(c.key, i); if(s) list.push(s); }
  return list;
}
function progress(c){
  const stages = stageList(c);
  const current = currentStage(c);
  return `${Math.max(stages.indexOf(current)+1,1)}/${stages.length}`;
}
function groupLabel(kind){
  return ({pre1:'Pré 1',pre2:'Pré 2',direct:'Grupos',official:'Grupos',copa1:'1ª fase',copa2:'2ª fase',copa3:'3ª fase',copa5:'5ª fase'})[kind] || kind;
}
function badge(text, type='normal'){ return `<span class="pill ${type}">${h(text)}</span>`; }
function stageReady(c, stage){
  const ms = activeMatches(c, stage);
  const rule = c.key === 'copa' ? 'copa' : 'normal';
  if(['league', 'groups'].includes(stage)) return ms.length > 0 && ms.every(played);
  return stageComplete(ms, rule);
}
function crestHTML(team, cls='crest'){ 
  const short = h((team?.short || team?.name || 'CL').slice(0,3));
  const logo = team?.logo ? h(team.logo) : '';
  return `<span class="${cls} crest-wrap">${logo ? `<img src="${logo}" alt="${h(team.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">` : ''}<span class="crest-fallback" ${logo ? 'style="display:none"' : ''}>${short.slice(0,2)}</span></span>`;
}

function competitionVisual(key, large=false){
  if(key === 'paulista'){
    const cls = large ? 'competition-trophy hero-trophy' : 'competition-trophy';
    return `<img class="${cls}" src="assets/paulista-trofeu.svg" alt="Taça do Paulistão" loading="lazy">`;
  }
  if(key === 'libertadores'){
    return `<img class="lib-menu-trophy" src="assets/libertadores-trofeu.webp" alt="Taça Libertadores" loading="lazy">`;
  }
  if(key === 'copa'){
    const cls = large ? 'copa-menu-mark hero-copa-mark' : 'copa-menu-mark';
    return `<img class="${cls}" src="assets/copa-brasil-emblem.png" alt="Emblema da Copa do Brasil" loading="lazy">`;
  }
  if(key==='brasileirao') return `<img class="br-trophy ${large?'br-trophy-large':''}" src="assets/brasileirao-2026-trofeu.webp" alt="Taça do Brasileirão Série A" loading="lazy">`;
  const symbol = INFO[key]?.symbol || 'CF';
  return `<span class="${large ? 'hero-symbol' : ''}">${h(symbol)}</span>`;
}
function positionZone(c, i){
  if(c.key==='brasileirao') return i<4?'zone-green':i<6?'zone-blue':i<12?'zone-sula':i>=16?'zone-red':'';
  if(c.key==='paulista') return i<8 ? 'zone-green' : i>=14 ? 'zone-red' : '';
  if(c.key==='libertadores') return i<2 ? 'zone-green' : '';
  return '';
}

function nav(){
  return `<aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">CF</div>
      <div><strong>Central<span>Fut</span></strong><small>Campeonatos 2026 · sistema separado</small></div>
    </div>
    <div class="side-hint">COMPETIÇÕES</div>
    <div class="competition-list">
      ${KEYS.map(key => {
        const i = INFO[key];
        const active = state.active === key ? 'active' : '';
        return `<button class="competition ${active} ${key}" data-action="league" data-value="${key}">
          <span class="comp-icon ${key==='paulista'?'is-trophy':''}">${competitionVisual(key)}</span>
          <span><b>${h(i.short)}</b><small>${h(i.identity)}</small></span>
        </button>`;
      }).join('')}
    </div>
    <div class="side-hint second">PAINEL</div>
    <nav class="side-tabs">
      ${[
        ['overview','Visão geral'],['clubs','Clubes'],['matches','Jogos'],['standings','Tabelas'],['bracket','Mata-mata'],['rules','Regulamento'],['settings','Ajustes']
      ].filter(([id])=>!(state.active==='brasileirao'&&id==='bracket')).map(([id,label]) => `<button class="side-tab ${state.tab===id?'active':''}" data-action="tab" data-value="${id}">${h(label)}</button>`).join('')}
    </nav>
  </aside>`;
}

function heading(c){
  const i = info(c), champ = champion(c), curr = currentStage(c);
  return `<header class="top">
      <div class="bread">CENTRALFUT <span>/</span> ${h(i.short.toUpperCase())} <span>/</span> TEMPORADA 2026</div>
      <div class="top-actions">
        <span class="season">◷ Temporada 2026</span>
        <button class="ghost-btn" data-action="export">↧ Exportar backup</button>
      </div>
    </header>
    <section class="hero hero-${c.key}">
      <div class="hero-text">
        <div class="eyebrow"><span class="eyebrow-dot"></span>${h(c.key==='paulista'?'Campeonato Paulista · Série A1':c.key==='copa'?'Copa Betano do Brasil · mata-mata nacional':c.key==='brasileirao'?'BRASILEIRÃO · SÉRIE A':i.identity)} <span class="year-tag">2026</span></div>
        <h1>${c.key==='paulista' ? 'PAULISTÃO' : c.key==='copa' ? 'COPA DO BRASIL' : c.key==='brasileirao'?'BRASILEIRÃO':h(i.name)}</h1>
        <p>${h(c.key==='libertadores'?libOfficial(c)?(libDrawn(c)?'Sorteio regulamentar da temporada 2026, com 32 equipes distribuídas em oito grupos':'Grupos oficiais da temporada 2026, com 32 equipes distribuídas em oito grupos'): 'Pré-Libertadores 2026: os 47 participantes e os confrontos preliminares':c.key==='copa'?'Base administrativa com 32 clubes: os 20 participantes da Série A e mais 12 clubes da Série B atual, em mata-mata direto desde a 5ª fase':c.key==='brasileirao'?i.name+' · '+i.subtitle:i.subtitle)}. ${c.key==='libertadores'?'Resultados e datas são lançados manualmente; nada é simulado como oficial.':c.key==='copa'?'Visual inspirado na identidade oficial da competição, com confrontos editáveis e progressão manual do chaveamento.':'Sistema administrativo com identidade visual própria e edição manual das tabelas.'}</p>
        <div class="hero-actions">
          ${badge(champ ? `Campeão: ${tName(c, champ)}` : 'Edição administrável', champ ? 'success' : 'normal')}
          ${badge(`Fase atual: ${stageLabel(curr)}`, 'ghost')}
          ${badge(`Progresso: ${progress(c)}`, 'ghost')}
        </div>
      </div>
      ${c.key === 'paulista' ? '' : c.key === 'libertadores' ? `<div class="lib-hero-brand" aria-label="Libertadores — La Gloria Eterna">
        <img src="assets/libertadores-trofeu.webp" alt="Taça dourada da Libertadores" loading="eager">
        <strong>CONMEBOL LIBERTADORES</strong>
        <span>LA GLORIA ETERNA</span>
      </div>` : `<div class="hero-emblem ${c.key}">
        <strong>${h(i.short)}</strong>
        ${competitionVisual(c.key, true)}
        <small>${c.key==='copa'?'Arte temática · 2026':c.key==='brasileirao'?'SÉRIE A · 2026':'Design dedicado'}</small>
      </div>`}
      <div class="hero-sheen"></div>
    </section>
    ${tabNav()}`;
}

function tabNav(){
  const items = [['overview','Visão geral'],['clubs','Clubes'],['matches','Jogos'],['standings','Tabelas'],['bracket','Mata-mata'],['rules','Regulamento'],['settings','Ajustes']];
  return `<nav class="tab-nav">${items.filter(([id])=>!(state.active==='brasileirao'&&id==='bracket')).map(([id,label])=>`<button class="tab-btn ${state.tab===id?'active':''}" data-action="tab" data-value="${id}">${h(label)}</button>`).join('')}</nav>`;
}

function counts(c){
  const total = c.matches.length;
  const done = c.matches.filter(played).length;
  const clubs = c.teams.length;
  const open = total - done;
  return `<section class="metric-grid">
    <article class="metric-card"><small>Clubes</small><strong>${clubs}</strong><span>${h(info(c).short)}</span></article>
    <article class="metric-card"><small>Jogos lançados</small><strong>${done}</strong><span>de ${total}</span></article>
    <article class="metric-card"><small>Jogos pendentes</small><strong>${open}</strong><span>edição aberta</span></article>
    <article class="metric-card"><small>Fases concluídas</small><strong>${c.advanced.length}</strong><span>de ${stageList(c).length}</span></article>
  </section>`;
}

const LIB_FLAGS={BR:'🇧🇷',AR:'🇦🇷',BO:'🇧🇴',CL:'🇨🇱',CO:'🇨🇴',EC:'🇪🇨',PY:'🇵🇾',PE:'🇵🇪',UY:'🇺🇾',VE:'🇻🇪'};
function libFlag(team){const country=team?.country || libCountry(team?.name);return LIB_FLAGS[country] || '⚽';}
function libOfficial(c){return c.key==='libertadores' && c.teams.some(t=>t.kind==='official') && activeMatches(c,'groups').length===96;}
function libDrawn(c){return c.key==='libertadores' && c.mode==='groups-draw-2026';}
function libGroupPanel(c,compact=false){
 const official=libOfficial(c);
 if(!official)return '';
 const selected = libGroupFilter;
 return `<section class="lib-groups-section">
  <div class="section-title"><div><div class="eyebrow mini">CONMEBOL · FASE DE GRUPOS 2026</div><h2>Os grupos da Libertadores</h2><p>Oito grupos, quatro clubes e seis jogos por equipe. Acompanhe a disputa e abra a tabela de cada grupo.</p></div><button class="outline-btn" data-action="lib-view-all">Todas as tabelas ↗</button></div>
  <div class="lib-group-grid ${compact?'compact':''}">
    ${groups.map(group=>{const teams=c.teams.filter(t=>t.group===group);const groupGames=activeMatches(c,'groups').filter(m=>m.group===group);const count=groupGames.filter(played).length;return `<button type="button" class="lib-group-card ${selected===group?'selected':''}" data-action="lib-group" data-value="${group}">
      <div class="lib-group-top"><span>GRUPO <b>${group}</b></span><span class="lib-group-count">${count}/12 JOGOS</span></div>
      <div class="lib-group-team-list">${teams.map(team=>`<div class="lib-group-team">${crestHTML(team,'lib-crest')}<span>${h(team.name)}</span><span class="lib-country" title="${h(LIB_COUNTRY_LABELS[team.country]||'País')}">${libFlag(team)}</span></div>`).join('')}</div>
      <div class="lib-group-bottom">Ver classificação <span>→</span></div>
    </button>`}).join('')}
  </div>
 </section>`;
}
function libStageNotice(c){
 if(c.key!=='libertadores')return '';
 const official=libOfficial(c), blank=c.teams.filter(t=>t.placeholder).length;
 return `<div class="lib-stage-note"><div class="lib-stage-icon">★</div><div><strong>${official?(libDrawn(c)?'Libertadores 2026 · grupos embaralhados pelo regulamento':'Grupos oficiais da Libertadores 2026'):'Pré-Libertadores 2026 · 47 participantes reais'}</strong><p>${official?(libDrawn(c)?'Sorteio administrativo com um clube por pote e restrição de país, liberando exceção apenas para classificados da fase 3.':'Sorteio CONMEBOL de 19 de março de 2026. Os jogos estão sem placar, prontos para seu acompanhamento manual.'):'Os clubes são os participantes reais, sem placares lançados. Gere cada fase à medida que finalizar os confrontos. '+(blank?'Há '+blank+' vagas antigas para revisar.':'')}</p></div><button class="outline-btn" data-action="tab" data-value="settings">Alternar modo</button></div>`;
}
function overview(c){
  const s = currentStage(c);
  const ms = activeMatches(c, s);
  const done = ms.filter(played).length;
  const next = nextStage(c);
  const ready = stageReady(c, s);
  const upcoming = ms.filter(m => !played(m)).slice(0, 6);
  return `<div class="view">
    ${c.key==='libertadores'?libStageNotice(c):''}
    ${c.key==='copa'&&c.mode==='reduced-2026'?copaDrawControls(c):''}
    ${counts(c)}
    ${c.key==='libertadores'&&libOfficial(c)?libGroupPanel(c):''}
    <div class="split">
      <section class="panel">
        <div class="panel-head"><div><div class="eyebrow mini">PROGRESSÃO</div><h2>${h(stageLabel(s))}</h2><p>${done} de ${ms.length} jogos preenchidos na fase atual</p></div>${badge(`${Math.round(done/Math.max(ms.length,1)*100)}%`,'ghost')}</div>
        <div class="stage-track">
          ${stageList(c).map((v, i) => `<div class="stage-tile ${v===s?'current':c.advanced.includes(v)?'completed':''}"><span>${String(i+1).padStart(2,'0')}</span><b>${h(stageLabel(v))}</b>${v===s?'<small>EM ANDAMENTO</small>':c.advanced.includes(v)?'<small>CONCLUÍDA</small>':''}</div>`).join('')}
        </div>
        ${next ? `<div class="stage-action"><div><strong>Próxima etapa</strong><span>${h(stageLabel(next))}</span></div><button class="primary-btn" data-action="advance" ${!ready?'disabled':''}>Avançar fase <span>→</span></button></div>` : `<div class="info-note">${champion(c)?'Edição finalizada: campeão definido.':'Última fase desta competição.'}</div>`}
        ${c.key==='paulista' ? '<div class="info-note">Tabela administrativa do Paulistão baseada na estrutura regulamentar da FPF. Os confrontos podem ser ajustados manualmente.</div>' : ''}
        ${c.key==='brasileirao' ? '<div class="info-note">O calendário foi gerado automaticamente. Datas e mandos oficiais da CBF podem ser ajustados antes da publicação.</div>' : ''}
      </section>
      <section class="panel">
        <div class="panel-head"><div><div class="eyebrow mini">AGENDA</div><h2>Próximos jogos</h2><p>Partidas ainda sem placar lançado</p></div><button class="text-btn" data-action="tab" data-value="matches">Ver todos ↗</button></div>
        <div class="compact-games">
          ${upcoming.length ? upcoming.map(m => `<button data-action="edit-match" data-value="${m.id}" class="compact-game"><span class="game-stage">${h(stageLabel(m.stage))}${m.group?' · Grupo '+h(m.group):''}</span><div><strong>${h(tShort(c,m.home))}</strong><span>×</span><strong>${h(tShort(c,m.away))}</strong></div><span class="game-edit">↗</span></button>`).join('') : '<div class="empty-small">Todos os jogos da fase atual já foram preenchidos.</div>'}
        </div>
      </section>
    </div>
    <div class="bottom-help"><div class="help-icon">i</div><div><strong>Tabelas e regulamentos sob seu controle</strong><p>O sistema é independente, opera no navegador e permite editar clubes, resultados, grupos, logos conhecidos e cenários de acesso da Série B.</p></div><button class="outline-btn" data-action="tab" data-value="settings">Ajustes e backup →</button></div>
  </div>`;
}

function clubRow(c, team, index){
  return `<div class="club-row">
    <span class="club-number">${String(index+1).padStart(2,'0')}</span>
    ${crestHTML(team, 'club-crest')}
    <div class="club-name"><strong>${c.key==='libertadores'?libFlag(team)+' ':''}${h(team.name)}</strong><small>${c.key==='paulista' ? 'Pote ' + h(team.pot || '-') : c.key==='libertadores' ? (['direct','official'].includes(team.kind) ? 'Grupo ' + h(team.group || '?') + (team.pot ? ' · ' + h(team.pot) : '') : 'Entrada: ' + h(groupLabel(team.kind)))+' · '+ h(LIB_COUNTRY_LABELS[team.country]||'') : c.key==='copa' ? h(team.division || groupLabel(team.kind)) : 'Série A'}</small></div>
    ${team.placeholder ? badge('Vaga a preencher','warning') : team.logo ? badge('Logo vinculada','soft') : badge('Sem logo','ghost')}
    <button type="button" class="icon-btn" data-action="edit-team" data-value="${team.id}" aria-label="Editar clube">✎</button>
  </div>`;
}

const COPA_STAGES=['copa5','copa6','copa7','copa8','copa9'];
const COPA_STAGE_NAMES={'copa5':'5ª fase · 32 clubes','copa6':'Oitavas de final','copa7':'Quartas de final','copa8':'Semifinal','copa9':'Grande final'};
function copaRoundTies(c,stage){
 const grouped=new Map();
 for(const m of activeMatches(c,stage)){
  const id=m.tie||m.id;
  if(!grouped.has(id))grouped.set(id,[]);
  grouped.get(id).push(m);
 }
 return [...grouped.values()];
}
function copaStatusMap(c){
 const map=new Map(c.teams.map(team=>[team.id,{status:'waiting',stage:'copa5',label:'Aguardando sorteio', games:0, wins:0, goals:0,conceded:0}]));
 for(const stage of COPA_STAGES){
  for(const tie of copaRoundTies(c,stage)){
   const winner=winnerOfTie(tie,'copa');
   const ids=[tie[0].home,tie[0].away];
   for(const id of ids){
    const entry=map.get(id); if(!entry)continue;
    entry.stage=stage;
    for(const m of tie.filter(played)){
     entry.games++;
     const own=m.home===id?m.hg:m.ag,other=m.home===id?m.ag:m.hg;
     entry.goals+=own;entry.conceded+=other;
     if(own>other)entry.wins++;
    }
    if(winner){
     entry.status=winner===id?'qualified':'eliminated';
     entry.label=winner===id?(stage==='copa9'?'Campeão':'Classificado'):'Eliminado';
    }else{
     entry.status='live';entry.label='Em disputa';
    }
   }
  }
 }
 return map;
}
function copaStatusBadge(entry){
 const tone=entry.status==='qualified'?'qualified':entry.status==='eliminated'?'eliminated':'pending';
 const cls=entry.status==='qualified'?'✓':entry.status==='eliminated'?'×':'◌';
 return `<span class="copa-status ${tone}"><span aria-hidden="true">${cls}</span>${h(entry.label)}</span>`;
}
function copaDrawControls(c,compact=false){
 const current=currentStage(c), currentMatches=activeMatches(c,current), registered=currentMatches.some(played);
 const title=current==='copa9'?'Refazer sorteio da final':'Refazer sorteio da fase';
 return `<div class="copa-draw-toolbar ${compact?'compact':''}"><div><span class="copa-toolbar-kicker">SORTEIO ADMINISTRATIVO 2026</span><strong>${h(COPA_STAGE_NAMES[current]||stageLabel(current))}</strong><small>${registered?'Esta etapa já tem placares registrados. Um novo sorteio exigirá confirmação para apagá-los.':'Todos os participantes da fase podem ser embaralhados sem alterar as outras competições.'}</small></div><button type="button" class="copa-draw-btn" data-action="copa-draw" aria-label="Refazer sorteio da Copa do Brasil"><span aria-hidden="true">⤨</span>${compact?'Embaralhar times':title}</button></div>`;
}
function copaClubsView(c){
 const status=copaStatusMap(c);
 const teams=[...c.teams].sort((a,b)=>{
  const ranks={qualified:0,live:1,waiting:2,eliminated:3};
  const sa=status.get(a.id),sb=status.get(b.id);
  return ranks[sa.status]-ranks[sb.status]||a.name.localeCompare(b.name,'pt-BR');
 });
 const filters=[['all','Todos'],['qualified','Classificados'],['live','Em disputa'],['eliminated','Eliminados']];
 const list=teams.filter(t=>copaStatusFilter==='all'||status.get(t.id)?.status===copaStatusFilter);
 return `<section class="view copa-editorial">
  <header class="section-title"><div><div class="eyebrow mini">COPA DO BRASIL · ELENCO</div><h2>Os clubes da competição</h2><p>32 escudos, campanhas e situações atualizadas conforme você registra as partidas.</p></div><button class="outline-btn" data-action="bulk-teams">Editar clubes em lote</button></header>
  ${copaDrawControls(c,true)}
  <div class="copa-stats-strip"><div><strong>${c.teams.length}</strong><span>clubes participantes</span></div><div><strong>${c.teams.filter(t=>t.division==='Série A').length}</strong><span>clubes da Série A</span></div><div><strong>${c.teams.filter(t=>t.division==='Série B').length}</strong><span>clubes da Série B</span></div><div><strong>${[...status.values()].filter(s=>s.status==='eliminated').length}</strong><span>eliminados confirmados</span></div></div>
  <div class="copa-filter-row" role="group" aria-label="Filtrar situação dos clubes">${filters.map(([v,label])=>`<button type="button" data-action="copa-filter" data-value="${v}" class="copa-filter ${copaStatusFilter===v?'active':''}" aria-pressed="${copaStatusFilter===v}">${label}<span>${v==='all'?teams.length:teams.filter(t=>status.get(t.id)?.status===v).length}</span></button>`).join('')}</div>
  ${list.length?`<div class="copa-club-grid">${list.map(team=>{const s=status.get(team.id);return `<article class="copa-club-card ${h(s.status)}"><div class="copa-club-top"><span class="copa-division">${h(team.division||'Participante')}</span>${copaStatusBadge(s)}</div><div class="copa-club-hero">${crestHTML(team,'copa-club-crest')}<div><h3>${h(team.name)}</h3><p>${h(stageLabel(s.stage))}</p></div></div><div class="copa-club-metrics"><span><b>${s.games}</b>jogos</span><span><b>${s.wins}</b>vitórias</span><span><b>${s.goals}</b>gols</span><span><b>${s.goals-s.conceded>=0?'+':''}${s.goals-s.conceded}</b>saldo</span></div><button type="button" class="copa-card-link" data-action="edit-team" data-value="${h(team.id)}">Editar cadastro <span>↗</span></button></article>`}).join('')}</div>`:'<div class="empty">Nenhum clube nesta situação.</div>'}
 </section>`;
}
function copaStandingsView(c){
 const current=currentStage(c),stages=COPA_STAGES;
 return `<section class="view copa-editorial"><div class="section-title"><div><div class="eyebrow mini">CAMINHO DA TAÇA</div><h2>Quadro de classificação</h2><p>Confrontos e classificados por fase. Os eliminados só são marcados depois que o duelo é decidido.</p></div><button type="button" class="outline-btn" data-action="tab" data-value="bracket">Ver chaveamento →</button></div>
 ${copaDrawControls(c,true)}
 <div class="copa-progress-rail">${stages.map((stage,i)=>{const m=activeMatches(c,stage),currentStageNow=stage===current;return `<div class="copa-rail-item ${currentStageNow?'active':''} ${c.advanced.includes(stage)?'complete':''}"><span>0${i+1}</span><strong>${h(COPA_STAGE_NAMES[stage])}</strong><small>${m.length?`${m.filter(played).length}/${m.length} jogos`: 'Aguardando avanço'}</small></div>`}).join('')}</div>
 ${stages.filter(stage=>activeMatches(c,stage).length).map(stage=>`<section class="panel copa-qual-panel"><div class="copa-panel-heading"><div><small>ETAPA ${String(stages.indexOf(stage)+1).padStart(2,'0')}</small><h3>${h(COPA_STAGE_NAMES[stage])}</h3></div><span class="copa-panel-count">${copaRoundTies(c,stage).length} confrontos</span></div><div class="copa-qual-list">${copaRoundTies(c,stage).map((tie,i)=>{const winner=winnerOfTie(tie,'copa'), ids=[tie[0].home,tie[0].away];return `<div class="copa-qual-row"><span class="copa-tie-count">${String(i+1).padStart(2,'0')}</span>${ids.map((id,j)=>`<div class="copa-qual-team ${winner===id?'selected':winner&&winner!==id?'out':''}">${crestHTML(t(c,id),'mini-crest')}<strong>${h(tName(c,id))}</strong>${winner===id?'<span class="copa-tiny-qualified">AVANÇA</span>':''}</div>`).join('<span class="copa-versus">×</span>')}<button type="button" class="copa-match-link" data-action="copa-tie-games" data-value="${h(tie[0].id)}" aria-label="Ver jogos do confronto ${i+1}">↗</button></div>`}).join('')}</div></section>`).join('')}
 <div class="copa-legend"><span><i class="copa-dot qualified"></i>Classificado</span><span><i class="copa-dot eliminated"></i>Eliminado</span><span><i class="copa-dot pending"></i>Aguardando decisão</span><small>Distribuição administrativa, não sorteio oficial da CBF.</small></div>
 </section>`;
}
function copaBracketView(c, embedded=false){
 const current=currentStage(c);
 return `<section class="${embedded?'':'view'} copa-editorial"><div class="section-title"><div><div class="eyebrow mini">COPA BETANO DO BRASIL</div><h2>Rumo à grande final</h2><p>Mapa completo do mata-mata. Os confrontos futuros são definidos ao avançar as fases.</p></div><span class="copa-small-cup" aria-label="Taça">🏆</span></div>
 ${copaDrawControls(c,true)}
 <div class="copa-bracket-viewport"><div class="copa-bracket-grid">${COPA_STAGES.map(stage=>{const ties=copaRoundTies(c,stage),expected={copa5:16,copa6:8,copa7:4,copa8:2,copa9:1}[stage];return `<section class="copa-bracket-col"><header class="copa-bracket-head"><small>${h(stage===current?'FASE EM ANDAMENTO':c.advanced.includes(stage)?'FASE ENCERRADA':'A DEFINIR')}</small><h3>${h(COPA_STAGE_NAMES[stage])}</h3><span>${ties.length?`${ties.length} duelos`:`${expected} vagas`}</span></header><div class="copa-bracket-ties">${(ties.length?ties:Array.from({length:Math.min(expected,stage==='copa5'?16:8)},()=>null)).map((tie,i)=>{if(!tie)return `<div class="copa-bracket-tie empty-tie"><span class="copa-tie-label">CONFRONTO ${i+1}</span><div class="copa-bracket-team"><span class="copa-empty-crest">?</span> A definir</div><div class="copa-bracket-team"><span class="copa-empty-crest">?</span> A definir</div></div>`;const ids=[tie[0].home,tie[0].away],win=winnerOfTie(tie,'copa');return `<button type="button" class="copa-bracket-tie" data-action="copa-tie-games" data-value="${h(tie[0].id)}" aria-label="Abrir confronto ${i+1}"><span class="copa-tie-label">CHAVE ${String(i+1).padStart(2,'0')} · ${tie.length===2?'IDA / VOLTA':'JOGO ÚNICO'}</span>${ids.map(id=>{const completed=tie.every(played),goals=completed?tie.reduce((sum,m)=>sum+(m.home===id?m.hg:m.ag),0):null;return `<div class="copa-bracket-team ${win===id?'win':win&&win!==id?'loss':''}">${crestHTML(t(c,id),'mini-crest')}<span>${h(tName(c,id))}</span><strong>${goals===null?'—':goals}</strong></div>`}).join('')}<span class="copa-tie-footer">${win?'✓ Classificado: '+h(tName(c,win)):'Aguardando decisão'} <span>↗</span></span></button>`}).join('')}</div></section>`}).join('')}</div></div><div class="copa-legend"><span><i class="copa-dot qualified"></i>Avança</span><span><i class="copa-dot eliminated"></i>Eliminado</span><span><i class="copa-dot pending"></i>Não definido</span><small>Nenhum resultado fictício é exibido.</small></div></section>`;
}
function clubs(c){
  if(c.key==='paulista')return paulistaClubView(c);
  if(c.key==='copa' && c.mode==='reduced-2026')return copaClubsView(c);
  if(c.key==='libertadores' && libOfficial(c))return libertadoresClubView(c);
  const official = c.key==='libertadores' && c.teams.some(t=>t.kind==='official');
  const kinds = c.key==='copa' ? [...new Set(c.teams.map(t=>t.kind))] : official ? groups : c.key==='libertadores' ? ['pre1','pre2','direct'] : ['all'];
  const kind = k => k==='all' ? c.teams : official ? c.teams.filter(t=>t.group===k) : c.teams.filter(t=>t.kind===k);
  const serieBPanel = c.key === 'brasileirao' ? `<section class="panel promotion-panel"><div class="panel-head"><div><div class="eyebrow mini">ACESSO</div><h2>Opções da Série B</h2><p>Mais clubes disponíveis para simular acesso da Série B para a Série A.</p></div><button class="primary-btn" data-action="promotion">Gerenciar acesso</button></div><div class="candidate-grid">${SERIE_B_OPTIONS.map(name => `<span class="candidate-chip">${h(name)}</span>`).join('')}</div><div class="modal-note inline">Use o gerenciador de acesso para substituir até quatro clubes da Série A por candidatos da Série B, preservando IDs e calendário.</div></section>` : '';
  return `<section class="view">
    <div class="section-title"><div><div class="eyebrow mini">CADASTRO</div><h2>Clubes participantes</h2><p>Edite nomes oficiais, aproveite a biblioteca de clubes conhecidos e mantenha os confrontos preservados.</p></div><div class="page-actions">${c.key==='brasileirao'?'<button class="outline-btn" data-action="promotion">Acesso Série B</button>':''}<button class="primary-btn" data-action="bulk-teams">☷ Importar nomes em lote</button></div></div>
    ${c.teams.some(t=>t.placeholder) ? `<div class="alert">⚠ ${c.teams.filter(t=>t.placeholder).length} vagas ilustrativas ainda precisam ser preenchidas. Ao informar um clube conhecido, o sistema tenta vincular sigla e logo reais automaticamente.</div>` : ''}
    ${c.key==='copa' ? '<div class="info-note copa-note"><strong>Base desta edição:</strong> 32 clubes em chave única, com todos os 20 participantes da Série A e mais 12 equipes da Série B atual para manter o mata-mata a partir da 5ª fase.</div>' : ''}
    ${serieBPanel}
    ${c.key==='libertadores' ? libStageNotice(c) : ''}
    ${c.key==='libertadores'&&official ? libGroupPanel(c,true) : ''}
    <div class="club-groups">${kinds.map(k => `<section class="panel"><div class="group-title"><h3>${h(k==='all'?'Participantes':c.key==='paulista'?'Pote '+k:official?'Grupo '+k:groupLabel(k))}</h3>${badge(`${kind(k).length} clubes`,'ghost')}</div><div class="club-list">${kind(k).map((team, i) => clubRow(c, team, i)).join('')}</div></section>`).join('')}</div>
  </section>`;
}

// Brasileirão: faixas indicativas. Pelo REC 2026 o G4 é direto, 5º é
// preliminar, 6º depende do repasse de vagas; a Sul-Americana pode variar.
function brData(c){
 const matches=activeMatches(c,'league'),finished=matches.filter(played).length;
 return {matches,finished,complete:finished===380,rows:standings(c.teams,matches,'brasileirao')};
}
function brStatus(index,complete){
 const tail=complete?'':' · provisório';
 if(index<4)return {type:'g4',name:'G-4 · Libertadores'+tail,abbr:'G4'};
 if(index===4)return {type:'g6',name:'Pré-Libertadores'+tail,abbr:'PRÉ'};
 if(index===5)return {type:'g6',name:'G-6 condicional'+tail,abbr:'G6*'};
 if(index<12)return {type:'sula',name:'Zona Sul-Americana'+tail,abbr:'SULA'};
 if(index>=16)return {type:'z4',name:'Rebaixamento'+tail,abbr:'Z4'};
 return {type:'middle',name:'Zona intermediária'+tail,abbr:'—'};
}
function brScheduleControls(c){
 const done=c.matches.filter(played).length;
 const valid=validateBrasileiraoCalendar(c.matches,c.teams.map(t=>t.id));
 return `<section class="br-calendar-tools" aria-label="Gerenciar calendário do Brasileirão"><div class="br-calendar-icon">↻</div><div><strong>Calendário inteligente · 38 rodadas</strong><p>Turno e returno, 10 partidas por rodada, 19 jogos em casa e 19 fora por clube, com no máximo 2 visitas consecutivas. ${!valid?'⚠ O calendário atual não atende a regra. Refaça para corrigir.':done?done+' placares cadastrados.':''}</p></div><button class="primary-btn br-calendar-btn" data-action="br-redraw">↻ Refazer calendário</button></section>`;
}
function brasileiraoOverview(c){
 const {finished,rows}=brData(c);
 return `<div class="br-page">${overview(c)}<div class="br-summary-panel"><div><span>LIDERANÇA ${finished<380?'PROVISÓRIA':'FINAL'}</span><strong>${h(rows[0]?.name||'A definir')}</strong><small>${rows[0]?.pts||0} pontos · ${rows[0]?.v||0} vitórias</small></div><div><span>RODADAS</span><strong>38</strong><small>Turno e returno</small></div><div><span>RESULTADOS</span><strong>${finished}<em>/380</em></strong><small>partidas registradas</small></div></div>${brScheduleControls(c)}</div>`;
}
function brasileiraoStandingsView(c){
 const {rows,finished,complete}=brData(c);
 const data=rows.map((r,index)=>({...r,position:index+1,status:brStatus(index,complete)}));
 const visible=data.filter(r=>brRankingFilter==='all'||(brRankingFilter==='g4'&&r.position<=4)||(brRankingFilter==='g6'&&r.position<=6)||(brRankingFilter==='sula'&&r.position>=7&&r.position<=12)||(brRankingFilter==='z4'&&r.position>=17));
 return `<section class="view br-page"><div class="section-title"><div><div class="eyebrow mini">SÉRIE A · TABELA 2026</div><h2>Classificação do Brasileirão</h2><p>20 clubes, 38 rodadas e 380 partidas. Posições ${complete?'finais da simulação':'provisórias'}.</p></div><button class="outline-btn" data-action="csv-standings">↧ Exportar CSV</button></div>
 <div class="br-stat-banner"><div><span>DISPUTA PELO TÍTULO</span><h3>Uma tabela. Muitos destinos.</h3><p>Classificação atualizada após cada resultado registrado.</p></div><div class="br-stat-numbers"><div><b>${finished}<small>/380</small></b><span>Jogos lançados</span></div><div><b>20</b><span>Clubes</span></div><div><b>04</b><span>Rebaixados</span></div></div></div>
 <div class="br-legend" aria-label="Situações da classificação"><span class="g4">● G-4 · Grupos Libertadores</span><span class="g6">● G-6 · 5º pré / 6º condicional</span><span class="sula">● Sul-Americana · indicativo</span><span class="z4">● Z-4 · Rebaixamento</span></div>
 <nav class="br-filter-bar" aria-label="Filtrar classificação">${[['all','Tabela completa'],['g4','G-4'],['g6','G-6'],['sula','Sul-Americana'],['z4','Z-4']].map(([id,label])=>`<button type="button" class="br-filter ${brRankingFilter===id?'active':''}" data-action="br-filter" data-value="${id}" aria-pressed="${brRankingFilter===id}">${label}</button>`).join('')}</nav>
 <div class="panel br-table-panel"><div class="table-scroll"><table class="br-ranking"><thead><tr><th>POS</th><th>CLUBE</th><th>SITUAÇÃO</th><th>PTS</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>${visible.map(r=>`<tr class="br-rank-row ${r.status.type}"><td><span class="br-position">${String(r.position).padStart(2,'0')}</span></td><td><button type="button" class="br-ranking-club" data-action="br-team-games" data-value="${r.id}">${crestHTML(r,'mini-crest')}<strong>${h(r.name)}</strong><span>↗</span></button></td><td><span class="br-rank-status ${r.status.type}" title="${h(r.status.name)}">${h(r.status.abbr)}</span></td>${['pts','j','v','e','d','gp','gc','sg'].map(k=>`<td class="${k==='pts'?'br-points':''}">${r[k]>0&&k==='sg'?'+':''}${r[k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="br-table-foot">${finished} de 380 resultados · ${complete?'Classificação final':'Tabela provisória até a 38ª rodada'}</div></div>
 <div class="br-regulation-note"><strong>Vagas 2026:</strong> a tabela garante Libertadores direta para 1º–4º e preliminar para o 5º. A 6ª posição depende de redistribuição de vagas. A zona Sul-Americana é apenas indicativa, pois as vagas dependem de outras competições. A classificação é administrativa, sem homologação da CBF.</div>${brScheduleControls(c)}</section>`;
}
function brasileiraoClubsView(c){
 const {rows,complete,finished}=brData(c),place=new Map(rows.map((r,i)=>[r.id,{...r,position:i+1,status:brStatus(i,complete)}]));
 return `<section class="view br-page"><div class="section-title"><div><div class="eyebrow mini">BRASILEIRÃO · ELENCO DA TEMPORADA</div><h2>Clubes da Série A</h2><p>Escudos, colocação e campanha de cada participante atualizados com os resultados.</p></div><div class="page-actions"><button class="outline-btn" data-action="promotion">Acesso Série B</button><button class="outline-btn" data-action="bulk-teams">Editar clubes em lote</button></div></div>
 <div class="br-club-overline"><span>20 clubes participantes</span><span>${finished} de 380 partidas registradas</span></div><div class="br-club-grid">${c.teams.map(team=>{
  const r=place.get(team.id);return `<article class="br-club-card ${r.status.type}"><div class="br-club-card-header"><span>${String(r.position).padStart(2,'0')}º NA TABELA</span><span class="br-card-status ${r.status.type}">${h(r.status.abbr)}</span></div><div class="br-club-card-main">${crestHTML(team,'br-large-crest')}<h3>${h(team.name)}</h3><small>${h(r.status.name)}</small></div><div class="br-club-card-metrics"><div><strong>${r.pts}</strong><small>Pontos</small></div><div><strong>${r.v}</strong><small>Vitórias</small></div><div><strong>${r.sg>0?'+':''}${r.sg}</strong><small>Saldo</small></div></div><div class="br-club-actions"><button data-action="br-team-games" data-value="${team.id}">Ver partidas ↗</button><button data-action="edit-team" data-value="${team.id}">Editar</button></div></article>`;}).join('')}</div>
 ${brScheduleControls(c)}<section class="panel br-b-pool"><div class="panel-head"><div><div class="eyebrow mini">CANDIDATOS À SÉRIE A</div><h2>Opções da Série B</h2><p>Simule alterações no elenco da Série A com os clubes já cadastrados na biblioteca.</p></div><button class="outline-btn" data-action="promotion">Gerenciar acesso</button></div><div class="candidate-grid">${SERIE_B_OPTIONS.map(name=>`<span class="candidate-chip">${h(name)}</span>`).join('')}</div></section><div class="br-regulation-note">As faixas são indicativas enquanto houver jogos pendentes; vagas continentais podem ser redistribuídas conforme outros torneios.</div></section>`;
}
function brasileiraoMatchesView(c){return `<div class="br-page">${brScheduleControls(c)}${matchesView(c)}</div>`;}
function brasileiraoSettingsView(c){return `<div class="br-page">${brScheduleControls(c)}${settings(c)}</div>`;}
function paulistaCalendarControls(c){
 const games=activeMatches(c,'league'),done=games.filter(played).length,dates=games.filter(m=>m.date).length;
 const locked=Boolean(c.advanced?.length||c.matches.some(m=>m.stage!=='league'));
 const valid=validatePaulistaCalendar(games,c.teams);
 return `<section class="paulista-calendar-tools" aria-label="Gerenciar calendário do Paulistão">
  <span class="paulista-calendar-icon" aria-hidden="true">↻</span>
  <div class="paulista-calendar-description"><strong>Calendário inteligente · 8 rodadas</strong>
   <p>64 partidas e os oito adversários definidos para cada clube, com <b>4 mandos e 4 visitas</b> e no máximo 2 jogos seguidos fora de casa. ${locked?'As fases finais já foram geradas: calendário bloqueado para preservar os classificados.':!valid?'⚠ O calendário atual não atende à alternância. Refaça para corrigir.':done||dates?`${done} resultados e ${dates} datas cadastradas.`:'Embaralhe os confrontos entre rodadas com um novo sorteio administrativo.'}</p></div>
  <button type="button" class="primary-btn paulista-calendar-btn" data-action="paulista-redraw" ${locked?'disabled title="Fases finais iniciadas"':''}>↻ Embaralhar e refazer calendário</button>
 </section>`;
}
function paulistaOverview(c){return `<div class="paulista-calendar-page">${paulistaCalendarControls(c)}${overview(c)}</div>`;}
function paulistaMatchesView(c){return `<div class="paulista-calendar-page">${paulistaCalendarControls(c)}${matchesView(c)}</div>`;}
function paulistaSettingsView(c){return `<div class="paulista-calendar-page">${paulistaCalendarControls(c)}${settings(c)}</div>`;}
function paulistaStandingsWithCalendar(c){return `<div class="paulista-calendar-page">${paulistaStandingsView(c)}${paulistaCalendarControls(c)}</div>`;}
function paulistaClubsWithCalendar(c){return `<div class="paulista-calendar-page">${paulistaClubView(c)}${paulistaCalendarControls(c)}</div>`;}
// Painel especializado do Paulista: a posição ao vivo é indicativa até a homologação.
function paulistaStandings(c){return standings(c.teams,activeMatches(c,'league'),'paulista');}
function paulistaStatus(index,complete){
  if(index<8)return {name:complete?'Quartas de final':'Zona de classificação', short:'G8',tone:'qualified'};
  if(index>=14)return {name:complete?'Rebaixamento':'Zona de rebaixamento',short:'Z2',tone:'relegated'};
  return {name:'Intermediária',short:'—',tone:'middle'};
}
function paulistaLeaders(c){
 const rows=paulistaStandings(c),games=activeMatches(c,'league'),completed=games.filter(played).length,finished=completed===games.length;
 const leader=rows[0];
 return `<div class="paulista-topline">
  <div class="paulista-topline-info"><span class="overline">PAULISTÃO • FASE DE LIGA</span><h3>Retrato da classificação</h3><p>${completed} de ${games.length} partidas registradas · ${finished?'fase concluída':'posições provisórias'}</p></div>
  <div class="paulista-topline-figures"><div><strong>08</strong><span>Vagas nas quartas</span></div><div><strong>02</strong><span>Vagas de rebaixamento</span></div><div><strong>${Math.round(completed/Math.max(games.length,1)*100)}%</strong><span>Jogos concluídos</span></div></div>
 </div>${completed>0?`<div class="paulista-leader-strip"><div class="leader-label"><span class="micro-trophy">✦</span><div><small>LIDERANÇA ${finished?'DA FASE':'ATUAL'}</small><b>${h(leader.name)}</b></div></div>${crestHTML(leader,'leader-crest')}<div class="leader-details"><strong>${leader.pts} <small>PTS</small></strong><span>${leader.v} V · ${leader.sg>=0?'+':''}${leader.sg} SG</span></div><button class="outline-btn" data-action="view-club" data-value="${leader.id}">Ver campanha ↗</button></div>`:''}`;
}
function paulistaStandingTable(c){
 const rows=paulistaStandings(c),complete=activeMatches(c,'league').every(played);
 const visible=rows.map((r,i)=>({...r,rank:i+1,status:paulistaStatus(i,complete)})).filter(r=>rankingFilter==='all'||(rankingFilter==='qualified'&&r.rank<=8)||(rankingFilter==='relegated'&&r.rank>=15));
 return `<div class="table-scroll paulista-table-scroll"><table class="ranking paulista-ranking"><thead><tr><th>POS</th><th>CLUBE</th><th>SITUAÇÃO</th><th>PTS</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>CV</th><th>CA</th></tr></thead><tbody>${visible.map(r=>`<tr class="paulista-rank-row rank-${r.status.tone}"><td><span class="position rank-position ${r.status.tone}">${String(r.rank).padStart(2,'0')}</span></td><td><button class="rank-club" data-action="view-club" data-value="${r.id}" title="Ver campanha de ${h(r.name)}">${crestHTML(r,'mini-crest')}<span>${h(r.name)}</span><span class="open-profile">↗</span></button></td><td><span class="zone-label ${r.status.tone}">${h(r.status.name)}</span></td>${['pts','j','v','e','d','gp','gc','sg','red','yellow'].map(k=>`<td class="${k==='pts'?'points':''}">${k==='sg'&&r[k]>0?'+':''}${r[k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function paulistaStandingsView(c){
 const matches=activeMatches(c,'league'),done=matches.filter(played).length;
 return `<section class="view paulista-page paulista-standings-view"><div class="section-title"><div><div class="eyebrow mini">PAULISTÃO • TABELA 2026</div><h2>Classificação geral</h2><p>16 clubes · oito partidas por clube · as oito melhores campanhas vão às quartas; as duas últimas posições são de rebaixamento.</p></div><button class="outline-btn" data-action="csv-standings">↧ Exportar classificação</button></div>
 ${paulistaLeaders(c)}
 <div class="paulista-ranking-toolbar"><div><strong>Primeira fase</strong><span>${done===64?'64 resultados registrados':'Classificação em andamento · ainda não homologada'}</span></div><div class="rank-filter" role="group" aria-label="Filtrar tabela paulista">${[['all','Todas as equipes'],['qualified','Zona das quartas'],['relegated','Zona de rebaixamento']].map(([id,label])=>`<button type="button" class="rank-filter-btn ${rankingFilter===id?'active':''}" data-action="ranking-filter" data-value="${id}" aria-pressed="${rankingFilter===id}">${label}</button>`).join('')}</div></div>
 <div class="panel paulista-ranking-panel">${paulistaStandingTable(c)}</div>
 <div class="paulista-legend"><span><i class="key green"></i> 1º ao 8º · quartas de final</span><span><i class="key neutral"></i> 9º ao 14º · posições intermediárias</span><span><i class="key red"></i> 15º e 16º · rebaixamento</span></div>
 <div class="paulista-disclaimer">As posições exibidas enquanto houver jogos pendentes são <strong>provisórias</strong>. Em empate absoluto nos critérios, a definição depende de sorteio ou decisão oficial. Dados e mandos não são sincronizados com a FPF.</div></section>`;
}
function paulistaClubGallery(c){
 const ranks=new Map(paulistaStandings(c).map((r,i)=>[r.id,i]));const complete=activeMatches(c,'league').every(played);
 return `<div class="paulista-club-gallery">${c.teams.map(team=>{const index=ranks.get(team.id)??0;const status=paulistaStatus(index,complete);return `<article class="paulista-team-card ${status.tone}"><div class="paulista-team-card-top"><span class="team-card-pot">POTE ${h(team.pot||'—')}</span><span class="team-card-rank">${String(index+1).padStart(2,'0')}º <small>na tabela</small></span></div><div class="paulista-team-main">${crestHTML(team,'team-gallery-crest')}<h3>${h(team.name)}</h3><span class="team-gallery-status ${status.tone}">${h(status.name)}</span></div><div class="paulista-team-card-actions"><button type="button" data-action="view-club" data-value="${team.id}">Ver campanha <span>↗</span></button><button type="button" class="icon-btn" data-action="edit-team" data-value="${team.id}" aria-label="Editar ${h(team.name)}">✎</button></div></article>`;}).join('')}</div>`;
}
function paulistaClubView(c){
 return `<section class="view paulista-page"><div class="section-title"><div><div class="eyebrow mini">PAULISTÃO • PARTICIPANTES</div><h2>Os 16 clubes da competição</h2><p>Escudos em destaque, potes do sorteio e posição provisória com acesso à campanha de cada equipe.</p></div><button class="primary-btn" data-action="bulk-teams">☷ Editar clubes em lote</button></div>${paulistaClubGallery(c)}<div class="paulista-disclaimer">O editor individual mantém o ID da equipe e os jogos vinculados. Alterar o nome de um clube não altera a estrutura do torneio.</div></section>`;
}
function paulistaTieCard(c,tie,win,index,stage,locked){
 const initial=tie[0],a=initial.home,b=initial.away,finished=tie.every(played);
 const goals=id=>finished?tie.reduce((sum,m)=>sum+(m.home===id?m.hg:m.ag),0):'—';
 const label=stage==='quarters'?'Quartas':stage==='semis'?'Semifinal':'Final';
 const badgeValue=win?'Definido':finished?'Aguardando desempate':'Em disputa';
 return `<div class="paulista-knockout-card"><div class="knockout-card-header"><span>${label} · Confronto ${String(index+1).padStart(2,'0')}</span><span class="knockout-status ${win?'defined':finished?'tied':'pending'}">${badgeValue}</span></div>
 ${[a,b].map(id=>`<div class="knockout-team ${win===id?'winner':''}">${crestHTML(t(c,id),'mini-crest')}<span>${h(tName(c,id))}</span>${win===id?'<span class="knockout-winner-check" aria-label="Classificado">✓</span>':''}<strong>${goals(id)}</strong></div>`).join('')}
 <div class="knockout-card-foot">${tie.length===2?'Ida e volta · resultado agregado':'Jogo único'}${finished&&Number.isInteger(tie.at(-1).hp)&&Number.isInteger(tie.at(-1).ap)?` · PEN ${tie.at(-1).hp}–${tie.at(-1).ap}`:''}${!locked?`<button type="button" data-action="edit-match" data-value="${tie.find(m=>!played(m))?.id||tie.at(-1).id}">${finished?'Ver partida':'Registrar resultado'} ↗</button>`:''}</div></div>`;
}
function paulistaBracketView(c){
 const stages=['quarters','semis','final'],matches=activeMatches(c,'league'),done=matches.filter(played).length,finalWinner=champion(c);
 const draw=stages.map(s=>{const playedStage=activeMatches(c,s);if(!playedStage.length)return null;const by=new Map();for(const m of playedStage){const key=m.tie||m.id;if(!by.has(key))by.set(key,[]);by.get(key).push(m);}const wins=stageWinners(playedStage,'normal');return {stage:s,ties:[...by.values()],wins};});
 return `<section class="view paulista-page paulista-bracket-view"><div class="section-title"><div><div class="eyebrow mini">CAMINHO PARA O TÍTULO</div><h2>Chaveamento do Paulistão</h2><p>Quartas e semifinal em jogo único, com final no formato definido em Ajustes. O chaveamento avança somente com resultados concluídos.</p></div><button class="outline-btn" data-action="tab" data-value="matches">Ver partidas ↗</button></div>
 <div class="paulista-finals-header"><img src="assets/paulistao-trofeu-ref.png" alt="Taça do Paulistão" loading="lazy"><div><span>FASES FINAIS • 2026</span><strong>Rumo ao título paulista</strong><small>${finalWinner?'Campeão definido':'Resultados e confrontos administráveis'}</small></div>${finalWinner?`<div class="paulista-champion">${crestHTML(t(c,finalWinner),'mini-crest')}<span>CAMPEÃO <b>${h(tName(c,finalWinner))}</b></span></div>`:''}</div>
 <div class="paulista-bracket-flow">${stages.map((stage,i)=>{const data=draw[i],len=[4,2,1][i];return `<section class="paulista-round"><div class="paulista-round-header"><span>0${i+1} / 03</span><h3>${h(stageLabel(stage))}</h3><small>${len} ${len===1?'confronto':'confrontos'}</small></div><div class="paulista-round-content">${data?data.ties.map((tie,j)=>paulistaTieCard(c,tie,data.wins[j],j,stage,c.advanced.includes(stage))).join(''):[...Array(len)].map((_,j)=>`<div class="paulista-empty-tie"><div class="empty-tie-title">CHAVE ${j+1}</div><div><span>?</span><strong>${i===0?`Posições ${j+1} e ${8-j}`:'A definir'}</strong></div><div><span>?</span><strong>Aguardando classificados</strong></div></div>`).join('')}</div></section>`;}).join('<div class="bracket-flow-arrow" aria-hidden="true">›</div>')}</div>
 <div class="paulista-bracket-note"><span class="note-icon">i</span><div><strong>Critério esportivo</strong><p>${!activeMatches(c,'quarters').length?`Os confrontos das quartas (1º×8º, 2º×7º, 3º×6º, 4º×5º) serão gerados após os 64 jogos da primeira fase. ${done} de 64 resultados registrados.`:'Os confrontos aparecem conforme as fases anteriores são concluídas. Em caso de empate no jogo único, preencha os pênaltis para definir o classificado.'} As partidas geradas por este sistema não substituem os sorteios, mandos ou homologações da FPF.</p></div></div></section>`;
}
function clubProfileModal(c){
 const team=t(c,modal.id);if(!team)return '';
 const rows=paulistaStandings(c),index=rows.findIndex(r=>r.id===team.id),r=rows[index],games=activeMatches(c,'league').filter(m=>m.home===team.id||m.away===team.id),done=games.filter(played).length;
 const status=paulistaStatus(index,activeMatches(c,'league').every(played));
 const recent=games.slice(0,8).map(m=>`<div class="profile-fixture"><span>${String(m.round).padStart(2,'0')}ª rodada</span><strong>${h(tShort(c,m.home))} ${played(m)?`${m.hg} × ${m.ag}`:'×'} ${h(tShort(c,m.away))}</strong><em>${played(m)?'Finalizado':'Pendente'}</em></div>`).join('');
 return `<div class="modal-backdrop" data-action="close-modal"><div class="modal paulista-profile-modal" role="dialog" aria-modal="true" aria-label="Campanha de ${h(team.name)}"><div class="modal-head"><div><div class="eyebrow mini">PAULISTÃO · CAMPANHA</div><h2>${h(team.name)}</h2></div><button class="close-btn" data-action="close-modal">×</button></div><div class="profile-heading">${crestHTML(team,'profile-crest')}<div><b>${String(index+1).padStart(2,'0')}º lugar</b><span class="zone-label ${status.tone}">${h(status.name)}</span><p>${done} de ${games.length} jogos lançados</p></div></div><div class="profile-kpis">${[['Pontos',r.pts],['Vitórias',r.v],['Gols pró',r.gp],['Saldo',`${r.sg>0?'+':''}${r.sg}`]].map(([label,v])=>`<div><strong>${v}</strong><small>${label}</small></div>`).join('')}</div><h3 class="profile-subtitle">Jogos da primeira fase</h3><div class="profile-fixtures">${recent}</div><div class="modal-actions"><button type="button" class="outline-btn" data-action="close-modal">Fechar</button><button type="button" class="primary-btn" data-action="club-games" data-value="${team.id}">Ver partidas deste clube →</button></div></div></div>`;
}

function resultHtml(m){ return played(m) ? `<strong class="score-result">${m.hg}<span>:</span>${m.ag}</strong>` : '<span class="score-pending">×</span>'; }

function matchCard(c, m, locked=false){
  return `<button type="button" class="match-card" data-action="edit-match" data-value="${m.id}" ${locked?'disabled':''}>
    <div class="match-top"><span>${h(stageLabel(m.stage))}${m.group?' · Grupo '+h(m.group):''}${m.tie?' · Chave '+h(m.tie.split('-').at(-1)):''}</span><span>${m.date ? h(new Date(m.date).toLocaleString('pt-BR')) : played(m) ? 'Finalizado' : 'Não agendado'}</span></div>
    <div class="match-center">
      <div class="match-team">${crestHTML(t(c,m.home),'mini-crest')}<b>${h(tName(c,m.home))}</b></div>
      ${resultHtml(m)}
      <div class="match-team away"><b>${h(tName(c,m.away))}</b>${crestHTML(t(c,m.away),'mini-crest')}</div>
    </div>
    <div class="match-bottom"><span>${m.leg===2?'Volta':m.leg===1&&m.tie&&c.matches.filter(x=>x.tie===m.tie).length===2?'Ida':`Rodada ${m.round}`}${Number.isInteger(m.hp)&&Number.isInteger(m.ap)?` · PEN ${m.hp}–${m.ap}`:''}</span><span class="edit-link">${locked?'Fase encerrada':played(m)?'Editar resultado':'Lançar resultado'} ↗</span></div>
  </button>`;
}

function matchesView(c){
  const available = stageList(c).filter(s => activeMatches(c,s).length);
  const curr = currentStage(c);
  if(!available.includes(selectedStage)) selectedStage = curr;
  const ms = activeMatches(c, selectedStage);
  const rounds = roundsByMatches(ms);
  if(selectedRound && !rounds.includes(selectedRound)) selectedRound = null;
  let list = selectedRound ? ms.filter(m => m.round === selectedRound) : ms;
  if(c.key==='libertadores'&&selectedStage==='groups'&&libMatchGroup!=='all'){list=list.filter(m=>m.group===libMatchGroup);}
  if(['libertadores','copa'].includes(c.key)&&libTieFilter){list=list.filter(m=>(m.tie||m.id)===libTieFilter);}
  if(filter.trim()){
    const q = filter.toLocaleLowerCase('pt-BR');
    list = list.filter(m => [tName(c,m.home), tName(c,m.away)].some(x => x.toLocaleLowerCase('pt-BR').includes(q)));
  }
  const locked = c.advanced.includes(selectedStage);
  return `<section class="view">
    <div class="section-title"><div><div class="eyebrow mini">CENTRAL DE PARTIDAS</div><h2>Jogos e resultados</h2><p>Registre placares, datas, cartões e desempates por pênaltis.</p></div><div class="page-actions"><button class="outline-btn" data-action="csv-matches">↧ Exportar CSV</button></div></div>
    ${c.key==='copa'&&c.mode==='reduced-2026'?copaDrawControls(c,true):''}
    <div class="filters panel"><label>Etapa<select id="stage-select">${available.map(s => `<option value="${s}" ${s===selectedStage?'selected':''}>${h(stageLabel(s))}</option>`).join('')}</select></label><label>Rodada<select id="round-select"><option value="">Todas</option>${rounds.map(r => `<option value="${r}" ${selectedRound===r?'selected':''}>Rodada ${r}</option>`).join('')}</select></label><label class="search-box">Buscar clube<input id="search-games" placeholder="Digite o clube…" value="${h(filter)}"></label><div class="filter-summary">${c.key==='libertadores'&&libMatchGroup!=='all'?'Grupo '+h(libMatchGroup)+' · ':''}${['libertadores','copa'].includes(c.key)&&libTieFilter?'Confronto · ':''}${list.length} jogos</div></div>
    ${locked ? '<div class="info-note">Esta fase está bloqueada porque seus classificados já avançaram. Para corrigir resultados, restaure um backup anterior.</div>' : ''}
    ${!list.length ? '<div class="empty">Nenhuma partida corresponde ao filtro.</div>' : `<div class="matches-grid">${list.map(m => matchCard(c,m,locked)).join('')}</div>`}
    ${selectedStage===curr && nextStage(c) ? `<div class="stage-action footer-stage"><div><strong>${stageReady(c,curr)?'Fase pronta para avançar':'Preencha os jogos e desempates'}</strong><span>Próxima: ${h(stageLabel(nextStage(c)))}</span></div><button class="primary-btn" data-action="advance" ${!stageReady(c,curr)?'disabled':''}>Gerar próxima fase →</button></div>` : ''}
  </section>`;
}

// Libertadores: status é provisório até os doze jogos do grupo serem encerrados.
function libStatus(index, finished){
 const items=[
  {type:'qualifies',label:finished?'Oitavas de final':'Zona de oitavas',short:'OITAVAS'},
  {type:'qualifies',label:finished?'Oitavas de final':'Zona de oitavas',short:'OITAVAS'},
  {type:'sudamericana',label:finished?'Playoff Sul-Americana':'Zona Sul-Americana',short:'SULA'},
  {type:'eliminated',label:finished?'Eliminado':'Zona de eliminação',short:'FORA'}
 ];
 return items[index] || {type:'pending',label:'A definir',short:'—'};
}
function libGroupData(c, group){
 const fixtures=activeMatches(c,'groups').filter(m=>m.group===group);
 const clubIds=new Set(fixtures.flatMap(m=>[m.home,m.away]));
 const clubs=c.teams.filter(t=>t.group===group && (clubIds.has(t.id)||fixtures.length===0));
 return {fixtures, rows:standings(clubs,fixtures,'libertadores'), done:fixtures.filter(played).length,complete:fixtures.length===12 && fixtures.every(played)};
}
function libertadoresStandingsView(c){
 const games=activeMatches(c,'groups');
 const available=games.length>0;
 const allGroups=groups.filter(g=>libGroupFilter==='all'||libGroupFilter===g);
 const summaries=groups.map(g=>libGroupData(c,g));
 const registered=summaries.reduce((acc,g)=>acc+g.done,0);
 return `<section class="view libertadores-page lib-ranking-view">
  <div class="section-title"><div><div class="eyebrow mini">CONMEBOL LIBERTADORES · 2026</div><h2>Classificação dos grupos</h2><p>Grupos A–H, com situação de cada clube e atualização após o registro dos jogos.</p></div><button class="outline-btn" data-action="csv-standings">↧ Exportar classificação</button></div>
  <div class="lib-tournament-banner"><div><span class="lib-overline">CAMINHO À GLÓRIA ETERNA</span><h3>Os melhores avançam.</h3><p>As posições são provisórias até a conclusão dos 12 jogos de cada grupo.</p></div><div class="lib-tournament-figures"><div><b>16</b><small>Vagas nas oitavas</small></div><div><b>08</b><small>Vagas na Sul-Americana</small></div><div><b>${registered}<span>/96</span></b><small>Jogos registrados</small></div></div></div>
  <div class="lib-status-legend" aria-label="Legenda da classificação"><span class="lib-legend-item qualifies"><i></i>1º e 2º — Oitavas</span><span class="lib-legend-item sudamericana"><i></i>3º — Playoff Sul-Americana</span><span class="lib-legend-item eliminated"><i></i>4º — Eliminado</span><small>Estados ainda provisórios em grupos incompletos</small></div>
  <nav class="lib-group-filter" aria-label="Filtrar grupo"><span>Selecionar grupo</span>${['all',...groups].map(g=>`<button type="button" class="lib-filter-btn ${libGroupFilter===g?'active':''}" data-action="lib-group-filter" data-value="${g}" aria-pressed="${libGroupFilter===g}">${g==='all'?'Todos':'Grupo '+g}</button>`).join('')}</nav>
  ${!available?'<div class="alert">A fase de grupos ficará disponível depois das preliminares. Nenhuma classificação está definida.</div>':`<div class="lib-tables-grid">${allGroups.map(g=>{
   const {rows,done,complete}=libGroupData(c,g);
   const pct=Math.round(done/12*100);
   return `<section class="lib-table-card panel"><div class="lib-table-head"><div><span class="lib-overline">FASE DE GRUPOS</span><h3>Grupo ${g}</h3></div><div class="lib-table-progress"><b>${done}/12 jogos</b><span class="lib-progress-track"><span style="width:${pct}%"></span></span></div></div>
    <div class="lib-table-scroll"><table class="lib-table"><thead><tr><th>POS</th><th>CLUBE</th><th>PTS</th><th>J</th><th>V</th><th>SG</th><th>SITUAÇÃO</th></tr></thead><tbody>${rows.map((r,i)=>{const status=libStatus(i,complete);return `<tr class="lib-table-row ${status.type}" title="${h(status.label)}${complete?'':' (provisório)'}"><td><span class="lib-place">${i+1}º</span></td><td><span class="lib-row-team">${crestHTML(r,'lib-standing-crest')}<span><strong>${h(r.name)}</strong><small>${h(LIB_COUNTRY_LABELS[r.country]||'Clube participante')}</small></span></span></td><td class="lib-pts">${r.pts}</td><td>${r.j}</td><td>${r.v}</td><td>${r.sg>0?'+':''}${r.sg}</td><td><span class="lib-situation ${status.type}">${h(status.short)}${complete?'':' *'}</span></td></tr>`}).join('')}</tbody></table></div>
    <div class="lib-table-foot"><span>${complete?'Grupo concluído':'* Posições provisórias'}</span><button data-action="lib-group-games" data-value="${g}" class="lib-inline-action">Ver partidas <span>→</span></button></div>
   </section>`}).join('')}</div>`}
  <div class="lib-ranking-note"><span>i</span><p><strong>Interpretação de fases:</strong> os dois primeiros vão às oitavas da Libertadores; o terceiro disputa os playoffs da Sul-Americana; o quarto é eliminado. O sistema calcula posições a partir dos resultados lançados e não homologa decisões oficiais.</p></div>
 </section>`;
}
function libertadoresClubView(c){
 const fixtures=activeMatches(c,'groups');
 return `<section class="view libertadores-page lib-club-view"><div class="section-title"><div><div class="eyebrow mini">OS PROTAGONISTAS · 2026</div><h2>Clubes da Libertadores</h2><p>32 equipes, dez países, oito grupos. Escudos e identidades preservados.</p></div><button class="primary-btn" data-action="bulk-teams">☷ Importar nomes em lote</button></div>
 ${libStageNotice(c)}
 <div class="lib-group-filter" aria-label="Filtrar clubes por grupo"><span>Filtrar clubes</span>${['all',...groups].map(g=>`<button class="lib-filter-btn ${libGroupFilter===g?'active':''}" data-action="lib-club-filter" data-value="${g}" aria-pressed="${libGroupFilter===g}">${g==='all'?'Todos':'Grupo '+g}</button>`).join('')}</div>
 <div class="lib-club-grid">${groups.filter(g=>libGroupFilter==='all'||libGroupFilter===g).flatMap(group=>c.teams.filter(t=>t.group===group).map(team=>{
  const teamGames=fixtures.filter(m=>m.home===team.id||m.away===team.id);
  const finished=teamGames.filter(played).length;
  const row=libGroupData(c,group).rows.find(r=>r.id===team.id);
  return `<article class="lib-club-card"><div class="lib-club-card-top"><span>GRUPO ${group}${team.pot?' · '+h(team.pot):''}</span><span>${libFlag(team)} ${h(LIB_COUNTRY_LABELS[team.country]||'')}</span></div><div class="lib-club-card-body">${crestHTML(team,'lib-large-crest')}<h3>${h(team.name)}</h3><span class="lib-club-card-subtitle">${finished} de 6 jogos realizados</span></div><div class="lib-club-stats"><div><b>${row?.pts??0}</b><small>Pontos</small></div><div><b>${row?.v??0}</b><small>Vitórias</small></div><div><b>${row?.sg??0}</b><small>Saldo</small></div></div><div class="lib-club-actions"><button data-action="lib-club-games" data-value="${team.id}">Partidas ↗</button><button data-action="edit-team" data-value="${team.id}">Editar clube</button></div></article>`;
 })).join('')}</div>
 <div class="lib-ranking-note"><span>i</span><p>Os resultados, as classificações e a edição dos participantes continuam independentes por competição. A identidade visual é inspirada na Libertadores e não representa um painel oficial da CONMEBOL.</p></div>
 </section>`;
}
function libertadoresBracketView(c,embedded=false){
 const stages=['r16','quarters','semis','final'];
 const sizes={r16:8,quarters:4,semis:2,final:1};
 const names={r16:'Oitavas de final',quarters:'Quartas de final',semis:'Semifinais',final:'Grande final'};
 const current=currentStage(c);
 const started=c.advanced.includes('groups') || stages.some(s=>activeMatches(c,s).length);
 const winnerId=champion(c);
 return `<section class="${embedded?'':'view'} libertadores-page lib-bracket-view"><div class="section-title"><div><div class="eyebrow mini">CAMINHO À GLÓRIA ETERNA</div><h2>Rumo à grande final</h2><p>Oitavas, quartas e semifinais em ida e volta; final em jogo único.</p></div>${winnerId?'<span class="lib-bracket-badge">CAMPEÃO DEFINIDO</span>':'<span class="lib-bracket-badge">CHAVEAMENTO 2026</span>'}</div>
 <div class="lib-knockout-banner"><img src="assets/libertadores-trofeu.webp" alt="Taça da Libertadores" loading="lazy"><div><span class="lib-overline">CONTINENTE EM DISPUTA</span><h3>${winnerId?h(tName(c,winnerId)):'Um continente. Uma glória.'}</h3><p>${winnerId?'Campeão registrado no sistema.':'Os confrontos futuros serão definidos à medida que as fases forem concluídas.'}</p></div></div>
 <div class="lib-bracket-scroll"><div class="lib-bracket-grid">${stages.map((stage,idx)=>{
  const ms=activeMatches(c,stage);const byTie=new Map();for(const m of ms){const id=m.tie||m.id;if(!byTie.has(id))byTie.set(id,[]);byTie.get(id).push(m);}
  const tuples=[...byTie.values()];const winners=tuples.length?stageWinners(ms,'normal'):[];
  return `<section class="lib-bracket-round"><div class="lib-bracket-round-head"><div><span>0${idx+1} · ETAPA ELIMINATÓRIA</span><h3>${names[stage]}</h3></div><span>${sizes[stage]} ${sizes[stage]===1?'confronto':'confrontos'}</span></div><div class="lib-bracket-ties">${Array.from({length:Math.max(sizes[stage],tuples.length)},(_,i)=>{
   const tie=tuples[i];if(!tie)return `<div class="lib-knockout-placeholder"><span>CHAVE ${String(i+1).padStart(2,'0')}</span><div>Equipe a definir <b>—</b></div><div>Equipe a definir <b>—</b></div><small>Aguardando ${idx===0?'fase de grupos':'fase anterior'}</small></div>`;
   const first=tie[0],a=t(c,first.home),b=t(c,first.away),won=winners[i];
   const aggregate=id=>tie.filter(played).reduce((sum,m)=>sum+(m.home===id?m.hg:m.away===id?m.ag:0),0);
   const completed=tie.every(played);
   const penalties=tie.find(m=>Number.isInteger(m.hp)&&Number.isInteger(m.ap));
   return `<div class="lib-knockout-tie"><div class="lib-knockout-tie-head"><span>CHAVE ${String(i+1).padStart(2,'0')}</span><span>${tie.length===2?'IDA E VOLTA':'JOGO ÚNICO'}</span></div>${[a,b].map(team=>`<div class="lib-knockout-team ${won===team.id?'is-winner':''}">${crestHTML(team,'lib-tie-crest')}<span>${h(team.name)}</span><b>${completed?aggregate(team.id):'—'}</b></div>`).join('')}<div class="lib-knockout-footer"><span>${won?'✓ Classificado: '+h(tName(c,won)):completed?'Decisão pendente':tie.filter(played).length+' de '+tie.length+' jogos lançados'}${penalties?' · PEN '+penalties.hp+'–'+penalties.ap:''}</span><button data-action="lib-tie-games" data-value="${h(first.id)}">Ver jogos ↗</button></div></div>`;
  }).join('')}</div></section>`;
 }).join('')}</div></div>
 ${!started?'<div class="lib-ranking-note"><span>i</span><p>Os confrontos acima ainda estão vazios. Conclua a fase de grupos e use “Avançar fase” para gerar as oitavas de final. Nenhum clube foi classificado antecipadamente.</p></div>':'<div class="lib-ranking-note"><span>i</span><p>Placar exibido como soma dos gols dos confrontos com jogos de ida e volta. Pênaltis só aparecem quando registrados; resultados pendentes nunca são apresentados como definitivos.</p></div>'}
 </section>`;
}

function standingTable(c, clubIds, matches, mode){
  const rows = standings(c.teams.filter(team => clubIds.includes(team.id)), matches, mode);
  return `<div class="table-scroll"><table class="ranking"><thead><tr><th>#</th><th>CLUBE</th><th>PTS</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>CV</th><th>CA</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td><span class="position ${positionZone(c,i)}">${i+1}</span></td><td class="ranking-name">${crestHTML(r,'mini-crest')}<strong>${h(r.name)}</strong></td>${['pts','j','v','e','d','gp','gc','sg','red','yellow'].map(k=>`<td class="${k==='pts'?'points':''}">${r[k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function standingsView(c){
  if(c.key==='paulista')return paulistaStandingsView(c);
  if(c.key==='libertadores')return libertadoresStandingsView(c);
  if(c.key==='copa'&&c.mode==='reduced-2026')return copaStandingsView(c);
  const isLib = c.key === 'libertadores';
  const stage = isLib ? 'groups' : 'league';
  const games = activeMatches(c, stage);
  const ready = !isLib || games.length;
  return `<section class="view">
    <div class="section-title"><div><div class="eyebrow mini">TABELAS</div><h2>Classificação ${isLib?'dos grupos':'geral'}</h2><p>${isLib?'Desempate da edição 2026: confrontos diretos entre empatados, saldo, gols e cartões.':'Pontuação: vitória 3, empate 1 e derrota 0, com cartões como critério complementar.'}</p></div><button class="outline-btn" data-action="csv-standings">↧ Exportar classificação</button></div>
    ${isLib ? `<div class="lib-group-filter"><span>Selecionar grupo</span>${['all',...groups].map(g=>`<button type="button" class="lib-filter-btn ${libGroupFilter===g?'active':''}" data-action="lib-group-filter" data-value="${g}">${g==='all'?'Todos':'Grupo '+g}</button>`).join('')}</div>`:''}
    ${isLib && !ready ? '<div class="alert">A fase de grupos ficará disponível após concluir as três etapas preliminares. Os 47 clubes já estão cadastrados.</div>' : isLib ? `<div class="group-standings">${groups.filter(g=>libGroupFilter==='all'||libGroupFilter===g).map(g => `<section class="panel lib-standing-card"><div class="group-title"><h3>Grupo ${g}</h3>${badge('4 equipes','ghost')}</div>${standingTable(c, c.teams.filter(t => t.group===g && games.some(m => m.home===t.id||m.away===t.id)).map(t => t.id), games.filter(m=>m.group===g), 'libertadores')}</section>`).join('')}</div>` : `<div class="panel ranking-panel">${standingTable(c, c.teams.map(t => t.id), games, c.key)}</div>`}
    <div class="legend">${c.key==='brasileirao' ? '<span><i class="key green"></i> Libertadores</span><span><i class="key blue"></i> Competições continentais</span><span><i class="key red"></i> Rebaixamento</span>' : c.key==='paulista' ? '<span><i class="key green"></i> Quartas de final</span><span><i class="key red"></i> Rebaixamento</span>' : '<span><i class="key green"></i> Classificados</span>'}<span>Empate absoluto pode exigir decisão oficial.</span></div>
  </section>`;
}

function bracketView(c, embedded=false){
  if(c.key==='paulista')return paulistaBracketView(c);
  if(c.key==='copa'&&c.mode==='reduced-2026')return copaBracketView(c,embedded);
  if(c.key==='libertadores')return libertadoresBracketView(c, embedded);
  const stages = stageList(c).filter(s => !['league','groups'].includes(s) && activeMatches(c,s).length);
  if(!stages.length) return '<div class="empty">O mata-mata aparecerá após a conclusão da primeira fase.</div>';
  return `<div class="${embedded?'':'view'}"><div class="section-title"><div><div class="eyebrow mini">CHAVEAMENTO</div><h2>Fases eliminatórias</h2><p>Avançam apenas os vencedores de confrontos concluídos.</p></div></div><div class="bracket-scroll"><div class="bracket-columns">${stages.map(s => {
    const ms = activeMatches(c,s);
    const grouped = new Map();
    for(const m of ms){ const key = m.tie || m.id; if(!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(m); }
    const wins = stageWinners(ms, c.key==='copa'?'copa':'normal');
    return `<section class="bracket-column"><div class="column-head"><strong>${h(stageLabel(s))}</strong>${badge(`${grouped.size} chaves`,'ghost')}</div>${[...grouped.values()].map((tie, i) => `<div class="tie-card"><div class="tie-label">CHAVE ${String(i+1).padStart(2,'0')} ${tie.length===2?'· IDA/VOLTA':''}</div><div class="tie-competitor ${wins[i]===tie[0].home?'won':''}">${crestHTML(t(c,tie[0].home),'mini-crest')}<span>${h(tName(c,tie[0].home))}</span><strong>${tie.every(played) ? tie.reduce((acc,m)=>acc+(m.home===tie[0].home?m.hg:m.ag),0) : '—'}</strong></div><div class="tie-competitor ${wins[i]===tie[0].away?'won':''}">${crestHTML(t(c,tie[0].away),'mini-crest')}<span>${h(tName(c,tie[0].away))}</span><strong>${tie.every(played) ? tie.reduce((acc,m)=>acc+(m.home===tie[0].away?m.hg:m.ag),0) : '—'}</strong></div>${wins[i] ? '<div class="tie-winner">✓ Classificado</div>' : '<div class="tie-winner neutral">Aguardando resultado</div>'}</div>`).join('')}</section>`;
  }).join('')}</div></div></div>`;
}

const RULES = {
  paulista:[['Participantes e calendário','16 clubes, oito partidas na primeira fase. Adversários sorteados em quatro potes; os mandos e rodadas podem ser administrados no sistema.'],['Classificação','Os oito melhores avançam às quartas (1º × 8º, 2º × 7º, 3º × 6º, 4º × 5º). Os dois últimos são rebaixados.'],['Eliminatórias','Quartas e semifinal em jogo único; empates decididos por pênaltis. As semifinais consideram melhor campanha acumulada.'],['Final','Regulamento admite final em jogo único ou ida e volta, com configuração administrativa antes da geração da fase final.'],['Desempates da fase de liga','Pontos, vitórias, saldo, gols pró, menos cartões vermelhos, menos amarelos e sorteio oficial.']],
  libertadores:[['Participantes','47 clubes: 6 iniciam na fase preliminar 1, 13 entram na fase 2 e 28 entram diretamente nos grupos.'],['Pré-Libertadores','Três fases em ida e volta: 6→3, 16→8 e 8→4 classificados.'],['Grupos','Oito grupos de quatro, turno e returno (6 rodadas); classificam-se os dois primeiros.'],['Desempate dos grupos','Pontos, confrontos diretos (pontos, saldo, gols), saldo geral, gols geral, menos vermelhos, menos amarelos e sorteio.'],['Eliminatórias','Oitavas, quartas e semifinal em ida e volta; final em jogo único.']],
  copa:[['Participantes','Modelo administrativo reduzido: 32 clubes (20 da Série A e 12 da Série B), não equivalente à lista completa da CBF.'],['Distribuição','5ª fase: 32→16; oitavas: 16→8; quartas: 8→4; semifinal: 4→2; final: 2→1 campeão.'],['Tipos de confrontos','Fases 1–4 e final em jogo único. Fases 5–8 em ida e volta.'],['Desempate','Jogo único: empate decidido nos pênaltis. Em dois jogos: pontos do confronto, depois saldo, depois pênaltis.'],['Sorteio administrativo','A ferramenta embaralha aleatoriamente os participantes da fase ativa, sem pretensão de reproduzir os sorteios oficiais da CBF. Chaves futuras são geradas somente depois do avanço.']],
  brasileirao:[['Participantes','20 equipes, 38 rodadas e 380 partidas em turno e returno.'],['Pontuação','Vitória vale 3 pontos, empate 1 e derrota 0.'],['Desempates','Vitórias, saldo de gols, gols marcados, confronto direto (se apenas duas equipes empatadas), menos cartões vermelhos, menos amarelos e sorteio.'],['Vagas continentais 2026','1º a 4º vão diretamente à Libertadores 2027; 5º à preliminar; 6º somente se houver redistribuição de vagas. Seis melhores não classificados à Libertadores podem obter vaga na Sul-Americana, conforme os critérios e repasses.'],['Acesso da Série B','O sistema inclui um módulo simples para simular acesso ao substituir clubes da Série A por opções ampliadas da Série B.'],['Calendário administrável','O calendário gerado tem 38 rodadas, 380 partidas, turno e returno, com no máximo dois jogos consecutivos fora ou em casa. Não equivale à tabela oficial de datas e mandos da CBF.']]
};

function rules(c){
  const i = info(c);
  return `<div class="view"><div class="section-title"><div><div class="eyebrow mini">FONTE OFICIAL · EDIÇÃO 2026</div><h2>Regulamento aplicado</h2><p>Regras esportivas para cálculo, avanço de fases e desempate.</p></div><a class="outline-btn" href="${h(i.url)}" target="_blank" rel="noopener noreferrer">Abrir documento oficial ↗</a></div><div class="rules-grid">${RULES[c.key].map(([title,txt],i)=>`<article class="panel rule-card"><span class="rule-number">${String(i+1).padStart(2,'0')}</span><h3>${h(title)}</h3><p>${h(txt)}</p></article>`).join('')}</div><div class="alert"><strong>Atenção:</strong> sistema administrativo independente. Sorteios, mandos, decisões disciplinares, calendários reais e homologações dependem das entidades organizadoras.</div></div>`;
}

function settings(c){
  return `<div class="view"><div class="section-title"><div><div class="eyebrow mini">SEGURANÇA E DADOS</div><h2>Ajustes e backup</h2><p>Gerencie dados locais, regras da edição e exportação.</p></div></div>${c.key==='copa'&&c.mode==='reduced-2026'?copaDrawControls(c):''}${c.key==='libertadores' ? `<div class="lib-mode-switch panel"><div><div class="eyebrow mini">SORTEIO E PARTICIPANTES 2026</div><h3>Escolha como acompanhar a Libertadores</h3><p>Você pode carregar os grupos oficiais, embaralhar os potes de acordo com o regulamento ou simular as três fases preliminares com os 47 clubes reais.</p></div><div class="lib-mode-options"><button class="lib-mode-btn ${libOfficial(c)&&libDrawn(c)?'active':''}" data-action="lib-draw-groups"><strong>${libDrawn(c)?'Embaralhar novamente · 32 clubes':'Grupos embaralhados · 32 clubes'}</strong><small>Novo sorteio por potes, respeitando restrições de país</small></button><button class="lib-mode-btn ${libOfficial(c)&&!libDrawn(c)?'active':''}" data-action="official-groups"><strong>Grupos oficiais · 32 clubes</strong><small>Distribuição original do sorteio CONMEBOL</small></button><button class="lib-mode-btn ${!libOfficial(c)?'active':''}" data-action="lib-qualifiers"><strong>Desde as preliminares · 47 clubes</strong><small>Fases 1, 2 e 3, com participantes reais</small></button></div><p class="lib-mode-warning">Ao trocar o modo, somente os dados da Libertadores são reiniciados. Faça backup antes se já cadastrou resultados.</p></div>` : ''}<div class="settings-grid"><section class="panel setting-panel"><span class="setting-icon">↧</span><h3>Backup de todas as competições</h3><p>Exporte um arquivo JSON com clubes, resultados, grupos e as quatro competições.</p><button class="primary-btn" data-action="export">Baixar JSON</button></section><section class="panel setting-panel"><span class="setting-icon">↥</span><h3>Restaurar backup</h3><p>Recupere seus dados de um JSON exportado anteriormente. Esta ação substitui os dados locais.</p><label class="outline-btn upload-btn">Selecionar arquivo JSON<input type="file" id="import-json" accept=".json,application/json" hidden></label></section><section class="panel setting-panel"><span class="setting-icon">⚑</span><h3>Final do Paulistão</h3><p>Escolha o formato da decisão antes de gerar a final.</p><label class="select-label">Formato da final <select id="final-legs" ${c.key!=='paulista'||c.advanced.includes('semis')?'disabled':''}><option value="2" ${c.finalLegs===2?'selected':''}>Ida e volta</option><option value="1" ${c.finalLegs===1?'selected':''}>Jogo único</option></select></label>${c.key!=='paulista' ? '<small>Disponível somente na competição Paulista.</small>' : ''}</section><section class="panel setting-panel danger-setting"><span class="setting-icon">⟲</span><h3>Reiniciar competição</h3><p>Apaga placares e personalizações da competição atual e restaura seu modelo 2026.</p><button class="danger-btn" data-action="reset">Reiniciar ${h(INFO[c.key].short)}</button></section></div><div class="info-note"><strong>Publicação:</strong> este sistema separado é estático, compatível com GitHub Pages ou hospedagem HTML. O armazenamento é local ao navegador.</div></div>`;
}

function teamModal(c){
  const team = c.teams.find(x => x.id === modal.id);
  if(!team) return '';
  const known = CLUB_LIBRARY;
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="Editar clube"><div class="modal-head"><div><div class="eyebrow mini">EQUIPE INSCRITA</div><h2>Editar clube</h2></div><button class="close-btn" data-action="close-modal">×</button></div><form id="team-form" data-id="${team.id}"><div class="form-grid"><label class="span-two">Nome oficial<input name="name" maxlength="75" required value="${h(team.name)}"></label><label>Sigla<input name="short" maxlength="8" required value="${h(team.short)}"></label>${c.key==='libertadores'&&team.kind==='direct' ? `<label>Grupo<select name="group" ${activeMatches(c,'groups').length?'disabled':''}>${groups.map(g=>`<option value="${g}" ${team.group===g?'selected':''}>${g}</option>`).join('')}</select></label>` : ''}<label class="span-two">Aplicar clube conhecido<select name="preset"><option value="">Selecione uma opção</option>${known.map(name => `<option value="${h(name)}">${h(name)}</option>`).join('')}</select></label></div><div class="modal-note">Se o nome escolhido constar na biblioteca, o sistema vincula automaticamente sigla e logo conhecidos. Os resultados permanecem vinculados ao mesmo ID da equipe.</div><div class="modal-actions"><button class="outline-btn" type="button" data-action="close-modal">Cancelar</button><button class="primary-btn" type="submit">Salvar clube ✓</button></div></form></div></div>`;
}

function bulkModal(c){
  const official = c.key==='libertadores' && c.teams.some(t=>t.kind==='official');
  const kinds = c.key==='copa' ? [...new Set(c.teams.map(t=>t.kind))] : official ? groups : c.key==='libertadores' ? ['pre1','pre2','direct'] : ['all'];
  const kind = modal.kind || kinds[0];
  const arr = kind==='all' ? c.teams : official ? c.teams.filter(t=>t.group===kind) : c.teams.filter(t=>t.kind===kind);
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="Importar clubes"><div class="modal-head"><div><div class="eyebrow mini">CADASTRO EM LOTE</div><h2>Preencher nomes</h2></div><button class="close-btn" data-action="close-modal">×</button></div><form id="bulk-form"><label>Categoria<select id="bulk-kind" name="kind">${kinds.map(x=>`<option value="${x}" ${kind===x?'selected':''}>${h(x==='all'?'Todos os clubes':official?'Grupo '+x:groupLabel(x))}</option>`).join('')}</select></label><label>Nomes dos clubes (${arr.length} linhas, uma equipe por linha)<textarea name="names" rows="12" spellcheck="false">${h(arr.map(t=>t.name).join('\n'))}</textarea></label><div class="modal-note">Mantenha exatamente ${arr.length} linhas não vazias. A ordem das equipes é preservada.</div><div class="modal-actions"><button class="outline-btn" type="button" data-action="close-modal">Cancelar</button><button class="primary-btn" type="submit">Aplicar nomes ✓</button></div></form></div></div>`;
}

function matchModal(c){
  const m = c.matches.find(x => x.id === modal.id);
  if(!m) return '';
  const two = c.matches.some(x => x.tie===m.tie && x.id!==m.id) && m.tie;
  const canSwap = !played(m) && !c.advanced.includes(m.stage);
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="Editar partida"><div class="modal-head"><div><div class="eyebrow mini">LANÇAR RESULTADO</div><h2>${h(stageLabel(m.stage))}</h2></div><button class="close-btn" data-action="close-modal" aria-label="Fechar">×</button></div><form id="match-form" data-id="${m.id}"><div class="score-editor"><div>${crestHTML(t(c,m.home),'mini-crest large')}<strong>${h(tName(c,m.home))}</strong><small>Mandante</small></div><input name="hg" type="number" min="0" step="1" placeholder="–" value="${m.hg??''}" aria-label="Gols do mandante"><span>×</span><input name="ag" type="number" min="0" step="1" placeholder="–" value="${m.ag??''}" aria-label="Gols do visitante"><div>${crestHTML(t(c,m.away),'mini-crest large')}<strong>${h(tName(c,m.away))}</strong><small>Visitante</small></div></div><div class="form-grid"><label>Data e horário (opcional)<input type="datetime-local" name="date" value="${h(m.date||'')}"></label><label>Rodada<input type="number" name="round" min="1" max="100" value="${m.round}" ${c.key==='brasileirao'||(c.key==='paulista'&&m.stage==='league')?'readonly title="Rodada fixada pelo calendário inteligente"':''}></label></div><div class="form-section-title">Desempate nos pênaltis <small>preencha somente se necessário</small></div><div class="form-grid"><label>Pênaltis · Mandante<input type="number" name="hp" min="0" placeholder="–" value="${m.hp??''}"></label><label>Pênaltis · Visitante<input type="number" name="ap" min="0" placeholder="–" value="${m.ap??''}"></label></div>${['league','groups'].includes(m.stage) ? '<div class="form-section-title">Cartões <small>usados nos desempates da tabela</small></div><div class="form-grid four">'+[['hy','Amarelos casa'],['ay','Amarelos fora'],['hr','Vermelhos casa'],['ar','Vermelhos fora']].map(([n,label])=>`<label>${label}<input type="number" name="${n}" min="0" max="99" value="${m[n]||0}"></label>`).join('')+'</div>' : ''}<div class="modal-note">${two?'Confronto com dois jogos: informe os pênaltis apenas na volta, se necessário.':'Em mata-mata de jogo único, use pênaltis em caso de empate.'}</div><div class="modal-actions">${canSwap&&!(c.key==='paulista'&&m.stage==='league') ? `<button type="button" class="outline-btn" data-action="swap-home" data-value="${m.id}">⇄ Inverter mando</button>` : ''}<button type="button" class="ghost-btn" data-action="clear-match" data-value="${m.id}">Limpar placar</button><button type="submit" class="primary-btn">Salvar resultado ✓</button></div></form></div></div>`;
}

function promotionModal(c){
  if(c.key !== 'brasileirao') return '';
  const currentTeams = [...c.teams].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="Gerenciar acesso da Série B"><div class="modal-head"><div><div class="eyebrow mini">SIMULAÇÃO DE ACESSO</div><h2>Série B → Série A</h2></div><button class="close-btn" data-action="close-modal">×</button></div><form id="promotion-form"><div class="modal-note">Selecione até quatro trocas. Os clubes de saída deixam a Série A e são substituídos por candidatos da Série B, preservando o calendário e os IDs da tabela.</div>${[0,1,2,3].map(i => `<div class="promotion-row"><label>Clube da Série A que sai<select name="out-${i}"><option value="">Nenhum</option>${currentTeams.map(team => `<option value="${team.id}">${h(team.name)}</option>`).join('')}</select></label><label>Clube que sobe da Série B<select name="in-${i}"><option value="">Nenhum</option>${SERIE_B_OPTIONS.map(name => `<option value="${h(name)}">${h(name)}</option>`).join('')}</select></label></div>`).join('')}<div class="modal-actions"><button class="outline-btn" type="button" data-action="close-modal">Cancelar</button><button class="primary-btn" type="submit">Aplicar acessos ✓</button></div></form></div></div>`;
}

function modalHtml(c){
  if(!modal) return '';
  if(modal.type === 'match') return matchModal(c);
  if(modal.type === 'team') return teamModal(c);
  if(modal.type === 'bulk') return bulkModal(c);
  if(modal.type === 'promotion') return promotionModal(c);
  if(modal.type === 'club-profile') return clubProfileModal(c);
  return '';
}

function render(){
  const c = get();
  document.title = `${INFO[c.key].short} · Central de Campeonatos`;
  document.body.className = `theme-${c.key}`;
  if(c.key==='brasileirao'&&state.tab==='bracket')state.tab='standings';
  const views = {overview, clubs, matches:matchesView, standings:standingsView, bracket:bracketView, rules, settings};
  if(c.key==='paulista')Object.assign(views,{overview:paulistaOverview,clubs:paulistaClubsWithCalendar,matches:paulistaMatchesView,standings:paulistaStandingsWithCalendar,settings:paulistaSettingsView});
  if(c.key==='brasileirao')Object.assign(views,{overview:brasileiraoOverview,clubs:brasileiraoClubsView,matches:brasileiraoMatchesView,standings:brasileiraoStandingsView,settings:brasileiraoSettingsView});
  $('#app').innerHTML = `${nav()}<main class="main theme-${c.key}">${heading(c)}${views[state.tab](c)}<footer class="footer"><span>© CentralFut · Edição 2026 · Sistema independente</span><span>Dados locais · Visual aprimorado · Logos e identidades temáticas</span></footer></main>${modalHtml(c)}${toast ? `<div class="toast" role="status">${h(toast)}</div>` : ''}`;
  if($('.toast') && /falha|erro|não/i.test(toast)) $('.toast').classList.add('is-error');
}

function download(name, content, type='application/json'){
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
function exportCSV(name, rows){
  const csv = rows.map(r => r.map(x => '"' + String(x ?? '').replace(/"/g,'""') + '"').join(';')).join('\r\n');
  download(name, '\uFEFF' + csv, 'text/csv;charset=utf-8');
}
function exportStandings(){
  const c = get();
  const ms = activeMatches(c, c.key==='libertadores' ? 'groups' : 'league');
  const rows = [['Grupo','Posição','Clube','Pontos','Jogos','Vitórias','Empates','Derrotas','GP','GC','SG','Cartões vermelhos','Cartões amarelos']];
  for(const g of (c.key==='libertadores' ? groups : ['Geral'])){
    const clubs = c.key==='libertadores' ? c.teams.filter(x => x.group===g && ms.some(m => m.home===x.id || m.away===x.id)) : c.teams;
    const table = standings(clubs, ms.filter(m => c.key!=='libertadores' || m.group===g), c.key);
    table.forEach((r,i) => rows.push([g,i+1,r.name,r.pts,r.j,r.v,r.e,r.d,r.gp,r.gc,r.sg,r.red,r.yellow]));
  }
  exportCSV(`${c.key}-classificacao-2026.csv`, rows);
}
function exportMatches(){
  const c = get();
  const rows = [['Fase','Rodada','Chave','Mandante','Gols mandante','Gols visitante','Visitante','Pênaltis casa','Pênaltis fora','Data','Grupo']];
  c.matches.forEach(m => rows.push([stageLabel(m.stage),m.round,m.tie||'',tName(c,m.home),m.hg??'',m.ag??'',tName(c,m.away),m.hp??'',m.ap??'',m.date,m.group||'']));
  exportCSV(`${c.key}-jogos-2026.csv`, rows);
}

function editMatch(form){
  const c = get();
  const m = c.matches.find(x => x.id === form.dataset.id);
  if(!m || c.advanced.includes(m.stage)) throw new Error('Esta fase já está encerrada.');
  const data = new FormData(form);
  function nullableInt(k){
    const value = String(data.get(k) ?? '').trim();
    if(!value) return null;
    const n = Number(value);
    if(!Number.isInteger(n) || n < 0 || n > 99) throw new Error(`Valor inválido: ${k}.`);
    return n;
  }
  const hg = nullableInt('hg'), ag = nullableInt('ag'), hp = nullableInt('hp'), ap = nullableInt('ap');
  if((hg===null)!==(ag===null)) throw new Error('Preencha os dois lados do placar.');
  if((hp===null)!==(ap===null)) throw new Error('Preencha ambos os lados do desempate por pênaltis.');
  if(hp!==null && hg===null) throw new Error('Informe o placar normal antes dos pênaltis.');
  if(hp!==null && hp===ap) throw new Error('O desempate por pênaltis precisa de vencedor.');
  if(hp!==null && !m.tie) throw new Error('Pênaltis não são aplicáveis a partidas de pontos corridos.');
  if(hp!==null && m.tie && c.matches.filter(x => x.tie===m.tie).length===2 && m.leg!==2) throw new Error('Em ida e volta, informe os pênaltis apenas na volta.');
  m.hg = hg; m.ag = ag; m.hp = hp; m.ap = ap; m.date = String(data.get('date') || '');
  if(c.key!=='brasileirao' && !(c.key==='paulista'&&m.stage==='league'))m.round = Math.max(1, Math.floor(Number(data.get('round')) || 1));
  for(const k of ['hy','ay','hr','ar']){
    const v = data.get(k);
    m[k] = v===null ? m[k] : Math.max(0, Math.min(99, Math.floor(Number(v)||0)));
  }
  modal = null;
}

function applyKnownClub(team, name, short){
  const originalShort = short ? String(short).trim().toUpperCase() : '';
  applyClubIdentity(team, name);
  if(originalShort) team.short = originalShort;
}

function onClick(event){
  const btn = event.target.closest('[data-action]');
  if(!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value;
  if(action==='close-modal'){ if(event.target.closest('.modal') && event.target!==btn) return; modal = null; render(); return; }
  if(action==='league'){ brRankingFilter='all';copaStatusFilter='all';rankingFilter='all'; state.active = value; state.tab = 'overview'; libGroupFilter='all';libMatchGroup='all';libTieFilter=''; selectedStage = null; selectedRound = null; filter = ''; modal = null; save(); render(); return; }
  if(action==='tab'){ if(state.active==='brasileirao'&&value==='bracket')return;libMatchGroup='all';libTieFilter=''; state.tab = value; selectedStage = null; selectedRound = null; filter = ''; save(); render(); return; }
  if(action==='edit-match'){ modal = {type:'match', id:value}; render(); return; }
  if(action==='edit-team'){ modal = {type:'team', id:value}; render(); return; }
  if(action==='bulk-teams'){ modal = {type:'bulk', kind:null}; render(); return; }
  if(action==='ranking-filter'){ rankingFilter = ['all','qualified','relegated'].includes(value)?value:'all'; render(); return; }
  if(action==='view-club'){ modal={type:'club-profile',id:value}; render(); return; }
  if(action==='club-games'){ const team=t(get(),value); if(!team)return; state.tab='matches'; selectedStage='league'; selectedRound=null; filter=team.name; modal=null; save(); render(); return; }
  if(action==='promotion'){ modal = {type:'promotion'}; render(); return; }
  if(action==='br-filter'){
    if(state.active!=='brasileirao')return;
    brRankingFilter=['all','g4','g6','sula','z4'].includes(value)?value:'all';render();return;
  }
  if(action==='br-team-games'){
    if(state.active!=='brasileirao')return;
    const team=t(get(),value);if(!team)return;
    state.tab='matches';selectedStage='league';selectedRound=null;filter=team.name;save();render();return;
  }
  if(action==='paulista-redraw'){
    const c=get();if(c.key!=='paulista')return;
    if(c.advanced?.length||c.matches.some(m=>m.stage!=='league')){
      requestNotice('Não é possível refazer a primeira fase após gerar o mata-mata. Restaure um backup anterior para alterar o calendário.',true);return;
    }
    const games=activeMatches(c,'league'),done=games.filter(played).length,dates=games.filter(m=>m.date).length;
    if(done||dates){
      if(!confirm(`O novo calendário do Paulistão apagará ${done} placares e ${dates} datas da primeira fase, além de cartões e horários. Os clubes, os adversários definidos e as outras competições serão preservados. Continuar?`))return;
      if(!confirm('Confirma definitivamente a substituição das 64 partidas do Paulistão? Exporte um backup JSON antes de prosseguir caso precise recuperar resultados.'))return;
    }else if(!confirm('Embaralhar os confrontos do Paulistão em 8 rodadas, mantendo os 64 pares de adversários e a alternância de mandos (4 casa, 4 fora; máximo 2 jogos seguidos fora)?'))return;
    try{
      const next=redrawPaulistaCalendar(c);
      selectedStage='league';selectedRound=null;filter='';modal=null;
      save();requestNotice(`Novo calendário do Paulistão gerado: ${next.length} partidas em 8 rodadas, sem três visitas consecutivas.`);
    }catch(err){requestNotice(err?.message||'Erro ao refazer o calendário do Paulistão.',true);}
    return;
  }
  if(action==='br-redraw'){
    const c=get();if(c.key!=='brasileirao')return;
    const playedCount=c.matches.filter(played).length;
    const scheduleCount=c.matches.filter(m=>m.date).length;
    if(playedCount||scheduleCount){
      if(!confirm(`O novo calendário do Brasileirão substituirá todas as 380 partidas, apagando ${playedCount} resultados e ${scheduleCount} datas cadastradas. Clubes e outros campeonatos serão preservados. Deseja continuar?`))return;
      if(!confirm('Confirma a perda dos placares, cartões, horários e mandos do Brasileirão? Exporte o backup JSON antes de prosseguir.'))return;
    }else if(!confirm('Refazer o calendário administrativo da Série A com novos confrontos e mandos, em 38 rodadas, sem mais de 2 jogos consecutivos fora de casa?'))return;
    try{
      const next=redrawBrasileiraoCalendar(c);
      selectedStage='league';selectedRound=null;filter='';
      save();requestNotice(`Novo calendário gerado: ${next.length} jogos, 38 rodadas, até duas viagens consecutivas por clube.`);
    }catch(err){requestNotice(err?.message||'Erro ao gerar calendário.',true);}
    return;
  }
  if(action==='copa-filter'){if(state.active!=='copa')return;copaStatusFilter=['all','qualified','live','eliminated'].includes(value)?value:'all';render();return;}
  if(action==='copa-tie-games'){
    if(state.active!=='copa')return;
    const m=get().matches.find(x=>x.id===value);
    if(!m)return;
    state.tab='matches';selectedStage=m.stage;selectedRound=null;
    filter='';libTieFilter=m.tie||m.id;save();render();return;
  }
  if(action==='copa-draw'){
    const c=get();if(c.key!=='copa'||c.mode!=='reduced-2026')return;
    const current=currentStage(c), games=activeMatches(c,current);
    if(!games.length){requestNotice('Não há confrontos disponíveis nesta etapa.',true);return;}
    const hasResults=games.some(played),hasDates=games.some(m=>m.date);
    if(hasResults){
      if(!confirm(`Atenção: o novo sorteio irá APAGAR os ${games.filter(played).length} placares da fase ${stageLabel(current)}, além de datas, cartões e pênaltis cadastrados nela. As fases anteriores e os outros campeonatos não serão alterados. Continuar?`))return;
      if(!confirm('Confirma definitivamente descartar os resultados da fase atual e embaralhar os times? Exporte um backup antes, se precisar recuperá-los.'))return;
    }else if(!confirm(`Refazer o sorteio administrativo da fase ${stageLabel(current)}? ${hasDates?'As datas e mandos dessa fase serão redefinidos.':'Serão gerados novos confrontos.'} As outras competições não serão alteradas.`))return;
    try{
      const next=redrawCopaStage(c);
      selectedStage=current;selectedRound=null;filter='';libTieFilter='';
      save();requestNotice(`Sorteio realizado: ${next.length} partidas, ${new Set(next.map(m=>m.tie)).size} confrontos.`);
    }catch(err){requestNotice(err?.message||'Não foi possível realizar o sorteio.',true);}
    return;
  }
  if(action==='swap-home'){ mutate(() => { const m = get().matches.find(x => x.id===value);if(get().key==='paulista'&&m?.stage==='league')throw new Error('Mando da primeira fase bloqueado para preservar a alternância. Use Refazer calendário.'); if(!m || played(m)) throw new Error('Somente jogos sem resultado podem inverter o mando.'); [m.home,m.away] = [m.away,m.home]; if(get().key==='brasileirao'&&!validateBrasileiraoCalendar(get().matches,get().teams.map(t=>t.id))){[m.home,m.away]=[m.away,m.home];throw new Error('Este mando deixaria um clube com três jogos seguidos fora de casa ou quebraria o turno/returno. Use Refazer calendário para manter a alternância.');} modal = {type:'match', id:m.id}; }); return; }
  if(action==='clear-match'){ if(!confirm('Limpar o resultado e o desempate desta partida?')) return; mutate(() => { const m = get().matches.find(x => x.id===value); if(get().advanced.includes(m.stage)) throw new Error('Fase encerrada'); m.hg = null; m.ag = null; m.hp = null; m.ap = null; modal = null; }); return; }
  if(action==='lib-group' || action==='lib-group-filter'){
    if(state.active!=='libertadores')return;
    libGroupFilter=value||'all';
    state.tab='standings'; selectedStage=null; selectedRound=null; save(); render(); return;
  }
  if(action==='lib-view-all'){if(state.active!=='libertadores')return;libGroupFilter='all';state.tab='standings';save();render();return;}
  if(action==='lib-club-filter'){if(state.active!=='libertadores')return;libGroupFilter=groups.includes(value)?value:'all';render();return;}
  if(action==='lib-group-games'){if(state.active!=='libertadores')return;libTieFilter='';state.tab='matches';selectedStage='groups';selectedRound=null;filter='';libMatchGroup=groups.includes(value)?value:'all';save();render();return;}
  if(action==='lib-club-games'){const club=t(get(),value);if(!club)return;libTieFilter='';state.tab='matches';selectedStage='groups';selectedRound=null;filter=club.name;libMatchGroup='all';save();render();return;}
  if(action==='lib-tie-games'){const entry=get().matches.find(m=>m.id===value);if(!entry)return;state.tab='matches';selectedStage=entry.stage;selectedRound=null;filter='';libMatchGroup='all';libTieFilter=entry.tie||entry.id;save();render();return;}

  if(action==='lib-draw-groups'){
    if(state.active!=='libertadores')return;
    if(!confirm('Sortear novamente os 32 clubes da Libertadores por potes, respeitando as restrições de país do regulamento? Isso substituirá somente os dados da Libertadores e apagará seus resultados atuais. Faça backup antes.'))return;
    try {
      const sorteio=createLibertadoresDrawnGroups();
      state.data.libertadores=sorteio;
      state.tab='clubs';libGroupFilter='all';selectedStage=null;selectedRound=null;filter='';
      save();
      requestNotice('Novo sorteio realizado: 8 grupos, 4 clubes por grupo e 96 jogos gerados.');
    } catch (err) {requestNotice(err?.message || 'Falha ao embaralhar os grupos.',true);}
    return;
  }
  if(action==='official-groups'){
    if(state.active!=='libertadores')return;
    if(!confirm('Carregar os 32 participantes oficiais dos grupos 2026? Os dados atuais da Libertadores serão substituídos. Faça backup antes.'))return;
    mutate(()=>{state.data.libertadores=createLibertadoresOfficialGroups();state.tab='clubs';libGroupFilter='all';selectedStage=null;selectedRound=null;});return;
  }
  if(action==='lib-qualifiers'){
    if(state.active!=='libertadores')return;
    if(!confirm('Reiniciar a Libertadores com os 47 clubes reais inscritos em 2026? Isso substituirá os dados da Libertadores atual. Faça backup antes.'))return;
    mutate(()=>{state.data.libertadores=createCompetition('libertadores');state.tab='clubs';libGroupFilter='all';selectedStage=null;selectedRound=null;});return;
  }
  if(action==='advance'){ const c = get(), stage = currentStage(c); if(!stageReady(c,stage)){ requestNotice('Fase incompleta: confira placares e pênaltis.', true); return; } if(!confirm(`Gerar a próxima fase após ${stageLabel(stage)}? A etapa atual ficará bloqueada.`)) return; mutate(() => { advance(get()); state.tab = 'matches'; selectedStage = null; selectedRound = null; }); return; }
  if(action==='export'){ download('central-de-campeonatos-2026-backup.json', JSON.stringify({...state, exportedAt:new Date().toISOString()}, null, 2)); return; }
  if(action==='csv-standings'){ exportStandings(); return; }
  if(action==='csv-matches'){ exportMatches(); return; }
  if(action==='reset'){ if(!confirm(`ATENÇÃO: você perderá os dados salvos de ${INFO[state.active].short}. Faça backup antes. Reiniciar?`)) return; if(!confirm('Confirmar definitivamente a reinicialização desta competição?')) return; mutate(() => { state.data[state.active] = state.active==='libertadores'?createLibertadoresDrawnGroups():createCompetition(state.active); state.tab = 'overview'; selectedStage = null; selectedRound = null; }); return; }
}

function onChange(e){
  const el = e.target;
  const c = get();
  if(el.id==='stage-select'){ libTieFilter='';libMatchGroup='all'; selectedStage = el.value; selectedRound = null; filter = ''; render(); return; }
  if(el.id==='round-select'){ selectedRound = el.value ? Number(el.value) : null; render(); return; }
  if(el.id==='bulk-kind'){ modal.kind = el.value; render(); return; }
  if(el.id==='final-legs'){ mutate(() => { if(c.key!=='paulista' || c.advanced.includes('semis')) throw new Error('A final já foi gerada.'); c.finalLegs = Number(el.value); }); return; }
  if(el.id==='import-json' && el.files?.length){
    const f = el.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if(payload.version!==1 || !payload.data || KEYS.some(k => !Array.isArray(payload.data[k]?.teams) || !Array.isArray(payload.data[k]?.matches))) throw new Error('Arquivo incompatível.');
        if(!confirm('Substituir todos os dados locais pelo conteúdo deste backup?')) return;
        state = {version:1, active:KEYS.includes(payload.active)?payload.active:'paulista', tab:'overview', data:enrichAllCompetitions(payload.data)};
        selectedStage = null; modal = null; save(); requestNotice('Backup restaurado com sucesso.');
      } catch(err){ requestNotice('Falha ao importar: ' + err.message, true); }
    };
    reader.readAsText(f);
    return;
  }
}

function onSubmit(e){
  if(!['match-form','team-form','bulk-form','promotion-form'].includes(e.target.id)) return;
  e.preventDefault();
  const form = e.target;
  if(form.id==='match-form'){ mutate(() => editMatch(form)); return; }
  if(form.id==='team-form'){
    mutate(() => {
      const data = new FormData(form);
      const team = get().teams.find(x => x.id===form.dataset.id);
      const preset = String(data.get('preset') || '').trim();
      const name = String(data.get('name') || '').trim();
      const chosenName = preset || name;
      const short = String(data.get('short') || '').trim().toUpperCase();
      if(!chosenName || !short) throw new Error('Nome e sigla são obrigatórios.');
      if(get().teams.some(x => x.id!==team.id && x.name.toLowerCase()===chosenName.toLowerCase())) throw new Error('Já existe clube com este nome.');
      applyKnownClub(team, chosenName, short);
      const grp = data.get('group');
      if(grp && !activeMatches(get(),'groups').length) team.group = String(grp);
      modal = null;
    });
    return;
  }
  if(form.id==='bulk-form'){
    mutate(() => {
      const data = new FormData(form);
      const kind = String(data.get('kind'));
      const arr = kind==='all' ? get().teams : get().key==='libertadores' && get().teams.some(t=>t.kind==='official') ? get().teams.filter(t=>t.group===kind) : get().teams.filter(t=>t.kind===kind);
      const lines = String(data.get('names') || '').split(/\r?\n/).map(s => s.trim());
      if(lines.length !== arr.length || lines.some(v => !v)) throw new Error(`Informe exatamente ${arr.length} linhas não vazias.`);
      if(new Set(lines.map(x => x.toLowerCase())).size !== lines.length) throw new Error('Existem nomes duplicados.');
      arr.forEach((team, index) => applyKnownClub(team, lines[index], ''));
      modal = null;
    });
    return;
  }
  if(form.id==='promotion-form'){
    mutate(() => {
      const data = new FormData(form);
      const usedOut = new Set();
      const usedIn = new Set();
      let applied = 0;
      for(let i=0;i<4;i++){
        const out = String(data.get(`out-${i}`) || '').trim();
        const incoming = String(data.get(`in-${i}`) || '').trim();
        if(!out && !incoming) continue;
        if(!out || !incoming) throw new Error('Preencha ambos os lados de cada troca de acesso.');
        if(usedOut.has(out) || usedIn.has(incoming)) throw new Error('Não repita clubes nas trocas.');
        usedOut.add(out); usedIn.add(incoming);
        const team = get().teams.find(x => x.id===out);
        if(!team) throw new Error('Clube de saída não encontrado.');
        if(get().teams.some(x => x.id!==team.id && x.name.toLowerCase()===incoming.toLowerCase())) throw new Error(`O clube ${incoming} já está presente na Série A.`);
        applyKnownClub(team, incoming, '');
        applied++;
      }
      if(!applied) throw new Error('Selecione ao menos uma troca de acesso.');
      modal = null;
    });
    return;
  }
}

document.addEventListener('click', onClick);
document.addEventListener('change', onChange);
document.addEventListener('submit', onSubmit);
document.addEventListener('input', e => {
  if(e.target.id==='search-games'){ filter = e.target.value; render(); }
});
document.addEventListener('keydown', e => { if(e.key==='Escape' && modal){ modal = null; render(); } });

save();
render();
