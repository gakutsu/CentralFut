export const KEYS = ['paulista', 'libertadores', 'copa', 'brasileirao'];
export const INFO = {
 paulista:{name:'Campeonato Paulista',short:'Paulistão',symbol:'SP',theme:'orange',total:16,subtitle:'16 clubes · 8 jogos · quartas, semifinal e final',identity:'Pontos corridos com mata-mata estadual',url:'https://futebolpaulista.com.br/Repositorio/Competicao/Regulamento/1551/1551_639002025107690404.pdf'},
 libertadores:{name:'CONMEBOL Libertadores',short:'Libertadores',symbol:'LIB',theme:'blue',total:47,subtitle:'32 clubes nos 8 grupos oficiais · 47 inscritos ao todo · temporada 2026',identity:'A glória eterna começa aqui',url:'https://cdn.conmebol.com/wp-content/uploads/2025/12/CL-2026-Manual-de-Clubes-POR.pdf'},
 copa:{name:'Copa Betano do Brasil',short:'Copa do Brasil',symbol:'CB',theme:'green',total:32,subtitle:'32 clubes · 20 da Série A + 12 da Série B · mata-mata nacional',identity:'Mata-mata nacional · identidade temática',url:'https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/REC_Copa_do_Brasil_2026_66989a5426.pdf'},
 brasileirao:{name:'Campeonato Brasileiro Série A',short:'Brasileirão',symbol:'BR',theme:'yellow',total:20,subtitle:'20 clubes · turno e returno · 38 rodadas',identity:'Pontos corridos com 38 rodadas',url:'https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/REC_Brasileiro_Serie_A_2026_c984f8cf05.pdf'}
};
export const BR = ['Athletico-PR','Atlético-MG','Bahia','Botafogo','Chapecoense','Corinthians','Coritiba','Cruzeiro','Flamengo','Fluminense','Grêmio','Internacional','Mirassol','Palmeiras','Red Bull Bragantino','Remo','Santos','São Paulo','Vasco','Vitória'];
export const SERIE_B_OPTIONS = ['América-MG','Athletic Club','Avaí','Botafogo-SP','Ceará','CRB','Criciúma','Cuiabá','Ferroviária','Goiás','Novorizontino','Operário-PR','Ponte Preta','Paysandu','Sport','Vila Nova','Coritiba','Guarani','Juventude','Amazonas'];
export const COPA_SERIE_B_2026 = ['América-MG','Athletic Club','Avaí','Botafogo-SP','Ceará','CRB','Criciúma','Cuiabá','Ferroviária','Goiás','Novorizontino','Operário-PR'];
export const LIB_OFFICIAL_2026 = {
 A:['Flamengo','Estudiantes','Cusco','Independiente Medellín'],
 B:['Nacional-URU','Universitario','Coquimbo Unido','Deportes Tolima'],
 C:['Fluminense','Bolívar','Deportivo La Guaira','Independiente Rivadavia'],
 D:['Boca Juniors','Cruzeiro','Universidad Católica','Barcelona-EQU'],
 E:['Peñarol','Corinthians','Independiente Santa Fe','Platense'],
 F:['Palmeiras','Cerro Porteño','Junior Barranquilla','Sporting Cristal'],
 G:['LDU Quito','Lanús','Always Ready','Mirassol'],
 H:['Independiente del Valle','Libertad','Rosario Central','Universidad Central']
};
// Participantes e entrada por fase conferidos para a edição de 2026.
export const LIB_PRE1_2026 = ['The Strongest','Deportivo Táchira','2 de Mayo','Alianza Lima','Juventud-URU','Universidad Católica-EQU'];
export const LIB_PRE2_2026 = ['Guaraní-PAR','Deportes Tolima','Sporting Cristal','Barcelona-EQU','Argentinos Juniors','Nacional Potosí','Botafogo','Carabobo','Huachipato','O’Higgins','Bahia','Liverpool-URU','Independiente Medellín'];
// Os quatro vencedores das preliminares de 2026: DIM (A), Tolima (B), Barcelona (D), Sporting Cristal (F).
export const LIB_QUALIFIED_PRE3_2026 = ['Independiente Medellín','Deportes Tolima','Barcelona-EQU','Sporting Cristal'];
export const LIB_COUNTRIES = {
 'Flamengo':'BR','Fluminense':'BR','Cruzeiro':'BR','Corinthians':'BR','Palmeiras':'BR','Mirassol':'BR','Bahia':'BR','Botafogo':'BR',
 'Estudiantes':'AR','Independiente Rivadavia':'AR','Boca Juniors':'AR','Platense':'AR','Lanús':'AR','Rosario Central':'AR','Argentinos Juniors':'AR',
 'Cusco':'PE','Universitario':'PE','Sporting Cristal':'PE','Alianza Lima':'PE',
 'Independiente Medellín':'CO','Deportes Tolima':'CO','Independiente Santa Fe':'CO','Junior Barranquilla':'CO',
 'Nacional-URU':'UY','Peñarol':'UY','Juventud-URU':'UY','Liverpool-URU':'UY',
 'Coquimbo Unido':'CL','Universidad Católica':'CL','Huachipato':'CL','O’Higgins':'CL',
 'Bolívar':'BO','Always Ready':'BO','The Strongest':'BO','Nacional Potosí':'BO',
 'Deportivo La Guaira':'VE','Universidad Central':'VE','Deportivo Táchira':'VE','Carabobo':'VE',
 'Barcelona-EQU':'EC','LDU Quito':'EC','Independiente del Valle':'EC','Universidad Católica-EQU':'EC',
 'Cerro Porteño':'PY','Libertad':'PY','2 de Mayo':'PY','Guaraní-PAR':'PY'
};
export const LIB_COUNTRY_LABELS = {BR:'Brasil',AR:'Argentina',PE:'Peru',CO:'Colômbia',UY:'Uruguai',CL:'Chile',BO:'Bolívia',VE:'Venezuela',EC:'Equador',PY:'Paraguai'};
export const LIB_DIRECT_2026 = Object.entries(LIB_OFFICIAL_2026).flatMap(([group,names])=>names.filter(name=>!LIB_QUALIFIED_PRE3_2026.includes(name)).map(name=>({name,group})));
export const LIB_POTS_2026 = [0,1,2,3].map(index=>'ABCDEFGH'.split('').map(group=>LIB_OFFICIAL_2026[group][index]));
export const PAULISTA = ['Corinthians','Palmeiras','São Paulo','Santos','São Bernardo','Novorizontino','Red Bull Bragantino','Mirassol','Ponte Preta','Guarani','Velo Clube','Portuguesa','Noroeste','Botafogo-SP','Capivariano','Primavera'];

