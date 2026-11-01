const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const bundle=fs.readFileSync(path.join(__dirname,'..','src','bundle.js'),'utf8');
function boot(confirmations=[]){
 const app={innerHTML:''};const listeners={};const storage=new Map();let confirms=0;
 const document={body:{className:''},querySelector:s=>s==='#app'?app:null,addEventListener:(t,f)=>listeners[t]=f};
 const ctx=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){},clearTimeout(){},confirm(){return confirmations[confirms++]??true},alert(){},URL,Date,console,Math,JSON,String,Number,Object});
 vm.runInContext(bundle,ctx,{timeout:20000});
 return {app,storage,click:(action,value='')=>listeners.click({target:{closest:()=>({dataset:{action,value}})}}),get:()=>JSON.parse(storage.get('centralfut-campeonatos-2026')),getConfirmCount:()=>confirms};
}
test('Copa exibe painel premium, cards dos 32 clubes e filtros por situação',()=>{
 const b=boot();b.click('league','copa');b.click('tab','clubs');
 assert.match(b.app.innerHTML,/copa-club-grid/);
 assert.equal((b.app.innerHTML.match(/class="copa-club-card /g)||[]).length,32);
 for(const label of ['Classificados','Em disputa','Eliminados'])assert.ok(b.app.innerHTML.includes(label));
 b.click('copa-filter','qualified');
 assert.match(b.app.innerHTML,/Nenhum clube nesta situação/);
 b.click('copa-filter','all');assert.equal((b.app.innerHTML.match(/class="copa-club-card /g)||[]).length,32);
});
test('Copa mostra as cinco fases da chave e nunca inventa classificados futuros',()=>{
 const b=boot();b.click('league','copa');b.click('tab','bracket');
 assert.match(b.app.innerHTML,/copa-bracket-grid/);
 assert.match(b.app.innerHTML,/Grande final/);
 assert.match(b.app.innerHTML,/A definir/);
 assert.equal((b.app.innerHTML.match(/data-action="copa-tie-games"/g)||[]).length,16);
 b.click('tab','standings');assert.match(b.app.innerHTML,/Quadro de classificação/);
 assert.match(b.app.innerHTML,/copa-qual-row/);
});
test('Botão refazer sorteio da Copa muda os confrontos e preserva Paulistão',()=>{
 const b=boot();b.click('league','copa');b.click('tab','settings');
 assert.match(b.app.innerHTML,/data-action="copa-draw"/);
 const before=b.get(),matches=JSON.stringify(before.data.copa.matches),paulista=JSON.stringify(before.data.paulista);
 b.click('copa-draw');
 const after=b.get();
 assert.notEqual(JSON.stringify(after.data.copa.matches),matches);
 assert.equal(JSON.stringify(after.data.paulista),paulista);
 assert.equal(after.data.copa.teams.length,32);
 assert.equal(after.data.copa.lastDraw.number,1);
});
test('Sorteio com placar exige dupla confirmação; cancelar não altera partida',()=>{
 const b=boot([false]);b.click('league','copa');
 const before=b.get();const game=before.data.copa.matches[0];game.hg=2;game.ag=1;
 b.storage.set('centralfut-campeonatos-2026',JSON.stringify(before));
 // reinicializa com os dados preenchidos, pois o estado da instância é mantido em memória.
 const app={innerHTML:''},listeners={},storage=b.storage;let questions=0;
 const doc={body:{className:''},querySelector:s=>s==='#app'?app:null,addEventListener:(t,f)=>listeners[t]=f};
 const ctx=vm.createContext({document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){},clearTimeout(){},confirm(){questions++;return false},alert(){},URL,Date,console,Math,JSON,String,Number,Object});
 vm.runInContext(bundle,ctx,{timeout:20000});
 listeners.click({target:{closest:()=>({dataset:{action:'copa-draw',value:''}})}});
 const after=JSON.parse(storage.get('centralfut-campeonatos-2026'));
 assert.equal(questions,1);assert.equal(after.data.copa.matches[0].hg,2);
});

test('Copa mostra classificados e eliminados reais quando os dois jogos de uma chave terminam',()=>{
 const first=boot();first.click('league','copa');
 const payload=first.get();const games=payload.data.copa.matches;
 const firstTie=games.filter(m=>m.tie===games[0].tie);
 firstTie[0].hg=3;firstTie[0].ag=0;
 firstTie[1].hg=1;firstTie[1].ag=1;
 const second=boot();second.storage.set('centralfut-campeonatos-2026',JSON.stringify(payload));
 const live=bootFromStore(second.storage);
 live.click('league','copa');live.click('tab','clubs');
 assert.match(live.app.innerHTML,/Classificado/);
 assert.match(live.app.innerHTML,/Eliminado/);
 live.click('copa-filter','eliminated');
 assert.equal((live.app.innerHTML.match(/class="copa-club-card /g)||[]).length,1);
 live.click('copa-filter','qualified');
 assert.equal((live.app.innerHTML.match(/class="copa-club-card /g)||[]).length,1);
});
function bootFromStore(storage){
 const app={innerHTML:''},listeners={};
 const document={body:{className:''},querySelector:s=>s==='#app'?app:null,addEventListener:(t,f)=>listeners[t]=f};
 const ctx=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){},clearTimeout(){},confirm(){return true},alert(){},URL,Date,console,Math,JSON,String,Number,Object});
 vm.runInContext(bundle,ctx,{timeout:20000});
 return {app,storage,click:(action,value='')=>listeners.click({target:{closest:()=>({dataset:{action,value}})}}),get:()=>JSON.parse(storage.get('centralfut-campeonatos-2026'))};
}
test('Atalho do confronto na Copa mostra apenas os dois jogos da chave',()=>{
 const b=boot();b.click('league','copa');b.click('tab','bracket');
 const html=b.app.innerHTML;
 const match=html.match(/data-action="copa-tie-games" data-value="([^"]+)"/);
 assert.ok(match,'confronto deve ter ação de abrir jogos');
 b.click('copa-tie-games',match[1]);
 assert.match(b.app.innerHTML,/2 jogos/);
 assert.equal((b.app.innerHTML.match(/class="match-card"/g)||[]).length,2);
});
