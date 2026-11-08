import {problems} from '../src/data/problems.js';
import {LANGS} from '../src/services/codeExecution.js';
import {judgeStatus,parseDiagnostic} from '../src/services/diagnostics.js';
import {getHiddenTests} from './hiddenTests.js';

const JUDGE_URL='https://ce.judge0.com/submissions?base64_encoded=false&wait=true';
const MAX_BODY=128*1024;
const equalOutput=(actual,expected,problemId)=>{
 const normalize=value=>String(value??'').replace(/\r\n/g,'\n').trim().replace(/[ \t]+/g,' ');
 const got=normalize(actual),wanted=normalize(expected);
 if(problemId===17&&Number.isFinite(Number(got))&&Number.isFinite(Number(wanted)))return Math.abs(Number(got)-Number(wanted))<=1e-6;
 return got===wanted;
};
async function execute(language,code,test,problemId){
 const response=await fetch(JUDGE_URL,{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),
  body:JSON.stringify({source_code:code,language_id:LANGS[language].id,stdin:test.input})});
 if(!response.ok)throw new Error(`Judge0 returned ${response.status}.`);
 const data=await response.json(),stderr=data.compile_output||data.stderr||data.message||'';
 const status=judgeStatus(data.status?.id,stderr),stdout=(data.stdout||'').trim();
 const finalStatus=status==='Accepted'&&!equalOutput(stdout,test.expected,problemId)?'Wrong Answer':status;
 return{status:finalStatus,stdout,stderr,time:data.time||null,
  diagnostic:finalStatus==='Accepted'?null:parseDiagnostic(stderr,finalStatus)};
}

async function bodyJson(request){
 let body='',length=0;
 for await(const chunk of request){length+=chunk.length;if(length>MAX_BODY){const error=new Error('Request body is too large.');error.statusCode=413;throw error;}body+=chunk;}
 try{return JSON.parse(body);}catch{const error=new Error('Request body must be valid JSON.');error.statusCode=400;throw error;}
}

export async function handleSubmit(request,response){
 try{
  const {problemId,language,code}=await bodyJson(request);
  const problem=problems.find(item=>item.id===Number(problemId));
  if(!problem)return send(response,400,{error:'Unknown problem.'});
  if(!Object.hasOwn(LANGS,language))return send(response,400,{error:'Unsupported programming language.'});
  if(typeof code!=='string'||!code.trim())return send(response,400,{error:'Code must not be empty.'});
  if(code.length>100000)return send(response,413,{error:'Code exceeds the 100 KB limit.'});
  const tests=[...problem.testCases,...getHiddenTests(problem.id)],publicResults=[],hiddenResults=[];
  let totalTime=0,timeKnown=false;
  for(const test of tests){
   const result=await execute(language,code,test,problem.id);
   if(result.time!==null){totalTime+=Number(result.time);timeKnown=true;}
   if(test.type==='Large')hiddenResults.push({id:test.id,status:result.status,time:result.time,diagnostic:result.diagnostic});
   else publicResults.push({id:test.id,type:test.type,status:result.status,expected:test.expected,stdout:result.stdout,stderr:result.stderr,time:result.time,diagnostic:result.diagnostic});
  }
  const passed=publicResults.filter(item=>item.status==='Accepted').length+hiddenResults.filter(item=>item.status==='Accepted').length;
  const failed=tests.length-passed;
  const verdict=failed===0?'Accepted':tests.map((test,index)=>({test,status:(test.type==='Large'?hiddenResults.find(item=>item.id===test.id):publicResults.find(item=>item.id===test.id))?.status,index}))
   .find(item=>item.status!=='Accepted')?.status||'Wrong Answer';
  return send(response,200,{verdict,passed,failed,total:tests.length,executionTime:timeKnown?totalTime.toFixed(3):null,cases:publicResults,hiddenCases:hiddenResults});
 }catch(error){
  return send(response,error.statusCode||502,{error:error.message||'Submission service failed.'});
 }
}

function send(response,status,payload){
 response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 response.end(JSON.stringify(payload));
}