const LOGO_BASE='https://assets.footylogos.com/logos';
const logo=(slug,ext='svg')=>`${LOGO_BASE}/${slug}/${slug}-logo-footylogos.${ext}`;
const commons=file=>`https://commons.wikimedia.org/wiki/Special:Redirect/file/${file}`;
const CLUBS = {
 'Athletico-PR':{short:'CAP',logo:logo('athletico-paranaense')},
 'Atlético-MG':{short:'CAM',logo:logo('atletico-mineiro')},
 'Bahia':{short:'BAH',logo:logo('bahia')},
 'Botafogo':{short:'BOT',logo:logo('botafogo')},
 'Chapecoense':{short:'CHA',logo:logo('chapecoense')},
 'Corinthians':{short:'COR',logo:logo('corinthians')},
 'Coritiba':{short:'CFC',logo:logo('coritiba')},
 'Cruzeiro':{short:'CRU',logo:logo('cruzeiro')},
 'Flamengo':{short:'FLA',logo:logo('flamengo')},
 'Fluminense':{short:'FLU',logo:logo('fluminense')},
 'Grêmio':{short:'GRE',logo:logo('gremio')},
 'Internacional':{short:'INT',logo:logo('sc-internacional')},
 'Mirassol':{short:'MIR',logo:commons('Mirassol_Futebol_Clube_logo.svg')},
 'Palmeiras':{short:'PAL',logo:logo('palmeiras')},
 'Red Bull Bragantino':{short:'RBB',logo:logo('rb-bragantino')},
 'Remo':{short:'REM',logo:commons('Escudo_oficial_do_Clube_do_Remo.png')},
 'Santos':{short:'SAN',logo:logo('santos-fc')},
 'São Paulo':{short:'SAO',logo:logo('sao-paulo')},
 'Vasco':{short:'VAS',logo:logo('vasco-da-gama')},
 'Vitória':{short:'VIT',logo:logo('vitoria')},
 'São Bernardo':{short:'SBE',logo:logo('sao-bernardo')},
 'Novorizontino':{short:'NOV',logo:commons('Gr%C3%AAmio_Novorizontino.svg')},
 'Ponte Preta':{short:'PON',logo:logo('ponte-preta')},
 'Guarani':{short:'GUA',logo:logo('guarani')},
 'Velo Clube':{short:'VEL',logo:'assets/velo-clube-oficial-v2.png'},
 'Portuguesa':{short:'LUS',logo:commons('Associa%C3%A7%C3%A3o_Portuguesa_de_Desportos.svg')},
 'Noroeste':{short:'NOR',logo:commons('Esporte_Clube_Noroeste.svg')},
 'Botafogo-SP':{short:'BSP',logo:logo('botafogo-sp')},
 'Capivariano':{short:'CAPV',logo:commons('Capivariano_FC.png')},
 'Primavera':{short:'PRI',logo:commons('Esporte_Clube_Primavera.png')},
 'Paysandu':{short:'PAY',logo:logo('paysandu')},
 'Confiança':{short:'CON',logo:logo('confianca')},
 'Barra':{short:'BAR',logo:logo('barra-sc')},
 'Estudiantes':{short:'EST',logo:logo('estudiantes-de-la-plata')},
 'Cusco':{short:'CUS',logo:logo('cusco', 'png')},
 'Independiente Medellín':{short:'DIM',logo:logo('independiente-medellin')},
 'Nacional-URU':{short:'NAC',logo:logo('nacional')},
 'Universitario':{short:'UNI',logo:'https://upload.wikimedia.org/wikipedia/commons/7/77/Logo_oficial_de_Universitario.svg'},
 'Coquimbo Unido':{short:'COQ',logo:logo('coquimbo-unido')},
 'Deportes Tolima':{short:'TOL',logo:logo('deportes-tolima')},
 'Bolívar':{short:'BOL',logo:logo('bolivar')},
 'Deportivo La Guaira':{short:'DLG',logo:logo('deportivo-la-guaira','png')},
 'Independiente Rivadavia':{short:'IRI',logo:logo('independiente-rivadavia')},
 'Boca Juniors':{short:'BOC',logo:logo('boca-juniors')},
 'Universidad Católica':{short:'UCA',logo:logo('universidad-catolica')},
 'Barcelona-EQU':{short:'BAR',logo:logo('barcelona-sc-guayaquil')},
 'Peñarol':{short:'PEN',logo:logo('penarol')},
 'Independiente Santa Fe':{short:'SFE',logo:logo('independiente-santa-fe')},
 'Platense':{short:'PLA',logo:'https://upload.wikimedia.org/wikipedia/commons/d/db/Club_Alt%C3%A9tico_Platense_crest_%282025%29.svg'},
 'Cerro Porteño':{short:'CER',logo:logo('cerro-porteno')},
 'Junior Barranquilla':{short:'JUN',logo:logo('atletico-junior')},
 'Sporting Cristal':{short:'SCR',logo:logo('sporting-cristal')},
 'LDU Quito':{short:'LDU',logo:logo('ldu-quito')},
 'Lanús':{short:'LAN',logo:logo('lanus')},
 'Always Ready':{short:'ALW',logo:logo('always-ready','png')},
 'Independiente del Valle':{short:'IDV',logo:logo('independiente-del-valle')},
 'Libertad':{short:'LIB',logo:commons('Club_Libertad.png')},
 'Rosario Central':{short:'ROS',logo:logo('rosario-central')},
 'Universidad Central':{short:'UCE',logo:logo('universidad-central','png')},

 'The Strongest':{short:'STR',logo:logo('the-strongest')},
 'Deportivo Táchira':{short:'TAC',logo:logo('deportivo-tachira')},
 '2 de Mayo':{short:'2DM',logo:logo('2-de-mayo')},
 'Alianza Lima':{short:'ALI',logo:logo('alianza-lima')},
 'Juventud-URU':{short:'JUV',logo:logo('juventud-las-piedras')},
 'Universidad Católica-EQU':{short:'UCE',logo:logo('universidad-catolica-ecuador')},
 'Guaraní-PAR':{short:'GUA',logo:logo('club-guarani')},
 'Argentinos Juniors':{short:'ARG',logo:logo('argentinos-juniors')},
 'Nacional Potosí':{short:'NPO',logo:logo('nacional-potosi')},
 'Carabobo':{short:'CAR',logo:logo('carabobo')},
 'Huachipato':{short:'HUA',logo:logo('huachipato')},
 'O’Higgins':{short:'OHI',logo:logo('ohiggins')},
 'Liverpool-URU':{short:'LIV',logo:logo('liverpool-montevideo')},

 'América-MG':{short:'AMG',logo:logo('america-mineiro')},
 'Athletic Club':{short:'ATH',logo:commons('Athletic_Club_%28Minas_Gerais%29.svg')},
 'Avaí':{short:'AVA',logo:commons('Ava%C3%AD_Futebol_Clube_logo.svg')},
 'Ceará':{short:'CEA',logo:commons('Cear%C3%A1_Sporting_Club_logo.svg')},
 'CRB':{short:'CRB',logo:logo('crb')},
 'Criciúma':{short:'CRI',logo:logo('criciuma')},
 'Cuiabá':{short:'CUI',logo:logo('cuiaba')},
 'Ferroviária':{short:'FER',logo:logo('ferroviaria')},
 'Goiás':{short:'GOI',logo:logo('goias')},
 'Operário-PR':{short:'OPE',logo:logo('operario-ferroviario')},
 'Sport':{short:'SPT',logo:logo('sport-recife')},
 'Vila Nova':{short:'VNO',logo:logo('vila-nova')},
 'Juventude':{short:'JUV',logo:logo('juventude')},
 'Amazonas':{short:'AMZ',logo:logo('amazonas-fc')}
};
const ALIASES = {
 'Athletico Paranaense':'Athletico-PR','Atletico Paranaense':'Athletico-PR','Atlético Mineiro':'Atlético-MG',
 'Vasco da Gama':'Vasco','SC Internacional':'Internacional','Internacional RS':'Internacional','RB Bragantino':'Red Bull Bragantino',
 'Mirassol FC':'Mirassol','São Paulo (SPFC)':'São Paulo','Clube de Remo':'Remo', 'Junior':'Junior Barranquilla',
 'Atletico Junior':'Junior Barranquilla', 'Estudiantes de La Plata':'Estudiantes', 'Barcelona SC Guayaquil':'Barcelona-EQU',
 'Club Libertad':'Libertad', 'LDU Quito (Liga de Quito)':'LDU Quito', 'Nacional':'Nacional-URU', 'Club Atlético Platense':'Platense'
};
export function canonicalClubName(name=''){const clean=String(name||'').trim();return ALIASES[clean]||clean;}
export function clubMeta(name=''){return CLUBS[canonicalClubName(name)]||null;}
export function libCountry(name=''){return LIB_COUNTRIES[canonicalClubName(name)] || '';}

