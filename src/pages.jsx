import {useState} from 'react';import {Link,Navigate,useSearchParams} from 'react-router-dom';import {Bookmark as BM,Check} from 'lucide-react';
import {problems,TOPICS,users} from './data/problems.js';import {useStore,update,reset,streak} from './services/storage.js';
const pts={Easy:10,Medium:20,Hard:40};
const stats=s=>{const done=problems.filter(p=>s.solved[p.id]);const by=d=>done.filter(p=>p.difficulty===d).length;
 return{done:done.length,Easy:by('Easy'),Medium:by('Medium'),Hard:by('Hard'),points:done.reduce((a,p)=>a+pts[p.difficulty],0),streak:streak(s.days)}};
const Stat=({l,v})=><div className="card"><small>{l}</small><h2>{v}</h2></div>;
const difficultyColors={Easy:'#3ddc97',Medium:'#f472b6',Hard:'#ff6b6b'};
const asDay=date=>date.toISOString().slice(0,10);
const recentDays=()=>Array.from({length:7},(_,index)=>{const date=new Date();date.setUTCHours(0,0,0,0);date.setUTCDate(date.getUTCDate()-(6-index));return asDay(date)});
function ProgressOverview({totals}){
 const done=totals.Easy+totals.Medium+totals.Hard;
 const easy=problems.filter(problem=>problem.difficulty==='Easy').length;
 const medium=problems.filter(problem=>problem.difficulty==='Medium').length;
 const hard=problems.filter(problem=>problem.difficulty==='Hard').length;
 const total=problems.length,angle=value=>total?value/total*360:0;
 const easyEnd=angle(totals.Easy),mediumEnd=easyEnd+angle(totals.Medium),hardEnd=mediumEnd+angle(totals.Hard);
 const chartStyle={'--easy-color':difficultyColors.Easy,'--medium-color':difficultyColors.Medium,'--hard-color':difficultyColors.Hard,
  background:`conic-gradient(${difficultyColors.Easy} 0deg ${easyEnd}deg, ${difficultyColors.Medium} ${easyEnd}deg ${mediumEnd}deg, ${difficultyColors.Hard} ${mediumEnd}deg ${hardEnd}deg, #292e3b ${hardEnd}deg 360deg)`};
 return <section className="progress-card">
  <div className="progress-chart" style={chartStyle} role="img" aria-label={`${done} of ${total} problems solved: ${totals.Easy} easy, ${totals.Medium} medium, ${totals.Hard} hard`}>
   <div className="progress-chart-center"><strong>{done}</strong><span>solved</span><small>of {total}</small></div>
  </div>
  <div className="progress-breakdown"><h2>Problem progress</h2><p className="muted">Solved problems by difficulty</p>
   {[['Easy',totals.Easy,easy],['Medium',totals.Medium,medium],['Hard',totals.Hard,hard]].map(([label,count,totalCount])=><div className="difficulty-progress" key={label}>
    <span className="difficulty-key" style={{'--difficulty-color':difficultyColors[label]}}/><b>{label}</b><span>{count} / {totalCount}</span>
    <div className="difficulty-track"><i style={{width:`${totalCount?Math.min(100,count/totalCount*100):0}%`,'--difficulty-color':difficultyColors[label]}}/></div>
   </div>)}
  </div>
 </section>;
}
function DailyProgress({store,currentStreak}){
 const today=asDay(new Date()),target=1;
 const solvedToday=new Set(store.subs.filter(sub=>sub.verdict==='Accepted'&&sub.at?.slice(0,10)===today).map(sub=>sub.pid)).size;
 const progress=Math.min(target,solvedToday),complete=progress>=target;
 const days=recentDays();
 return <section className="daily-progress-card">
  <div className="daily-streak-heading"><span className="flame">🔥</span><div><small>Current streak</small><strong>{currentStreak} {currentStreak===1?'day':'days'}</strong></div></div>
  <p>{complete?'Daily goal complete — great work!':'Solve a problem today to keep your streak going.'}</p>
  <div className="daily-goal-row"><b>Daily progress</b><span>{progress}/{target} solved</span></div>
  <div className="daily-goal-track" role="progressbar" aria-label="Daily progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={target}><i style={{width:`${progress/target*100}%`}}/></div>
  <div className="week-activity" aria-label="Activity for the last seven days">{days.map((day,index)=><div className="week-day" key={day}>
   <span className={store.days.includes(day)?'day-dot active':'day-dot'} title={store.days.includes(day)?'Accepted submission':'No accepted submission'}>{store.days.includes(day)?'✓':''}</span>
   <small>{['S','M','T','W','T','F','S'][new Date(`${day}T00:00:00Z`).getUTCDay()]}</small>
  </div>)}</div>
 </section>;
}
function List({items}){const s=useStore();if(!items.length)return<p className="empty-state">No problems to show.</p>;
 return<div className="problem-list">{items.map(p=><article className="problem-row" key={p.id}><span className="problem-id">{String(p.id).padStart(2,'0')}</span>
 <div className="problem-row-title"><Link to={'/problems/'+p.id}><b>{p.title}</b></Link><small>{p.topics.join(' · ')}</small></div>
 <span className={`tag ${p.difficulty}`}>{p.difficulty}</span><span className={s.solved[p.id]?'solved-state':'unsolved-state'}>{s.solved[p.id]?<><Check size={14}/>Solved</>:'To do'}</span>
 <button className="bookmark-button" title={s.bookmarks.includes(p.id)?'Remove bookmark':'Bookmark'} aria-label={s.bookmarks.includes(p.id)?'Remove bookmark':'Bookmark'} onClick={()=>update(x=>({...x,bookmarks:x.bookmarks.includes(p.id)?x.bookmarks.filter(i=>i!==p.id):[...x.bookmarks,p.id]}))}><BM size={17} fill={s.bookmarks.includes(p.id)?'currentColor':'none'}/></button></article>)}</div>}
