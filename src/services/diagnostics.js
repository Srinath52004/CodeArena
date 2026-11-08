const stripAnsi=value=>String(value??'').replace(/\u001b\[[0-?]*[ -/]*[@-~]/g,'').trim();

export function judgeStatus(statusId,stderr=''){
 if(/\b(?:SyntaxError|IndentationError|TabError)\b/.test(stderr))return'Compilation Error';
 if(statusId===6)return'Compilation Error';
 if(statusId===5)return'Time Limit Exceeded';
 if(statusId===4)return'Wrong Answer';
 if(statusId>=7)return'Runtime Error';
 return statusId===3?'Accepted':'Error';
}

export function parseDiagnostic(stderr,status){
 const raw=stripAnsi(stderr);
 if(!raw){
  if(status==='Wrong Answer')return{line:null,message:'Program output did not match the expected output.'};
  if(status==='Time Limit Exceeded')return{line:null,message:'Execution exceeded the allowed time limit.'};
  return{line:null,message:`${status} occurred. Judge0 did not return a source location.`};
 }
 const pythonLines=[...raw.matchAll(/File\s+["'][^"']+["'],\s*line\s+(\d+)/g)];
 const compiledLine=[...raw.matchAll(/(?:[\w.-]+\.(?:cpp|cc|cxx|c|java|js|py)|\bMain):(\d+)(?::\d+)?/gi)];
 const stackLines=[...raw.matchAll(/:\s*(\d+):\d+\)?(?=\s|$)/gm)];
 const genericLines=[...raw.matchAll(/\bline\s+(\d+)\b/gi)];
 const match=pythonLines.at(-1)||compiledLine.at(-1)||stackLines.at(-1)||genericLines.at(-1);
 const diagnosticLines=raw.split('\n').map(line=>line.trim()).filter(Boolean);
 const messageLine=[...diagnosticLines].reverse().find(line=>/(?:\berror\b|\bexception\b|\bwarning\b|syntaxerror|typeerror|referenceerror|nameerror|zerodivisionerror|segmentation fault|undefined reference)/i.test(line));
 const message=messageLine||diagnosticLines[0]||`${status} occurred.`;
 return{line:match?Number(match[1]):null,message,details:raw};
}
