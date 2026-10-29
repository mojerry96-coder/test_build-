window.GL = window.GL || {};
GL.storageKey='gradient-lab-replication-v1';
GL.saved={beginner:[],intermediate:[],last:'start',theme:'system',advanced:{points:0,solved:0,streak:0,best:0,type:'mixed'}};
try {
 const s=JSON.parse(localStorage.getItem(GL.storageKey)||'{}');
 for(const k of ['beginner','intermediate']) if(Array.isArray(s[k])) GL.saved[k]=[...new Set(s[k].filter(n=>Number.isInteger(n)&&n>=0&&n<(k==='beginner'?7:6)))];
 if(['start','beginner','intermediate','advanced'].includes(s.last))GL.saved.last=s.last;
 if(s.advanced&&typeof s.advanced==='object'){for(const k of ['points','solved','streak','best'])if(Number.isInteger(s.advanced[k])&&s.advanced[k]>=0)GL.saved.advanced[k]=s.advanced[k];if(['mixed','read','two','missing','targets'].includes(s.advanced.type))GL.saved.advanced.type=s.advanced.type}
 if(['system','light','dark'].includes(s.theme))GL.saved.theme=s.theme;
} catch(e) { /* Private browsing and file:// may block persistence. */ }
GL.save=()=>{try{localStorage.setItem(GL.storageKey,JSON.stringify(GL.saved))}catch(e){}};
GL.state={page:'start', beginner:{m:0,c:0,mission:0,rise:true,lesson:false,hint:false,notice:'',walking:false}, intermediate:{a:{x:-3,y:-1},b:{x:1,y:3},mission:0,predict:false,equation:false,revealed:false,feedback:'',hint:false,pairs:[]}, advanced:{ch:null,tries:0,status:'open',notes:[],hint:false,inputs:{},sm:0,sc:0,example:null}};
GL.complete=(level,i)=>{if(!GL.saved[level].includes(i)){GL.saved[level].push(i);GL.save();GL.announce('Mission complete.');GL.updateCounts();}};
GL.pages={};
