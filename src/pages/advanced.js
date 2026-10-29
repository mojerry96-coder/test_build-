/* Page 04: Equation detective. Random challenges, three tries each, scored feedback ladder. */
GL.detective=(()=>{
 const M=GL.math;
 const pick=(a,r)=>a[Math.floor(r()*a.length)];
 const int=(lo,hi,r)=>lo+Math.floor(r()*(hi-lo+1));
 const sign=r=>r()<.5?-1:1;
 const GRADIENTS=[1,2,3,1/2,3/2,1/3,2/3];
 const ratio=m=>{for(let q=1;q<=12;q++)if(M.close(m*q,Math.round(m*q)))return {p:Math.round(m*q),q};return {p:m,q:1}};
 const types={mixed:'Mixed',read:'Read the graph',two:'Two points',missing:'Missing coordinate',targets:'Hit the targets'};
 const hints={
  read:'c is where the line crosses the y-axis. For m, find two places where the line passes exactly through grid corners, then work out change in y ÷ change in x.',
  two:'First find the gradient: change in y ÷ change in x. Then put one point into y = mx + c and solve for c.',
  missing:'Replace y and x with the numbers you know, then solve; or put the x-value in, multiply first, then add or subtract c.',
  targets:'Work out the gradient between the two dots first and set m. Then move c until the line passes through one dot. It will pass through both.'
 };
 const make={
  read(r){const m=sign(r)*pick(GRADIENTS,r),c=int(-4,4,r),{p,q}=ratio(m);return {type:'read',m,c,through:{x:q,y:c+p}}},
  two(r){for(;;){const m=sign(r)*pick(GRADIENTS,r),c=int(-5,5,r),{q}=ratio(m),xs=[];for(let x=-6;x<=6;x++)if(x&&x%q===0&&Math.abs(m*x+c)<=10)xs.push(x);if(xs.length<2)continue;const x1=pick(xs,r),x2=pick(xs.filter(x=>x!==x1),r);return {type:'two',m,c,a:{x:x1,y:m*x1+c},b:{x:x2,y:m*x2+c}}}},
  missing(r){const m=sign(r)*int(1,4,r),c=int(-6,6,r);let k=int(-5,4,r);if(k>=0)k++;return {type:'missing',m,c,find:r()<.5?'k':'y',x:k,y:m*k+c}},
  targets(r){for(;;){const m=sign(r)*int(1,6,r)/2,c=int(-4,4,r),xs=[-4,-2,2,4].filter(x=>Math.abs(m*x+c)<=7);if(xs.length<2)continue;const x1=pick(xs,r),x2=pick(xs.filter(x=>x!==x1),r),[a,b]=[x1,x2].sort((p,q)=>p-q);return {type:'targets',m,c,t1:{x:a,y:m*a+c},t2:{x:b,y:m*b+c}}}}
 };
 const key=ch=>JSON.stringify(ch);
 const generate=(type='mixed',r=Math.random,avoid=null)=>{for(let i=0;i<30;i++){const t=type==='mixed'?pick(['read','two','missing','targets'],r):type,ch=make[t](r);if(!avoid||key(ch)!==key(avoid))return ch}return make[type==='mixed'?'read':type](r)};
 /* Decimals typed to two or more places, such as 0.33 for 1/3, are accepted. */
 const matches=(raw,value)=>{const n=M.parse(raw);if(n===null)return false;if(M.close(n,value))return true;const dp=(String(raw).split('.')[1]||'').replace(/\D/g,'').length;return dp>=2&&Math.abs(n-value)<.01};
 const hits=(ch,m,c)=>[ch.t1,ch.t2].filter(p=>M.close(m*p.x+c,p.y)).length;
 /* answer: {m,c} as typed strings, {v} for a missing coordinate, or numeric {m,c} from the target sliders. */
 const check=(ch,answer)=>{
  if(ch.type==='missing'){const want=ch.find==='k'?ch.x:ch.y,correct=matches(answer.v,want);return {correct,comment:!correct&&want!==0&&matches(answer.v,-want)?'Check the sign of your answer.':''}}
  if(ch.type==='targets'){const n=hits(ch,answer.m,answer.c);if(n===2)return {correct:true,comment:''};return {correct:false,comment:n===1?'Your line passes through 1 of the 2 dots.':M.close(answer.m,ch.m)?'Your gradient is right, but c is not.':M.close(answer.m,-ch.m)?'Check the sign of your gradient.':''}}
  const mOk=matches(answer.m,ch.m),cOk=matches(answer.c,ch.c);
  if(mOk&&cOk)return {correct:true,comment:''};
  return {correct:false,comment:mOk?'Your gradient is right, but c is not.':matches(answer.m,-ch.m)?'Check the sign of your gradient.':cOk?'Your c is right, but the gradient is not.':''};
 };
 /* tries is the attempt that ended the challenge (1–3); solved is false when the answer was revealed. */
 const award=(score,tries,solved)=>{const points=solved?4-tries:0,streak=solved&&tries===1?score.streak+1:0;return {...score,points:score.points+points,solved:score.solved+(solved?1:0),streak,best:Math.max(score.best,streak),earned:points}};
 const question=ch=>{const d=M.display;
  if(ch.type==='read')return 'Find the equation of the red line. Give m and c.';
  if(ch.type==='two')return `A straight line passes through (${d(ch.a.x)}, ${d(ch.a.y)}) and (${d(ch.b.x)}, ${d(ch.b.y)}). Find its equation in the form y = mx + c.`;
  if(ch.type==='missing')return ch.find==='k'?`The point (k, ${d(ch.y)}) lies on the line ${M.equation(ch.m,ch.c)}. Find k.`:`The point (${d(ch.x)}, y) lies on the line ${M.equation(ch.m,ch.c)}. Find y.`;
  return `Set m and c so the line passes through both target dots, (${d(ch.t1.x)}, ${d(ch.t1.y)}) and (${d(ch.t2.x)}, ${d(ch.t2.y)}), then press Check.`;
 };
 const X=v=>`<span class="x-value">${v}</span>`,Y=v=>`<span class="y-value">${v}</span>`;
 const plusC=c=>c?` ${c<0?'−':'+'} ${M.display(Math.abs(c))}`:'';
 const coef=(m,v)=>m===1?v:m===-1?'−'+v:M.display(m)+v;
 const gradientLine=(p,q)=>`<div class="working"><span>m =</span>${M.stack(Y(`${M.par(q.y)} − ${M.par(p.y)}`),X(`${M.par(q.x)} − ${M.par(p.x)}`))}<span>=</span>${M.stack(M.display(q.y-p.y),M.display(q.x-p.x))}<span>=</span><strong>${M.fracHTML((q.y-p.y)/(q.x-p.x))}</strong></div>`;
 const interceptLine=(p,m)=>`<p>Substitute (${X(M.display(p.x))}, ${Y(M.display(p.y))}): ${M.display(p.y)} = ${M.display(m)} × ${M.par(p.x)} + c, so c = ${M.display(p.y)} − ${M.par(m*p.x)} = <strong>${M.display(p.y-m*p.x)}</strong>.</p>`;
 const working=ch=>{const d=M.display,eq=`<div class="equation">${M.equationHTML(ch.m,ch.c)}</div>`;
  if(ch.type==='read')return `<p>The line crosses the y-axis at (0, ${d(ch.c)}), so <strong>c = ${d(ch.c)}</strong>. It also passes exactly through the grid corner (${d(ch.through.x)}, ${d(ch.through.y)}).</p>${gradientLine({x:0,y:ch.c},ch.through)}${eq}`;
  if(ch.type==='two')return gradientLine(ch.a,ch.b)+interceptLine(ch.a,ch.m)+eq;
  if(ch.type==='missing'){if(ch.find==='y')return `<p>Put x = ${d(ch.x)} into ${M.equation(ch.m,ch.c)}. Multiply first, then ${ch.c<0?'subtract':'add'} c.</p><div class="working"><span>y = ${d(ch.m)} × ${M.par(ch.x)}${plusC(ch.c)} = ${d(ch.m*ch.x)}${plusC(ch.c)} = <strong>${d(ch.y)}</strong></span></div>`;
   return `<p>Replace y with ${d(ch.y)} and solve for k.</p><div class="working"><span>${d(ch.y)} = ${coef(ch.m,'k')}${plusC(ch.c)}</span></div><div class="working"><span>${coef(ch.m,'k')} = ${d(ch.y)} − ${M.par(ch.c)} = ${d(ch.y-ch.c)}</span></div><div class="working"><span>k = ${d(ch.y-ch.c)} ÷ ${M.par(ch.m)} = <strong>${d(ch.x)}</strong></span></div>`}
  return gradientLine(ch.t1,ch.t2)+interceptLine(ch.t1,ch.m)+`<p>Set m = ${d(ch.m)} and c = ${d(ch.c)}.</p>`+eq;
 };
 return {types,hints,generate,check,award,question,working,matches,ratio};
})();

