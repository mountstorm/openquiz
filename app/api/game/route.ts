import { env } from 'cloudflare:workers';
import { apply, view, validateQuiz, type Room } from '../../../lib/game';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function db(){if(!env.DB)throw Error('Game database is unavailable.');return env.DB;}
async function read(code:string){const row=await db().prepare('SELECT state, revision FROM rooms WHERE code = ? AND expires > ?').bind(code,Date.now()).first<{state:string;revision:number}>();if(!row)throw Error('Game not found. Check the six-digit code.');return {room:JSON.parse(row.state) as Room,revision:row.revision};}
export async function GET(req:Request){try{const u=new URL(req.url);const {room}=await read(u.searchParams.get('code')||'');return reply(view(room,req.headers.get('Authorization')?.replace('Bearer ','')||''));}catch(e){return reply({error:(e as Error).message},400);}}
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return reply({error:'Invalid origin.'},403);
 const raw=await req.text();if(raw.length>60000)return reply({error:'Quiz is too large.'},413);const b=JSON.parse(raw);
 if(b.action==='create'){
 validateQuiz(b.quiz);await db().prepare('DELETE FROM rooms WHERE expires < ?').bind(Date.now()).run();
 for(let i=0;i<8;i++){const bytes=crypto.getRandomValues(new Uint32Array(1));const code=String(100000+bytes[0]%900000);const r:Room={code,host:crypto.randomUUID(),quiz:b.quiz,phase:'lobby',index:0,deadline:0,players:[]};const result=await db().prepare('INSERT OR IGNORE INTO rooms(code,state,revision,expires) VALUES (?,?,0,?)').bind(code,JSON.stringify(r),Date.now()+86400000).run();if(result.meta.changes)return reply({code,token:r.host});}throw Error('Could not create room. Try again.');
 }
 if(typeof b.code!=='string'||!/^\d{6}$/.test(b.code))throw Error('Enter a six-digit game code.');
 for(let i=0;i<8;i++){const {room,revision}=await read(b.code);const result=apply(room,b);const saved=await db().prepare('UPDATE rooms SET state = ?, revision = revision + 1 WHERE code = ? AND revision = ?').bind(JSON.stringify(room),b.code,revision).run();if(saved.meta.changes)return reply(result);}return reply({error:'The room is busy. Please try again.'},409);
 }catch(e){return reply({error:(e as Error).message},400);}}
