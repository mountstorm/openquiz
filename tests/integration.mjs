import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://localhost:5173';
async function post(b,ok=true){const r=await fetch(base+'/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const d=await r.json();if(ok)assert.equal(r.status,200,JSON.stringify(d));else assert.notEqual(r.status,200);return d;}
async function get(s){const r=await fetch(base+'/api/game?code='+s.code,{headers:{Authorization:'Bearer '+s.token}});assert.equal(r.status,200);return r.json();}
const quiz={title:'Integration test',questions:[{text:'Pick four',options:['1','2','3','4'],correct:3,seconds:60},{text:'Pick one',options:['1','2','3','4'],correct:0,seconds:60}]};
const h=await post({action:'create',quiz});
const players=await Promise.all(Array.from({length:6},async(_,i)=>({code:h.code,...await post({action:'join',code:h.code,name:'Player '+i})})));
assert.equal((await get(h)).players.length,6);
await post({action:'start',...players[0]},false);
await post({action:'start',...h});
assert.equal((await get(players[0])).question.correct,undefined);
await Promise.all(players.map((p,i)=>post({action:'answer',...p,index:0,choice:i%2?0:3})));
await post({action:'answer',...players[0],index:0,choice:3},false);
assert.equal((await get(h)).answered,6);
await post({action:'reveal',...h});
const shown=await get(h);assert.equal(shown.question.correct,3);assert.deepEqual(shown.counts,[3,0,0,3]);assert.equal(shown.players.filter(p=>p.score>0).length,3);
await post({action:'leaderboard',...h});
assert.equal((await get(h)).question,null);
if((await get(h)).phase!=='final') await post({action:'next',...h});
await post({action:'answer',...players[0],index:0,choice:3},false);
await post({action:'reveal',...h});await post({action:'leaderboard',...h});
assert.equal((await get(h)).question,null);
if((await get(h)).phase!=='final') await post({action:'next',...h});assert.equal((await get(h)).phase,'final');
console.log('PASS: concurrent joins and answers for six players; hidden answers; permissions; duplicate and stale rejection; final results.');
