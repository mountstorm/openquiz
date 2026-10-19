export type Question = { text: string; options: string[]; correct: number; seconds: number; image?: string; imageAlt?: string; explanation?: string; source?: string };
export type Quiz = { title: string; questions: Question[] };
export type Player = { id: string; token: string; name: string; score: number; answers: Record<string, { choice: number; points: number }> };
export type Room = { code: string; host: string; quiz: Quiz; phase: 'lobby'|'question'|'reveal'|'leaderboard'|'final'; index: number; deadline: number; revealUntil?: number; players: Player[] };
export function validImage(value: unknown): boolean {
 if (typeof value !== 'string' || value.length > 2000) return false;
 if (/^\/photos\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(value)) return true;
 try { const u=new URL(value); return u.protocol==='https:' && !u.username && !u.password; } catch { return false; }
}
export function validateQuiz(q: Quiz) {
 if (!q || typeof q.title !== 'string' || !q.title.trim() || q.title.length > 100 || !Array.isArray(q.questions) || q.questions.length < 1 || q.questions.length > 50) throw Error('Add a title and between 1 and 50 questions.');
 for (const x of q.questions) if (!x || typeof x.text !== 'string' || !x.text.trim() || x.text.length > 300 || !Array.isArray(x.options) || x.options.length !== 4 || x.options.some(o=>typeof o !== 'string'||!o.trim()||o.length>120) || !Number.isInteger(x.correct) || x.correct < 0 || x.correct > 3 || ![10,20,30,60].includes(x.seconds)) throw Error('Each question needs four answers, a correct answer, and a 10, 20, 30, or 60 second timer.');
 for (const x of q.questions) {
  if (x.image && !validImage(x.image)) throw Error('Photos need a valid HTTPS image URL.');
  if (x.imageAlt && (typeof x.imageAlt !== 'string'||x.imageAlt.length>200)) throw Error('Photo descriptions must be under 200 characters.');
  if (x.explanation && (typeof x.explanation !== 'string'||x.explanation.length>600)) throw Error('Explanations must be under 600 characters.');
  if (x.source && (typeof x.source !== 'string'||x.source.length>2000||!/^https:\/\//.test(x.source))) throw Error('Sources must use HTTPS.');
 }
}
export function phase(r: Room, now=Date.now()) {
 const revealEnd=r.phase==='question'?r.deadline+3000:r.revealUntil;
 if((r.phase==='question'&&now>=r.deadline)||r.phase==='reveal'){
  if(revealEnd!==undefined&&now>=revealEnd)return r.index+1===r.quiz.questions.length?'final':'leaderboard';
  return 'reveal';
 }
 return r.phase;
}
export function apply(r: Room, b: any, now=Date.now()) {
 if(b.action==='join') {
  if(r.phase!=='lobby') throw Error('This game has already started.');
  const name=typeof b.name==='string'?b.name.trim():'';
  if(!name||name.length>24) throw Error('Use a nickname of 1–24 characters.');
  if(r.players.length>=200) throw Error('This room is full.');
  if(r.players.some(p=>p.name.toLowerCase()===name.toLowerCase())) throw Error('That nickname is taken.');
  const p={id:crypto.randomUUID(),token:crypto.randomUUID(),name,score:0,answers:{}};r.players.push(p);return {token:p.token};
 }
 if(b.action==='answer') {
  const p=r.players.find(p=>p.token===b.token);if(!p) throw Error('Join this game first.');
  if(phase(r,now)!=='question'||b.index!==r.index) throw Error('This question is closed.');
  if(p.answers[r.index]) throw Error('Your answer is already locked in.');
  if(!Number.isInteger(b.choice)||b.choice<0||b.choice>3) throw Error('Choose an answer.');
  const q=r.quiz.questions[r.index];const points=b.choice===q.correct?500+Math.round(500*Math.max(0,Math.min(1,(r.deadline-now)/(q.seconds*1000)))):0;
  p.answers[r.index]={choice:b.choice,points};p.score+=points;return {};
 }
 if(b.token!==r.host) throw Error('Only the host can control this game.');
 if(b.action==='start'&&r.phase==='lobby') { r.phase='question';r.index=0;r.deadline=now+r.quiz.questions[0].seconds*1000; }
 else if(b.action==='reveal'&&phase(r,now)==='question') {r.phase='reveal';r.revealUntil=now+3000;}
 else if(b.action==='leaderboard'&&phase(r,now)==='reveal') {r.phase=r.index+1===r.quiz.questions.length?'final':'leaderboard';}
 else if(b.action==='next'&&phase(r,now)==='leaderboard') {r.index++;if(r.index>=r.quiz.questions.length){r.index=r.quiz.questions.length-1;r.phase='final';}else {r.phase='question';r.deadline=now+r.quiz.questions[r.index].seconds*1000;}}
 else throw Error('That action is not available now.');
 return {};
}
export function view(r:Room,token:string,now=Date.now()) {
 const p=r.players.find(p=>p.token===token);const host=token===r.host;if(!host&&!p) throw Error('Your game session was not found.');
 const stage=phase(r,now),show=stage==='reveal'||stage==='leaderboard'||stage==='final',q=r.quiz.questions[r.index];
 const previous=[...r.players].sort((a,b)=>(b.score-(b.answers[r.index]?.points??0))-(a.score-(a.answers[r.index]?.points??0)));
 const standings=r.players.map(p=>{let streak=0;for(let i=r.index;i>=0&&p.answers[i]?.points>0;i--)streak++;return {id:p.id,name:p.name,score:stage==='question'?p.score-(p.answers[r.index]?.points??0):p.score,...(show?{previousScore:p.score-(p.answers[r.index]?.points??0),previousRank:1+previous.filter(x=>x.score-(x.answers[r.index]?.points??0)>p.score-(p.answers[r.index]?.points??0)).length,roundPoints:p.answers[r.index]?.points??0,streak}:{})};}).sort((a,b)=>b.score-a.score);
 const ranked=standings.map(p=>({...p,rank:1+standings.filter(x=>x.score>p.score).length}));
 return {code:r.code,title:r.quiz.title,phase:stage,index:r.index,total:r.quiz.questions.length,deadline:r.deadline,serverTime:now,host,question:['lobby','leaderboard','final'].includes(stage)?null:{text:q.text,options:q.options,seconds:q.seconds,image:q.image,imageAlt:q.imageAlt,...(show?{correct:q.correct,explanation:q.explanation,source:q.source}:{})},players:ranked,answered:r.players.filter(p=>p.answers[r.index]).length,me:p?{id:p.id,choice:p.answers[r.index]?.choice,...(show?{points:p.answers[r.index]?.points??0}:{})}:null,counts:show?q.options.map((_,i)=>r.players.filter(p=>p.answers[r.index]?.choice===i).length):null};
}
