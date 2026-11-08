import {judgeStatus,parseDiagnostic} from './diagnostics.js';

const URL='https://ce.judge0.com/submissions?base64_encoded=false&wait=true';
export const LANGS={python:{id:71,label:'Python',monaco:'python'},javascript:{id:63,label:'JavaScript',monaco:'javascript'},java:{id:62,label:'Java',monaco:'java'},cpp:{id:54,label:'C++',monaco:'cpp'}};
const clean=value=>String(value??'').replace(/\r\n/g,'\n').trim().replace(/[ \t]+/g,' ');

export async function runCode(lang,code,stdin,expected,problemId){
  if(!code.trim()){
    const stderr='Code is empty.';
    return{status:'Compilation Error',stdout:'',stderr,diagnostic:parseDiagnostic(stderr,'Compilation Error')};
  }
  try{
    const response=await fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({source_code:code,language_id:LANGS[lang].id,stdin})});
    if(!response.ok)throw new Error(`Judge0 returned ${response.status}.`);
    const data=await response.json(),stdout=(data.stdout||'').trim(),stderr=data.compile_output||data.stderr||data.message||'';
    let status=judgeStatus(data.status?.id,stderr);
    if(status==='Accepted'&&expected!=null){
      const actual=clean(stdout),wanted=clean(expected);
      const numeric=problemId===17&&Number.isFinite(Number(actual))&&Number.isFinite(Number(wanted));
      if(numeric?Math.abs(Number(actual)-Number(wanted))>1e-6:actual!==wanted)status='Wrong Answer';
    }else if(status==='Accepted')status='Executed';
    return{status,stdout,expected,time:data.time,stderr,diagnostic:status==='Accepted'||status==='Executed'?null:parseDiagnostic(stderr,status)};
  }catch(error){
    const stderr=`Could not reach Judge0: ${error.message}`;
    return{status:'Error',stdout:'',stderr,diagnostic:{line:null,message:stderr}};
  }
}
