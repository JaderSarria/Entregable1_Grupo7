# Interfaz y transiciones

Se conserva la preferencia de una aplicación sencilla, sin marca ni logotipos y sin azules. El diseño utiliza fondo marfil, superficies blancas, texto oscuro y verde oliva como acento. Los iconos son controles funcionales, no elementos de marca.

## Referencias investigadas

- [Atlassian Design System — Motion](https://atlassian.design/foundations/motion): movimiento para explicar cambios, respuesta rápida a las interacciones y respeto por la preferencia de movimiento reducido.
- [Material Design — Duration and easing](https://m1.material.io/motion/duration-easing.html): transiciones breves y curvas de desaceleración. Es una referencia de principios de movimiento, no una adopción del sistema visual ni de un framework.
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): consulta de la preferencia del dispositivo para reducir movimiento.
- [GOV.UK — File upload](https://design-system.service.gov.uk/components/file-upload/): controles de selección de archivos reconocibles. Se conserva un input nativo y se añade una vista previa; no se anuncia arrastrar y soltar como función propia.

La adaptación visual y el código de la interfaz son propios de este proyecto. No se copiaron activos de las referencias.

## Aplicación

- Navegación segmentada para usuarios y mascotas, con recuentos reales de registros.
- Fichas con fotografías amplias, campos agrupados, botones con texto y separación entre consulta, edición y borrado.
- Elevación al pasar el puntero, ampliación leve de la foto y respuesta al pulsar botones. Estos efectos de puntero se limitan a dispositivos que admiten hover.
- Transiciones de entrada de 170 a 280 ms. Cierre de diálogos de 130 ms. La interfaz permanece operativa sin soporte de Web Animations.
- Las animaciones de entrada del listado solo se ejecutan al cargar, cambiar de sección, filtrar, ordenar o guardar; no se repiten por cada letra escrita en la búsqueda.
- Formularios nativos con foco contenido en el diálogo. Escape cierra con transición; durante el guardado se bloquea el cierre para no interrumpir el resultado.
- Indicadores de carga, previews de imágenes y notificaciones cerrables. Sin demoras artificiales de red.
- Filtro por especie, ordenación y acción para limpiar filtros cuando no hay coincidencias.
- Se usa CSS y Web Animations API sin dependencias adicionales de frontend. Las animaciones se omiten con movimiento reducido y se cancelan si la preferencia cambia durante una transición.

## Verificación

42 comprobaciones de API y archivos superadas mediante HTTP real; 19 comprobaciones de frontend superadas en Chromium con pantallas de escritorio y móvil. Se verificaron formularios, imágenes, filtros, ordenación, flujo detalle a edición, borrado y su cancelación, Escape, ausencia de desbordamiento horizontal en móvil y movimiento reducido. Se revisaron capturas de escritorio y móvil con datos temporales.
