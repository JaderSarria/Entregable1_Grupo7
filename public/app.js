'use strict';

const icons = {
  check: '<path d="m5 12 4 4L19 6"/>',
  camera: '<path d="M4 6h4l2-3h4l2 3h4v14H4Z"/><circle cx="12" cy="12" r="4"/>',
  paw: '<ellipse cx="8" cy="6" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3"/><ellipse cx="3.7" cy="11" rx="1.7" ry="2.5" transform="rotate(-25 3.7 11)"/><ellipse cx="20.3" cy="11" rx="1.7" ry="2.5" transform="rotate(25 20.3 11)"/><path d="M6 18c0-3 3-7 6-7s6 4 6 7c0 4-4 2-6 2s-6 2-6-2Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm8-2v5m-2.5-2.5h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  edit: '<path d="m16 3 5 5M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15l-1 5Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>'
};
const $ = selector => document.querySelector(selector);
function icon(name) {
  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  // Only trusted, fixed SVG markup is inserted. Record values use textContent.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.paw}</svg>`;
  return span;
}
document.querySelectorAll('[data-icon]').forEach(element => element.replaceChildren(icon(element.dataset.icon)));

const state = { resource: 'pets', users: [], pets: [], loading: true, loadError: false, editing: null, deleting: null, detail: null, busy: false, lastSync: null };
const form = $('#record-form');
const dialog = $('#record-dialog');
const deleteDialog = $('#delete-dialog');
const detailDialog = $('#detail-dialog');
let previewUrls = [];
let toastTimer;
let toastVersion = 0;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeAnimations = new Set();
const closingDialogs = new WeakMap();
const ease = 'cubic-bezier(.2,.8,.2,1)';
function animate(element, frames, options = {}) {
  if (!element || !element.animate || motionPreference.matches || document.hidden) return null;
  const animation = element.animate(frames, { duration: 240, easing: ease, ...options });
  activeAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => activeAnimations.delete(animation));
  return animation;
}
motionPreference.addEventListener?.('change', event => {
  if (event.matches) activeAnimations.forEach(animation => animation.cancel());
});
function openModal(modal) {
  if (modal.open || closingDialogs.has(modal)) return;
  modal.showModal();
  animate(modal, [{ opacity: 0, transform: 'translateY(28px) scale(.95)' }, { opacity: 1, transform: 'translateY(-3px) scale(1.005)', offset: .8 }, { opacity: 1, transform: 'none' }], { duration: 360 });
  [...modal.querySelectorAll('form>div:not([hidden]), .detail-fields>div, .modal-actions')].slice(0, 12).forEach((element, i) => animate(element, [{ opacity: 0, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], { duration: 280, delay: 70 + Math.min(i * 30, 150) }));
}
async function closeModal(modal) {
  if (!modal.open) return;
  if (closingDialogs.has(modal)) return closingDialogs.get(modal);
  const task = (async () => {
    const animation = animate(modal, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(7px) scale(.99)' }], { duration: 130 });
    if (animation) await animation.finished.catch(() => {});
    if (modal.open) {
      const closed = new Promise(resolve => modal.addEventListener('close', resolve, { once: true }));
      modal.close();
      await closed;
    }
  })();
  closingDialogs.set(modal, task);
  try { await task; } finally { closingDialogs.delete(modal); }
}
function revealRecords() {
  const records = [...$('#records').querySelectorAll('.record-card, tbody tr')];
  records.slice(0, 16).forEach((element, i) => animate(element, [{ opacity: 0, transform: 'translateY(24px) scale(.96)' }, { opacity: 1, transform: 'translateY(-2px) scale(1.005)', offset: .8 }, { opacity: 1, transform: 'none' }], { duration: 420, delay: Math.min(i * 45, 225) }));
  if (!$('#empty-state').hidden) animate($('#empty-state'), [{ opacity: 0 }, { opacity: 1 }]);
}
const navHighlight = node('span', 'nav-highlight');
navHighlight.setAttribute('aria-hidden', 'true');
$('.resource-nav').prepend(navHighlight);
function positionNav() {
  const active = $('.nav-item.active');
  if (!active) return;
  navHighlight.style.width = `${active.offsetWidth}px`;
  navHighlight.style.height = `${active.offsetHeight}px`;
  navHighlight.style.transform = `translateX(${active.offsetLeft}px)`;
}
if (window.ResizeObserver) new ResizeObserver(positionNav).observe($('.resource-nav'));
else window.addEventListener('resize', positionNav);

function recordPositions() {
  if (motionPreference.matches) return new Map();
  const nodes = [...$('#records').querySelectorAll('[data-record-key]')].slice(0, 80);
  nodes.forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
  return new Map(nodes.map(element => [element.dataset.recordKey, element.getBoundingClientRect()]));
}
function moveRecords(previous) {
  if (!previous.size || motionPreference.matches) return;
  [...$('#records').querySelectorAll('[data-record-key]')].slice(0, 80).forEach((element, i) => {
    const before = previous.get(element.dataset.recordKey);
    const after = element.getBoundingClientRect();
    if (before) {
      const x = before.left - after.left, y = before.top - after.top;
      if (Math.abs(x) > 1 || Math.abs(y) > 1) animate(element, [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'none' }], { duration: 360 });
    } else {
      animate(element, [{ opacity: 0, transform: 'translateY(16px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: Math.min(i * 25, 100) });
    }
  });
}
document.addEventListener('pointerdown', event => {
  if (motionPreference.matches) return;
  const button = event.target.closest('.button, .icon-button, .nav-item');
  if (!button || button.disabled) return;
  const box = button.getBoundingClientRect();
  const wave = node('span', 'button-wave');
  wave.setAttribute('aria-hidden', 'true');
  const size = Math.max(box.width, box.height) * 2;
  Object.assign(wave.style, { width: `${size}px`, height: `${size}px`, left: `${event.clientX - box.left - size / 2}px`, top: `${event.clientY - box.top - size / 2}px` });
  button.append(wave);
  const animation = animate(wave, [{ opacity: .22, transform: 'scale(0)' }, { opacity: 0, transform: 'scale(1)' }], { duration: 520 });
  if (animation) animation.finished.catch(() => {}).finally(() => wave.remove()); else wave.remove();
});
function skeletons() {
  return Array.from({ length: state.resource === 'pets' ? 3 : 2 }, () => {
    const skeleton = node('div', `skeleton ${state.resource === 'users' ? 'skeleton-row' : ''}`);
    skeleton.setAttribute('aria-hidden', 'true');
    skeleton.append(node('div', 'skeleton-photo'), node('div', 'skeleton-line'), node('div', 'skeleton-line short'));
    return skeleton;
  });
}
const singular = resource => resource === 'users' ? 'usuario' : 'mascota';
const recordName = (record, resource) => resource === 'users' ? `${record.firstname} ${record.lastname}` : record.especie;
const normalized = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

async function api(url, options) {
  let response;
  try { response = await fetch(url, options); }
  catch { throw new Error('No se pudo conectar con el servidor. Comprueba que siga en ejecución e inténtalo de nuevo.'); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `La solicitud no se pudo completar (${response.status}).`);
  if (data === null) throw new Error('El servidor devolvió una respuesta inesperada.');
  return data;
}

function showError(selector, message) {
  const element = $(selector);
  element.textContent = message;
  element.hidden = !message;
  if (message) animate(element, [{ opacity: 0, transform: 'translateX(0)' }, { opacity: 1, transform: 'translateX(-5px)', offset: .25 }, { transform: 'translateX(4px)', offset: .55 }, { transform: 'translateX(0)' }], { duration: 300 });
}

function notify(message) {
  clearTimeout(toastTimer);
  const version = ++toastVersion;
  $('#toast').getAnimations().forEach(animation => animation.cancel());
  $('#toast-message').textContent = message;
  $('#toast').hidden = false;
  animate($('#toast'), [{ opacity: 0, translate: '0 24px', scale: '.96' }, { opacity: 1, translate: '0 -3px', scale: '1.01', offset: .8 }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: 360 });
  animate($('.toast-icon'), [{ transform: 'rotate(-45deg) scale(.6)' }, { transform: 'rotate(0) scale(1)' }], { duration: 380 });
  toastTimer = setTimeout(() => { void dismissToast(version); }, 4500);
}
async function dismissToast(version = toastVersion) {
  clearTimeout(toastTimer);
  const toast = $('#toast');
  if (toast.hidden) return;
  const animation = animate(toast, [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 14px' }], { duration: 150 });
  if (animation) await animation.finished.catch(() => {});
  if (version === toastVersion) toast.hidden = true;
}

async function load() {
  state.loading = true;
  state.loadError = false;
  showError('#load-error', '');
  $('#refresh').disabled = true;
  render();
  try {
    const [users, pets] = await Promise.all([api('/api/users'), api('/api/pets')]);
    if (!Array.isArray(users) || !Array.isArray(pets)) throw new Error('No se pudo leer el directorio.');
    state.users = users;
    state.pets = pets;
    state.lastSync = new Date();
    updateSpecies();
  } catch (error) {
    state.loadError = true;
    showError('#load-error', `${error.message} Pulsa Actualizar para volver a intentar.`);
  } finally {
    state.loading = false;
    $('#refresh').disabled = false;
    render();
    revealRecords();
  }
}

function imageElement(url, alt) {
  if (typeof url !== 'string' || !/^\/img\/(users|pets)\/[a-zA-Z0-9.-]+$/.test(url)) return null;
  const image = node('img');
  image.src = url;
  image.alt = alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true });
  image.addEventListener('error', () => { image.replaceWith(node('span', 'field-hint', 'Imagen no disponible')); });
  return image;
}

function actionButton(label, iconName, className, callback) {
  const button = node('button', className);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.append(icon(iconName));
  button.addEventListener('click', callback);
  return button;
}

// Reference assets decorate records without pretending to be uploaded photos.
function referenceImage(species) {
  const key = normalized(species).trim();
  const source = /^(perro|perra|canino|dog)$/.test(key) ? 'perro' : /^(gato|gata|felino|cat)$/.test(key) ? 'gato' : /^(conejo|coneja|rabbit)$/.test(key) ? 'conejo' : null;
  if (!source) return null;
  const image = node('img', 'reference-image');
  image.src = `/assets/${source}.webp`;
  image.alt = `Imagen de referencia de ${source}; este registro no tiene foto propia`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true });
  image.addEventListener('error', () => {
    const media = image.parentElement;
    image.remove();
    const placeholder = node('div', 'photo-placeholder');
    placeholder.append(icon('camera'), node('span', '', 'Sin fotografía propia'));
    if (media?.isConnected) {
      media.classList.remove('is-reference');
      media.querySelector('.reference-label')?.remove();
      media.prepend(placeholder);
    }
  }, { once: true });
  return image;
}

function card(record) {
  const resource = state.resource;
  const isUser = resource === 'users';
  const name = recordName(record, resource);
  const article = node('article', `record-card ${isUser ? 'user-card' : ''}`);
  article.dataset.recordKey = `${resource}-${record.id}`;
  const media = node('div', 'card-media');
  const image = imageElement(isUser ? record.avatar : record.img?.[0], isUser ? `Avatar de ${name}` : `Fotografía de ${name}`);
  if (image) media.append(image);
  else if (isUser) media.append(node('span', 'initials', `${record.firstname.slice(0, 1)}${record.lastname.slice(0, 1)}`.toUpperCase()));
  else {
    const reference = referenceImage(record.especie);
    if (reference) {
      media.classList.add('is-reference');
      const label = node('span', 'reference-label', 'Imagen de referencia');
      label.title = 'Este registro aún no tiene fotografías propias. Puedes añadirlas desde Editar.';
      media.append(reference, label);
    } else {
      const placeholder = node('div', 'photo-placeholder');
      placeholder.append(icon('camera'), node('span', '', 'Sin fotografía propia'));
      media.append(placeholder);
    }
  }
  media.append(node('span', 'record-id', `ID ${String(record.id).padStart(2, '0')}`));
  if (!isUser && record.img?.length) media.append(node('span', 'image-count', `${record.img.length} ${record.img.length === 1 ? 'foto' : 'fotos'}`));
  const body = node('div', 'card-body');
  const title = node('button', 'card-title-button', name);
  title.type = 'button';
  title.setAttribute('aria-label', `Ver ficha de ${name}`);
  title.addEventListener('click', () => openDetail(record));
  const heading = node('h3', 'card-title');
  heading.append(title);
  body.append(node('p', 'card-eyebrow', 'FICHA DE MASCOTA'), heading);
  const info = node('dl', 'card-info');
  const fields = isUser ? [['Usuario', `@${record.username}`]] : [['Edad', `${record.edad} ${record.edad === 1 ? 'año' : 'años'}`], ['Sexo', record.sexo], ['Color', record.color]];
  for (const [label, value] of fields) {
    const field = node('div', label === 'Color' ? 'card-field wide' : 'card-field');
    field.append(node('dt', '', label), node('dd', '', value));
    info.append(field);
  }
  const actions = node('div', 'card-actions');
  const view = node('button', 'button view-button', 'Ver ficha');
  view.type = 'button';
  view.setAttribute('aria-label', `Ver detalles de ${name}`);
  view.append(icon('arrow'));
  view.addEventListener('click', () => openDetail(record));
  const edit = actionButton(`Editar ${name}`, 'edit', 'icon-button text-action', () => openForm(record));
  edit.append(node('span', '', 'Editar'));
  actions.append(view, edit, actionButton(`Eliminar ${name}`, 'trash', 'icon-button delete-button', () => openDelete(record)));
  body.append(info, actions);
  article.append(media, body);
  return article;
}

function usersTable(records) {
  const table = node('table', 'users-table');
  const caption = node('caption', 'sr-only', 'Usuarios registrados');
  const head = node('thead');
  const header = node('tr');
  for (const label of ['N.º', 'Nombre y apellido', 'Usuario', 'Acciones']) {
    const cell = node('th', '', label);
    cell.scope = 'col';
    header.append(cell);
  }
  head.append(header);
  const body = node('tbody');
  for (const record of records) {
    const row = node('tr');
    row.dataset.recordKey = `users-${record.id}`;
    const name = recordName(record, 'users');
    row.append(node('td', 'user-id', String(record.id).padStart(3, '0')));
    const identityCell = node('th');
    identityCell.scope = 'row';
    const identity = node('div', 'user-identity');
    const avatar = node('span', 'user-avatar');
    avatar.append(imageElement(record.avatar, `Avatar de ${name}`) || node('span', '', `${record.firstname.slice(0, 1)}${record.lastname.slice(0, 1)}`.toUpperCase()));
    const view = node('button', 'name-button', name);
    view.type = 'button';
    view.setAttribute('aria-label', `Ver detalles de ${name}`);
    view.addEventListener('click', () => openDetail(record));
    identity.append(avatar, view);
    identityCell.append(identity);
    const actionsCell = node('td');
    const actions = node('div', 'table-actions');
    const edit = actionButton(`Editar ${name}`, 'edit', 'icon-button text-action', () => openForm(record));
    edit.append(node('span', '', 'Editar'));
    actions.append(edit, actionButton(`Eliminar ${name}`, 'trash', 'icon-button delete-button', () => openDelete(record)));
    actionsCell.append(actions);
    row.append(identityCell, node('td', 'username-cell', `@${record.username}`), actionsCell);
    body.append(row);
  }
  table.append(caption, head, body);
  return table;
}

function updateSpecies() {
  const select = $('#species-filter');
  const previous = select.value;
  const species = [...new Set(state.pets.map(record => record.especie))].sort((a, b) => a.localeCompare(b, 'es'));
  const all = node('option', '', 'Todas');
  all.value = '';
  select.replaceChildren(all, ...species.map(value => {
    const option = node('option', '', value);
    option.value = value;
    return option;
  }));
  select.value = species.includes(previous) ? previous : '';
}

function render() {
  const previousPositions = recordPositions();
  const resource = state.resource;
  const isUser = resource === 'users';
  const term = normalized($('#search').value.trim());
  const species = isUser ? '' : $('#species-filter').value;
  const filtered = Boolean(term || species);
  const records = state[resource].filter(record => (!species || record.especie === species) && normalized(isUser ? `${record.id} ${record.firstname} ${record.lastname} ${record.username}` : `${record.id} ${record.especie} ${record.color} ${record.edad} ${record.sexo}`).includes(term));
  const order = $('#sort').value;
  records.sort((a, b) => order === 'name' ? recordName(a, resource).localeCompare(recordName(b, resource), 'es', { sensitivity: 'base' }) || a.id - b.id : order === 'oldest' ? a.id - b.id : b.id - a.id);
  $('#species-filter-field').hidden = isUser;
  $('#refresh').classList.toggle('is-loading', state.loading);
  $('#sync-label').textContent = state.loading ? 'Actualizando registros…' : state.loadError ? 'No se pudo actualizar' : state.lastSync ? `Actualizado a las ${state.lastSync.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}` : 'Sin actualizar';
  for (const kind of ['users', 'pets']) {
    const count = state.loading ? '—' : state[kind].length;
    $(`#${kind}-count`).textContent = count;
  }
  const totals = { pets: state.pets.length, users: state.users.length, photos: state.pets.reduce((sum, pet) => sum + (pet.img?.length || 0), 0) + state.users.filter(user => Boolean(user.avatar)).length };
  for (const [kind, value] of Object.entries(totals)) {
    const stat = $(`#stat-${kind}`);
    const next = state.loading ? '—' : String(value);
    if (stat.textContent !== next) {
      stat.textContent = next;
      if (!state.loading) animate(stat, [{ opacity: .3, translate: '0 7px' }, { opacity: 1, translate: '0 0' }], { duration: 300 });
    }
  }
  $('#collection-title').textContent = isUser ? 'Usuarios' : 'Mascotas';
  $('#collection-description').textContent = isUser ? 'Datos de acceso y perfiles registrados.' : 'Especie, edad, sexo y fotografías.';
  $('#add-label').textContent = `Registrar ${singular(resource)}`;
  $('#search').placeholder = isUser ? 'Buscar por nombre, usuario o ID…' : 'Buscar por especie, color o ID…';
  $('#search').setAttribute('aria-label', isUser ? 'Buscar usuarios' : 'Buscar mascotas');
  document.querySelectorAll('[data-resource]').forEach(button => {
    const active = button.dataset.resource === resource;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  positionNav();
  $('#records').setAttribute('aria-busy', String(state.loading));
  $('#records').classList.toggle('users-records', isUser);
  $('#records').replaceChildren(...(state.loading ? skeletons() : !records.length ? [] : isUser ? [usersTable(records)] : records.map(card)));
  $('#empty-state').hidden = state.loading || state.loadError || records.length > 0;
  $('#empty-title').textContent = filtered ? 'No encontramos coincidencias' : isUser ? 'Aún no hay usuarios' : 'Aún no hay mascotas';
  $('#empty-description').textContent = filtered ? 'Cambia la búsqueda o limpia los filtros para ver todos los registros.' : isUser ? 'Registra un usuario con su nombre, contraseña y avatar.' : 'Registra la primera mascota para guardar sus datos y fotografías.';
  $('#empty-add').hidden = filtered;
  $('#reset-filters').hidden = !filtered;
  $('#empty-add').replaceChildren(document.createTextNode(`Registrar ${isUser ? 'el primer usuario' : 'la primera mascota'}`), icon('arrow'));
  $('#results-label').textContent = state.loading ? 'Cargando registros…' : state.loadError ? 'No se pudo actualizar el directorio.' : `${records.length} ${isUser ? (records.length === 1 ? 'usuario' : 'usuarios') : (records.length === 1 ? 'mascota' : 'mascotas')}${filtered ? ` de ${state[resource].length} registros` : ' en el directorio'}`;
  moveRecords(previousPositions);
}

function revokePreviews() {
  previewUrls.forEach(url => URL.revokeObjectURL(url));
  previewUrls = [];
}

function renderPreview() {
  revokePreviews();
  const isUser = state.resource === 'users';
  const input = form.elements.namedItem(isUser ? 'avatar' : 'img');
  const files = [...input.files];
  const images = [];
  if (files.length) {
    for (const file of files.slice(0, isUser ? 1 : 5)) {
      const url = URL.createObjectURL(file);
      previewUrls.push(url);
      const image = node('img');
      image.src = url;
      image.alt = `Vista previa de ${file.name}`;
      images.push(image);
    }
  } else if (state.editing) {
    const urls = isUser ? [state.editing.avatar] : state.editing.img;
    for (const url of urls || []) {
      const image = imageElement(url, 'Imagen actual');
      if (image) images.push(image);
    }
  }
  $('#image-preview').replaceChildren(...images);
  if (files.length) images.forEach((image, i) => animate(image, [{ opacity: 0, transform: 'translateY(12px) rotate(-4deg) scale(.85)' }, { opacity: 1, transform: 'none' }], { delay: i * 45, duration: 320 }));
  $('#preview-caption').hidden = !images.length;
  $('#preview-caption').textContent = files.length ? 'Vista previa de los archivos seleccionados.' : 'Imágenes guardadas actualmente.';
}

function openForm(record = null) {
  const isUser = state.resource === 'users';
  state.editing = record;
  form.reset();
  showError('#form-error', '');
  $('#user-fields').hidden = !isUser;
  $('#pet-fields').hidden = isUser;
  for (const [selector, enabled] of [['#user-fields', isUser], ['#pet-fields', !isUser]]) {
    $(selector).querySelectorAll('input, select').forEach(input => {
      input.disabled = !enabled;
      input.required = enabled && input.type !== 'file' && input.name !== 'imageMode' && (input.name !== 'password' || !record);
    });
  }
  $('#image-mode-field').hidden = !record;
  form.elements.namedItem('imageMode').disabled = isUser || !record;
  if (record) {
    for (const key of isUser ? ['firstname', 'lastname', 'username'] : ['especie', 'color', 'edad', 'sexo']) form.elements.namedItem(key).value = record[key];
  }
  $('#form-eyebrow').textContent = record ? `EDITAR REGISTRO · ID ${record.id}` : 'NUEVO REGISTRO';
  $('#form-title').textContent = `${record ? 'Editar' : 'Registrar'} ${singular(state.resource)}`;
  $('#save-record').textContent = `Guardar ${singular(state.resource)}`;
  $('#password-label').textContent = record ? 'Nueva contraseña' : 'Contraseña *';
  $('#password-hint').textContent = record ? 'Déjala vacía para conservar la contraseña actual.' : 'Se guardará de forma segura.';
  renderPreview();
  openModal(dialog);
  form.querySelector(isUser ? '[name=firstname]' : '[name=especie]').focus();
}

function setFormBusy(busy) {
  state.busy = busy;
  form.setAttribute('aria-busy', String(busy));
  $('#save-record').setAttribute('aria-busy', String(busy));
  // Disable only active controls, preserving the inactive form section.
  if (busy) {
    dialog.querySelectorAll('input:not(:disabled),select:not(:disabled),button:not(:disabled)').forEach(element => { element.dataset.busyDisabled = 'true'; element.disabled = true; });
  } else {
    dialog.querySelectorAll('[data-busy-disabled]').forEach(element => { element.disabled = false; delete element.dataset.busyDisabled; });
  }
  $('#save-record').textContent = busy ? 'Guardando…' : `Guardar ${singular(state.resource)}`;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (state.busy || !form.reportValidity()) return;
  showError('#form-error', '');
  const resource = state.resource;
  const isUser = resource === 'users';
  const fileField = isUser ? 'avatar' : 'img';
  const files = [...form.elements.namedItem(fileField).files];
  if (files.length > (isUser ? 1 : 5)) return showError('#form-error', 'Puedes seleccionar hasta 5 fotografías por carga.');
  if (files.some(file => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))) return showError('#form-error', 'Selecciona imágenes JPEG, PNG, WebP o GIF.');
  if (files.some(file => file.size > 5 * 1024 * 1024)) return showError('#form-error', 'Cada imagen debe pesar como máximo 5 MB.');
  const body = new FormData(form);
  if (!files.length) body.delete(fileField);
  if (isUser && state.editing && !body.get('password')) body.delete('password');
  const editingId = state.editing?.id;
  setFormBusy(true);
  try {
    const saved = await api(`/api/${resource}${editingId ? `/${editingId}` : ''}`, { method: editingId ? 'PUT' : 'POST', body });
    state.lastSync = new Date();
    if (editingId) state[resource] = state[resource].map(record => record.id === editingId ? saved : record);
    else state[resource].push(saved);
    $('#search').value = '';
    await closeModal(dialog);
    updateSpecies();
    render();
    revealRecords();
    notify(`${isUser ? 'Usuario' : 'Mascota'} ${editingId ? (isUser ? 'actualizado' : 'actualizada') : (isUser ? 'creado' : 'creada')} correctamente.`);
  } catch (error) { showError('#form-error', error.message); }
  finally { setFormBusy(false); }
});

function openDelete(record) {
  state.deleting = record;
  showError('#delete-error', '');
  $('#delete-description').textContent = `Se eliminará «${recordName(record, state.resource)}» (ID ${record.id}), junto con sus imágenes. Esta acción no se puede deshacer.`;
  openModal(deleteDialog);
  $('#cancel-delete').focus();
}

$('#confirm-delete').addEventListener('click', async () => {
  if (state.busy || !state.deleting) return;
  state.busy = true;
  const resource = state.resource;
  const id = state.deleting.id;
  $('#confirm-delete').disabled = true;
  $('#cancel-delete').disabled = true;
  $('#confirm-delete').textContent = 'Eliminando…';
  showError('#delete-error', '');
  try {
    await api(`/api/${resource}/${id}`, { method: 'DELETE' });
    state.lastSync = new Date();
    await closeModal(deleteDialog);
    const removedElement = [...$('#records').querySelectorAll('[data-record-key]')].find(element => element.dataset.recordKey === `${resource}-${id}`);
    const exit = animate(removedElement, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px) scale(.94)' }], { duration: 180 });
    if (exit) await exit.finished.catch(() => {});
    state[resource] = state[resource].filter(record => record.id !== id);
    updateSpecies();
    render();
    notify('Registro eliminado correctamente.');
  } catch (error) { showError('#delete-error', error.message); }
  finally {
    state.busy = false;
    $('#confirm-delete').disabled = false;
    $('#cancel-delete').disabled = false;
    $('#confirm-delete').textContent = 'Sí, eliminar';
  }
});

function openDetail(record) {
  state.detail = record;
  const isUser = state.resource === 'users';
  const name = recordName(record, state.resource);
  $('#detail-title').textContent = name;
  $('#detail-eyebrow').textContent = `${isUser ? 'USUARIO' : 'MASCOTA'} · ID ${record.id}`;
  const gallery = $('#detail-gallery');
  gallery.replaceChildren();
  $('#detail-photo-note')?.remove();
  for (const url of (isUser ? [record.avatar] : record.img) || []) {
    const image = imageElement(url, `Fotografía de ${name}`);
    if (!image) continue;
    const link = node('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.title = 'Abrir imagen completa';
    link.append(image);
    gallery.append(link);
  }
  if (!isUser && !record.img?.length) {
    const note = node('p', 'detail-photo-note', 'Esta ficha aún no tiene fotografías propias. Puedes añadirlas desde Editar información.');
    note.id = 'detail-photo-note';
    gallery.after(note);
  }
  const fields = isUser ? [['Nombre', record.firstname], ['Apellido', record.lastname], ['Usuario', `@${record.username}`]] : [['Especie', record.especie], ['Color', record.color], ['Edad', `${record.edad} ${record.edad === 1 ? 'año' : 'años'}`], ['Sexo', record.sexo], ['Fotografías', record.img.length]];
  $('#detail-fields').replaceChildren(...fields.map(([label, value]) => {
    const row = node('div');
    row.append(node('dt', '', label), node('dd', '', value));
    return row;
  }));
  openModal(detailDialog);
  [...gallery.children].forEach((element, i) => animate(element, [{ opacity: 0, transform: 'translateX(22px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: Math.min(i * 60, 240) }));
}

document.querySelectorAll('[data-resource]').forEach(button => button.addEventListener('click', () => {
  if (state.resource === button.dataset.resource) return;
  state.resource = button.dataset.resource;
  $('#search').value = '';
  render();
  revealRecords();
  const direction = state.resource === 'users' ? 1 : -1;
  animate($('.section-heading'), [{ opacity: 0, transform: `translateX(${direction * 24}px)` }, { opacity: 1, transform: 'none' }], { duration: 320 });
}));
$('#search').addEventListener('input', render);
$('#refresh').addEventListener('click', load);
$('#add-record').addEventListener('click', () => openForm());
$('#empty-add').addEventListener('click', () => openForm());
document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => { if (!state.busy) void closeModal(dialog); }));
dialog.addEventListener('close', () => { revokePreviews(); state.editing = null; form.reset(); });
form.elements.namedItem('avatar').addEventListener('change', renderPreview);
form.elements.namedItem('img').addEventListener('change', renderPreview);
$('#cancel-delete').addEventListener('click', () => { if (!state.busy) void closeModal(deleteDialog); });
deleteDialog.addEventListener('close', () => { state.deleting = null; });
for (const modal of [dialog, deleteDialog, detailDialog]) modal.addEventListener('cancel', event => {
  event.preventDefault();
  if (!state.busy) void closeModal(modal);
});
$('#close-detail').addEventListener('click', () => { void closeModal(detailDialog); });
$('#edit-from-detail').addEventListener('click', async () => {
  const record = state.detail;
  await closeModal(detailDialog);
  openForm(record);
});
detailDialog.addEventListener('close', () => { state.detail = null; });
$('#sort').addEventListener('change', render);
$('#species-filter').addEventListener('change', render);
$('#reset-filters').addEventListener('click', () => {
  $('#search').value = '';
  $('#species-filter').value = '';
  render();
  revealRecords();
  $('#search').focus();
});
$('#close-toast').addEventListener('click', () => { void dismissToast(); });
animate($('.masthead-inner'), [{ opacity: 0, translate: '0 -12px' }, { opacity: 1, translate: '0 0' }], { duration: 440 });
animate($('.resource-nav'), [{ opacity: 0, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], { duration: 420, delay: 70 });
animate($('.welcome-content'), [{ opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' }], { duration: 600, delay: 80 });
animate($('.welcome-photo>img'), [{ opacity: .25, transform: 'scale(1.045)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 800 });
load();
