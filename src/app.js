const express = require('express');
const multer = require('multer');
const { initialize, publicDir } = require('./utils/store');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.static(publicDir, { dotfiles: 'deny' }));
app.get('/', (req, res) => res.json({ proyecto: 'Entregable 1', mensaje: 'API REST en desarrollo' }));
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((error, req, res, next) => {
  const status = error instanceof multer.MulterError || error.type === 'entity.parse.failed' || error.type === 'entity.too.large' ? 400 : (error.status || 500);
  if (status === 500) console.error(error);
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : error.message });
});
if (require.main === module) {
  initialize().then(() => app.listen(process.env.PORT || 8080, () => console.log(`API disponible en http://localhost:${process.env.PORT || 8080}`)))
    .catch(error => { console.error(error); process.exitCode = 1; });
}
module.exports = { app, initialize };
