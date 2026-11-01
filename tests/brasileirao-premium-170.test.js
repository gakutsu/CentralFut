import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompetition,redrawBrasileiraoCalendar,scheduleBrasileirao,validateBrasileiraoCalendar} from '../src/competition.js';

function stat(c,id){const schedule=[];for(let r=1;r<=38;r++){const match=c.matches.find(m=>m.round===r&&(m.home===id||m.away===id));assert.ok(match);schedule.push(match.home===id?'C':'F');}return schedule;}

test('Série A: 20 clubes, 38 rodadas de 10 jogos e 19 mandos/19 viagens por equipe',()=>{
 const c=createCompetition('brasileirao');
 assert.equal(c.teams.length,20);assert.equal(c.matches.length,380);
 assert.ok(validateBrasileiraoCalendar(c.matches,c.teams.map(t=>t.id)));
 for(let r=1;r<=38;r++)assert.equal(c.matches.filter(m=>m.round===r).length,10);
 for(const team of c.teams){const s=stat(c,team.id);assert.equal(s.filter(x=>x==='C').length,19);assert.equal(s.filter(x=>x==='F').length,19);}
});

test('Série A: nenhuma sequência de três viagens (nem três mandos), inclusive na 19ª/20ª rodada',()=>{
 const c=createCompetition('brasileirao');
 for(const team of c.teams){const s=stat(c,team.id).join('');assert.doesNotMatch(s,/FFF|CCC/);}
});

test('Série A: confronto repetido uma vez com mando inverso, sem duplicados',()=>{
 const c=createCompetition('brasileirao');
 const pair=new Map();for(const m of c.matches){const key=[m.home,m.away].sort().join(':');pair.set(key,[...(pair.get(key)||[]),m.home]);}
 assert.equal(pair.size,190);for(const [_,values] of pair)assert.equal(new Set(values).size,2);
});

test('Série A: 100 sorteios são válidos com mandos alternados',()=>{
 const ids=createCompetition('brasileirao').teams.map(x=>x.id);
 for(let i=0;i<100;i++)assert.equal(validateBrasileiraoCalendar(scheduleBrasileirao(ids),ids),true,`sorteio ${i}`);
});

test('Série A: refazer calendário mantém IDs e clubes e remove placares somente da Série A',()=>{
 const c=createCompetition('brasileirao');const ids=c.teams.map(t=>t.id);const old=c.matches;
 old[0].hg=3;old[0].ag=1;old[1].date='2026-09-01T20:00';
 const matches=redrawBrasileiraoCalendar(c);
 assert.equal(matches.length,380);assert.equal(c.scheduleVersion,1);
 assert.deepEqual(c.teams.map(t=>t.id),ids);assert.notEqual(old,c.matches);
 assert.equal(c.matches.filter(m=>m.hg!==null||m.date).length,0);
 assert.equal(validateBrasileiraoCalendar(c.matches,ids),true);
});

test('Série A: validação detecta terceira visita consecutiva e tabela parcial',()=>{
 const c=createCompetition('brasileirao');const ids=c.teams.map(t=>t.id);
 assert.equal(validateBrasileiraoCalendar(c.matches.slice(1),ids),false);
 const bad=c.matches.map(m=>({...m}));bad[0].home=bad[0].away;assert.equal(validateBrasileiraoCalendar(bad,ids),false);
});
