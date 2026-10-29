# Entregable 1 — API REST

Servidor modular con Node.js 18+, Express y persistencia JSON mediante `fs.promises`.

## Ejecutar

```sh
npm ci
npm start
```

Abrir http://localhost:8080. Esta etapa corresponde al backend; la interfaz se incorpora en commits posteriores.

## Recursos disponibles

CRUD de `/api/users`: GET, GET por ID, POST, PUT y DELETE. Validaciones, hashing scrypt con salt y avatar con `upload.single('avatar')`. El gestor compartido de recursos se prepara para incorporar mascotas.