export function Dashboard(){const s=useStore(),t=stats(s),daily=problems[new Date().getDate()%problems.length];
 const recent=s.subs.slice(0,5);
 return<div className="page dashboard-page"><h1>Welcome back, Coder 👋</h1><div className="dashboard-overview"><ProgressOverview totals={t}/><DailyProgress store={s} currentStreak={t.streak}/></div>
 <div className="card"><h3>Daily challenge</h3><Link to={'/problems/'+daily.id}>{daily.title}</Link> <span className={'tag '+daily.difficulty}>{daily.difficulty}</span></div>
 <div className="card"><h3>Recently attempted</h3>{recent.length?recent.map((r,i)=><div key={i}>{problems.some(p=>p.id===r.pid&&p.title===r.title)?<Link to={'/problems/'+r.pid}>{r.title}</Link>:r.title} — {r.verdict}</div>):<small>No submissions yet.</small>}</div>
 <Link className="btn" to="/problems">Browse problems</Link></div>}
export function Problems(){const s=useStore(),[params,setParams]=useSearchParams();const [q,setQ]=useState(params.get('search')||''),[d,setD]=useState(''),[t,setT]=useState(''),[o,setO]=useState('id');
 const items=problems.filter(p=>(p.title.toLowerCase().includes(q.toLowerCase())||p.topics.some(topic=>topic.toLowerCase().includes(q.toLowerCase())))&&(!d||p.difficulty===d)&&(!t||p.topics.includes(t))).sort((a,b)=>o==='diff'?pts[a.difficulty]-pts[b.difficulty]:a.id-b.id);
 const search=value=>{setQ(value);setParams(value?{search:value}:{})};
 return<div className="page explorer-page"><div className="page-heading"><div><span className="eyebrow">PRACTICE LIBRARY</span><h1>Problem Set</h1><p>Sharpen your skills with curated coding challenges.</p></div><div className="problem-total"><strong>{problems.length}</strong><span>problems</span></div></div>
 <div className="explorer-toolbar"><label className="explorer-search"><span>⌕</span><input aria-label="Filter problems" placeholder="Search by title or topic..." value={q} onChange={e=>search(e.target.value)}/></label>
 <select aria-label="Filter by difficulty" value={d} onChange={e=>setD(e.target.value)}><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
 <select aria-label="Filter by topic" value={t} onChange={e=>setT(e.target.value)}><option value="">All topics</option>{TOPICS.map(x=><option key={x}>{x}</option>)}</select>
 <select aria-label="Sort problems" value={o} onChange={e=>setO(e.target.value)}><option value="id">Sort: ID</option><option value="diff">Sort: Difficulty</option></select></div>
 <section className="explorer-table"><div className="explorer-table-heading"><span>CHALLENGE</span><span>DIFFICULTY</span><span>STATUS</span><span></span></div><List items={items}/></section><p className="result-count">Showing {items.length} of {problems.length} problems</p></div>}
