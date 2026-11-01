const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const bundle = fs.readFileSync(path.join(__dirname, '..', 'src', 'bundle.js'),'utf8');

function boot(storage = new Map()) {
 const app = {innerHTML: ''};
 const listeners = {};
 const document = {
   body:{className: ''},
   querySelector(selector){return selector==='#app' ? app : null;},
   addEventListener(type,cb){listeners[type]=cb;},
 };
 const context = vm.createContext({
   document,
   localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
   setTimeout(){return 1;},clearTimeout(){},
   confirm(){return true;}, alert(){},
   URL, Date, console, Math, JSON, String, Number, Object,
 });
 vm.runInContext(bundle,context,{filename:'bundle.js',timeout:20000});
 const click=(action,value='')=>listeners.click({target:{closest:()=>({dataset:{action,value}})}});
 return {app,document,listeners,click,storage};
}

test('bundle offline inicializa index.html sem imports de módulos',()=>{
 assert.doesNotMatch(bundle,/^\s*(import|export)\s/m);
 const {app} = boot();
 assert.match(app.innerHTML, /Campeonato Paulista/);
 assert.match(app.innerHTML, /CentralFut/);
 assert.match(app.innerHTML, /Clube|Participantes/);
});

test('troca entre quatro competições e navega entre abas',()=>{
 const b=boot();
 for(const [key,label] of Object.entries({brasileirao:'Campeonato Brasileiro Série A',paulista:'Campeonato Paulista',libertadores:'CONMEBOL Libertadores',copa:'Copa do Brasil'})){
   b.click('league',key);assert.ok(b.app.innerHTML.includes(label),key);
   for(const tab of ['overview','clubs','matches','standings','bracket','rules','settings']){
     b.click('tab',tab);
     assert.ok(b.app.innerHTML.length>1500,`${key}/${tab}`);
   }
 }
});

test('painel de acesso da Série B é acessível pelo Brasileirão',()=>{
 const b=boot();b.click('league','brasileirao');b.click('tab','clubs');
 assert.match(b.app.innerHTML,/Opções da Série B/);
 b.click('promotion');
 assert.match(b.app.innerHTML, /id="promotion-form"/);
 assert.match(b.app.innerHTML, /América-MG/);
});

test('não depende de localStorage estar autorizado para renderizar a tela',()=>{
 const app={innerHTML:''};
 const document={body:{},querySelector:s=>s==='#app'?app:null,addEventListener(){}};
 const context=vm.createContext({
  document,localStorage:{getItem(){throw Error('SecurityError')},setItem(){throw Error('SecurityError')}},
  setTimeout(){},clearTimeout(){},confirm(){return true},alert(){},URL,Date,console,Math,JSON,String,Number,Object
 });
 vm.runInContext(bundle,context,{timeout:20000});
 assert.match(app.innerHTML,/Campeonato Paulista/);
});


test('Velo Clube usa a imagem oficial enviada e a imagem antiga é substituída em dados salvos',()=>{
 const first=boot();
 const storage=first.storage;
 const payload=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 const team=payload.data.paulista.teams.find(t=>t.name==='Velo Clube');
 assert.ok(team);
 team.logo='assets/velo-clube-oficial.png';
 storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const next=boot(storage);
 next.click('tab','clubs');
 const saved=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 assert.equal(saved.data.paulista.teams.find(t=>t.name==='Velo Clube').logo,'assets/velo-clube-oficial-v2.png');
 assert.match(next.app.innerHTML,/assets\/velo-clube-oficial-v2\.png/);
 const pathFile=path.join(__dirname,'..','assets','velo-clube-oficial-v2.png');
 const buffer=fs.readFileSync(pathFile);
 assert.equal(buffer.subarray(1,4).toString(),'PNG');
 assert.ok(buffer.length>20000,'O escudo correto deve ser uma imagem detalhada, não um ícone provisório');
});



