const { Router } = require('express');
const upload = require('../middlewares/multer.middleware');
const store = require('./store');
const { hashPassword } = require('./crypto');
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const safe = record => { const { password, ...publicRecord } = record; return publicRecord; };
function validate(body, resource, creating) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail('Cuerpo inválido');
  const fields = resource === 'users' ? ['firstname', 'lastname', 'username', 'password'] : ['especie', 'color', 'edad', 'sexo'];
  for (const key of Object.keys(body)) if (!fields.includes(key) && !(resource === 'pets' && key === 'imageMode')) throw fail(`Campo no permitido: ${key}`);
  const result = {};
  for (const key of fields) {
    if (!(key in body)) { if (creating) throw fail(`Falta el campo ${key}`); continue; }
    const value = body[key];
    if (key === 'edad') {
      if (!['string', 'number'].includes(typeof value) || String(value).trim() === '' || !Number.isInteger(Number(value)) || Number(value) < 0) throw fail('edad debe ser un entero no negativo');
      result[key] = Number(value);
    } else {
      if (typeof value !== 'string' || !value.trim() || value.length > 256) throw fail(`Campo inválido: ${key}`);
      result[key] = key === 'password' ? value : value.trim();
    }
  }
  if (result.sexo && !['macho', 'hembra'].includes(result.sexo)) throw fail('sexo debe ser macho o hembra');
  if (body.imageMode !== undefined && !['append', 'replace'].includes(body.imageMode)) throw fail('imageMode debe ser append o replace');
  return result;
}
module.exports = function resourceRouter(resource) {
  const router = Router();
  const isUser = resource === 'users';
  const handler = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  router.param('id', (req, res, next, value) => {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) return next(fail('ID inválido'));
    req.recordId = Number(value); next();
  });
  router.get('/', handler(async (req, res) => res.json((await store.read(resource)).map(safe))));
  router.get('/:id', handler(async (req, res) => {
    const record = (await store.read(resource)).find(item => item.id === req.recordId);
    if (!record) throw fail('Recurso no encontrado', 404);
    res.json(safe(record));
  }));
  const middleware = isUser ? upload.single('avatar') : upload.array('img', 5);
  const save = creating => handler(async (req, res) => {
    const files = isUser ? (req.file ? [req.file] : []) : (req.files || []);
    const urls = files.map(file => `/img/${resource}/${file.filename}`);
    let committed = false;
    let obsolete = [];
    try {
      const fields = validate(req.body, resource, creating);
      if (!creating && !Object.keys(fields).length && !files.length) throw fail('No hay campos para actualizar');
      if (fields.password) fields.password = await hashPassword(fields.password);
      const result = await store.mutate(resource, async records => {
        const index = records.findIndex(item => item.id === req.recordId);
        if (!creating && index < 0) throw fail('Recurso no encontrado', 404);
        if (isUser && fields.username && records.some(item => item.id !== req.recordId && item.username.toLowerCase() === fields.username.toLowerCase())) throw fail('username ya existe');
        const old = creating ? {} : records[index];
        const id = creating ? Math.max(0, ...records.map(item => item.id)) + 1 : old.id;
        const record = { ...old, ...fields, id };
        if (isUser) {
          record.avatar = urls[0] || old.avatar || null;
          if (urls.length && old.avatar) obsolete = [old.avatar];
        } else {
          const replace = req.body.imageMode === 'replace';
          record.img = replace ? urls : [...(old.img || []), ...urls];
          if (replace) obsolete = old.img || [];
        }
        if (creating) records.push(record); else records[index] = record;
        return record;
      });
      committed = true;
      await store.removeImages(obsolete);
      res.status(creating ? 201 : 200).json(safe(result));
    } catch (error) {
      if (!committed) await store.removeImages(urls);
      throw error;
    }
  });
  router.post('/', middleware, save(true));
  router.put('/:id', middleware, save(false));
  router.delete('/:id', handler(async (req, res) => {
    const removed = await store.mutate(resource, async records => {
      const index = records.findIndex(item => item.id === req.recordId);
      if (index < 0) throw fail('Recurso no encontrado', 404);
      return records.splice(index, 1)[0];
    });
    await store.removeImages(isUser ? [removed.avatar] : removed.img);
    res.status(200).json({ message: 'Recurso eliminado', id: removed.id });
  }));
  return router;
};
