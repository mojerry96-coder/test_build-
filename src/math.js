/* Pure math helpers: deterministic graph/answer calculations. */
window.GL = window.GL || {};
GL.math = (() => {
 const gcd = (a,b) => b ? gcd(b,a%b) : Math.abs(a);
 const close = (a,b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b)<1e-8;
 const fraction = n => {
   if(!Number.isFinite(n)) return 'undefined';
   for(let d=1;d<=100;d++) if(close(n*d,Math.round(n*d))) {
     const num=Math.round(n*d), g=gcd(num,d)||1;
     return d/g===1?String(num/g):`${num/g}/${d/g}`;
   }
   return String(Number(n.toFixed(3)));
 };
 const display = n => fraction(n).replace(/-/g,'−');
 const fracHTML = n => { const s=display(n); if(!s.includes('/')) return s; const [a,b]=s.split('/'); return `<span class="fraction"><span>${a}</span><span>${b}</span></span>`; };
 const stack = (a,b) => `<span class="fraction"><span>${a}</span><span>${b}</span></span>`;
 const equation=(m,c)=> {
   if(close(m,0)) return `y = ${display(c)}`;
   let out=m===1?'x':m===-1?'−x':`${display(m)}x`;
   if(c) out+=` ${c<0?'−':'+'} ${display(Math.abs(c))}`;
   return `y = ${out}`;
 };
 const equationHTML=(m,c)=>{
   if(close(m,0))return `y = ${fracHTML(c)}`;
   let out=m===1?'x':m===-1?'−x':`${fracHTML(m)}x`;
   if(c)out+=` ${c<0?'−':'+'} ${fracHTML(Math.abs(c))}`;
   return `y = ${out}`;
 };
 const gradient=(a,b)=>a.x===b.x?null:(b.y-a.y)/(b.x-a.x);
 const intercept=(a,b)=>{const m=gradient(a,b);return m===null?null:a.y-m*a.x};
 const parse=s=>{
   s=String(s).trim().replace(/−/g,'-');
   if(!s || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s))return null;
   const a=s.split('/').map(Number), n=a.length===2?a[0]/a[1]:a[0];
   return Number.isFinite(n)?n:null;
 };
 const par=n=>n<0?`(${display(n)})`:display(n);
 return {gcd,close,fraction,display,fracHTML,stack,equation,equationHTML,gradient,intercept,parse,par};
})();
