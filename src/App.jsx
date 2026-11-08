import {useState} from 'react';
import {NavLink,Routes,Route,Navigate,useNavigate} from 'react-router-dom';
import {LayoutDashboard,ListChecks,Shuffle,Bookmark,History,Trophy,User,Settings as Cog,Code2,Search,SlidersHorizontal} from 'lucide-react';
import {Dashboard,Problems,Practice,Bookmarks,Submissions,Leaderboard,Profile,SettingsPage} from './pages.jsx';
import ProblemDetails from './ProblemDetails.jsx';
const nav=[['/','Dashboard',LayoutDashboard],['/problems','Problems',ListChecks],['/practice','Practice',Shuffle],['/bookmarks','Bookmarks',Bookmark],['/submissions','Submissions',History],['/leaderboard','Leaderboard',Trophy],['/profile','Profile',User],['/settings','Settings',Cog]];
export default function App(){
 const [search,setSearch]=useState(''),navigate=useNavigate();
 const submitSearch=event=>{event.preventDefault();navigate(`/problems?search=${encodeURIComponent(search.trim())}`);};
 return(<div className="app">
<aside className="side"><NavLink to="/" className="brand"><span className="brand-mark"><Code2 size={21}/></span><span>Code<span className="brand-accent">Arena</span><small>CODE. COMPETE. GROW.</small></span></NavLink>
<div className="side-label">WORKSPACE</div>{nav.map(([to,l,I])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'on':''}><I size={18}/>{l}</NavLink>)}
<div className="sidebar-bottom"><div className="sidebar-tip"><span>DAILY CHALLENGE</span><b>One problem a day.</b><small>Build a streak, one solution at a time.</small></div></div>
</aside>
<div className="app-main"><header className="topbar"><div className="breadcrumb"><span>CodeArena</span><b>/</b><strong>Practice workspace</strong></div>
<form className="global-search" role="search" onSubmit={submitSearch}><Search size={16}/><input aria-label="Search problems" placeholder="Search problems..." value={search} onChange={event=>setSearch(event.target.value)}/><button type="submit">Search</button></form>
<div className="topbar-actions"><NavLink to="/settings" className="icon-action" title="Preferences"><SlidersHorizontal size={17}/></NavLink><NavLink to="/profile" className="profile-action" title="Profile"><span>CA</span><b>Coder</b></NavLink></div></header>
<main><Routes><Route path="/" element={<Dashboard/>}/><Route path="/problems" element={<Problems/>}/><Route path="/problems/:id" element={<ProblemDetails/>}/>
<Route path="/practice" element={<Practice/>}/><Route path="/bookmarks" element={<Bookmarks/>}/><Route path="/submissions" element={<Submissions/>}/>
<Route path="/leaderboard" element={<Leaderboard/>}/><Route path="/profile" element={<Profile/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></main></div></div>)}
