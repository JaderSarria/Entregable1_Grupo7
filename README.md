# Entregable 1 — API REST

Servidor modular con Node.js 18+, Express y persistencia JSON mediante `fs.promises`.

## Ejecutar

```sh
npm ci
npm start
```

Abrir http://localhost:8080. Esta etapa corresponde al backend; la interfaz se incorpora en commits posteriores.

## Recursos disponibles

CRUD completos de `/api/users` y `/api/pets`. Mascotas con especie, color, edad y sexo; carga de hasta cinco imágenes por petición con `upload.array('img', 5)`. Respuestas 200, 201, 400, 404 y 500 según el resultado.