export function applyClubIdentity(target,name){
 const canonical=canonicalClubName(name); const meta=clubMeta(canonical) || {};
 target.name=canonical;
 target.short=meta.short || canonical.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]/g,'').slice(0,3).toUpperCase() || 'CLB';
 target.logo=meta.logo || target.logo || '';
 if(LIB_COUNTRIES[canonical]) target.country=LIB_COUNTRIES[canonical];
 target.placeholder=false;
 return target;
}
export const CLUB_LIBRARY = Array.from(new Set([...BR,...PAULISTA,...SERIE_B_OPTIONS,...Object.keys(CLUBS)])).sort((a,b)=>String(a).localeCompare(String(b),'pt-BR'));
export const PAULISTA_OPP = {
 'Corinthians':'Santos,Palmeiras,São Paulo,Red Bull Bragantino,São Bernardo,Velo Clube,Ponte Preta,Capivariano',
 'Palmeiras':'Santos,São Paulo,Corinthians,Novorizontino,Mirassol,Guarani,Portuguesa,Botafogo-SP',
 'São Paulo':'Santos,Palmeiras,Corinthians,Mirassol,São Bernardo,Portuguesa,Ponte Preta,Primavera',
 'Santos':'Palmeiras,São Paulo,Corinthians,Red Bull Bragantino,Novorizontino,Velo Clube,Guarani,Noroeste',
 'São Bernardo':'Red Bull Bragantino,Novorizontino,Mirassol,São Paulo,Corinthians,Ponte Preta,Noroeste,Capivariano',
 'Novorizontino':'Santos,Palmeiras,Red Bull Bragantino,Mirassol,São Bernardo,Guarani,Botafogo-SP,Primavera',
 'Red Bull Bragantino':'Santos,Corinthians,Novorizontino,Mirassol,São Bernardo,Velo Clube,Noroeste,Botafogo-SP',
 'Mirassol':'Palmeiras,São Paulo,Red Bull Bragantino,Novorizontino,São Bernardo,Portuguesa,Primavera,Capivariano',
 'Ponte Preta':'Velo Clube,Guarani,Portuguesa,São Paulo,Corinthians,São Bernardo,Capivariano,Noroeste',
 'Guarani':'Velo Clube,Portuguesa,Ponte Preta,Santos,Palmeiras,Novorizontino,Botafogo-SP,Primavera',
 'Velo Clube':'Guarani,Portuguesa,Ponte Preta,Santos,Corinthians,Red Bull Bragantino,Noroeste,Botafogo-SP',
 'Portuguesa':'Velo Clube,Guarani,Ponte Preta,Palmeiras,São Paulo,Mirassol,Primavera,Capivariano',
 'Noroeste':'Botafogo-SP,Primavera,Capivariano,Santos,Red Bull Bragantino,São Bernardo,Velo Clube,Ponte Preta',
 'Botafogo-SP':'Noroeste,Primavera,Capivariano,Palmeiras,Red Bull Bragantino,Novorizontino,Velo Clube,Guarani',
 'Capivariano':'Noroeste,Botafogo-SP,Primavera,Corinthians,Mirassol,São Bernardo,Portuguesa,Ponte Preta',
 'Primavera':'Noroeste,Botafogo-SP,Capivariano,São Paulo,Novorizontino,Mirassol,Guarani,Portuguesa'
};
let counter = 0;
const uid = (prefix='id') => `${prefix}-${++counter}-${Math.random().toString(36).slice(2,8)}`;
export function team(name, kind='', extra={}){const canonical=canonicalClubName(name);const meta=clubMeta(canonical)||{};return {id:uid('t'),name:canonical,country:LIB_COUNTRIES[canonical]||'',short:extra.short||meta.short||canonical.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]/g,'').slice(0,3).toUpperCase(),logo:extra.logo===undefined?(meta.logo||''):extra.logo,kind,...extra};}
export function match(home,away,stage,round=1,leg=1,extra={}){return {id:uid('m'),home,away,stage,round,leg,hg:null,ag:null,hp:null,ap:null,hy:0,ay:0,hr:0,ar:0,date:'',...extra};}
export const played = m=>Number.isInteger(m.hg)&&Number.isInteger(m.ag);
export function scheduleLeague(ids, double=true, stage='league'){
 const all=[...ids]; if(all.length%2)all.push(null); const n=all.length, rounds=[];let ordered=[...all];
 for(let r=0;r<n-1;r++){
  const fixtures=[];
  for(let k=0;k<n/2;k++){
   const a=ordered[k],b=ordered[n-1-k]; if(a&&b){ const h=(r+k)%2===0?a:b, v=h===a?b:a; fixtures.push(match(h,v,stage,r+1)); }
  }rounds.push(fixtures);
  ordered=[ordered[0],ordered[n-1],...ordered.slice(1,n-1)];
 }
 if(double){ const second=rounds.map((fixtures,r)=>fixtures.map(m=>match(m.away,m.home,stage,r+rounds.length+1,2))); rounds.push(...second); }
 return rounds.flat();
}
/**
 * Calendário administrativo da Série A em 38 rodadas.
 * 19 rodadas de emparelhamento circular, com orientações Berger (sem três
 * mandos consecutivos iguais); returno com mando invertido e rotação ímpar.
 * Garante 19 mandos + 19 visitas por clube, todos os 380 jogos e no máximo
 * duas partidas seguidas fora ou em casa, inclusive na virada do turno.
 */
