import test from 'node:test';
import assert from 'node:assert/strict';
import {createLibertadoresDrawnGroups, createLibertadoresOfficialGroups,LIB_POTS_2026,LIB_QUALIFIED_PRE3_2026,LIB_OFFICIAL_2026,clubMeta} from '../src/competition.js';

const potByClub=new Map(LIB_POTS_2026.flatMap((names,pot)=>names.map(name=>[name,pot])));

test('Sorteio regulamentar: mantém 32 clubes reais, um por pote e restrição de país',()=>{
  for(let i=0;i<125;i++){
    const edition=createLibertadoresDrawnGroups();
    assert.equal(edition.mode,'groups-draw-2026');
    assert.equal(edition.teams.length,32);
    assert.equal(edition.matches.length,96);
    assert.ok(edition.matches.every(m=>m.hg===null && m.ag===null));
    assert.equal(new Set(edition.teams.map(t=>t.name)).size,32);
    for(const group of 'ABCDEFGH'){
      const teams=edition.teams.filter(t=>t.group===group);
      assert.equal(teams.length,4);
      assert.deepEqual(new Set(teams.map(t=>potByClub.get(t.name))),new Set([0,1,2,3]));
      for(let a=0;a<4;a++) for(let b=a+1;b<4;b++){
        const A=teams[a],B=teams[b];
        if(A.country===B.country) assert.ok(LIB_QUALIFIED_PRE3_2026.includes(A.name)||LIB_QUALIFIED_PRE3_2026.includes(B.name),`País duplicado sem exceção: ${A.name}/${B.name}`);
      }
      assert.equal(edition.matches.filter(m=>m.group===group).length,12);
    }
  }
});

test('Retorno aos grupos oficiais mantém a composição original do sorteio',()=>{
 const edition=createLibertadoresOfficialGroups();
 for(const group of 'ABCDEFGH') assert.deepEqual(edition.teams.filter(t=>t.group===group).map(t=>t.name),LIB_OFFICIAL_2026[group]);
});

test('Universitario e Platense usam escudos reais do Wikimedia Commons',()=>{
 for(const [name,piece] of [['Universitario','Logo_oficial_de_Universitario.svg'],['Platense','Platense_crest_%282025%29.svg']]){
   const meta=clubMeta(name);
   assert.ok(meta?.logo.startsWith('https://upload.wikimedia.org/wikipedia/commons/'));
   assert.ok(meta.logo.includes(piece),`${name}: imagem não corrigida`);
 }
});
