'use strict';
(() => {
  const KEY = 'goalgrid.board.v1';
  const palette = ['#edf0e7', '#eee9e1', '#e7eceb', '#efe3db', '#eae6ed'];
  const fresh = () => ({ version: 1, phrase: '', goals: Array.from({ length: 25 }, (_, i) => ({ text: '', color: palette[(i + Math.floor(i / 5)) % 5] })) });
  let state = fresh();
  let dirty = false;
  const status = document.querySelector('#status');
  const valid = data => data && data.version === 1 && typeof data.phrase === 'string' && data.phrase.length <= 140 && Array.isArray(data.goals) && data.goals.length === 25 && data.goals.every(goal => goal && typeof goal.text === 'string' && goal.text.length <= 180 && /^#[0-9a-f]{6}$/i.test(goal.color));
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const saved = JSON.parse(raw);
      if (!valid(saved)) throw new Error('Invalid board');
      state = saved;
      status.textContent = 'Tablero recuperado';
    }
  } catch {
    status.textContent = 'No pudimos recuperar el tablero. El guardado anterior no se ha borrado.';
  }
  const markDirty = () => { dirty = true; status.textContent = 'Cambios sin guardar'; };
  const year = document.querySelector('#year');
  const updateYear = () => { year.textContent = new Date().getFullYear(); };
  updateYear();
  setInterval(updateYear, 60000);
  const phrase = document.querySelector('#phrase');
  phrase.value = state.phrase;
  phrase.addEventListener('input', () => { state.phrase = phrase.value; markDirty(); });
  const dialog = document.querySelector('#color-dialog');
  const picker = document.querySelector('#color-picker');
  const hex = document.querySelector('#hex');
  let selected = 0;
  let returnFocus;
  const foreground = color => {
    const rgb = color.match(/[a-f0-9]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? '#17291f' : '#ffffff';
  };
  const board = document.querySelector('#board');
  state.goals.forEach((goal, i) => {
    const card = document.createElement('div');
    card.className = 'goal';
    card.style.backgroundColor = goal.color;
    card.style.color = foreground(goal.color);
    const top = document.createElement('div');
    top.className = 'goal-top';
    const number = document.createElement('span');
    number.className = 'goal-number';
    number.textContent = String(i + 1).padStart(2, '0');
    const color = document.createElement('button');
    color.type = 'button';
    color.className = 'color-button';
    color.setAttribute('aria-label', `Cambiar color de meta ${i + 1}`);
    color.addEventListener('click', () => {
      selected = i;
      returnFocus = color;
      hex.value = picker.value = state.goals[i].color;
      document.querySelector('#color-goal').textContent = `Meta ${i + 1}`;
      dialog.showModal();
    });
    const text = document.createElement('textarea');
    text.maxLength = 180;
    text.rows = 3;
    text.placeholder = i === 0 ? '¿Qué quieres lograr?' : 'Escribe una meta…';
    text.setAttribute('aria-label', `Meta ${i + 1}`);
    text.value = goal.text;
    text.addEventListener('input', () => { state.goals[i].text = text.value; markDirty(); });
    top.append(number, color);
    card.append(top, text);
    board.append(card);
  });
  picker.addEventListener('input', () => { hex.value = picker.value; });
  hex.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(hex.value)) picker.value = hex.value; });
  const closeDialog = () => { dialog.close(); returnFocus?.focus(); };
  document.querySelector('#close-color').addEventListener('click', closeDialog);
  document.querySelector('#color-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!/^#[0-9a-f]{6}$/i.test(hex.value)) { hex.reportValidity(); return; }
    state.goals[selected].color = hex.value.toLowerCase();
    const card = board.children[selected];
    card.style.backgroundColor = hex.value;
    card.style.color = foreground(hex.value);
    markDirty();
    closeDialog();
  });
  document.querySelector('#save').addEventListener('click', () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      dirty = false;
      status.textContent = 'Tablero guardado en este dispositivo';
    } catch {
      status.textContent = 'No se pudo guardar. Revisa el espacio o los permisos del navegador.';
    }
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
})();