export function scheduleBrasileirao(ids, random=Math.random){
 if(ids.length!==20 || new Set(ids).size!==20) throw Error('O calendário da Série A exige 20 clubes distintos.');
 const ordered=[...ids];
 for(let i=ordered.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[ordered[i],ordered[j]]=[ordered[j],ordered[i]];}
 let rotating=ordered.slice();
 const first=[];
 for(let r=0;r<19;r++){
  const fixtures=[];
  for(let k=0;k<10;k++){
   const a=rotating[k],b=rotating[19-k];
   const reverse=k===0 ? r%2===1 : k%2===1;
   fixtures.push(reverse ? [b,a] : [a,b]);
  }
  first.push(fixtures);
  rotating=[rotating[0],rotating[19],...rotating.slice(1,19)];
 }
 // A rotação ímpar do returno elimina a sequência de três mandos
 // na transição entre as rodadas 19 e 20.
 const shifts=[1,3,5,7,9,11,13,15,17];
 const offset=shifts[Math.min(shifts.length-1,Math.max(0,Math.floor(random()*shifts.length)))];
 const rounds=[...first,...Array.from({length:19},(_,r)=>first[(r+offset)%19].map(([a,b])=>[b,a]))];
 const matches=rounds.flatMap((fixtures, r)=>fixtures.map(([home,away])=>match(home,away,'league',r+1,r<19?1:2)));
 if(!validateBrasileiraoCalendar(matches,ids)) throw Error('Falha ao gerar calendário alternado. Tente refazer o sorteio.');
 return matches;
}
export function validateBrasileiraoCalendar(matches, ids){
 if(matches.length!==380||ids.length!==20||new Set(ids).size!==20) return false;
 const idSet=new Set(ids),pairCounts=new Map();
 const rounds=new Map(Array.from({length:38},(_,r)=>[r+1,[]]));
 for(const m of matches){
  if(!idSet.has(m.home)||!idSet.has(m.away)||m.home===m.away||!rounds.has(m.round))return false;
  const key=[m.home,m.away].sort().join('|');
  if(!pairCounts.has(key))pairCounts.set(key,[]);
  pairCounts.get(key).push(m.home);
  rounds.get(m.round).push(m);
 }
 if(pairCounts.size!==190||[...pairCounts.values()].some(a=>a.length!==2||a[0]===a[1]))return false;
 if([...rounds.values()].some(g=>g.length!==10||new Set(g.flatMap(m=>[m.home,m.away])).size!==20))return false;
 for(const id of ids){
  let away=0,home=0,totalH=0,totalA=0;
  for(let r=1;r<=38;r++){
   const m=rounds.get(r).find(x=>x.home===id||x.away===id);
   if(m.home===id){home++;away=0;totalH++;}else{away++;home=0;totalA++;}
   if(away>2||home>2)return false;
  }
  if(totalH!==19||totalA!==19)return false;
 }
 return true;
}
export function redrawBrasileiraoCalendar(c,random=Math.random){
 if(c.key!=='brasileirao') throw Error('O sorteio de calendário é exclusivo do Brasileirão.');
 const matches=scheduleBrasileirao(c.teams.map(t=>t.id),random);
 c.matches=matches;
 c.advanced=[];
 c.finalWinner=null;
 c.scheduleVersion=(c.scheduleVersion||0)+1;
 return matches;
}
// Encontra oito emparelhamentos, um por rodada, a partir dos confrontos sorteados pela FPF.
export function schedulePaulista(teams){
 const byName=Object.fromEntries(teams.map(t=>[t.name,t.id]));const edges=[];const seen=new Set();
 for(const [name, csv] of Object.entries(PAULISTA_OPP)) for(const opp of csv.split(',')){
  const a=byName[name],b=byName[opp];if(!a||!b)throw Error('Clube não encontrado na lista oficial');const key=[a,b].sort().join('::');if(!seen.has(key)){seen.add(key);edges.push([a,b]);}
 }
 if(edges.length!==64)throw Error('A lista da FPF deve produzir exatamente 64 jogos.');
 const rounds=[];let remaining=[...edges];
 for(let round=0;round<8;round++){
   // Escolhe partidas da rodada por busca com menor número de opções.
   const lookup=new Map(teams.map(t=>[t.id,[]]));for(const e of remaining){lookup.get(e[0]).push(e);lookup.get(e[1]).push(e);}
   const search=(used,picks)=>{
    if(picks.length===8)return picks;
    const open=teams.map(t=>t.id).filter(id=>!used.has(id)).sort((a,b)=>lookup.get(a).filter(e=>!used.has(e[0])&&!used.has(e[1])).length-lookup.get(b).filter(e=>!used.has(e[0])&&!used.has(e[1])).length);
    const id=open[0],choices=lookup.get(id).filter(e=>!used.has(e[0])&&!used.has(e[1]));
    for(const e of choices){const next=search(new Set([...used,...e]),[...picks,e]);if(next)return next;}return null;
   };
   const chosen=search(new Set(),[]);
   if(!chosen){ // Calendário administrativo: preserva integralmente a lista de confrontos sem inventar rodada oficial.
     return edges.map((e,i)=>match(e[i%2],e[(i+1)%2],'league',Math.floor(i/8)+1));
   }
   rounds.push(...chosen.map((e,i)=>match((i+round)%2?e[1]:e[0],(i+round)%2?e[0]:e[1],'league',round+1)));
   const keys=new Set(chosen.map(e=>e.slice().sort().join(':')));remaining=remaining.filter(e=>!keys.has(e.slice().sort().join(':')));
 }
 return rounds;
}
// Sorteio administrativo do Paulistão. Os 64 pares de adversários da FPF
// permanecem inalterados; somente rodadas e mandos são embaralhados.
// Cada rodada tem 8 partidas, cada clube joga uma vez por rodada e recebe
// 4 mandos / 4 visitas sem três mandos ou viagens consecutivas.
export function schedulePaulistaShuffled(teams, random=Math.random){
 if(teams.length!==16||new Set(teams.map(t=>t.id)).size!==16)
  throw Error('O Paulistão exige exatamente 16 clubes distintos.');
 // O vínculo regulatório é por inscrição, não pelo nome editado pelo usuário.
 const base=schedulePaulista(teams.map((t,i)=>({...t,name:PAULISTA[i]})));
 let rounds=Array.from({length:8},(_,r)=>base.filter(m=>m.round===r+1).map(m=>[m.home,m.away]));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;};
 rounds=shuffle(rounds);
 // Trocas de ciclos alternados entre duas rodadas preservam os oito jogos
 // por rodada, mas também alteram os adversários que se enfrentam nela.
 const ids=teams.map(t=>t.id);
 for(let pass=0;pass<24;pass++){
  const a=Math.floor(random()*8), b0=Math.floor(random()*7), b=b0>=a?b0+1:b0;
  const edges=[...rounds[a],...rounds[b]];
  const first=ids[Math.floor(random()*16)],component=new Set([first]),pending=[first];
  while(pending.length){const id=pending.pop();for(const [x,y] of edges){
   if(x===id&&!component.has(y)){component.add(y);pending.push(y);}
   if(y===id&&!component.has(x)){component.add(x);pending.push(x);}
  }}
  const outerA=rounds[a].filter(([x])=>!component.has(x)),innerA=rounds[a].filter(([x])=>component.has(x));
  const outerB=rounds[b].filter(([x])=>!component.has(x)),innerB=rounds[b].filter(([x])=>component.has(x));
  rounds[a]=[...outerA,...innerB];rounds[b]=[...outerB,...innerA];
 }
 // Cada clube recebe um padrão de mandos com 4 partidas em casa e 4 fora.
 // Atribuição por restrições: adversários sempre têm mandos opostos, e
 // ninguém joga três vezes seguidas no mesmo mando.
 const patterns=[];
 for(let pattern=0;pattern<256;pattern++){
  let homes=0,valid=true;
  for(let r=0;r<8;r++){
   homes+=(pattern>>r)&1;
   if(r>1 && ((pattern>>r)&1)===((pattern>>(r-1))&1) && ((pattern>>r)&1)===((pattern>>(r-2))&1))valid=false;
  }
  if(valid&&homes===4)patterns.push(pattern);
 }
 const pos=new Map(ids.map((id,i)=>[id,i]));const neighbors=ids.map(()=>[]);
 for(let r=0;r<8;r++)for(const [home,away] of rounds[r]){
  const a=pos.get(home),b=pos.get(away);neighbors[a].push([b,r]);neighbors[b].push([a,r]);
 }
 let explored=0;
 const solve=(domains,assigned)=>{
  if(++explored>50000)return null;
  let pick=-1,min=Infinity;
  for(let i=0;i<16;i++)if(assigned[i]<0 && domains[i].length<min){pick=i;min=domains[i].length;}
  if(pick<0)return assigned;
  if(min===0)return null;
  for(const option of shuffle(domains[pick])){
   const next=assigned.slice(),nextDomains=domains.slice();next[pick]=option;let valid=true;
   for(const [other,r] of neighbors[pick]){
    const required=1-((option>>r)&1);
    if(next[other]>=0){if(((next[other]>>r)&1)!==required){valid=false;break;}continue;}
    const filtered=nextDomains[other].filter(p=>((p>>r)&1)===required);
    if(!filtered.length){valid=false;break;}
    nextDomains[other]=filtered;
   }
   if(valid){const solution=solve(nextDomains,next);if(solution)return solution;}
  }
  return null;
 };
 const orientations=solve(ids.map(()=>patterns),ids.map(()=>-1));
 if(!orientations)throw Error('Não foi possível conciliar os mandos da FPF. Tente refazer o calendário.');
 const matches=rounds.flatMap((games,r)=>shuffle(games).map(([a,b])=>
  ((orientations[pos.get(a)]>>r)&1) ? match(a,b,'league',r+1) : match(b,a,'league',r+1)));
 if(!validatePaulistaCalendar(matches,teams))throw Error('A conferência do calendário do Paulistão falhou.');
 return matches;
}
export function validatePaulistaCalendar(matches,teams){
 if(teams.length!==16||matches.length!==64||new Set(teams.map(t=>t.id)).size!==16)return false;
 const ids=new Set(teams.map(t=>t.id));const pairCounts=new Map();const rounds=Array.from({length:8},()=>[]);
 for(const m of matches){
  if(m.stage!=='league'||!ids.has(m.home)||!ids.has(m.away)||m.home===m.away||!Number.isInteger(m.round)||m.round<1||m.round>8)return false;
  rounds[m.round-1].push(m);
  const key=[m.home,m.away].sort().join('|');pairCounts.set(key,(pairCounts.get(key)||0)+1);
 }
 if(pairCounts.size!==64||[...pairCounts.values()].some(x=>x!==1))return false;
 const expected=schedulePaulista(teams.map((t,i)=>({...t,name:PAULISTA[i]})));
 if(expected.length!==64||expected.some(m=>!pairCounts.has([m.home,m.away].sort().join('|'))))return false;
 if(rounds.some(list=>list.length!==8||new Set(list.flatMap(m=>[m.home,m.away])).size!==16))return false;
 for(const id of ids){
  let home=0,away=0,run=0,last=null;
  for(const round of rounds){
   const m=round.find(m=>m.home===id||m.away===id),type=m.home===id?'H':'A';
   if(type==='H')home++;else away++;
   run=type===last?run+1:1;last=type;
   if(run>2)return false;
  }
  if(home!==4||away!==4)return false;
 }
 return true;
}
export function redrawPaulistaCalendar(c, random=Math.random){
 if(c.key!=='paulista')throw Error('Calendário exclusivo do Paulistão.');
 if(c.advanced?.length || c.matches.some(m=>m.stage!=='league'))
  throw Error('As quartas já foram geradas. O calendário da primeira fase está bloqueado para preservar o mata-mata.');
 const old=c.matches.map(m=>[m.round,m.home,m.away].join('|')).sort().join(';');
 let matches;
 for(let attempt=0;attempt<8;attempt++){
  matches=schedulePaulistaShuffled(c.teams,random);
  const signature=matches.map(m=>[m.round,m.home,m.away].join('|')).sort().join(';');
  if(signature!==old)break;
 }
 c.matches=matches;c.finalWinner=null;c.scheduleVersion=(c.scheduleVersion||0)+1;
 return matches;
}
export function standings(teams,matches,mode='brasileirao'){
 const rows=teams.map(t=>({...t,j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,red:0,yellow:0})); const lookup=new Map(rows.map(t=>[t.id,t]));
 for(const m of matches.filter(played)){
  const h=lookup.get(m.home),a=lookup.get(m.away);if(!h||!a)continue;
  h.j++;a.j++;h.gp+=m.hg;h.gc+=m.ag;a.gp+=m.ag;a.gc+=m.hg;
  h.red+=Number(m.hr)||0;a.red+=Number(m.ar)||0;h.yellow+=Number(m.hy)||0;a.yellow+=Number(m.ay)||0;
  if(m.hg>m.ag){h.v++;a.d++;h.pts+=3;}else if(m.hg<m.ag){a.v++;h.d++;a.pts+=3;}else{h.e++;a.e++;h.pts++;a.pts++;}
 }
 rows.forEach(r=>r.sg=r.gp-r.gc);
 // Para a Libertadores a mini-tabela de confrontos diretos só se aplica entre clubes empatados em pontos.
 const miniCache=new Map();
 function mini(ids){const key=ids.slice().sort().join('|');if(!miniCache.has(key))miniCache.set(key,new Map(standingsSimple(rows.filter(t=>ids.includes(t.id)),matches).map(r=>[r.id,r])));return miniCache.get(key);}
 const byPts=new Map();for(const row of rows){if(!byPts.has(row.pts))byPts.set(row.pts,[]);byPts.get(row.pts).push(row.id);}
 rows.sort((a,b)=>{
  if(a.pts!==b.pts)return b.pts-a.pts;
  if(mode==='libertadores'){
    const mm=mini(byPts.get(a.pts));const u=mm.get(a.id),v=mm.get(b.id);
    for(const k of ['pts','sg','gp']){if(u[k]!==v[k])return v[k]-u[k];}
  } else if(a.v!==b.v)return b.v-a.v;
  for(const k of ['sg','gp'])if(a[k]!==b[k])return b[k]-a[k];
  if(mode==='brasileirao'&&byPts.get(a.pts).length===2){
    const x=standingsSimple([a,b],matches);const aa=x.find(t=>t.id===a.id),bb=x.find(t=>t.id===b.id);
    if(aa.pts!==bb.pts)return bb.pts-aa.pts;if(aa.sg!==bb.sg)return bb.sg-aa.sg;
  }
  if(a.red!==b.red)return a.red-b.red;if(a.yellow!==b.yellow)return a.yellow-b.yellow;
  return a.name.localeCompare(b.name,'pt-BR'); // Empates absolutos exigem sorteio oficial, não automático.
 });return rows;
}
function standingsSimple(teams,matches){
 const s=teams.map(t=>({id:t.id,pts:0,sg:0,gp:0}));const mp=new Map(s.map(x=>[x.id,x]));
 for(const m of matches.filter(played)){const h=mp.get(m.home),a=mp.get(m.away);if(!h||!a)continue;h.sg+=m.hg-m.ag;a.sg+=m.ag-m.hg;h.gp+=m.hg;a.gp+=m.ag;if(m.hg>m.ag)h.pts+=3;else if(m.hg<m.ag)a.pts+=3;else{h.pts++;a.pts++;}}
 return s;
}
export function winnerOfTie(matches,rule='normal'){
 if(!matches.length||matches.some(m=>!played(m)))return null;
 const a=matches[0].home,b=matches[0].away;let goals=new Map([[a,0],[b,0]]),pts=new Map([[a,0],[b,0]]);
 for(const m of matches){goals.set(m.home,goals.get(m.home)+m.hg);goals.set(m.away,goals.get(m.away)+m.ag);if(m.hg>m.ag)pts.set(m.home,pts.get(m.home)+3);else if(m.hg<m.ag)pts.set(m.away,pts.get(m.away)+3);else{pts.set(m.home,pts.get(m.home)+1);pts.set(m.away,pts.get(m.away)+1);}}
 if(matches.length>1&&rule==='copa'&&pts.get(a)!==pts.get(b))return pts.get(a)>pts.get(b)?a:b;
 if(goals.get(a)!==goals.get(b))return goals.get(a)>goals.get(b)?a:b;
 const last=matches.at(-1);if(Number.isInteger(last.hp)&&Number.isInteger(last.ap)&&last.hp!==last.ap)return last.hp>last.ap?last.home:last.away;
 return null;
}
export function knockoutMatches(entries,stage,legs=1){
 if(entries.length%2)throw Error('É necessário um número par de clubes');
 const matches=[];for(let i=0;i<entries.length;i+=2){const a=entries[i],b=entries[i+1];matches.push(match(a,b,stage,1,1,{tie:`${stage}-${i/2+1}`}));if(legs===2)matches.push(match(b,a,stage,2,2,{tie:`${stage}-${i/2+1}`}));}return matches;
}
export function stageWinners(matches,rule='normal'){
 const byTie=new Map();for(const m of matches){const k=m.tie||m.id;if(!byTie.has(k))byTie.set(k,[]);byTie.get(k).push(m);}
 return [...byTie.values()].map(ms=>winnerOfTie(ms,rule));
}
export function stageComplete(matches,rule){return matches.length>0&&stageWinners(matches,rule).every(Boolean);}
export const groups='ABCDEFGH'.split('');
export const COPA_COUNTS={copa5:32};
const shuffled=(items,rand=Math.random)=>{const arr=[...items];for(let i=arr.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;};
const qualifierTeam=name=>LIB_QUALIFIED_PRE3_2026.includes(canonicalClubName(name));
function canShareLibGroup(teamName,currentNames){
 const country=libCountry(teamName);
 if(!country) return true;
 return !currentNames.some(name=>libCountry(name)===country && !qualifierTeam(name) && !qualifierTeam(teamName));
}
function drawPotAssignments(pots,rand=Math.random){
 const groupsState=Object.fromEntries(groups.map(g=>[g,[]]));
 const placePot=(potIndex)=>{
   if(potIndex>=pots.length) return true;
   const teams=shuffled(pots[potIndex],rand);
   const assign=(teamIndex)=>{
     if(teamIndex>=teams.length) return placePot(potIndex+1);
     const name=teams[teamIndex];
     const choices=shuffled(groups.filter(g=>groupsState[g].length===potIndex && canShareLibGroup(name,groupsState[g])),rand);
     for(const group of choices){
       groupsState[group].push(name);
       if(assign(teamIndex+1)) return true;
       groupsState[group].pop();
     }
     return false;
   };
   return assign(0);
 };
 if(!placePot(0)) throw Error('Não foi possível sortear os grupos da Libertadores com as restrições do regulamento.');
 return groupsState;
}
// Opção de começar a administração após o sorteio oficial dos grupos, sem inventar resultados preliminares.
export function createLibertadoresOfficialGroups(){
 const teams=Object.entries(LIB_OFFICIAL_2026).flatMap(([group,names])=>names.map(name=>team(name,'official',{group})));
 const matches=groups.flatMap(group=>scheduleLeague(teams.filter(t=>t.group===group).map(t=>t.id),true,'groups').map(m=>({...m,group})));
 return {key:'libertadores',year:2026,mode:'groups-official-2026',teams,matches,advanced:['pre1','pre2','pre3'],createdAt:new Date().toISOString(),finalLegs:2,notes:'Grupos oficiais 2026; preliminares preservadas apenas como histórico de participantes. Resultados não carregados.',finalWinner:null};
}
export function createLibertadoresDrawnGroups(){
 const drawn=drawPotAssignments(LIB_POTS_2026);
 const teams=groups.flatMap(group=>drawn[group].map((name,index)=>team(name,'official',{group,pot:`P${index+1}`,qualified:qualifierTeam(name)})));
 const matches=groups.flatMap(group=>scheduleLeague(teams.filter(t=>t.group===group).map(t=>t.id),true,'groups').map(m=>({...m,group})));
 return {key:'libertadores',year:2026,mode:'groups-draw-2026',teams,matches,advanced:['pre1','pre2','pre3'],createdAt:new Date().toISOString(),finalLegs:2,notes:'Grupos embaralhados conforme o regulamento: um clube por pote, com restrição de país e exceção para classificados da fase 3. Resultados não carregados.',finalWinner:null};
}
export function createCompetition(key,year=2026){
 if(!KEYS.includes(key))throw Error('Competição não suportada');
 let teams=[];let matches=[];
 if(key==='paulista'){teams=PAULISTA.map((n,i)=>team(n,'', {pot:'ABCD'[Math.floor(i/4)]}));matches=schedulePaulistaShuffled(teams);}
 if(key==='brasileirao'){teams=BR.map(n=>team(n));matches=scheduleBrasileirao(teams.map(t=>t.id));}
 if(key==='copa'){
  const selected=[...BR.map(name=>({name,division:'Série A'})),...COPA_SERIE_B_2026.map(name=>({name,division:'Série B'}))];
  teams=selected.map(({name,division},index)=>team(name,'copa5',{division,ranking:index+1}));
  matches=knockoutMatches(teams.map(t=>t.id),'copa5',2);
 }
 if(key==='libertadores'){
  teams=[...LIB_PRE1_2026.map(name=>team(name,'pre1')),...LIB_PRE2_2026.map(name=>team(name,'pre2')),...LIB_DIRECT_2026.map(({name,group})=>team(name,'direct',{group}))];
  const ids = LIB_PRE1_2026.map(name=>teams.find(t=>t.name===name).id);
  // Ordem e mando da primeira fase conforme calendário divulgado pela CONMEBOL.
  matches=knockoutMatches(ids,'pre1',2);
 }
 return {key,year,mode:key==='libertadores'?'qualifiers-2026':key==='copa'?'reduced-2026':'standard',teams,matches,advanced:[],createdAt:new Date().toISOString(),finalLegs:2,notes:'',finalWinner:null};
}
export function roundsByMatches(matches){return [...new Set(matches.map(m=>m.round))].sort((a,b)=>a-b);}
export function stageFor(key,index){
 const maps={paulista:['league','quarters','semis','final'], brasileirao:['league'],
  copa:['copa1','copa2','copa3','copa4','copa5','copa6','copa7','copa8','copa9'],
  libertadores:['pre1','pre2','pre3','groups','r16','quarters','semis','final']};
 return maps[key]?.[index];
}
export function stageLabel(k){return ({league:'Primeira fase / Pontos corridos',quarters:'Quartas de final',semis:'Semifinal',final:'Final',groups:'Fase de grupos',r16:'Oitavas de final',pre1:'Pré-Libertadores · Fase 1',pre2:'Pré-Libertadores · Fase 2',pre3:'Pré-Libertadores · Fase 3',copa1:'1ª fase',copa2:'2ª fase',copa3:'3ª fase',copa4:'4ª fase',copa5:'5ª fase',copa6:'Oitavas de final',copa7:'Quartas de final',copa8:'Semifinal',copa9:'Final'})[k]||k;}
export function stageSequence(c){
 if(c.key==='copa'&&c.mode==='reduced-2026') return ['copa5','copa6','copa7','copa8','copa9'];
 const maps={paulista:['league','quarters','semis','final'], brasileirao:['league'], copa:['copa1','copa2','copa3','copa4','copa5','copa6','copa7','copa8','copa9'], libertadores:['pre1','pre2','pre3','groups','r16','quarters','semis','final']};
 return maps[c.key]||[];
}
export function currentStage(c){const sequence=stageSequence(c);for(const key of sequence){if(!c.advanced.includes(key))return key;}return sequence.at(-1)||null;}
export function nextStage(c){const current=currentStage(c),sequence=stageSequence(c);return sequence[sequence.indexOf(current)+1]||null;}
export function activeMatches(c,stage=currentStage(c)){return c.matches.filter(m=>m.stage===stage);}
/** Embaralha apenas a fase ativa da Copa. Mantém clubes/IDs, fases anteriores e outros campeonatos. */
export function redrawCopaStage(c, random=Math.random){
 if(c.key!=='copa'||c.mode!=='reduced-2026')throw Error('Sorteio disponível apenas para a Copa reduzida.');
 const stage=currentStage(c), active=activeMatches(c,stage);
 if(!active.length)throw Error('Esta fase não tem partidas para sortear.');
 if(c.advanced.includes(stage))throw Error('A fase já foi encerrada.');
 const entries=[...new Set(active.flatMap(m=>[m.home,m.away]))];
 if(entries.length!==active.length/(active.some(m=>m.leg===2)?2:1)*2)throw Error('As partidas desta fase estão inconsistentes.');
 if(entries.some(id=>!c.teams.some(t=>t.id===id)))throw Error('Há clubes inválidos na fase atual.');
 const before=active.filter(m=>m.leg===1).map(m=>[m.home,m.away].sort().join(':')).sort().join('|');
 let order=[...entries],next=[];
 for(let attempt=0;attempt<12;attempt++){
  order=shuffled(entries,random);
  const pairs=order.filter((_,i)=>i%2===0).map((x,i)=>[x,order[i*2+1]].sort().join(':')).sort().join('|');
  if(pairs!==before || entries.length===2)break;
 }
 // Numa fase de apenas dois clubes, ainda se pode trocar o mando no novo sorteio.
 if(entries.length===2 && order[0]===active[0].home)order.reverse();
 const legs=active.some(m=>m.leg===2)?2:1;
 next=knockoutMatches(order,stage,legs);
 c.matches=c.matches.filter(m=>m.stage!==stage).concat(next);
 c.lastDraw={stage,at:new Date().toISOString(),number:(c.lastDraw?.number||0)+1};
 return next;
}
export function advance(c){
 const stage=currentStage(c),next=nextStage(c);if(!next)throw Error('Não há outra fase disponível.');
 const games=activeMatches(c,stage);let entries=[];let matches=[];
 if(stage==='league'&&c.key==='paulista'){
  if(games.some(m=>!played(m)))throw Error('Preencha todos os 64 resultados da primeira fase.');
  const sorted=standings(c.teams,games,'paulista');entries=[sorted[0].id,sorted[7].id,sorted[1].id,sorted[6].id,sorted[2].id,sorted[5].id,sorted[3].id,sorted[4].id];
 }else if(stage==='groups'){
  if(games.some(m=>!played(m)))throw Error('Complete os jogos dos grupos.');
  const byG=groups.map(g=>standings(c.teams.filter(t=>t.group===g),games.filter(m=>m.group===g),'libertadores'));
  if(byG.some(g=>g.length!==4))throw Error('Cada grupo precisa ter quatro clubes.');
  const first=byG.map(r=>r[0].id),second=byG.map(r=>r[1].id);
  entries=first.flatMap((id,i)=>[id,second[(i+1)%8]]);
 }else{
  const rule=c.key==='copa'?'copa':'normal';entries=stageWinners(games,rule);
  if(entries.includes(null))throw Error('Há confrontos sem resultado ou sem decisão por pênaltis.');
  if(stage==='quarters'&&c.key==='paulista'){
   // A semifinal usa as melhores campanhas totais até as quartas.
   const base=standings(c.teams,c.matches.filter(m=>m.stage==='league'||m.stage==='quarters'),'paulista');
   entries.sort((a,b)=>base.findIndex(t=>t.id===a)-base.findIndex(t=>t.id===b));entries=[entries[0],entries[3],entries[1],entries[2]];
  }
  if(stage==='semis'&&c.key==='paulista'&&c.finalLegs===2){
   const ranked=standings(c.teams,c.matches.filter(m=>['league','quarters','semis'].includes(m.stage)),'paulista');
   entries.sort((a,b)=>ranked.findIndex(t=>t.id===a)-ranked.findIndex(t=>t.id===b));
   // melhor campanha manda o jogo de volta
   entries.reverse();
  }
  if(c.key==='copa'){
   const adds={copa1:'copa2',copa2:'copa3',copa4:'copa5'};
   if(adds[stage])entries.push(...c.teams.filter(t=>t.kind===adds[stage]).map(t=>t.id));
  }
  if(c.key==='libertadores'){
   if(stage==='pre1'){
    const findId = name => {const obj=c.teams.find(t=>t.name===name);if(!obj)throw Error(`Clube ausente: ${name}`);return obj.id;};
    // Oito confrontos reais do sorteio da pré-Libertadores de 2026.
    const pairs=[[entries[2],findId('Guaraní-PAR')],[entries[0],findId('Deportes Tolima')],[entries[1],findId('Sporting Cristal')],
      [findId('Barcelona-EQU'),findId('Argentinos Juniors')],[findId('Nacional Potosí'),findId('Botafogo')],
      [findId('Carabobo'),findId('Huachipato')],[findId('O’Higgins'),findId('Bahia')],
      [findId('Liverpool-URU'),findId('Independiente Medellín')]];
    matches=knockoutMatches(pairs.flat(),'pre2',2);
   }
   if(stage==='pre2'){
    // Pareamento da Fase 3: C1 x C8, C2 x C7, C3 x C6, C4 x C5.
    matches=knockoutMatches([entries[0],entries[7],entries[1],entries[6],entries[2],entries[5],entries[3],entries[4]],'pre3',2);
   }
   if(stage==='pre3'){
    const direct=c.teams.filter(t=>t.kind==='direct');
    const winners=entries.map(id=>c.teams.find(t=>t.id===id)).filter(Boolean);
    // Grupos do sorteio 2026 com vagas abertas A4, B4, D4 e F4.
    ['A','B','D','F'].forEach((g,i)=>{winners[i].group=g;});
    const members=[...direct,...winners];
    for(const g of groups){const ids=members.filter(t=>t.group===g).map(t=>t.id);if(ids.length!==4)throw Error(`Grupo ${g} não tem quatro clubes`);matches.push(...scheduleLeague(ids,true,'groups').map(m=>({...m,group:g})));}
   }
  }
 }
 if(!matches.length){let legs=1;if(c.key==='copa'&&['copa5','copa6','copa7','copa8'].includes(next))legs=2;
 else if(c.key==='libertadores'&&['pre2','pre3','r16','quarters','semis'].includes(next))legs=2;
 else if(c.key==='paulista'&&next==='final')legs=c.finalLegs;
 matches=knockoutMatches(entries,next,legs);
 }
 c.matches.push(...matches);c.advanced.push(stage);return matches;
}
export function champion(c){const last=c.key==='brasileirao'?'league':stageFor(c.key,{paulista:3,libertadores:7,copa:8}[c.key]);const ms=activeMatches(c,last);if(c.key==='brasileirao'){if(ms.some(m=>!played(m)))return null;return standings(c.teams,ms,'brasileirao')[0]?.id||null;}
 return stageComplete(ms,c.key==='copa'?'copa':'normal')?stageWinners(ms,c.key==='copa'?'copa':'normal')[0]:null;}
