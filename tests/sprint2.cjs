const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:4176';
  const out = '.local/phase4/evidence'; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({headless:true, channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome'});
  const context = await browser.newContext({viewport:{width:1440,height:1100}});
  const page = await context.newPage(); const results = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const test = async (name, action) => { await action(); results.push({name,result:'PASS'}); console.log('PASS',name); };
  const text = i => page.getByRole('textbox',{name:`Meta ${i}`,exact:true});
  const goal = i => page.locator('.goal').nth(i-1);
  const options = async i => { const d = goal(i).locator('details'); if (!await d.evaluate(e=>e.open)) await d.locator('summary').click(); };
  await page.goto(base);
  await test('#9 #10 #11 completar, estrella, progreso y deshacer',async()=>{
    assert.match(await page.locator('#progress-text').innerText(),/0 de 25.*0%/);
    await text(1).fill('Leer un libro'); await page.getByRole('button',{name:'Completar meta 1',exact:true}).click();
    assert.equal(await goal(1).locator('.completion-stamp').isVisible(),true);
    assert.match(await page.locator('#progress-text').innerText(),/1 de 25.*4%/);
    await page.getByRole('button',{name:'Marcar pendiente meta 1',exact:true}).click();
    assert.equal(await goal(1).locator('.completion-stamp').isVisible(),false);
    await text(1).dblclick(); assert.equal(await goal(1).locator('.done-button').getAttribute('aria-pressed'),'true');
  });
  await test('#18 imagen solo en meta completada, validación y persistencia',async()=>{
    await options(2); assert.equal(await goal(2).getByRole('button',{name:'Imagen de meta 2',exact:true}).isDisabled(),true);
    await options(1);
    const file = goal(1).locator('input[type=file]');
    await file.setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('no es imagen')});
    await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('JPG'));
    assert.equal(await goal(1).locator('img').isVisible(),false);
    const fixture = await goal(1).screenshot();
    await file.setInputFiles({name:'demostracion.png',mimeType:'image/png',buffer:fixture});
    await goal(1).locator('img').waitFor({state:'visible'});
    const src = await goal(1).locator('img').getAttribute('src'); assert.match(src,/^data:image\/jpeg/); assert.ok(src.length<=60000);
    await page.locator('#save').click(); await page.reload();
    assert.equal(await goal(1).locator('img').getAttribute('src'),src);
    assert.equal(await goal(1).locator('.done-button').getAttribute('aria-pressed'),'true');
    assert.equal(await text(1).inputValue(),'Leer un libro');
    await options(1); await page.getByRole('button',{name:'Quitar imagen de meta 1',exact:true}).click();
    assert.equal(await goal(1).locator('img').isVisible(),false);
  });
  await test('#7 colores rápidos y HEX sin perder completado',async()=>{
    await page.getByRole('button',{name:'Cambiar color de meta 1',exact:true}).click();
    await page.getByRole('button',{name:'Elegir color #2f5145',exact:true}).click();
    assert.equal(await goal(1).evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(47, 81, 69)');
    assert.equal(await goal(1).locator('.done-button').getAttribute('aria-pressed'),'true');
  });
  await test('#19 plantillas conservan textos, imágenes y completado',async()=>{
    const fixture = await goal(1).screenshot(); await options(1);
    await goal(1).locator('input[type=file]').setInputFiles({name:'demostracion.png',mimeType:'image/png',buffer:fixture});
    await goal(1).locator('img').waitFor({state:'visible'}); const src = await goal(1).locator('img').getAttribute('src');
    await text(2).fill('Meta vecina'); await page.locator('#template').selectOption('forest'); await page.locator('#apply-template').click();
    assert.equal(await text(1).inputValue(),'Leer un libro'); assert.equal(await text(2).inputValue(),'Meta vecina');
    assert.equal(await goal(1).locator('img').getAttribute('src'),src);
    assert.equal(await goal(1).locator('.done-button').getAttribute('aria-pressed'),'true');
    assert.equal(await goal(1).evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(220, 232, 216)');
  });
  await test('#19 restablecer: cancelar, confirmar y aislar la celda',async()=>{
    await options(1); await page.getByRole('button',{name:'Restablecer meta 1',exact:true}).click();
    await page.getByRole('button',{name:'Cancelar',exact:true}).click(); assert.equal(await text(1).inputValue(),'Leer un libro');
    await page.getByRole('button',{name:'Restablecer meta 1',exact:true}).click(); await page.locator('#confirm-reset').click();
    await page.waitForFunction(()=>document.querySelector('.goal textarea').value==='');
    assert.equal(await goal(1).locator('img').isVisible(),false); assert.equal(await goal(1).locator('.done-button').getAttribute('aria-pressed'),'false');
    assert.equal(await goal(1).evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(237, 240, 231)'); assert.equal(await text(2).inputValue(),'Meta vecina');
    await page.locator('#save').click(); await page.reload(); assert.equal(await text(1).inputValue(),''); assert.equal(await text(2).inputValue(),'Meta vecina');
    // Reset must not break subsequent image uploads on the same cell.
    await page.getByRole('button',{name:'Completar meta 1',exact:true}).click(); await options(1);
    await goal(1).locator('input[type=file]').setInputFiles({name:'after-reset.png',mimeType:'image/png',buffer:await goal(1).screenshot()});
    await goal(1).locator('img').waitFor({state:'visible'});
  });
  await test('#11 límite de progreso 25/25',async()=>{
    for(const b of await page.locator('.done-button').all()) if(await b.getAttribute('aria-pressed') === 'false') await b.click();
    assert.match(await page.locator('#progress-text').innerText(),/25 de 25.*100%/); assert.equal(await page.locator('#progress').getAttribute('max'),'25');
  });
  const old = await browser.newContext(); const op = await old.newPage(); await op.goto(base);
  await test('migración Sprint 1 conserva datos y no reescribe antes de Guardar',async()=>{
    const legacy = {version:1,phrase:'Frase anterior',goals:Array.from({length:25},(_,i)=>({text:`Anterior ${i+1}`,color:'#223344'}))};
    await op.evaluate(v=>localStorage.setItem('goalgrid.board.v1',JSON.stringify(v)),legacy); await op.reload();
    assert.equal(await op.getByRole('textbox',{name:'Meta 25',exact:true}).inputValue(),'Anterior 25');
    assert.equal(await op.locator('#phrase').inputValue(),'Frase anterior');
    assert.equal(await op.evaluate(()=>JSON.parse(localStorage.getItem('goalgrid.board.v1')).version),1);
    await op.locator('#save').click(); const saved = await op.evaluate(()=>JSON.parse(localStorage.getItem('goalgrid.board.v1')));
    assert.equal(saved.version,2); assert.equal(saved.goals[0].done,false); assert.equal(saved.goals[0].color,'#223344');
  });
  await test('#12 periodo anual, cambio de año y tablero conservado',async()=>{
    await op.clock.install({time:new Date('2026-12-31T23:59:40')});
    await op.evaluate(()=>{const s=JSON.parse(localStorage.getItem('goalgrid.board.v1'));s.year=2026;localStorage.setItem('goalgrid.board.v1',JSON.stringify(s));}); await op.reload();
    assert.match(await op.locator('#period').innerText(),/Metas de 2026.*1 día restante/);
    await op.clock.fastForward(61000);
    assert.equal(await op.locator('#year').innerText(),'2027'); assert.match(await op.locator('#period').innerText(),/Metas de 2026.*Periodo finalizado.*Conservamos/);
    assert.equal(await op.getByRole('textbox',{name:'Meta 1',exact:true}).inputValue(),'Anterior 1');
  });
  await test('sin errores JavaScript',async()=>assert.deepEqual(errors,[]));
  // Evidence uses demonstration content, not feedback or personal user goals.
  for(const b of await page.locator('.done-button').all()) if(await b.getAttribute('aria-pressed') === 'true') await b.click();
  await text(1).fill('Leer un libro'); await text(2).fill('Terminar mi proyecto'); await text(3).fill('Aprender a nadar');
  await page.getByRole('button',{name:'Completar meta 1',exact:true}).click();
  for(const d of await page.locator('.cell-options').all()) if(await d.evaluate(e=>e.open)) await d.locator('summary').click();
  await page.locator('#save').click(); await page.screenshot({path:`${out}/sprint2-controls.png`,fullPage:false}); await page.screenshot({path:`${out}/sprint2-desktop.png`,fullPage:true});
  await test('móvil 390px sin desbordamiento',async()=>{await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:`${out}/sprint2-mobile.png`,fullPage:true});});
  fs.writeFileSync(`${out}/sprint2-results.json`,JSON.stringify({base,executedAt:new Date().toISOString(),browser:'Chrome headless',results},null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
