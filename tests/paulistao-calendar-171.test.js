import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompetition,schedulePaulistaShuffled,validatePaulistaCalendar,redrawPaulistaCalendar,advance,PAULISTA_OPP} from '../src/competition.js';

function normalizedPairs(c){return c.matches.map(m=>[m.home,m.away].sort().join(':')).sort();}
function homeAway(c,id){return Array.from({length:8},(_,i)=>{const m=c.matches.find(m=>m.round===i+1 && (m.home===id||m.away===id));assert.ok(m);return m.home===id?'C':'F';}).join('');}

test('Paulistão: 8 rodadas completas, 64 jogos e 4 mandos/4 visitas por clube',()=>{
 const c=createCompetition('paulista');
 assert.ok(validatePaulistaCalendar(c.matches,c.teams));
 for(let r=1;r<=8;r++)assert.equal(c.matches.filter(m=>m.round===r).length,8);
 for(const t of c.teams){const s=homeAway(c,t.id);assert.equal(s.length,8);assert.equal(s.split('C').length-1,4);assert.equal(s.split('F').length-1,4);assert.doesNotMatch(s,/CCC|FFF/);}
});
test('Paulistão: 200 sorteios de primeira fase válidos, com adversários oficiais preservados',()=>{
 const c=createCompetition('paulista');const pairs=normalizedPairs(c);
 for(let i=0;i<200;i++){
  const ms=schedulePaulistaShuffled(c.teams);
  assert.equal(validatePaulistaCalendar(ms,c.teams),true,`tentativa ${i}`);
  assert.deepEqual(ms.map(m=>[m.home,m.away].sort().join(':')).sort(),pairs);
 }
});
test('Paulistão: refazer sorteio mantém IDs e nomes editados, substituindo jogos',()=>{
 const c=createCompetition('paulista');c.teams[0].name='Clube Personalizado';
 const old=c.matches,ids=c.teams.map(t=>t.id),pairs=normalizedPairs(c);
 old[0].hg=3;old[0].ag=0;old[1].date='2026-08-01T16:00';
 redrawPaulistaCalendar(c);
 assert.equal(c.scheduleVersion,1);
 assert.deepEqual(c.teams.map(t=>t.id),ids);
 assert.equal(c.teams[0].name,'Clube Personalizado');
 assert.notEqual(c.matches,old);
 assert.deepEqual(normalizedPairs(c),pairs);
 assert.ok(c.matches.every(m=>m.hg===null&&!m.date));
 assert.equal(validatePaulistaCalendar(c.matches,c.teams),true);
});
test('Paulistão: bloqueia refazer calendário depois de gerar quartas de final',()=>{
 const c=createCompetition('paulista');
 c.matches.forEach(m=>{m.hg=1;m.ag=0;});advance(c);
 const orig=c.matches;
 assert.throws(()=>redrawPaulistaCalendar(c),/quartas|mata-mata/i);
 assert.equal(c.matches,orig);
});
test('Paulistão: validação detecta calendário corrompido e confronto duplicado',()=>{
 const c=createCompetition('paulista');const x=c.matches.map(m=>({...m}));
 x[0].home=x[0].away;assert.equal(validatePaulistaCalendar(x,c.teams),false);
 const bad=c.matches.slice(1);assert.equal(validatePaulistaCalendar(bad,c.teams),false);
});
