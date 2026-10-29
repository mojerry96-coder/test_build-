/* Run with npm run test:browser after installing Playwright and its Chromium binary.
 * Optional CHROMIUM_PATH points at an existing compatible browser executable.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const http=require('node:http');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{const name=decodeURIComponent(req.url.split('?')[0]);const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data)})});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});const page=await browser.newPage({viewport:{width:1440,height:900},colorScheme:'light',reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const size of [{width:1440,height:900},{width:1366,height:768},{width:1280,height:720},{width:390,height:844}]){
  await page.setViewportSize(size);
  for(const file of ['01-start.html','02-line-lab.html','03-two-point-gradient.html','04-equation-detective.html']){
   await page.goto(base+'/'+file);await page.evaluate(()=>document.fonts.ready);
   const dim=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}));
   assert.ok(dim.w<=size.width,`${file} horizontal overflow at ${size.width}: ${dim.w}`);
   if(size.width>=900)assert.ok(dim.h<=size.height,`${file} vertical overflow at ${size.height}: ${dim.h}`);
  }
 }
 await page.setViewportSize({width:1440,height:900});
 await page.goto(base+'/02-line-lab.html');assert.equal(await page.locator('.success').count(),0);
 await page.locator('#slider-m').fill('2');assert.equal(await page.locator('#live-equation').textContent(),'y = 2x');assert.equal(await page.locator('.success').count(),1);
 await page.locator('[data-mission="4"]').click();await page.locator('#slider-c').fill('-4');assert.equal(await page.locator('#live-equation').textContent(),'y = 2x − 4');assert.equal(await page.locator('.success').count(),1);
 await page.locator('#rise').uncheck();await page.locator('#lesson').check();assert.equal(await page.locator('.reference-line').count(),1);
 await page.locator('#walk').click();assert.equal(await page.locator('#walk').isDisabled(),true);
 await page.locator('[data-nav="intermediate"]').click();await page.waitForSelector('[data-point="a"]');
 await page.locator('[data-point="b"]').focus();await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>GL.state.intermediate.b.y),4);
 const dot=page.locator('[data-point="b"] circle').last();const box=await dot.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+50,box.y+box.height/2, {steps:5});await page.mouse.up();assert.ok(await page.evaluate(()=>GL.state.intermediate.b.x>1),'Point drag changed x');
 await page.goto(base+'/03-two-point-gradient.html');await page.locator('#predict').check();await page.locator('#prediction').fill('');await page.locator('#predict-form button[type=submit]').click();assert.ok((await page.locator('#input-note').textContent()).includes('Enter'));
 await page.locator('#prediction').fill('1');await page.locator('#predict-form button[type=submit]').click();assert.ok((await page.locator('.feedback').textContent()).includes('Spot on'));
 await page.locator('[data-point="b"]').focus();await page.keyboard.press('ArrowUp');assert.equal(await page.locator('#prediction').count(),1);
 await page.locator('#show-working').click();await page.locator('#show-equation').check();assert.ok((await page.locator('.intercept-working').textContent()).includes('Using A'));
 await page.locator('[data-point="b"]').focus();for(let i=0;i<4;i++)await page.keyboard.press('ArrowLeft');await page.locator('#show-working').click();assert.ok((await page.locator('.warning').textContent()).includes('Division by zero'));
 await page.locator('[data-mission="3"]').click();assert.ok((await page.locator('.pair-count').textContent()).includes('1 of 3'));
 await page.locator('[data-point="b"]').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');assert.ok((await page.locator('.pair-count').textContent()).includes('3 of 3'));assert.equal(await page.locator('.success').count(),1);
 await page.locator('[data-mission="0"]').click();assert.equal(await page.locator('.pair-count').count(),0);
 await page.locator('#theme').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.locator('#theme').click();
 await page.locator('[data-nav="advanced"]').first().click();await page.waitForSelector('#answer-form');assert.equal(await page.title(),'Equation detective · Gradient Lab');
 const load=ch=>page.evaluate(ch=>GL.pages.advanced.load(ch),ch);const submit=()=>page.locator('#answer-form button[type=submit]').click();
 await load({type:'two',m:-1.5,c:2,a:{x:4,y:-4},b:{x:-4,y:8}});assert.equal(await page.locator('.ring, .student-line').count(),0,'Two points shows no graph while working');
 await page.locator('#answer-m').fill('');await page.locator('#answer-m').press('Enter');assert.ok((await page.locator('#input-note').textContent()).includes('not counted'));assert.equal(await page.evaluate(()=>GL.state.advanced.tries),0);
 await page.locator('#answer-m').fill('3/2');await page.locator('#answer-c').fill('2');await submit();assert.ok((await page.locator('.note.yellow').textContent()).includes('Check the sign'));
 await page.locator('#answer-m').fill('-3/2');await page.locator('#answer-c').fill('1');await submit();assert.equal(await page.locator('.note.blue').count(),1);assert.ok((await page.locator('.note.blue').textContent()).includes('Now use the same steps'));
 await page.locator('#answer-m').fill('1');await submit();assert.ok((await page.locator('.note.red').textContent()).includes('Here is the answer'));assert.equal(await page.locator('#next-challenge').count(),1);assert.equal(await page.locator('.student-line').count(),1,'line appears after the challenge ends');
 assert.deepEqual(await page.evaluate(()=>[GL.saved.advanced.points,GL.saved.advanced.streak]),[0,0]);
 await load({type:'missing',m:2,c:5,find:'k',x:-4,y:-3});await page.locator('#answer-v').fill('−4');await page.locator('#answer-v').press('Enter');assert.ok((await page.locator('.note.green').textContent()).includes('+3 points'));
 assert.deepEqual(await page.evaluate(()=>[GL.saved.advanced.points,GL.saved.advanced.solved,GL.saved.advanced.streak,GL.saved.advanced.best]),[3,1,1,1]);assert.equal(await page.locator('[data-count="advanced"]').textContent(),'1 solved');
 await load({type:'targets',m:.5,c:1,t1:{x:-2,y:0},t2:{x:4,y:3}});assert.equal(await page.locator('.ring.hit').count(),1);await page.locator('#slider-m').fill('0.5');await page.locator('#slider-c').fill('1');assert.equal(await page.locator('.ring.hit').count(),2);await submit();assert.ok((await page.locator('.note.green').textContent()).includes('Correct'));assert.equal(await page.evaluate(()=>GL.saved.advanced.streak),2);
 await load({type:'targets',m:.5,c:1,t1:{x:-2,y:0},t2:{x:4,y:3}});for(let i=0;i<3;i++)await submit();assert.equal(await page.evaluate(()=>[GL.state.advanced.sm,GL.state.advanced.sc].join()),'0.5,1','reveal moves the sliders');assert.equal(await page.locator('#slider-m').isDisabled(),true);
 await load({type:'read',m:2/3,c:-1,through:{x:3,y:1}});await page.locator('#answer-m').fill('1');await page.locator('#answer-c').fill('-1');await submit();await submit();assert.equal(await page.locator('.mini-graph svg').count(),1,'read-the-graph example includes a small graph');
 const before=await page.evaluate(()=>JSON.stringify(GL.saved.advanced));await page.locator('#new-challenge').click();assert.equal(await page.evaluate(()=>JSON.stringify(GL.saved.advanced)),before,'New challenge skips without changing the score');
 await page.locator('[data-type="missing"]').click();assert.equal(await page.evaluate(()=>GL.state.advanced.ch.type),'missing');await page.reload();assert.equal(await page.locator('[data-type="missing"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#scores .score strong').first().textContent(),'6','score persists');
 await page.goto(base+'/index.html');assert.equal(await page.evaluate(()=>GL.state.page),'advanced','reopens on the last level');
 await page.locator('#reset-score').click();await page.locator('#confirm-score-reset').click();assert.deepEqual(await page.evaluate(()=>[GL.saved.advanced.points,GL.saved.advanced.solved,GL.saved.advanced.streak,GL.saved.advanced.best]),[0,0,0,0]);
 await page.locator('#settings').click();await page.locator('#reset-progress').click();assert.equal(await page.locator('#confirm-reset').count(),1);await page.locator('#confirm-reset').click();assert.equal(await page.evaluate(()=>GL.saved.beginner.length+GL.saved.intermediate.length),0);
 assert.deepEqual(errors,[]);console.log('Browser interactions for all four screens, persistence controls and responsive initial layouts passed.');
 } finally{if(browser)await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