export function Practice(){const s=useStore();const left=problems.filter(p=>!s.solved[p.id]);const p=(left.length?left:problems)[Math.floor(Math.random()*(left.length||problems.length))];return<Navigate to={'/problems/'+p.id} replace/>}
export const Bookmarks=()=>{const s=useStore();return<div className="page"><h1>Bookmarks</h1><List items={problems.filter(p=>s.bookmarks.includes(p.id))}/></div>};
export function Submissions(){const s=useStore();return<div className="page"><h1>Submissions</h1>{s.subs.length?<table><thead><tr><th>Problem</th><th>Language</th><th>Result</th><th>Tests</th><th>Time</th></tr></thead><tbody>{s.subs.map((r,i)=><tr key={i}><td>{problems.some(p=>p.id===r.pid&&p.title===r.title)?<Link to={'/problems/'+r.pid}>{r.title}</Link>:r.title}</td><td>{r.lang}</td><td className={r.verdict==='Accepted'?'ok':'bad'}>{r.verdict}</td><td>{r.passed}/{r.total}</td><td>{new Date(r.at).toLocaleString()}</td></tr>)}</tbody></table>:<p>No submissions yet.</p>}</div>}
export function Leaderboard(){const s=useStore(),t=stats(s);const rows=[...users.map(([n,a,b,c])=>({n,a,b,c})),{n:'you',a:t.done,b:t.points,c:t.streak}].sort((x,y)=>y.b-x.b);
 return<div className="page"><h1>Leaderboard</h1><table><thead><tr><th>Rank</th><th>User</th><th>Solved</th><th>Points</th><th>Streak</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.n} className={r.n==='you'?'me':''}><td>{i+1}</td><td>{r.n}</td><td>{r.a}</td><td>{r.b}</td><td>{r.c}</td></tr>)}</tbody></table></div>}
export function Profile(){const s=useStore(),t=stats(s);return<div className="page"><h1>👤 coder</h1><p>Member of CodeArena · Preferred language: {s.lang}</p><div className="grid"><Stat l="Solved" v={t.done}/><Stat l="Easy" v={t.Easy}/><Stat l="Medium" v={t.Medium}/><Stat l="Hard" v={t.Hard}/><Stat l="Streak" v={t.streak}/><Stat l="Points" v={t.points}/></div><p>{s.subs.length} total submissions. <Link to="/submissions">View history</Link></p></div>}
export function SettingsPage(){const s=useStore();return<div className="page"><h1>Settings</h1><label>Default language <select value={s.lang} onChange={e=>update(x=>({...x,lang:e.target.value}))}><option value="python">Python</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="cpp">C++</option></select></label>
 <p><button className="bad" onClick={()=>window.confirm('Erase all progress?')&&reset()}>Reset all data</button></p></div>}