GL.pages.advanced={
 render(){const s=GL.state.advanced;if(!s.ch)this.reset(GL.detective.generate(GL.saved.advanced.type));return `<main id="main" class="lab advanced" tabindex="-1"><div class="lab-main"><section class="plot-col" aria-label="Challenge graph"><div id="plot-host" class="plot-host">${GL.graph.svg(GL.graph.detectiveContent(s.ch,s))}</div><p id="detective-caption" class="caption">${this.caption()}</p></section><section class="working-panel detective-panel" aria-label="Challenge"><div><h1>Equation detective</h1><p class="subtitle">Find the rule behind each straight line.</p></div><div class="type-buttons" role="group" aria-label="Challenge type">${Object.entries(GL.detective.types).map(([t,label])=>`<button class="type-button" data-type="${t}" aria-pressed="${GL.saved.advanced.type===t}">${label}</button>`).join('')}</div><div id="scores" class="scores">${this.scoresHTML()}</div><section id="challenge" class="challenge" aria-live="polite">${this.challengeHTML()}</section><div class="detective-actions"><button class="secondary" id="new-challenge">New challenge</button><button class="text-button" id="reset-score">Reset my score</button></div></section></div></main>`},
 reset(ch){Object.assign(GL.state.advanced,{ch,tries:0,status:'open',notes:[],hint:false,inputs:{},sm:0,sc:0,example:null})},
 caption(){const s=GL.state.advanced,ch=s.ch;if(ch.type==='two')return s.status==='open'?'No graph this time. Use the coordinates.':[ch.a,ch.b].every(p=>Math.abs(p.x)<=8&&Math.abs(p.y)<=8)?'The line through both points.':'These points do not both fit on this grid.';if(ch.type==='targets')return 'Move m and c until both rings turn green.';if(ch.type==='missing')return `The line ${GL.math.equation(ch.m,ch.c)}.`;return 'Read the red line.'},
 scoresHTML(){const a=GL.saved.advanced;return [['Points',a.points],['Solved',a.solved],['Streak',a.streak],['Best streak',a.best]].map(([label,n])=>`<div class="score"><strong>${n}</strong><span>${label}</span></div>`).join('')},
 note(kind,title,body){return `<div class="note ${kind}" role="status"><h3>${title}</h3>${body}</div>`},
 field(name,label,value,locked){return `<label class="answer-field"><span>${label} =</span><input id="answer-${name}" name="${name}" inputmode="text" autocomplete="off" value="${String(value??'').replace(/[^0-9./+\-−\s]/g,'')}" aria-label="${label === 'm'?'Gradient m':label==='c'?'Intercept c':label}" ${locked?'disabled':''}></label>`},
 challengeHTML(){const s=GL.state.advanced,ch=s.ch,D=GL.detective,locked=s.status!=='open',hintShown=s.notes.some(n=>n.hint);
  let inputs;
  if(ch.type==='targets')inputs=GL.pages.beginner.slider('m','Gradient',-4,4,.5,s.sm)+GL.pages.beginner.slider('c','Y-intercept',-8,8,1,s.sc)+`<div class="target-equation" id="target-equation">${GL.math.equationHTML(s.sm,s.sc)}</div>`;
  else if(ch.type==='missing')inputs=`<div class="answer-fields">${this.field('v',ch.find,s.inputs.v,locked)}</div>`;
  else inputs=`<div class="answer-fields">${this.field('m','m',s.inputs.m,locked)}${this.field('c','c',s.inputs.c,locked)}</div>`;
  const notes=s.notes.map(n=>this.note(n.kind,n.title,n.body)).join('')+(s.hint&&!hintShown&&!locked?this.note('yellow','Hint',`<p>${D.hints[ch.type]}</p>`):'');
  return `<div class="eyebrow">${D.types[ch.type]} · ${locked?(s.status==='solved'?'Solved':'Answer shown'):`Try ${s.tries+1} of 3`}</div><h2 class="hand question">${D.question(ch)}</h2><form id="answer-form" class="answer-form" novalidate>${inputs}<div class="answer-actions">${locked?`<button type="button" class="primary" id="next-challenge">Next challenge</button>`:`<button type="submit" class="primary">Check</button>${hintShown?'':`<button type="button" class="text-button" id="detective-hint">${s.hint?'Hide hint':'Give me a hint'}</button>`}`}</div></form><p id="input-note" class="input-note" role="status"></p>${notes}`;
 },
 bind(){document.querySelectorAll('[data-type]').forEach(btn=>btn.onclick=()=>{GL.saved.advanced.type=btn.dataset.type;GL.save();document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));this.newChallenge(false)});document.getElementById('new-challenge').onclick=()=>this.newChallenge();document.getElementById('reset-score').onclick=()=>{GL.showDialog('Reset your score?','<p>This sets points, solved, streak and best streak back to 0.</p><button class="danger" id="confirm-score-reset">Reset my score</button>');document.getElementById('confirm-score-reset').onclick=()=>{Object.assign(GL.saved.advanced,{points:0,solved:0,streak:0,best:0});GL.save();document.getElementById('dialog').close();this.refreshScores();GL.announce('Score reset.')}};this.bindChallenge()},
 newChallenge(focus=true){const s=GL.state.advanced;this.reset(GL.detective.generate(GL.saved.advanced.type,Math.random,s.ch));this.refresh();if(focus)this.focusChallenge()},
 /* Test hook: show a specific challenge. */
 load(ch){this.reset(ch);this.refresh()},
 refresh(){GL.graph.repaint('advanced');document.getElementById('detective-caption').textContent=this.caption();document.getElementById('challenge').innerHTML=this.challengeHTML();this.bindChallenge();this.refreshScores()},
 refreshScores(){document.getElementById('scores').innerHTML=this.scoresHTML();GL.updateCounts()},
 focusChallenge(){(document.querySelector('#challenge input:not([disabled])')||document.getElementById('next-challenge'))?.focus({preventScroll:true})},
 bindChallenge(){const s=GL.state.advanced;document.getElementById('answer-form').onsubmit=e=>{e.preventDefault();this.submit()};const next=document.getElementById('next-challenge');if(next)next.onclick=()=>this.newChallenge();const hint=document.getElementById('detective-hint');if(hint)hint.onclick=()=>{s.hint=!s.hint;this.refresh();document.getElementById('detective-hint')?.focus({preventScroll:true})};
  document.querySelectorAll('#challenge input:not([type=range])').forEach(input=>input.oninput=()=>{s.inputs[input.name]=input.value});
  for(const k of ['m','c']){const slider=document.getElementById('slider-'+k);if(!slider)continue;slider.disabled=s.status!=='open';slider.oninput=()=>{s['s'+k]=Number(slider.value);document.getElementById('value-'+k).textContent=GL.math.display(Number(slider.value));document.getElementById('target-equation').innerHTML=GL.math.equationHTML(s.sm,s.sc);GL.graph.repaint('advanced')}}},
 submit(){const s=GL.state.advanced,ch=s.ch,D=GL.detective;if(s.status!=='open')return;
  let answer;
  if(ch.type==='targets')answer={m:s.sm,c:s.sc};
  else{const names=ch.type==='missing'?['v']:['m','c'];for(const n of names){const input=document.getElementById('answer-'+n);s.inputs[n]=input.value;if(GL.math.parse(input.value)===null){document.getElementById('input-note').textContent='Type a whole number, decimal or fraction, such as −2, 1.5 or 3/2. This try was not counted.';input.focus();return}}answer=ch.type==='missing'?{v:s.inputs.v}:{m:s.inputs.m,c:s.inputs.c}}
  const result=D.check(ch,answer);s.tries++;
  const hintBody=`<p>${D.hints[ch.type]}</p>`;
  if(result.correct){const score=D.award(GL.saved.advanced,s.tries,true);this.store(score);s.status='solved';s.notes=[{kind:'green',title:'Correct!',body:`<p><strong>+${score.earned} point${score.earned===1?'':'s'}.</strong> ${s.tries===1?'First try!':`Solved on try ${s.tries}.`}</p>${D.working(ch)}`}]}
  else if(s.tries===1)s.notes=[{kind:'yellow',title:'Not yet',hint:true,body:`${result.comment?`<p><strong>${result.comment}</strong></p>`:''}${hintBody}<p>Try again.</p>`}];
  else if(s.tries===2){s.example=D.generate(ch.type,Math.random,ch);const ex=s.example,graph=ex.type==='read'||ex.type==='targets'?`<div class="mini-graph">${GL.graph.svg(GL.graph.detectiveContent(ex,{status:'example'}),{clip:'mini-clip',label:'Example graph: '+GL.math.equation(ex.m,ex.c)})}</div>`:'';s.notes=[{kind:'yellow',title:'Not yet',hint:true,body:`${result.comment?`<p><strong>${result.comment}</strong></p>`:''}${hintBody}`},{kind:'blue',title:'Try a similar one first',body:`<p class="example-question">${D.question(ex)}</p>${graph}${D.working(ex)}<p>Now use the same steps and try again.</p>`}]}
  else{const score=D.award(GL.saved.advanced,s.tries,false);this.store(score);s.status='revealed';if(ch.type==='targets'){s.sm=ch.m;s.sc=ch.c}s.notes=[{kind:'red',title:'Here is the answer',body:D.working(ch)}]}
  this.refresh();this.focusChallenge();
  GL.announce(s.notes.map(n=>n.title+'. '+n.body.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ')).join(' ').slice(0,400));
 },
 store(score){const {earned,...rest}=score;Object.assign(GL.saved.advanced,rest);GL.save()}
};
