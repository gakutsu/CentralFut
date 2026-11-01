const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const bundle=fs.readFileSync(path.join(__dirname,'..','src','bundle.js'),'utf8');
function boot(storage=new Map(),confirmDecisions=[]){
 const app={innerHTML:''},listeners={},log=[];let confirmIndex=0;
 const document={body:{className:''},querySelector:s=>s==='#app'?app:null,addEventListener:(e,f)=>listeners[e]=f};
 const ctx=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){return 1},clearTimeout(){},confirm(q){log.push(q);return confirmDecisions[confirmIndex++]??true},alert(){},URL,Date,console,Math,JSON,String,Number,Object});
 vm.runInContext(bundle,ctx,{timeout:20000});
 return {app,storage,log,click:(action,value='')=>listeners.click({target:{closest:()=>({dataset:{action,value}})}}),get:()=>JSON.parse(storage.get('centralfut-campeonatos-2026'))};
}
function goBr(b,tab='overview'){b.click('league','brasileirao');b.click('tab',tab)}
test('Tema Brasileiro mostra a imagem local sem afetar Libertadores e Paulistão',()=>{
 const styles=fs.readFileSync(path.join(__dirname,'..','src','style.css'),'utf8');
 assert.match(styles,/brasileirao-2026-ambiente\.webp/);
 for(const asset of ['brasileirao-2026-ambiente.webp','brasileirao-2026-trofeu.webp'])assert.ok(fs.statSync(path.join(__dirname,'..','assets',asset)).size>1500);
 const b=boot();goBr(b);assert.match(b.app.innerHTML,/hero-brasileirao/);assert.match(b.app.innerHTML,/BRASILEIRÃO/);b.click('league','libertadores');assert.match(b.app.innerHTML,/hero-libertadores/);b.click('league','paulista');assert.match(b.app.innerHTML,/hero-paulista/);
});
test('Não exibe aba Mata-mata no Brasileirão, preservando-a nas outras copas',()=>{
 const b=boot();goBr(b);assert.doesNotMatch(b.app.innerHTML,/data-action="tab" data-value="bracket"/);
 b.click('tab','bracket');assert.doesNotMatch(b.app.innerHTML,/data-action="tab" data-value="bracket"/);
 b.click('league','copa');assert.match(b.app.innerHTML,/data-action="tab" data-value="bracket"/);
});
test('Tabela tem 20 clubes e zonas G4, G6, Sula, Z4 com filtros funcionais',()=>{
 const b=boot();goBr(b,'standings');assert.equal((b.app.innerHTML.match(/class="br-rank-row /g)||[]).length,20);
 for(const group of ['g4','g6','sula','z4']){b.click('br-filter',group);assert.match(b.app.innerHTML,/br-table-panel/)}
 b.click('br-filter','g4');assert.equal((b.app.innerHTML.match(/class="br-rank-row /g)||[]).length,4);
 b.click('br-filter','g6');assert.equal((b.app.innerHTML.match(/class="br-rank-row /g)||[]).length,6);
 b.click('br-filter','sula');assert.equal((b.app.innerHTML.match(/class="br-rank-row /g)||[]).length,6);
 b.click('br-filter','z4');assert.equal((b.app.innerHTML.match(/class="br-rank-row /g)||[]).length,4);
});
test('20 cards de clubes com escudos e acesso à Série B preservado',()=>{
 const b=boot();goBr(b,'clubs');assert.equal((b.app.innerHTML.match(/class="br-club-card /g)||[]).length,20);
 assert.match(b.app.innerHTML,/Opções da Série B/);b.click('promotion');assert.match(b.app.innerHTML,/id="promotion-form"/);
});
test('Refazer calendário preserva as outras competições e gera novas partidas',()=>{
 const b=boot();goBr(b,'matches');const before=b.get();
 const old=JSON.stringify(before.data.brasileirao.matches),other=JSON.stringify(before.data.paulista);
 assert.match(b.app.innerHTML,/data-action="br-redraw"/);
 b.click('br-redraw');const after=b.get();
 assert.notEqual(JSON.stringify(after.data.brasileirao.matches),old);
 assert.equal(JSON.stringify(after.data.paulista),other);
 assert.equal(after.data.brasileirao.matches.length,380);
});
test('Cancelamento de sorteio com placar impede qualquer perda de dados',()=>{
 const base=boot(),data=base.get();data.data.brasileirao.matches[0].hg=2;data.data.brasileirao.matches[0].ag=1;
 base.storage.set('centralfut-campeonatos-2026',JSON.stringify(data));
 const b=boot(base.storage,[false]);goBr(b);b.click('br-redraw');
 assert.equal(b.log.length,1);assert.equal(b.get().data.brasileirao.matches[0].hg,2);
});
test('Com resultados, calendário exige dupla confirmação para descartar dados',()=>{
 const base=boot(),data=base.get();data.data.brasileirao.matches[0].hg=2;data.data.brasileirao.matches[0].ag=1;
 base.storage.set('centralfut-campeonatos-2026',JSON.stringify(data));
 const b=boot(base.storage,[true,true]);goBr(b);b.click('br-redraw');
 assert.equal(b.log.length,2);
 assert.equal(b.get().data.brasileirao.matches.filter(m=>m.hg!==null).length,0);
});
test('Migrate antiga tabela sem jogos sem apagar personalização de nome',()=>{
 const base=boot(),data=base.get();const c=data.data.brasileirao;
 const name='Meu Clube';c.teams[0].name=name;
 // corrompe somente o mando e mantém placares e datas intactos
 c.matches[0].home=c.matches[0].away;
 base.storage.set('centralfut-campeonatos-2026',JSON.stringify(data));
 const migrated=boot(base.storage).get().data.brasileirao;
 assert.equal(migrated.teams[0].name,name);
 assert.notEqual(migrated.matches[0].home,migrated.matches[0].away);
});
