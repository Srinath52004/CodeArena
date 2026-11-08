import {useEffect,useRef,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {Play,Send,Loader2,RotateCcw} from 'lucide-react';
import {problems,getStarter} from './data/problems.js';
import {LANGS,runCode} from './services/codeExecution.js';
import {useStore,update,today} from './services/storage.js';

const statusClass=status=>status==='Accepted'||status==='Executed'?'ok':status==='Running'?'':'bad';
const tabs=[['samples','Sample Test Cases'],['custom','Custom Test Cases'],['all','All Test Cases']];
export default function ProblemDetails(){
  const {id}=useParams(),p=problems.find(x=>x.id===Number(id)),store=useStore();
  const [lang,setLang]=useState(store.lang),[code,setCode]=useState(''),[results,setResults]=useState({}),[hiddenResults,setHiddenResults]=useState([]),
    [busy,setBusy]=useState(false),[custom,setCustom]=useState(''),[tab,setTab]=useState('samples'),[selected,setSelected]=useState('S1'),
    [summary,setSummary]=useState(null),[requestError,setRequestError]=useState(''),[leftWidth,setLeftWidth]=useState(44);
  const draftKey=`code:v2:${id}:${lang}`;
  const splitRef=useRef(null);
  const editorRef=useRef(null),monacoRef=useRef(null),errorDecorations=useRef([]);

  useEffect(()=>{
    setCode(localStorage.getItem(draftKey)||getStarter(p||problems[0],lang));
    setResults({});setHiddenResults([]);setSummary(null);setRequestError('');
  },[id,lang,p,draftKey]);

  if(!p)return <div className="page"><h1>Problem not found</h1><Link to="/problems">Back to problems</Link></div>;
  const edit=value=>{const next=value||'';setCode(next);localStorage.setItem(draftKey,next);};
  const jumpToLine=line=>{
    const editor=editorRef.current,monaco=monacoRef.current,model=editor?.getModel();
    if(!editor||!monaco||!model||line<1||line>model.getLineCount())return;
    const range=new monaco.Range(line,1,line,1);
    errorDecorations.current=editor.deltaDecorations(errorDecorations.current,[{range,options:{isWholeLine:true,className:'error-line-highlight',glyphMarginClassName:'error-line-glyph'}}]);
    editor.revealLineInCenter(line);editor.setPosition({lineNumber:line,column:1});editor.focus();
  };
  const publicCases=p.testCases;

  async function runCases(cases){
    setBusy(true);setRequestError('');setSummary(null);setHiddenResults([]);
    try{
      for(const test of cases){
        setResults(previous=>({...previous,[test.id]:{...test,status:'Running'}}));
        const result=await runCode(lang,code,test.input,test.expected,p.id);
        setResults(previous=>({...previous,[test.id]:{...test,...result}}));
      }
    }finally{setBusy(false);}
  }
  async function runCustom(){
    setBusy(true);setRequestError('');setSummary(null);setHiddenResults([]);
    try{
      const result=await runCode(lang,code,custom,null,p.id);
      setResults(previous=>({...previous,custom:{id:'Custom input',input:custom,expected:null,...result}}));
    }finally{setBusy(false);}
  }
  async function submit(){
    setBusy(true);setRequestError('');setSummary(null);setResults({});
    try{
      const response=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({problemId:p.id,language:lang,code})});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||`Submission service returned ${response.status}.`);
      setSummary(payload);setHiddenResults(payload.hiddenCases||[]);
      const next={};
      for(const result of payload.cases||[])next[result.id]={...result};
      setResults(next);
      update(state=>({
        ...state,
        subs:[{pid:p.id,title:p.title,lang,verdict:payload.verdict,passed:payload.passed,total:payload.total,at:new Date().toISOString()},...state.subs],
        solved:payload.verdict==='Accepted'?{...state.solved,[p.id]:true}:state.solved,
        days:payload.verdict==='Accepted'&&!state.days.includes(today())?[...state.days,today()]:state.days
      }));
      setTab('all');
    }catch(error){setRequestError(error.message||'Submission failed.');}
    finally{setBusy(false);}
  }
  const runSelected=()=>tab==='custom'?runCustom():runCases(publicCases.filter(test=>test.id===selected).slice(0,1).length?publicCases.filter(test=>test.id===selected).slice(0,1):publicCases.slice(0,1));
  const runOne=test=>{setSelected(test.id);runCases([test]);};
  const resize=e=>{
    if(!splitRef.current||!e.currentTarget.hasPointerCapture(e.pointerId))return;
    const bounds=splitRef.current.getBoundingClientRect();
    setLeftWidth(Math.max(28,Math.min(68,((e.clientX-bounds.left)/bounds.width)*100)));
  };
  const publicResults=Object.values(results).filter(result=>result.id&&result.id!=='Custom input');
  const passed=summary?.passed??publicResults.filter(result=>result.status==='Accepted').length;
  const failed=summary?.failed??publicResults.filter(result=>result.status&&result.status!=='Accepted'&&result.status!=='Running').length;

  return <div className="split" ref={splitRef} style={{'--left-width':`${leftWidth}%`}}>
    <section className="left problem-pane">
      <div className="problem-heading"><div><h1>{p.id}. {p.title}</h1><span className={`tag ${p.difficulty}`}>{p.difficulty}</span>{p.topics.map(topic=><span className="tag" key={topic}>{topic}</span>)}</div></div>
      <h2>Problem Description</h2><p>{p.description}</p>
      <h3>Task Explanation</h3><p>{p.taskExplanation}</p>
      <h3>Input Format</h3><p>{p.input}</p><h3>Output Format</h3><p>{p.output}</p>
      <h3>Constraints</h3><p>{p.constraints}</p>
      {p.examples.map((example,index)=><section className="example" key={index}><h3>Example {index+1}</h3>
        <b>Input</b><pre>{example.input||'(empty input)'}</pre><b>Output</b><pre>{example.output||'(empty output)'}</pre>
        <b>Explanation</b><p>{example.explanation}</p></section>)}
      <h3>Edge Cases</h3><p>{p.edgeCases}</p>
      <h3>Expected Complexity</h3><p><b>Time:</b> {p.timeComplexity} · <b>Space:</b> {p.spaceComplexity}</p>
      <h3>Related Topics</h3><p>{p.topics.join(' · ')}</p>
    </section>
    <div className="splitter" role="separator" aria-label="Resize problem and editor panels" onPointerDown={e=>e.currentTarget.setPointerCapture(e.pointerId)} onPointerMove={resize} onPointerUp={e=>e.currentTarget.releasePointerCapture(e.pointerId)}/>
    <section className="right workspace-pane">
      <div className="editor-toolbar">
        <select aria-label="Programming language" value={lang} onChange={e=>setLang(e.target.value)}>{Object.entries(LANGS).map(([key,value])=><option key={key} value={key}>{value.label}</option>)}</select>
        <button disabled={busy} onClick={runSelected}><Play size={14}/>Run</button>
        <button disabled={busy} className="pri" onClick={submit}>{busy?<Loader2 className="spin" size={14}/>:<Send size={14}/>}Submit</button>
        <button disabled={busy} onClick={()=>{setCode(getStarter(p,lang));localStorage.removeItem(draftKey);}}><RotateCcw size={14}/>Reset</button>
      </div>
      <Editor height="42vh" theme="vs-dark" language={LANGS[lang].monaco} value={code} onChange={edit}
        onMount={(editor,monaco)=>{editorRef.current=editor;monacoRef.current=monaco;}}
        options={{minimap:{enabled:false},fontSize:14,tabSize:4,automaticLayout:true,scrollBeyondLastLine:false,glyphMargin:true}}/>
      <section className="test-panel">
        <div className="test-tabs" role="tablist">{tabs.map(([key,label])=><button key={key} role="tab" aria-selected={tab===key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</div>
        {requestError&&<div className="service-error" role="alert">{requestError}</div>}
        {summary&&<div className="results-summary"><h3>Submission: <span className={statusClass(summary.verdict)}>{summary.verdict}</span></h3>
          <div className="summary-stats"><span>Passed: {summary.passed}/{summary.total}</span><span>Failed: {summary.failed}/{summary.total}</span>{summary.executionTime!=null&&<span>Execution time: {summary.executionTime}s</span>}</div></div>}
        {tab==='samples'&&<div className="test-list">{publicCases.filter(test=>test.type==='Sample').map(test=><TestCard key={test.id} test={test} result={results[test.id]} onRun={()=>runOne(test)} onJump={jumpToLine} busy={busy}/>)}</div>}
        {tab==='custom'&&<div className="custom-test"><label htmlFor="custom-input">Custom input (stdin)</label><textarea id="custom-input" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Enter input in the format described for this problem."/>
          <button className="pri" disabled={busy} onClick={runCustom}>{busy?<Loader2 className="spin" size={14}/>:<Play size={14}/>}Run Custom Input</button>
          {results.custom&&<ResultOutput result={results.custom}/>}</div>}
        {tab==='all'&&<div className="test-list"><div className="bar"><button disabled={busy} onClick={()=>runCases(publicCases)}><Play size={14}/>Run all public tests</button></div>
          {publicCases.map(test=><TestCard key={test.id} test={test} result={results[test.id]} onRun={()=>runOne(test)} onJump={jumpToLine} busy={busy}/>)}
          {hiddenResults.length>0&&<section className="hidden-results"><h3>Hidden Tests</h3><p>Hidden inputs and expected outputs are not displayed.</p>{hiddenResults.map(result=><div className="case-row" key={result.id}><div><b className={statusClass(result.status)}>{result.id}: {result.status}</b>{result.diagnostic&&<Diagnostic diagnostic={result.diagnostic} onJump={jumpToLine}/>}</div>{result.time&&<small>{result.time}s</small>}</div>)}</section>}
          {!hiddenResults.length&&<p className="muted">Submit to run the private test suite.</p>}
        </div>}
        {(tab!=='custom'&&!summary)&&publicResults.length>0&&<div className="results-summary"><h3>Test Results</h3><div className="summary-stats"><span>Passed: {passed}</span><span>Failed: {failed}</span></div></div>}
      </section>
    </section>
  </div>;
}

function TestCard({test,result,onRun,onJump,busy}){
  return <article className="test-card"><div className="test-card-heading"><div><b>{test.id}</b><span className="tag">{test.type}</span><span className="muted">{test.description}</span></div>
    <button disabled={busy} onClick={onRun}><Play size={13}/>Run</button></div>
    <div className="test-io"><div><small>Input</small><pre>{test.input||'(empty input)'}</pre></div><div><small>Expected Output</small><pre>{test.expected||'(empty output)'}</pre></div></div>
    {result&&<ResultOutput result={result} onJump={onJump}/>}</article>;
}

function ResultOutput({result,onJump}){
  return <div className="case-result"><b className={statusClass(result.status)}>{result.id}: {result.status}</b>
    {result.time&&<small> · {result.time}s</small>}
    {result.stdout!==undefined&&<div className="test-io">{result.expected!=null&&<div><small>Expected Output</small><pre>{result.expected||'(empty output)'}</pre></div>}<div><small>Actual Output</small><pre>{result.stdout||'(empty output)'}</pre></div></div>}
    {result.diagnostic&&<Diagnostic diagnostic={result.diagnostic} onJump={onJump}/>}
    {result.stderr&&<details className="error-details"><summary>Full compiler/runtime output</summary><pre className="error-output">{result.stderr}</pre></details>}
  </div>;
}

function Diagnostic({diagnostic,onJump}){
  return <div className="error-diagnostic" role="status"><div><b>{diagnostic.line?`Error on line ${diagnostic.line}`:'Source line unavailable'}</b><p>{diagnostic.message}</p></div>
    {diagnostic.line&&<button onClick={()=>onJump?.(diagnostic.line)}>Go to line {diagnostic.line}</button>}
  </div>;
}
