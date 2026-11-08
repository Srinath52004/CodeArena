const ints=input=>input.trim().split(/\s+/).filter(Boolean).map(Number);
const lines=input=>input.replace(/\r/g,'').split('\n');
const output=value=>String(value);

export function reference(id,input){
 const line=lines(input),all=ints(input);
 switch(id){
  case 1:{
   const [n,target]=ints(line[0]),nums=ints(line[1]),seen=new Map();
   for(let i=0;i<n;i++){const j=seen.get(target-nums[i]);if(j!==undefined)return`[${j},${i}]`;seen.set(nums[i],i);}
   return'';
  }
  case 2:{const x=Number(line[0]),value=Number(`${Math.sign(x)<0?'-':''}${String(Math.abs(x)).split('').reverse().join('')}`);return Number.isSafeInteger(value)&&value>=-2147483648&&value<=2147483647?output(value):'0';}
  case 3:{const x=line[0],digits=x.replace('-','');return String(!x.startsWith('-')&&digits===digits.split('').reverse().join(''));}
  case 4:{const [s,t]=line;return String(s.length===t.length&&[...s].sort().join('')===[...t].sort().join(''));}
  case 5:{const nums=ints(line[1]);let best=-Infinity,current=0;for(const value of nums){current=Math.max(value,current+value);best=Math.max(best,current);}return output(best);}
  case 6:{const nums=ints(line[1]);return String(new Set(nums).size!==nums.length);}
  case 7:{const s=line[0],stack=[],pairs={')':'(',']':'[','}':'{'};for(const c of s){if('([{'.includes(c))stack.push(c);else if(stack.pop()!==pairs[c])return'false';}return String(stack.length===0);}
  case 8:{
   const nums=ints(line[1]).sort((a,b)=>a-b),found=[];
   for(let i=0;i<nums.length-2;i++){if(i&&nums[i]===nums[i-1])continue;let l=i+1,r=nums.length-1;while(l<r){const sum=nums[i]+nums[l]+nums[r];if(sum===0){found.push(`${nums[i]} ${nums[l]} ${nums[r]}`);const a=nums[l],b=nums[r];while(l<r&&nums[l]===a)l++;while(l<r&&nums[r]===b)r--;}else if(sum<0)l++;else r--;}}
   return found.join('\n');
  }
  case 9:{const h=ints(line[1]);let l=0,r=h.length-1,best=0;while(l<r){best=Math.max(best,Math.min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}return output(best);}
  case 10:{const nums=ints(line[1]),result=Array(nums.length).fill(1);let left=1;for(let i=0;i<nums.length;i++){result[i]=left;left*=nums[i];}let right=1;for(let i=nums.length-1;i>=0;i--){result[i]*=right;right*=nums[i];}return result.join(' ');}
  case 11:{const s=input.replace(/\r/g,'').replace(/\n$/,'');let start=0,best=0;const last=new Map();for(let i=0;i<s.length;i++){if(last.has(s[i]))start=Math.max(start,last.get(s[i])+1);last.set(s[i],i);best=Math.max(best,i-start+1);}return output(best);}
  case 12:{const words=ints(line[0])[0],groups=new Map();for(const word of line[1].trim().split(/\s+/)){const key=[...word].sort().join('');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(word);}return[...groups.values()].map(group=>group.sort().join(' ')).sort().join('\n');}
  case 13:{const n=ints(line[0])[0],intervals=Array.from({length:n},(_,i)=>ints(line[i+1])).sort((a,b)=>a[0]-b[0]),ranges=[];for(const [start,end] of intervals){if(ranges.length&&start<=ranges[ranges.length-1][1])ranges[ranges.length-1][1]=Math.max(ranges[ranges.length-1][1],end);else ranges.push([start,end]);}return ranges.map(range=>range.join(' ')).join('\n');}
  case 14:{const [n,target]=ints(line[0]),nums=ints(line[1]);let l=0,r=n-1;while(l<=r){const m=(l+r)>>1;if(nums[m]===target)return output(m);if(nums[l]<=nums[m]){if(nums[l]<=target&&target<nums[m])r=m-1;else l=m+1;}else if(nums[m]<target&&target<=nums[r])l=m+1;else r=m-1;}return'-1';}
  case 15:{const [n,k]=ints(line[0]),nums=ints(line[1]),freq=new Map([[0,1]]);let sum=0,count=0;for(const value of nums){sum+=value;count+=freq.get(sum-k)||0;freq.set(sum,(freq.get(sum)||0)+1);}return output(count);}
  case 16:{
   const [m,n]=ints(line[0]),board=line.slice(1,1+m),word=line[1+m];if(word.length>m*n)return'false';
   const visit=(r,c,i)=>{if(i===word.length)return true;if(r<0||r>=m||c<0||c>=n||board[r][c]!==word[i])return false;const row=board[r];board[r]=row.slice(0,c)+'#'+row.slice(c+1);const found=visit(r+1,c,i+1)||visit(r-1,c,i+1)||visit(r,c+1,i+1)||visit(r,c-1,i+1);board[r]=row;return found;};
   for(let r=0;r<m;r++)for(let c=0;c<n;c++)if(visit(r,c,0))return'true';return'false';
  }
  case 17:{const [m,n]=ints(line[0]),a=ints(line[1]),b=ints(line[2]),arr=[...a,...b].sort((x,y)=>x-y),mid=arr.length>>1;const median=arr.length%2?arr[mid]:(arr[mid-1]+arr[mid])/2;return Number.isInteger(median)?output(median):median.toFixed(1);}
  case 18:{const h=ints(line[1]);let l=0,r=h.length-1,left=0,right=0,water=0;while(l<r){if(h[l]<h[r]){left=Math.max(left,h[l]);water+=left-h[l++];}else{right=Math.max(right,h[r]);water+=right-h[r--];}}return output(water);}
  case 19:{const s=input.replace(/\r/g,'').replace(/\n$/,'');let best=0;const stack=[-1];for(let i=0;i<s.length;i++){if(s[i]==='(')stack.push(i);else{stack.pop();if(!stack.length)stack.push(i);else best=Math.max(best,i-stack[stack.length-1]);}}return output(best);}
  case 20:{const nums=ints(line[1]),set=new Set(nums);let x=1;while(set.has(x))x++;return output(x);}
  default:throw new Error('Unknown problem.');
 }
}

function largeInputs(id){
 const n=2000,sequence=Array.from({length:n},(_,i)=>i+1);
 switch(id){
  case 1:return [3999,2001,3000].map(target=>`${n} ${target}\n${sequence.join(' ')}`);
  case 2:return ['1000000003','-1200000000','1463847412'];
  case 3:return ['999999999','1000000001','-1000000001'];
  case 4:return ['abc'.repeat(4000)+'\n'+'bca'.repeat(4000),'a'.repeat(12000)+'\n'+'a'.repeat(11999)+'b','abc'.repeat(3000)+'\n'+'cba'.repeat(3000)];
  case 5:return [`10000\n${Array(10000).fill(1).join(' ')}`,`10000\n${Array(10000).fill(-1).join(' ')}`,`10000\n${Array.from({length:10000},(_,i)=>i%5===0?-10:1).join(' ')}`];
  case 6:return [`10000\n${Array.from({length:10000},(_,i)=>i).join(' ')}`,`10000\n${Array.from({length:9999},(_,i)=>i).concat(9998).join(' ')}`,`10000\n${Array(10000).fill(-7).join(' ')}`];
  case 7:return ['()'.repeat(5000),'('.repeat(5000)+')'.repeat(5000),'('.repeat(9999)+')'];
  case 8:return [`502\n${Array(500).fill(1).concat(-2,0).join(' ')}`,`500\n${Array(500).fill(1).join(' ')}`,`500\n${Array(500).fill(0).join(' ')}`];
  case 9:return [`10000\n${Array(10000).fill(0).join(' ')}`,`10000\n${[1,...Array(9998).fill(0),1].join(' ')}`,`10000\n${Array.from({length:10000},(_,i)=>i<5000?i:10000-i).join(' ')}`];
  case 10:return [`10000\n${Array(10000).fill(1).join(' ')}`,`10000\n${Array.from({length:10000},(_,i)=>i%2?1:0).join(' ')}`,`10000\n${Array.from({length:10000},(_,i)=>i===5000?0:1).join(' ')}`];
  case 11:return ['abc'.repeat(10000),'a'.repeat(20000),'abcdefghijklmnopqrstuvwxyz'.repeat(10)];
  case 12:return [`1000\n${Array(1000).fill('abc').join(' ')}`,`1000\n${Array.from({length:1000},(_,i)=>i%2?'abc':'bca').join(' ')}`,`1000\n${Array.from({length:1000},(_,i)=>String.fromCharCode(97+i%26).repeat(1+Math.floor(i/26))).join(' ')}`];
  case 13:return [`1000\n${Array.from({length:1000},(_,i)=>`${i*2} ${i*2+1}`).join('\n')}`,`1000\n${Array.from({length:1000},(_,i)=>`${i} ${i+2}`).join('\n')}`,`1000\n${Array.from({length:1000},(_,i)=>`${i*4} ${i*4+1}`).reverse().join('\n')}`];
  case 14:{const arr=Array.from({length:10000},(_,i)=>i);const rotated=[...arr.slice(5000),...arr.slice(0,5000)];return [rotated,rotated,rotated].map((nums,i)=>`${nums.length} ${[9999,5000,10001][i]}\n${nums.join(' ')}`);}
  case 15:return [`20000 0\n${Array(20000).fill(0).join(' ')}`,`10000 10000\n${Array(10000).fill(1).join(' ')}`,`10000 0\n${Array.from({length:10000},(_,i)=>i%2?1:-1).join(' ')}`];
  case 16:return ['6 6\nABCDEF\nGHIJKL\nMNOPQR\nSTUVWX\nYZABCD\nEFGHIJ\nABCF','6 6\nAAAAAA\nAAAAAA\nAAAAAA\nAAAAAA\nAAAAAA\nAAAAAA\nAAAAAAAAAAAA','6 6\nABCDEF\nGHIJKL\nMNOPQR\nSTUVWX\nYZABCD\nEFGHIJ\nFEDC'];
  case 17:return [`1000 1000\n${Array.from({length:1000},(_,i)=>i).join(' ')}\n${Array.from({length:1000},(_,i)=>i+1000).join(' ')}`,`0 2000\n\n${sequence.concat(Array.from({length:0},()=>0)).join(' ')}`,`1000 1000\n${Array.from({length:1000},(_,i)=>i-2000).join(' ')}\n${Array.from({length:1000},(_,i)=>i).join(' ')}`];
  case 18:return [`20000\n${Array(20000).fill(0).join(' ')}`,`20000\n${[100,...Array(19998).fill(0),100].join(' ')}`,`20000\n${Array.from({length:20000},(_,i)=>i%100).join(' ')}`];
  case 19:return ['('.repeat(15000)+')'.repeat(15000),')'.repeat(15000),'()'.repeat(15000)];
  case 20:return [`10000\n${sequence.join(' ')}`,`10000\n${Array(10000).fill(-1).join(' ')}`,`10000\n${Array.from({length:10000},(_,i)=>i===0?2:i+2).join(' ')}`];
  default:throw new Error('Unknown problem.');
 }
}

export function getHiddenTests(problemId){
 return largeInputs(problemId).map((input,index)=>({id:`H${index+1}`,type:'Large',input,expected:reference(problemId,input),description:'Private large-input correctness and performance check.'}));
}
