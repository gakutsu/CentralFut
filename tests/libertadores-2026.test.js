import test from 'node:test';
import assert from 'node:assert/strict';
import {LIB_OFFICIAL_2026,LIB_DIRECT_2026,LIB_PRE1_2026,LIB_PRE2_2026,LIB_COUNTRIES,
 createCompetition,createLibertadoresOfficialGroups,advance,activeMatches,currentStage,played} from '../src/competition.js';

test('Libertadores oficial 2026: oito grupos de quatro com todos os 32 clubes do sorteio',()=>{
 const c=createLibertadoresOfficialGroups();
 assert.equal(c.mode,'groups-official-2026');
 assert.equal(c.teams.length,32);
 assert.equal(c.matches.length,96);
 assert.ok(c.matches.every(m=>!played(m)));
 assert.ok(c.teams.every(t=>t.logo && t.country && !t.placeholder));
 assert.equal(new Set(c.teams.map(t=>t.name)).size,32);
 assert.equal(new Set(c.teams.map(t=>t.country)).size,10);
 for(const group of 'ABCDEFGH'){
  assert.deepEqual(c.teams.filter(t=>t.group===group).map(t=>t.name),LIB_OFFICIAL_2026[group]);
  assert.equal(activeMatches(c,'groups').filter(m=>m.group===group).length,12);
 }
});
test('Libertadores 2026: cadastrados todos os 47 inscritos, sem vagas genéricas ou duplicadas',()=>{
 const c=createCompetition('libertadores');
 assert.equal(c.mode,'qualifiers-2026');
 assert.equal(c.teams.length,47);
 assert.ok(c.teams.every(t=>t.name && !t.placeholder && t.country));
 assert.equal(new Set(c.teams.map(t=>t.name)).size,47);
 assert.equal(c.teams.filter(t=>t.kind==='pre1').length,6);
 assert.equal(c.teams.filter(t=>t.kind==='pre2').length,13);
 assert.equal(c.teams.filter(t=>t.kind==='direct').length,28);
 assert.deepEqual(c.teams.filter(t=>t.kind==='pre1').map(t=>t.name),LIB_PRE1_2026);
 assert.deepEqual(c.teams.filter(t=>t.kind==='pre2').map(t=>t.name),LIB_PRE2_2026);
 assert.equal(LIB_DIRECT_2026.length,28);
 assert.equal(activeMatches(c,'pre1').length,6);
 assert.ok(c.matches.every(m=>!played(m)));
});
test('Primeira fase reproduz confrontos oficiais de 2026 e manda segundo jogo para rival',()=>{
 const c=createCompetition('libertadores');
 const one=activeMatches(c,'pre1').filter(m=>m.leg===1);
 const name=id=>c.teams.find(t=>t.id===id)?.name;
 assert.deepEqual(one.map(m=>[name(m.home),name(m.away)]),[
  ['The Strongest','Deportivo Táchira'],['2 de Mayo','Alianza Lima'],['Juventud-URU','Universidad Católica-EQU']
 ]);
 for(const m of one){const m2=activeMatches(c,'pre1').find(x=>x.tie===m.tie&&x.leg===2);assert.equal(m2.home,m.away);assert.equal(m2.away,m.home);}
});
test('Avanço das 3 preliminares usa 47 inscritos reais e gera grupos de quatro sem placares',()=>{
 const c=createCompetition('libertadores');
 const steps=[['pre1',16],['pre2',8],['pre3',96]];
 for(const [stage,expected] of steps){
  for(const m of activeMatches(c,stage)){m.hg=m.leg===1?1:0;m.ag=m.leg===2?1:0;}
  advance(c);
  assert.equal(activeMatches(c,currentStage(c)).length,expected);
 }
 for(const group of 'ABCDEFGH'){
  assert.equal(c.teams.filter(t=>t.group===group&&activeMatches(c,'groups').some(m=>m.home===t.id||m.away===t.id)).length,4);
 }
 assert.ok(activeMatches(c,'groups').every(m=>!played(m)));
});
