# Patio — dirección visual

Se replanteó la interfaz como un registro de trabajo con composición editorial. El nombre corto, la cabecera tipográfica y los números de sección dan identidad al producto sin ocupar espacio con un anuncio de bienvenida.

## Referencias investigadas

- [Battersea, Pentagram](https://www.pentagram.com/work/battersea/story): identidad centrada en el cuidado de animales, con ilustraciones dibujadas a mano y un lenguaje adaptable al público. Se tomó la intención de cercanía como referencia; no se usaron sus logotipos ni sus ilustraciones.
- [Good design, Vitsœ / Dieter Rams](https://www.vitsoe.com/us/about/good-design): utilidad, claridad, honestidad y reducción de elementos innecesarios. Orientó la eliminación de mensajes decorativos, métricas repetidas y adornos que no ayudan a gestionar registros.
- [Tablas, GOV.UK Design System](https://design-system.service.gov.uk/components/table/): información comparable organizada en filas y columnas. Orientó la elección de una tabla semántica para usuarios, con encabezados y acciones accesibles.

Estas decisiones son una interpretación propia para este proyecto, no una reproducción de las referencias.

## Aplicación

- Fondo papel `#f6f3eb`, texto tinta `#30312c`, acento terracota `#ad422b`.
- Georgia para la marca y los títulos, Segoe UI / Arial para formularios y texto, Courier New para numeración y rótulos. Fuentes del sistema, sin descargas externas.
- Navegación horizontal con dos secciones. Encabezado grande y breve, seguido de búsqueda y registros.
- Fichas de mascotas con fotos en proporción 4:3, datos sin etiquetas decorativas y botones con texto.
- Tabla de usuarios con avatar, nombre completo, usuario y acciones. Desplazamiento horizontal contenido en pantallas pequeñas.
- Separadores finos, esquinas casi rectas, sin degradados ni sombras decorativas.
- Dibujo vectorial original para el estado vacío y numeración de archivo como alternativa cuando falta una foto.
- Formularios, errores y confirmaciones con la misma tipografía y paleta. Las contraseñas siguen sin aparecer en las respuestas.

## Verificación

Se revisó la sintaxis JavaScript y pasaron las 42 comprobaciones de API, persistencia, imágenes y entrega de archivos estáticos mediante Express en proceso. La revisión visual en navegador no pudo completarse por las restricciones del entorno; no se presenta como verificada. El diseño incluye puntos de adaptación a 1050, 700 y 440 píxeles.
