const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const bundle=fs.readFileSync(path.join(__dirname,'..','src','bundle.js'),'utf8');
function boot(storage=new Map(),choices=[]){
 const app={innerHTML:''},listeners={},confirms=[];let counter=0;
 const document={body:{className:''},querySelector:s=>s==='#app'?app:null,addEventListener:(e,f)=>listeners[e]=f};
 const context=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){return 1},clearTimeout(){},confirm(q){confirms.push(q);return choices[counter++]??true},alert(){},URL,Date,console,Math,JSON,String,Number,Object});
 vm.runInContext(bundle,context,{timeout:20000});
 return {app,storage,confirms,click:(action,value='')=>listeners.click({target:{closest:()=>({dataset:{action,value}})}}),data:()=>JSON.parse(storage.get('centralfut-campeonatos-2026'))};
}
test('Botão do Paulistão disponível em Visão geral, Jogos, Clubes, Tabelas e Ajustes',()=>{
 const b=boot();for(const tab of ['overview','matches','clubs','standings','settings']){
  b.click('tab',tab);
  assert.match(b.app.innerHTML,/data-action="paulista-redraw"/);
  assert.match(b.app.innerHTML,/Calendário inteligente · 8 rodadas/);
 }
 const styles=fs.readFileSync(path.join(__dirname,'..','src','style.css'),'utf8');assert.match(styles,/\.paulista-calendar-tools/);
});
test('Botão refaz o calendário e preserva os demais campeonatos',()=>{
 const b=boot();const before=b.data(),others=JSON.stringify({libertadores:before.data.libertadores,copa:before.data.copa,brasileirao:before.data.brasileirao});
 const old=JSON.stringify(before.data.paulista.matches);
 b.click('paulista-redraw');const after=b.data();
 assert.notEqual(JSON.stringify(after.data.paulista.matches),old);
 assert.equal(after.data.paulista.matches.length,64);
 assert.equal(after.data.paulista.scheduleVersion,1);
 assert.equal(JSON.stringify({libertadores:after.data.libertadores,copa:after.data.copa,brasileirao:after.data.brasileirao}),others);
});
test('Com placares, cancelar primeira confirmação impede mudança',()=>{
 const seed=boot(),payload=seed.data();payload.data.paulista.matches[0].hg=1;payload.data.paulista.matches[0].ag=0;
 seed.storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const b=boot(seed.storage,[false]);b.click('paulista-redraw');
 assert.equal(b.confirms.length,1);assert.equal(b.data().data.paulista.matches[0].hg,1);
});
test('Com placares, exige duas confirmações antes de apagar a primeira fase',()=>{
 const seed=boot(),payload=seed.data();payload.data.paulista.matches[0].hg=2;payload.data.paulista.matches[0].ag=0;
 seed.storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const b=boot(seed.storage,[true,true]);b.click('paulista-redraw');
 assert.equal(b.confirms.length,2);assert.ok(b.data().data.paulista.matches.every(m=>m.hg===null));
});
test('Fases finais geradas bloqueiam sorteio sem apagar classificados',()=>{
 const seed=boot(),payload=seed.data();payload.data.paulista.advanced=['league'];
 seed.storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const b=boot(seed.storage);const prev=JSON.stringify(b.data().data.paulista);
 assert.match(b.app.innerHTML,/disabled title="Fases finais iniciadas"/);
 b.click('paulista-redraw');assert.equal(JSON.stringify(b.data().data.paulista),prev);
});
test('Calendário antigo sem dados migra automaticamente, mantendo clubes personalizados',()=>{
 const seed=boot(),payload=seed.data(),c=payload.data.paulista;
 c.teams[0].name='Meu Clube Local';
 c.matches[0].home=c.matches[0].away;
 seed.storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const migrated=boot(seed.storage).data().data.paulista;
 assert.equal(migrated.teams[0].name,'Meu Clube Local');
 assert.notEqual(migrated.matches[0].home,migrated.matches[0].away);
 assert.equal(migrated.scheduleVersion,1);
});
test('Calendário antigo com placares não migra e preserva resultados do usuário',()=>{
 const seed=boot(),payload=seed.data(),c=payload.data.paulista;
 c.matches[0].home=c.matches[0].away;
 c.matches[0].hg=2;c.matches[0].ag=1;
 seed.storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const loaded=boot(seed.storage).data().data.paulista;
 assert.equal(loaded.matches[0].hg,2);
 assert.equal(loaded.matches[0].home,loaded.matches[0].away);
});
