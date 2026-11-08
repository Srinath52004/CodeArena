import {useSyncExternalStore} from 'react';
import {problems} from '../data/problems.js';
const K='codearena';
const CATALOG_VERSION=2;
const legacyProblemIdMap={14:4,15:5,16:13,21:1,22:2,23:3,24:5,25:8,26:9,27:10,28:11,29:12,30:14,31:17,32:18,33:19,34:20};
const def={solved:{},bookmarks:[],subs:[],days:[],lang:'python',catalogVersion:CATALOG_VERSION};
const migrate=stored=>{
 if((stored.catalogVersion||0)>=CATALOG_VERSION)return{...def,...stored};
 const mapId=id=>legacyProblemIdMap[id];
 for(const [oldId,newId] of Object.entries(legacyProblemIdMap))for(const language of ['python','javascript','java','cpp']){
  const previousKey=`code:${oldId}:${language}`,nextKey=`code:v2:${newId}:${language}`;
  if(!localStorage.getItem(nextKey)){const previousCode=localStorage.getItem(previousKey);if(previousCode)localStorage.setItem(nextKey,previousCode);}
 }
 const solved={};
 for(const [id,value] of Object.entries(stored.solved||{}))if(value&&mapId(id))solved[mapId(id)]=true;
 const bookmarks=[...new Set((stored.bookmarks||[]).map(mapId).filter(Boolean))];
 const subs=(stored.subs||[]).map(sub=>{
  const pid=mapId(sub.pid),problem=problems.find(item=>item.id===pid);
  return problem?{...sub,pid,title:problem.title}:sub;
 });
 return{...def,...stored,solved,bookmarks,subs,catalogVersion:CATALOG_VERSION};
};
let s;try{const stored=JSON.parse(localStorage.getItem(K))||{};s=migrate(stored);if((stored.catalogVersion||0)<CATALOG_VERSION){try{localStorage.setItem(K,JSON.stringify(s))}catch{}}}catch{s=def}
const subs=new Set();
export const useStore=()=>useSyncExternalStore(f=>{subs.add(f);return()=>subs.delete(f)},()=>s);
export const update=fn=>{s=fn(s);try{localStorage.setItem(K,JSON.stringify(s))}catch{}subs.forEach(f=>f())};
export const reset=()=>update(()=>({...def}));
const day=d=>d.toISOString().slice(0,10);
export function streak(days){let n=0;const d=new Date();if(!days.includes(day(d)))d.setDate(d.getDate()-1);
while(days.includes(day(d))){n++;d.setDate(d.getDate()-1)}return n}
export const today=()=>day(new Date());