test('Remo, Ceará, Athletic Club e Avaí usam escudos oficiais e corrigem dados salvos',()=>{
 const first=boot();
 const storage=first.storage;
 const payload=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 for(const key of ['brasileirao','copa']){
   for(const team of payload.data[key].teams){
     if(['Remo','Ceará','Athletic Club','Avaí'].includes(team.name)) team.logo='https://assets.footylogos.com/logos/broken.svg';
   }
 }
 storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const next=boot(storage);
 next.click('competition','copa');
 next.click('tab','clubs');
 const saved=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 for(const [name,piece] of [
   ['Remo','Escudo_oficial_do_Clube_do_Remo.png'],
   ['Ceará','Cear%C3%A1_Sporting_Club_logo.svg'],
   ['Athletic Club','Athletic_Club_%28Minas_Gerais%29.svg'],
   ['Avaí','Ava%C3%AD_Futebol_Clube_logo.svg']
 ]){
   const team=saved.data.copa.teams.find(t=>t.name===name) || saved.data.brasileirao.teams.find(t=>t.name===name);
   assert.ok(team, name);
   assert.ok(String(team.logo).includes(piece), `${name} deve usar o escudo correto`);
 }
});

test('Paulistão: classificação refinada mostra 16 clubes e filtra G8 e Z2',()=>{
 const b=boot();b.click('tab','standings');
 assert.match(b.app.innerHTML,/Retrato da classificação/);
 assert.match(b.app.innerHTML,/class="ranking paulista-ranking"/);
 assert.equal((b.app.innerHTML.match(/class="paulista-rank-row /g)||[]).length,16);
 assert.match(b.app.innerHTML,/Zona de classificação/);
 assert.match(b.app.innerHTML,/Zona de rebaixamento/);
 b.click('ranking-filter','qualified');
 assert.equal((b.app.innerHTML.match(/class="paulista-rank-row /g)||[]).length,8);
 b.click('ranking-filter','relegated');
 assert.equal((b.app.innerHTML.match(/class="paulista-rank-row /g)||[]).length,2);
 b.click('ranking-filter','all');
 assert.equal((b.app.innerHTML.match(/class="paulista-rank-row /g)||[]).length,16);
});

test('Paulistão: elenco tem 16 cards e escudo atualizado do Velo Clube',()=>{
 const b=boot();b.click('tab','clubs');
 assert.equal((b.app.innerHTML.match(/class="paulista-team-card /g)||[]).length,16);
 assert.match(b.app.innerHTML,/assets\/velo-clube-oficial-v2\.png/);
 assert.match(b.app.innerHTML,/Ver campanha/);
});

test('Paulistão: mapa do mata-mata mostra quartas, semifinal e final antes de avançar',()=>{
 const b=boot();b.click('tab','bracket');
 assert.equal((b.app.innerHTML.match(/class="paulista-round"/g)||[]).length,3);
 assert.equal((b.app.innerHTML.match(/class="paulista-empty-tie"/g)||[]).length,7);
 assert.match(b.app.innerHTML,/1º×8º/);
});

test('Paulistão: ficha de campanha e atalho para jogos preservam IDs',()=>{
 const b=boot();b.click('tab','clubs');
 const payload=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 const velo=payload.data.paulista.teams.find(t=>t.name==='Velo Clube');
 b.click('view-club',velo.id);
 assert.match(b.app.innerHTML,/paulista-profile-modal/);
 assert.match(b.app.innerHTML,/Campanha de Velo Clube/);
 assert.match(b.app.innerHTML,/Jogos da primeira fase/);
 b.click('club-games',velo.id);
 assert.match(b.app.innerHTML,/id="search-games"/);
 assert.match(b.app.innerHTML,/value="Velo Clube"/);
 assert.equal((b.app.innerHTML.match(/class="match-card"/g)||[]).length,8);
});

test('Paulistão: quartas geradas exibem quatro confrontos e não inventam resultados',async()=>{
 const {createCompetition,advance}=await import('../src/competition.js');
 const c=createCompetition('paulista');
 for(const m of c.matches){m.hg=1;m.ag=0;}
 advance(c);
 const storage=new Map();
 storage.set('centralfut-campeonatos-2026',JSON.stringify({version:1,active:'paulista',tab:'bracket',data:{paulista:c}}));
 const b=boot(storage);
 assert.equal((b.app.innerHTML.match(/class="paulista-knockout-card"/g)||[]).length,4);
 assert.equal((b.app.innerHTML.match(/class="paulista-empty-tie"/g)||[]).length,3);
 assert.match(b.app.innerHTML,/Registrar resultado/);
});


test('Paulistão sem card da taça e Libertadores com marca dourada exclusiva',()=>{
 const b=boot();
 let hero=b.app.innerHTML.match(/<section class="hero hero-paulista">([\s\S]*?)<\/section>/)?.[0];
 assert.ok(hero,'Hero do Paulistão deve existir');
 assert.doesNotMatch(hero,/hero-emblem|Design dedicado/);
 assert.match(hero,/Campeonato Paulista/);
 assert.match(hero,/hero-sheen/);
 b.click('league','libertadores');
 hero=b.app.innerHTML.match(/<section class="hero hero-libertadores">([\s\S]*?)<\/section>/)?.[0];
 assert.ok(hero,'Hero da Libertadores deve existir');
 assert.match(hero,/lib-hero-brand/);
 assert.match(hero,/libertadores-trofeu\.webp/);
 assert.match(hero,/LA GLORIA ETERNA/);
 assert.doesNotMatch(hero,/Design dedicado/);
});

test('Libertadores 2026: abre com oito grupos oficiais e 32 clubes',()=>{
 const b=boot();
 b.click('league','libertadores');
 assert.match(b.app.innerHTML,/Os grupos da Libertadores/);
 assert.equal((b.app.innerHTML.match(/class="lib-group-card /g)||[]).length,8);
 assert.match(b.app.innerHTML,/Independiente Medellín/);
 assert.match(b.app.innerHTML,/Deportes Tolima/);
 assert.match(b.app.innerHTML,/Palmeiras/);
 const c=JSON.parse(b.storage.get('centralfut-campeonatos-2026')).data.libertadores;
 assert.equal(c.teams.length,32);
 assert.equal(c.matches.length,96);
});

test('Libertadores 2026: filtro interativo por grupo e retorno à tabela completa',()=>{
 const b=boot();b.click('league','libertadores');
 b.click('lib-group','A');
 assert.match(b.app.innerHTML,/Classificação dos grupos/);
 assert.match(b.app.innerHTML,/Grupo A/);
 assert.doesNotMatch(b.app.innerHTML,/class="lib-table-head"[\s\S]*?<h3>Grupo B/);
 b.click('lib-group-filter','all');
 assert.match(b.app.innerHTML,/<h3>Grupo B<\/h3>/);
 assert.match(b.app.innerHTML,/<h3>Grupo H<\/h3>/);
});

test('Libertadores 2026: alterna 32 grupos / 47 preliminares sem alterar o Paulistão',()=>{
 const b=boot();
 const before=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 const paulistaId=before.data.paulista.teams[0].id;
 b.click('league','libertadores');b.click('tab','settings');
 assert.match(b.app.innerHTML,/Desde as preliminares · 47 clubes/);
 b.click('lib-qualifiers');
 let saved=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 assert.equal(saved.data.libertadores.teams.length,47);
 assert.equal(saved.data.paulista.teams[0].id,paulistaId);
 b.click('tab','settings');b.click('official-groups');
 saved=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 assert.equal(saved.data.libertadores.teams.length,32);
 assert.equal(saved.data.paulista.teams[0].id,paulistaId);
});

test('Libertadores 2026: migra somente placeholders intactos, sem apagar alterações do usuário',()=>{
 const first=boot();const storage=first.storage;
 const payload=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 const dummy={...payload.data.libertadores,teams:[],matches:[],advanced:[],mode:null};
 // A estrutura antiga de 47 placeholders ainda é reconhecida pela migração.
 for(let i=0;i<47;i++) dummy.teams.push({id:'old'+i,name:'Vaga '+i,short:'XXX',placeholder:true,kind:i<6?'pre1':i<19?'pre2':'direct'});
 dummy.matches=[{id:'fixture-old',home:'old0',away:'old1',stage:'pre1',hg:null,ag:null}];
 payload.data.libertadores=dummy;
 storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 boot(storage);
 let saved=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 assert.equal(saved.data.libertadores.teams.length,32);
 // Um único clube personalizado desativa a migração automática.
 dummy.teams[0].name='Meu clube';dummy.teams[0].placeholder=false;
 payload.data.libertadores=dummy;
 storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 boot(storage);
 saved=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 assert.equal(saved.data.libertadores.teams.length,47);
 assert.equal(saved.data.libertadores.teams[0].name,'Meu clube');
});

test('Libertadores: botão de grupos embaralhados gera novo sorteio ao clicar',()=>{
 const b=boot();b.click('league','libertadores');b.click('tab','settings');
 assert.match(b.app.innerHTML,/data-action="lib-draw-groups"/);
 b.click('lib-draw-groups');
 const saved=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 assert.equal(saved.data.libertadores.mode,'groups-draw-2026');
 assert.equal(saved.data.libertadores.teams.length,32);
 assert.equal(saved.data.libertadores.matches.length,96);
 assert.match(b.app.innerHTML,/Novo sorteio realizado/);
 const paulistaId=saved.data.paulista.teams[0].id;
 b.click('tab','settings');b.click('official-groups');
 const official=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 assert.equal(official.data.libertadores.mode,'groups-official-2026');
 assert.equal(official.data.paulista.teams[0].id,paulistaId);
});

test('Libertadores: a escolha dos grupos oficiais persiste ao reabrir a aplicação',()=>{
 const b=boot();b.click('league','libertadores');b.click('tab','settings');b.click('official-groups');
 const restarted=boot(b.storage);restarted.click('league','libertadores');
 const payload=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 assert.equal(payload.data.libertadores.mode,'groups-official-2026');
 assert.match(restarted.app.innerHTML,/CONMEBOL Libertadores/);
});

test('Libertadores: escudos de Universitario e Platense corrigidos também em dados salvos',()=>{
 const b=boot();
 const payload=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 for(const team of payload.data.libertadores.teams){
   if(['Universitario','Platense'].includes(team.name)) team.logo='https://assets.footylogos.com/logos/broken.svg';
 }
 b.storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 boot(b.storage);
 const updated=JSON.parse(b.storage.get('centralfut-campeonatos-2026'));
 for(const name of ['Universitario','Platense']){
   const team=updated.data.libertadores.teams.find(x=>x.name===name);
   assert.ok(team?.logo.startsWith('https://upload.wikimedia.org/wikipedia/commons/'));
 }
});


test('Libertadores: arquivos de referência e identidade dourada estão presentes sem alterar Paulistão',()=>{
 const fs=require('node:fs'); const path=require('node:path');
 const root=path.resolve(__dirname,'..');
 const css=fs.readFileSync(path.join(root,'src','style.css'),'utf8');
 assert.match(css,/body\.theme-libertadores\s*\{/);
 assert.match(css,/libertadores-ambient\.webp/);
 assert.match(css,/lib-hero-brand/);
 assert.match(css,/lib-group-card/);
 for(const name of ['libertadores-trofeu.webp','libertadores-ambient.webp']){
  assert.ok(fs.statSync(path.join(root,'assets',name)).size > 1000);
 }
 const b=boot();
 b.click('league','libertadores');
 assert.match(b.app.innerHTML,/lib-hero-brand/);
 assert.equal((b.app.innerHTML.match(/class="lib-group-card /g)||[]).length,8);
 b.click('league','paulista');
 assert.doesNotMatch(b.app.innerHTML,/lib-hero-brand/);
 assert.match(b.app.innerHTML,/class="hero hero-paulista"/);
});
