// Ejecutar con Playwright instalado: NODE_PATH=<ruta>/node_modules node tests/acceptance.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1200}});
  const page = await context.newPage();
  const results = [];
  const test = async (name, action) => { await action(); results.push({name, result:'PASS'}); console.log('PASS',name); };
  const base = process.env.BASE_URL || 'http://127.0.0.1:4174';
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await test('#3 25 metas y cuadrícula de cinco columnas', async()=>{assert.equal(await page.locator('.goal').count(),25);assert.equal(await page.locator('.board').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),5);});
  await test('#4 Año actual',async()=>assert.equal(await page.locator('#year').innerText(),String(new Date().getFullYear())));
  await test('#5 y #6 Edición independiente y texto seguro',async()=>{await page.locator('#phrase').fill('Un paso cada día');await page.getByRole('textbox',{name:'Meta 1',exact:true}).fill('Leer 12 libros <script>alert(1)</script>');await page.getByRole('textbox',{name:'Meta 25',exact:true}).fill('Aprender a nadar');assert.equal(await page.getByRole('textbox',{name:'Meta 2',exact:true}).inputValue(),'');});
  await test('#7 y #8 Color HEX válido y rechazo de valor inválido',async()=>{await page.getByRole('button',{name:'Cambiar color de meta 1',exact:true}).click();await page.locator('#hex').fill('#zzzzzz');await page.getByRole('button',{name:'Aplicar color'}).click();assert.equal(await page.locator('dialog').isVisible(),true);await page.locator('#hex').fill('#223344');await page.getByRole('button',{name:'Aplicar color'}).click();assert.equal(await page.locator('.goal').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(34, 51, 68)');assert.equal(await page.locator('.goal').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');});
  await test('#13 y #14 Guardado y recuperación tras recarga',async()=>{await page.locator('#save').click();await page.reload();assert.equal(await page.locator('#phrase').inputValue(),'Un paso cada día');assert.match(await page.getByRole('textbox',{name:'Meta 1',exact:true}).inputValue(),/<script>/);assert.equal(await page.getByRole('textbox',{name:'Meta 25',exact:true}).inputValue(),'Aprender a nadar');assert.match(await page.locator('#status').innerText(),/recuperado/);assert.equal(await page.locator('.goal').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(34, 51, 68)');});
  await test('Sin errores de JavaScript',async()=>assert.deepEqual(errors,[]));
  // Captura de demostración; estos textos no son metas aportadas por el usuario.
  await page.getByRole('textbox',{name:'Meta 1',exact:true}).fill('Leer 12 libros');
  for (const [i,text] of [[2,'Aprender algo nuevo'],[3,'Caminar más'],[6,'Crear mi primer proyecto'],[9,'Compartir tiempo en familia'],[12,'Conocer un lugar nuevo'],[17,'Cuidar mi descanso']]) await page.getByRole('textbox',{name:`Meta ${i}`,exact:true}).fill(text);
  await page.locator('#save').click();
  fs.mkdirSync('.local/evidence',{recursive:true});
  await page.screenshot({path:'.local/evidence/goalgrid-desktop.png',fullPage:true});
  await test('Vista móvil sin desbordamiento horizontal',async()=>{await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'.local/evidence/goalgrid-mobile.png',fullPage:true});});
  const corrupt = await browser.newContext();
  await corrupt.addInitScript(()=>localStorage.setItem('goalgrid.board.v1','{invalid'));
  const cp = await corrupt.newPage();await cp.goto(base);
  await test('Datos dañados no borran el guardado anterior',async()=>{assert.equal(await cp.locator('.goal').count(),25);assert.match(await cp.locator('#status').innerText(),/No pudimos recuperar/);assert.equal(await cp.evaluate(()=>localStorage.getItem('goalgrid.board.v1')),'{invalid');});
  const denied = await browser.newContext();
  await denied.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','QuotaExceededError')};});
  const dp = await denied.newPage();await dp.goto(base);
  await test('Fallo de almacenamiento informado sin falso éxito',async()=>{await dp.getByRole('textbox',{name:'Meta 1',exact:true}).fill('Mi meta');await dp.locator('#save').click();assert.match(await dp.locator('#status').innerText(),/No se pudo guardar/);});
  await test('Teclado abre y cierra el selector de color',async()=>{await dp.getByRole('button',{name:'Cambiar color de meta 1',exact:true}).focus();await dp.keyboard.press('Enter');assert.equal(await dp.locator('dialog').isVisible(),true);await dp.keyboard.press('Escape');assert.equal(await dp.locator('dialog').isVisible(),false);});
  fs.writeFileSync('.local/evidence/test-results.json',JSON.stringify({base,executedAt:new Date().toISOString(),results},null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
