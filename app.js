'use strict';
(() => {
  // Preserve the original key and migrate Sprint 1 boards only in memory until Save.
  const KEY = 'goalgrid.board.v1';
  const palettes = {
    original: ['#edf0e7', '#eee9e1', '#e7eceb', '#efe3db', '#eae6ed'],
    forest: ['#dce8d8', '#e8eddf', '#cdded5', '#e9e7d6', '#dce8e4'],
    warm: ['#efdccf', '#eee4d5', '#e7d8ce', '#f0e8dd', '#e4ded2']
  };
  const initialColor = i => palettes.original[(i + Math.floor(i / 5)) % 5];
  const emptyGoal = i => ({ text: '', color: initialColor(i), done: false, image: '' });
  const fresh = () => ({ version: 2, year: new Date().getFullYear(), phrase: '', goals: Array.from({ length: 25 }, (_, i) => emptyGoal(i)) });
  const validImage = image => typeof image === 'string' && (image === '' || (image.length <= 60000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image)));
  const valid = data => data && [1, 2].includes(data.version) && typeof data.phrase === 'string' && data.phrase.length <= 140 &&
    (data.version === 1 || (Number.isInteger(data.year) && data.year >= 2000 && data.year <= 9999)) &&
    Array.isArray(data.goals) && data.goals.length === 25 && data.goals.every(g => g && typeof g.text === 'string' && g.text.length <= 180 && /^#[0-9a-f]{6}$/i.test(g.color) && (data.version === 1 || (typeof g.done === 'boolean' && validImage(g.image))));
  let state = fresh(), dirty = false;
  const status = document.querySelector('#status');
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const saved = JSON.parse(raw);
      if (!valid(saved)) throw new Error('Invalid board');
      state = saved.version === 1 ? { ...state, phrase: saved.phrase, goals: saved.goals.map(g => ({ text: g.text, color: g.color, done: false, image: '' })) } : saved;
      status.textContent = saved.version === 1 ? 'Tablero recuperado · compatible con Sprint 1' : 'Tablero recuperado';
    }
  } catch { status.textContent = 'No pudimos recuperar el tablero. El guardado anterior no se ha borrado.'; }
  const markDirty = () => { dirty = true; status.textContent = 'Cambios sin guardar'; };
  const updatePeriod = () => {
    const now = new Date();
    document.querySelector('#year').textContent = now.getFullYear();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.max(0, Math.ceil((Date.UTC(state.year + 1, 0, 1) - today) / 86400000));
    document.querySelector('#period').textContent = `Metas de ${state.year} · 1 de enero al 31 de diciembre · ${days ? `${days} ${days === 1 ? 'día restante' : 'días restantes'}` : 'Periodo finalizado'}${state.year !== now.getFullYear() ? ' · Conservamos tu tablero guardado' : ''}`;
  };
  updatePeriod(); setInterval(updatePeriod, 60000);
  const updateProgress = () => {
    const completed = state.goals.filter(g => g.done).length;
    document.querySelector('#progress').value = completed;
    document.querySelector('#progress-text').textContent = `${completed} de 25 completadas · ${completed * 4}%`;
  };
  const phrase = document.querySelector('#phrase'); phrase.value = state.phrase;
  phrase.addEventListener('input', () => { state.phrase = phrase.value; markDirty(); });
  const dialog = document.querySelector('#color-dialog'), picker = document.querySelector('#color-picker'), hex = document.querySelector('#hex');
  const resetDialog = document.querySelector('#reset-dialog');
  let selected = 0, resetIndex = 0, returnFocus;
  const foreground = color => {
    const rgb = color.match(/[a-f0-9]{2}/gi).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? '#17291f' : '#ffffff';
  };
  const board = document.querySelector('#board'), controls = [];
  const paint = i => {
    const g = state.goals[i], c = controls[i];
    c.card.style.backgroundColor = g.color; c.card.style.color = foreground(g.color);
    c.card.classList.toggle('completed', g.done); c.done.textContent = g.done ? '✓' : '○';
    c.done.setAttribute('aria-pressed', String(g.done));
    c.done.setAttribute('aria-label', `${g.done ? 'Marcar pendiente' : 'Completar'} meta ${i + 1}`);
    c.stamp.hidden = !g.done; c.image.hidden = !g.done || !g.image;
    if (g.image) c.image.src = g.image; else c.image.removeAttribute('src');
    c.photo.disabled = !g.done; c.photo.textContent = g.image ? 'Cambiar imagen' : 'Añadir imagen';
    c.remove.hidden = !g.image || !g.done;
  };
  const button = (text, label, cls = '') => {
    const el = document.createElement('button'); el.type = 'button'; el.textContent = text; el.className = cls;
    if (label) el.setAttribute('aria-label', label); return el;
  };
  // Re-encode locally to limit storage and discard original image metadata.
  const readPhoto = async file => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error('Elige una imagen JPG, PNG o WebP de hasta 10 MB.');
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height)), canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', .65);
      if (!validImage(data)) throw new Error('La imagen es demasiado compleja. Prueba con otra más pequeña.');
      return data;
    } finally { bitmap.close(); }
  };
  state.goals.forEach((goal, i) => {
    const card = document.createElement('div'); card.className = 'goal';
    const top = document.createElement('div'); top.className = 'goal-top';
    const number = document.createElement('span'); number.className = 'goal-number'; number.textContent = String(i + 1).padStart(2, '0');
    const actions = document.createElement('div'); actions.className = 'cell-actions';
    const done = button('✓', `Completar meta ${i + 1}`, 'done-button');
    const toggle = () => { state.goals[i].done = !state.goals[i].done; paint(i); updateProgress(); markDirty(); };
    done.addEventListener('click', toggle);
    card.addEventListener('dblclick', event => { if (!event.target.closest('button, summary, details, input')) toggle(); });
    const color = button('', `Cambiar color de meta ${i + 1}`, 'color-button');
    color.addEventListener('click', () => {
      selected = i; returnFocus = color; hex.value = picker.value = state.goals[i].color;
      document.querySelector('#color-goal').textContent = `Meta ${i + 1}`; dialog.showModal();
    });
    const text = document.createElement('textarea'); text.maxLength = 180; text.rows = 3;
    text.placeholder = i === 0 ? '¿Qué quieres lograr?' : 'Escribe una meta…'; text.setAttribute('aria-label', `Meta ${i + 1}`); text.value = goal.text;
    text.addEventListener('input', () => { state.goals[i].text = text.value; markDirty(); });
    const stamp = document.createElement('span'); stamp.className = 'completion-stamp'; stamp.textContent = '★ Completada';
    const image = document.createElement('img'); image.className = 'goal-image'; image.alt = `Imagen de la meta ${i + 1} completada`;
    const details = document.createElement('details'); details.className = 'cell-options';
    const summary = document.createElement('summary'); summary.textContent = 'Opciones'; summary.setAttribute('aria-label', `Opciones de meta ${i + 1}`);
    const photo = button('Añadir imagen', `Imagen de meta ${i + 1}`); photo.title = 'Disponible cuando la meta está completada';
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp'; input.hidden = true;
    input.setAttribute('aria-label', `Archivo de imagen de meta ${i + 1}`);
    let busy = false, revision = 0;
    photo.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const file = input.files[0]; if (!file || busy) return;
      const currentGoal = state.goals[i], token = revision;
      busy = true; photo.disabled = true;
      try {
        const data = await readPhoto(file);
        if (state.goals[i] === currentGoal && currentGoal.done && revision === token) { currentGoal.image = data; paint(i); markDirty(); }
      } catch (error) { status.textContent = error.message || 'No se pudo leer la imagen.'; }
      finally { busy = false; input.value = ''; paint(i); }
    });
    const remove = button('Quitar imagen', `Quitar imagen de meta ${i + 1}`);
    remove.addEventListener('click', () => { revision++; state.goals[i].image = ''; paint(i); markDirty(); });
    const reset = button('Restablecer', `Restablecer meta ${i + 1}`);
    reset.addEventListener('click', () => {
      resetIndex = i; returnFocus = reset; document.querySelector('#reset-detail').textContent = `¿Restablecer la meta ${i + 1}?`;
      resetDialog.returnValue = ''; resetDialog.showModal();
    });
    details.append(summary, photo, input, remove, reset); actions.append(done, color); top.append(number, actions);
    card.append(top, text, stamp, image, details); board.append(card);
    controls.push({ card, done, stamp, image, photo, remove, text, details }); paint(i);
  });
  updateProgress();
  resetDialog.addEventListener('close', () => {
    if (resetDialog.returnValue === 'reset') {
      state.goals[resetIndex] = emptyGoal(resetIndex); controls[resetIndex].text.value = ''; controls[resetIndex].details.open = false;
      paint(resetIndex); updateProgress(); markDirty(); controls[resetIndex].text.focus();
    } else returnFocus?.focus();
  });
  document.querySelector('#apply-template').addEventListener('click', () => {
    const palette = palettes[document.querySelector('#template').value]; if (!palette) return;
    state.goals.forEach((g, i) => { g.color = palette[(i + Math.floor(i / 5)) % 5]; paint(i); }); markDirty();
  });
  const swatches = document.createElement('div'); swatches.className = 'swatches';
  for (const value of [...palettes.original, '#cdded5', '#efdccf', '#2f5145']) {
    const swatch = button('', `Elegir color ${value}`); swatch.style.backgroundColor = value;
    swatch.addEventListener('click', () => { hex.value = picker.value = value; document.querySelector('#color-form').requestSubmit(); }); swatches.append(swatch);
  }
  document.querySelector('#color-goal').after(swatches);
  picker.addEventListener('input', () => { hex.value = picker.value; });
  hex.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(hex.value)) picker.value = hex.value; });
  const closeDialog = () => { dialog.close(); returnFocus?.focus(); };
  document.querySelector('#close-color').addEventListener('click', closeDialog);
  document.querySelector('#color-form').addEventListener('submit', event => {
    event.preventDefault(); if (!/^#[0-9a-f]{6}$/i.test(hex.value)) { hex.reportValidity(); return; }
    state.goals[selected].color = hex.value.toLowerCase(); paint(selected); markDirty(); closeDialog();
  });
  document.querySelector('#save').addEventListener('click', () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); dirty = false; status.textContent = 'Tablero guardado en este dispositivo'; }
    catch { status.textContent = 'No se pudo guardar. Revisa el espacio o los permisos del navegador; puedes quitar imágenes y volver a intentar.'; }
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
})();
