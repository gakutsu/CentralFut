const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/bundle.js'),'utf8');
function boot(initial=null){
 const storage=new Map();
 if(initial) storage.set('centralfut-campeonatos-2026',JSON.stringify(initial));
 const app={innerHTML:''};const listeners={};
 const document={body:{className:''},querySelector:s=>s==='#app'?app:null,addEventListener:(n,fn)=>listeners[n]=fn};
 const ctx=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){return 1},clearTimeout(){},confirm(){return true},URL,Date,Math,JSON,String,Number,Object,console});
 vm.runInContext(source,ctx,{timeout:10000});
 const click=(action,value='')=>listeners.click({target:{closest:()=>({dataset:{action,value}})}});
 const data=()=>JSON.parse(storage.get('centralfut-campeonatos-2026'));
 return {app,click,data};
}
test('Libertadores apresenta oito tabelas temáticas e situação ainda provisória',()=>{
 const b=boot();b.click('league','libertadores');b.click('tab','standings');
 assert.match(b.app.innerHTML,/CAMINHO À GLÓRIA ETERNA/);
 assert.equal((b.app.innerHTML.match(/class="lib-table-card panel"/g)||[]).length,8);
 assert.equal((b.app.innerHTML.match(/class="lib-table-row /g)||[]).length,32);
 assert.equal((b.app.innerHTML.match(/class="lib-situation qualifies"/g)||[]).length,16);
 assert.equal((b.app.innerHTML.match(/class="lib-situation sudamericana"/g)||[]).length,8);
 assert.equal((b.app.innerHTML.match(/class="lib-situation eliminated"/g)||[]).length,8);
 assert.match(b.app.innerHTML,/Posições provisórias/);
 assert.doesNotMatch(b.app.innerHTML,/Grupo concluído/);
});
test('Libertadores permite navegar de um grupo até os jogos daquele grupo',()=>{
 const b=boot();b.click('league','libertadores');b.click('lib-group','C');
 assert.equal((b.app.innerHTML.match(/class="lib-table-card panel"/g)||[]).length,1);
 b.click('lib-group-games','C');
 assert.match(b.app.innerHTML,/Grupo C · 12 jogos/);
 assert.equal((b.app.innerHTML.match(/class="match-card"/g)||[]).length,12);
});
test('Libertadores: cards de 32 clubes têm links funcionais e estatísticas do grupo',()=>{
 const b=boot();b.click('league','libertadores');b.click('tab','clubs');
 assert.equal((b.app.innerHTML.match(/class="lib-club-card"/g)||[]).length,32);
 assert.match(b.app.innerHTML,/Ver|Partidas ↗/);
 b.click('lib-club-filter','F');
 assert.equal((b.app.innerHTML.match(/class="lib-club-card"/g)||[]).length,4);
 const id=b.data().data.libertadores.teams.find(t=>t.group==='F').id;
 b.click('lib-club-games',id);
 assert.equal((b.app.innerHTML.match(/class="match-card"/g)||[]).length,6);
});
test('Libertadores: classificação passa a definitiva somente após fechar os 12 jogos do grupo',()=>{
 const b=boot();const data=b.data();const c=data.data.libertadores;
 for(const m of c.matches.filter(m=>m.group==='A')) {m.hg=1;m.ag=0;}
 data.active='libertadores';data.tab='standings';
 const updated=boot(data);
 updated.click('lib-group-filter','A');
 assert.equal((updated.app.innerHTML.match(/class="lib-table-row /g)||[]).length,4);
 assert.match(updated.app.innerHTML,/Grupo concluído/);
 assert.match(updated.app.innerHTML,/Oitavas de final/);
 assert.doesNotMatch(updated.app.innerHTML,/Posições provisórias<\/span>/);
});
test('Mata-mata Libertadores mostra 8+4+2+1 vagas sem inventar classificados',()=>{
 const b=boot();b.click('league','libertadores');b.click('tab','bracket');
 assert.equal((b.app.innerHTML.match(/class="lib-bracket-round"/g)||[]).length,4);
 assert.equal((b.app.innerHTML.match(/class="lib-knockout-placeholder"/g)||[]).length,15);
 assert.match(b.app.innerHTML,/Grande final/);
 assert.match(b.app.innerHTML,/Equipe a definir/);
 assert.match(b.app.innerHTML,/Nenhum clube foi classificado antecipadamente/);
});
test('Novas telas não alteram a identidade existente do Paulistão',()=>{
 const b=boot();b.click('tab','bracket');assert.match(b.app.innerHTML,/paulista-finals-header/);
 b.click('league','libertadores');b.click('tab','standings');assert.match(b.app.innerHTML,/lib-ranking-view/);
 b.click('league','paulista');assert.match(b.app.innerHTML,/hero-paulista/);
});
test('Mata-mata mostra oito duelos gerados com equipes e acesso aos dois jogos da chave',async()=>{
 const engine=await import('../src/competition.js');
 const c=engine.createLibertadoresOfficialGroups();
 for(const m of c.matches){m.hg=1;m.ag=0;}
 engine.advance(c);
 const data=boot().data();data.active='libertadores';data.tab='bracket';data.data.libertadores=c;
 const b=boot(data);
 assert.equal((b.app.innerHTML.match(/class="lib-knockout-tie"/g)||[]).length,8);
 assert.equal((b.app.innerHTML.match(/class="lib-knockout-placeholder"/g)||[]).length,7);
 const game=c.matches.find(m=>m.stage==='r16');
 b.click('lib-tie-games',game.id);
 assert.match(b.app.innerHTML,/Confronto · 2 jogos/);
 assert.equal((b.app.innerHTML.match(/class="match-card"/g)||[]).length,2);
});
test('Libertadores: cards refletem pontos e vitórias de resultados registrados no grupo',()=>{
 const orig=boot().data();const c=orig.data.libertadores;
 const team=c.teams.find(t=>t.group==='B');
 const fixture=c.matches.find(m=>m.group==='B'&&(m.home===team.id||m.away===team.id));
 if(fixture.home===team.id){fixture.hg=3;fixture.ag=1;}else{fixture.hg=1;fixture.ag=3;}
 orig.active='libertadores';orig.tab='clubs';
 const b=boot(orig);
 b.click('lib-club-filter','B');
 const pos=b.app.innerHTML.indexOf(team.name);
 assert.ok(pos>0);
 assert.match(b.app.innerHTML,/1 de 6 jogos realizados/);
 assert.match(b.app.innerHTML,/<b>3<\/b><small>Pontos<\/small>/);
});
