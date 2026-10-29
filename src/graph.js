/* An actual SVG coordinate system: never use the reference image as a graph. */
GL.graph={
 x:n=>48+(n+8)*29, y:n=>48+(8-n)*29,
 svg(inner,opts={}){
  const {x,y}=this,clip=opts.clip||'plot-clip',mini=!!opts.clip;let grid='',labels='';
  for(let n=-8;n<=8;n++){
   grid+=`<line class="gridline" x1="${x(n)}" y1="48" x2="${x(n)}" y2="512"/><line class="gridline" x1="48" y1="${y(n)}" x2="512" y2="${y(n)}"/>`;
   if(n%2===0&&n!==0)labels+=`<text x="${x(n)}" y="${y(0)+21}" text-anchor="middle">${n<0?'−'+Math.abs(n):n}</text><text x="${x(0)-13}" y="${y(n)+5}" text-anchor="end">${n<0?'−'+Math.abs(n):n}</text>`;
  }
  if(mini){inner=inner.replace(/plot-clip/g,clip);labels=''}
  return `<svg class="plot${mini?' mini':''}" viewBox="0 0 560 560" role="${mini?'img':'group'}" aria-label="${opts.label||'Coordinate grid, x and y from minus 8 to 8'}"><defs><clipPath id="${clip}"><rect x="48" y="48" width="464" height="464"/></clipPath></defs><rect x="48" y="48" width="464" height="464" rx="3" fill="var(--surface)"/>${grid}<path class="axis" d="M40 280H520m-6-4 6 4-6 4M280 520V40m-4 6 4-6 4 6" fill="none"/>${labels}${mini?'':`<text x="${x(0)-12}" y="${y(0)+21}" text-anchor="end">0</text>`}<text class="axis-label" x="527" y="275">x</text><text class="axis-label" x="290" y="36">y</text><g ${mini?'':'id="graph-content"'}>${inner}</g></svg>`;
 },
 line(m,c,reference=false){const {x,y}=this;return `<path clip-path="url(#plot-clip)" class="${reference?'reference-line':'student-line'}" d="M${x(-8)},${y(m*-8+c)}L${x(8)},${y(m*8+c)}"/>`},
 triangle(a,b){const {x,y}=this;const dx=b.x-a.x,dy=b.y-a.y;if(!dx||!dy)return '';const labelY=y(a.y)+(a.y<=-6?-13:23),labelX=x(b.x)+(b.x>4?-14:14);return `<g clip-path="url(#plot-clip)"><path d="M${x(a.x)},${y(a.y)}H${x(b.x)}V${y(b.y)}Z" fill="#f9d970" opacity=".28"/><path d="M${x(a.x)},${y(a.y)}H${x(b.x)}" stroke="#0789e1" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M${x(b.x)},${y(a.y)}V${y(b.y)}" stroke="#238143" stroke-width="2.5" stroke-dasharray="6 4"/></g><text x="${(x(a.x)+x(b.x))/2}" y="${labelY}" text-anchor="middle" style="fill:#0789e1;font-size:13px">across ${GL.math.display(dx)}</text><text x="${labelX}" y="${(y(a.y)+y(b.y))/2}" text-anchor="${b.x>4?'end':'start'}" style="fill:#238143;font-size:13px">${dy<0?'down':'up'} ${Math.abs(dy)}</text>`},
 point(p,id,color){const {x,y}=this;let labelX=x(p.x)+12,anchor='start';if(p.x>3||(p.x>=-4&&p.x<0)){labelX=x(p.x)-12;anchor='end'}return `<g class="point" data-point="${id}" tabindex="0" role="button" aria-label="Point ${id.toUpperCase()}, x ${p.x}, y ${p.y}. Use arrow keys to move."><circle class="point-focus" cx="${x(p.x)}" cy="${y(p.y)}" r="16" fill="transparent"/><circle cx="${x(p.x)}" cy="${y(p.y)}" r="8" fill="${color}" stroke="white" stroke-width="2"/><text x="${labelX}" y="${y(p.y)+(p.y>=6||(p.y<=0&&p.y>=-2)?26:-15)}" text-anchor="${anchor}" style="fill:${color}">${id.toUpperCase()} (${GL.math.display(p.x)}, ${GL.math.display(p.y)})</text></g>`},
 beginnerContent(){const s=GL.state.beginner,{x,y}=this;let out=s.lesson?this.line(2,-4,true):'';if(s.rise&&s.m!==0){const run=Number.isInteger(s.m)?1:2;out+=this.triangle({x:0,y:s.c},{x:run,y:s.c+s.m*run})}return out+this.line(s.m,s.c)+`<circle cx="${x(0)}" cy="${y(s.c)}" r="5.5" fill="var(--ink)" stroke="var(--surface)" stroke-width="2"/><circle id="hiker" r="7" cx="48" cy="280" fill="#168ee2" stroke="white" stroke-width="2" opacity="0" clip-path="url(#plot-clip)"/>`},
 intermediateContent(){const s=GL.state.intermediate,{x,y}=this,m=GL.math.gradient(s.a,s.b),c=GL.math.intercept(s.a,s.b);return (s.mission===3?this.line(2,-4,true):'')+this.triangle(s.a,s.b)+(m===null?`<path clip-path="url(#plot-clip)" class="student-line" d="M${x(s.a.x)},48V512"/>`:this.line(m,c))+this.point(s.a,'a','#0789e1')+this.point(s.b,'b','#8054c6')},
 marker(p,label,color='var(--ink)'){const {x,y}=this;if(Math.abs(p.x)>8||Math.abs(p.y)>8)return '';const right=p.x<5;return `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="6.5" fill="${color}" stroke="var(--surface)" stroke-width="2"/><text x="${x(p.x)+(right?12:-12)}" y="${y(p.y)+(p.y>6?24:-12)}" text-anchor="${right?'start':'end'}" style="fill:${color};font-weight:650">${label}</text>`},
 ring(p,hit){const {x,y}=this,right=p.x<0;return `<g class="ring ${hit?'hit':''}"><circle cx="${x(p.x)}" cy="${y(p.y)}" r="11" fill="none" stroke-width="3.5"/><circle cx="${x(p.x)}" cy="${y(p.y)}" r="3.5"/><text x="${x(p.x)+(right?-17:17)}" y="${y(p.y)+(p.y>6?26:-14)}" text-anchor="${right?'end':'start'}">(${GL.math.display(p.x)}, ${GL.math.display(p.y)})${hit?' ✓':''}</text></g>`},
 detectiveContent(ch,s={}){const M=GL.math,ended=s.status&&s.status!=='open',fits=p=>Math.abs(p.x)<=8&&Math.abs(p.y)<=8;if(!ch)return '';
  if(ch.type==='read')return this.line(ch.m,ch.c)+(ended?this.marker({x:0,y:ch.c},`(0, ${M.display(ch.c)})`)+this.marker(ch.through,`(${M.display(ch.through.x)}, ${M.display(ch.through.y)})`):'');
  if(ch.type==='two')return ended&&fits(ch.a)&&fits(ch.b)?this.line(ch.m,ch.c)+this.marker(ch.a,`(${M.display(ch.a.x)}, ${M.display(ch.a.y)})`,'#0789e1')+this.marker(ch.b,`(${M.display(ch.b.x)}, ${M.display(ch.b.y)})`,'#8054c6'):'';
  if(ch.type==='missing')return this.line(ch.m,ch.c)+(ended?this.marker({x:ch.x,y:ch.y},`(${M.display(ch.x)}, ${M.display(ch.y)})`):'');
  const m=s.sm??ch.m,c=s.sc??ch.c,hit=p=>M.close(m*p.x+c,p.y);return this.line(m,c)+this.ring(ch.t1,hit(ch.t1))+this.ring(ch.t2,hit(ch.t2));
 },
 repaint(level){const el=document.getElementById('graph-content');if(el)el.innerHTML=level==='beginner'?this.beginnerContent():level==='intermediate'?this.intermediateContent():this.detectiveContent(GL.state.advanced.ch,GL.state.advanced)},
 bindPoints(host){let active=null,svg=host.querySelector('svg');
  const move=(id,px,py)=>{
   const s=GL.state.intermediate,other=id==='a'?'b':'a';
   let nx=Math.max(-7,Math.min(7,Math.round(px))),ny=Math.max(-7,Math.min(7,Math.round(py)));
   if(s.mission===3){nx=Math.max(-1,Math.min(5,nx));ny=2*nx-4}
   if(nx===s[other].x&&ny===s[other].y)return false;
   if(nx===s[id].x&&ny===s[id].y)return false;
   s[id]={x:nx,y:ny};s.revealed=false;s.feedback='';
   GL.graph.repaint('intermediate');GL.pages.intermediate.updateWorking();return true;
  };
  host.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-point]');if(!target)return;e.preventDefault();active={id:target.dataset.point,changed:false};target.focus();host.setPointerCapture(e.pointerId)});
  host.addEventListener('pointermove',e=>{if(!active)return;const matrix=svg.getScreenCTM();if(!matrix)return;const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());active.changed=move(active.id,(point.x-48)/29-8,8-(point.y-48)/29)||active.changed});
  const finish=()=>{if(!active)return;const {id,changed}=active;active=null;if(changed){GL.pages.intermediate.checkMission();GL.announce(`${id.toUpperCase()} moved to ${GL.state.intermediate[id].x}, ${GL.state.intermediate[id].y}`)}host.querySelector(`[data-point="${id}"]`)?.focus({preventScroll:true})};
  host.addEventListener('pointerup',finish);host.addEventListener('pointercancel',finish);host.addEventListener('lostpointercapture',finish);
  host.addEventListener('keydown',e=>{const target=e.target.closest('[data-point]');if(!target||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const id=target.dataset.point,p=GL.state.intermediate[id];let dx=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,dy=e.key==='ArrowUp'?1:e.key==='ArrowDown'?-1:0;if(GL.state.intermediate.mission===3&&dy){dx=dy;dy=0}if(move(id,p.x+dx,p.y+dy)){GL.pages.intermediate.checkMission();GL.announce(`${id.toUpperCase()} moved to ${GL.state.intermediate[id].x}, ${GL.state.intermediate[id].y}`)}host.querySelector(`[data-point="${id}"]`)?.focus({preventScroll:true})});
 }
};
