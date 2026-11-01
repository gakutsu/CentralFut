import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompetition,redrawCopaStage,activeMatches,currentStage,advance,stageWinners,champion} from '../src/competition.js';

const fixtures=c=>activeMatches(c,currentStage(c)).filter(m=>m.leg===1).map(m=>[m.home,m.away].sort().join('/')).sort().join('|');
const settled=c=>{
 for(const m of activeMatches(c,currentStage(c))){
   m.hg=m.leg===2?0:2;
   m.ag=m.leg===2?1:0;
 }
};
test('Copa sorteia 32 clubes apenas na fase atual, mantém IDs e calendário das outras competições',()=>{
 const c=createCompetition('copa'),other=createCompetition('paulista');
 const before=fixtures(c), ids=c.teams.map(t=>t.id).sort();
 const otherSnapshot=JSON.stringify(other);
 const newMatches=redrawCopaStage(c);
 assert.equal(newMatches.length,32);
 assert.equal(new Set(newMatches.map(m=>m.tie)).size,16);
 assert.equal(fixtures(c)===before,false,'um novo sorteio deve modificar os confrontos');
 assert.deepEqual(c.teams.map(t=>t.id).sort(),ids);
 assert.equal(JSON.stringify(other),otherSnapshot);
 assert.equal(c.lastDraw.stage,'copa5');
 assert.equal(c.lastDraw.number,1);
 assert.ok(c.matches.every(m=>m.hg===null&&m.ag===null));
});
test('Um novo sorteio da Copa reinicia somente jogos da fase atual',()=>{
 const c=createCompetition('copa');
 settled(c);advance(c);
 const initial=JSON.stringify(activeMatches(c,'copa5'));
 const current=activeMatches(c,'copa6');current[0].hg=3;current[0].ag=1;current[0].date='2026-11-01T18:00';
 redrawCopaStage(c);
 assert.equal(currentStage(c),'copa6');
 assert.equal(JSON.stringify(activeMatches(c,'copa5')),initial);
 assert.ok(activeMatches(c,'copa6').every(m=>m.hg===null&&m.ag===null&&!m.date));
 assert.equal(c.advanced.join(','),'copa5');
});
test('Sorteio repetido não altera elenco e gera novo chaveamento',()=>{
 const c=createCompetition('copa');
 const first=fixtures(c);
 redrawCopaStage(c);const second=fixtures(c);
 redrawCopaStage(c);const third=fixtures(c);
 assert.notEqual(first,second);assert.notEqual(second,third);
 assert.equal(new Set(c.matches.flatMap(m=>[m.home,m.away])).size,32);
 assert.equal(c.lastDraw.number,2);
});
test('Sorteio chega à final e não pode ser usado em outras competições',()=>{
 const c=createCompetition('copa');
 for(let i=0;i<4;i++){settled(c);advance(c);}
 assert.equal(currentStage(c),'copa9');
 const draw=redrawCopaStage(c);
 assert.equal(draw.length,1);
 assert.equal(new Set([draw[0].home,draw[0].away]).size,2);
 assert.throws(()=>redrawCopaStage(createCompetition('paulista')),/Copa reduzida/);
});
