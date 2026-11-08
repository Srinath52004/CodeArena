import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {handleSubmit} from './submission.js';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const production=process.argv.includes('--production');
const port=Number(process.env.PORT)||5173;
const mime={'.css':'text/css','.html':'text/html','.ico':'image/x-icon','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(request,response)=>{
 const pathname=new URL(request.url,'http://localhost').pathname;
 if(pathname==='/api/submit'&&request.method==='POST')return handleSubmit(request,response);
 if(pathname.startsWith('/api/')){response.writeHead(404);return response.end('Not found');}
 if(!production)return;
 try{
  const dist=path.resolve(root,'dist');
  const requested=decodeURIComponent(pathname==='/'?'index.html':pathname.slice(1));
  const file=path.resolve(dist,requested);
  if(file!==dist&&!file.startsWith(`${dist}${path.sep}`))throw new Error('Invalid path.');
  let resolvedFile=file;
  try{if(!(await stat(resolvedFile)).isFile())resolvedFile=path.join(dist,'index.html');}
  catch{if(path.extname(resolvedFile))throw new Error('Asset not found.');resolvedFile=path.join(dist,'index.html');}
  const content=await readFile(resolvedFile);
  response.writeHead(200,{'Content-Type':mime[path.extname(resolvedFile)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
  response.end(content);
 }catch(error){response.writeHead(404,{'Content-Type':'text/plain'});response.end(error.message==='Asset not found.'?'Not found':'Not found');}
});

if(!production){
 const {createServer:createViteServer}=await import('vite');
 const vite=await createViteServer({server:{middlewareMode:true,hmr:{server},fs:{deny:['server/**']}},appType:'spa'});
 server.on('request',(request,response)=>{
  const pathname=new URL(request.url,'http://localhost').pathname;
  if(pathname==='/api/submit'||pathname.startsWith('/api/'))return;
  let decodedPath;
  try{decodedPath=decodeURIComponent(pathname);}catch{response.writeHead(400);response.end('Bad request');return;}
  if(decodedPath.includes('/server/')){response.writeHead(404);response.end('Not found');return;}
  vite.middlewares(request,response,error=>{
   if(error){response.statusCode=500;response.end(error.message);}
  });
 });
 server.on('close',()=>vite.close());
}

const host=production?'0.0.0.0':'127.0.0.1';
server.listen(port,host,()=>console.log(`CodeArena ${production?'server':'development server'} listening on http://${host}:${port}`));
