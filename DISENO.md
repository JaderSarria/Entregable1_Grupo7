# Interfaz y transiciones

Se conserva la preferencia de una aplicación sencilla, sin marca ni logotipos y sin azules. El diseño utiliza fondo marfil, superficies blancas, texto oscuro y verde oliva como acento. Los iconos son controles funcionales, no elementos de marca.

## Referencias investigadas

- [Atlassian Design System — Motion](https://atlassian.design/foundations/motion): movimiento para explicar cambios, respuesta rápida a las interacciones y respeto por la preferencia de movimiento reducido.
- [Material Design — Duration and easing](https://m1.material.io/motion/duration-easing.html): transiciones breves y curvas de desaceleración. Es una referencia de principios de movimiento, no una adopción del sistema visual ni de un framework.
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): consulta de la preferencia del dispositivo para reducir movimiento.
- [GOV.UK — File upload](https://design-system.service.gov.uk/components/file-upload/): controles de selección de archivos reconocibles. Se conserva un input nativo y se añade una vista previa; no se anuncia arrastrar y soltar como función propia.

La adaptación visual y el código de la interfaz son propios de este proyecto. No se copiaron activos de las referencias.

## Aplicación

- Navegación segmentada para usuarios y mascotas, con recuentos reales de registros y un indicador que se desliza entre secciones.
- Fichas con fotografías amplias, campos agrupados, botones con texto y separación entre consulta, edición y borrado.
- Elevación de fichas al pasar el puntero, ampliación de fotografías, giro de iconos y una onda en el punto de pulsación de los botones.
- Apertura de diálogos con un pequeño rebote de 360 ms y campos que aparecen de forma escalonada. Cierre de 130 ms. La interfaz permanece operativa sin soporte de Web Animations.
- Entrada escalonada de fichas de 420 ms, con retrasos de hasta 225 ms. Al ordenar o filtrar, las fichas restantes se desplazan desde su posición anterior durante 360 ms; no se repite la entrada completa del listado por cada letra escrita.
- Salida de la ficha eliminada antes de reorganizar el listado. Galería de detalle y vistas previas con entradas escalonadas; fotografías con una aparición gradual de 400 ms.
- Avisos con entrada y salida animadas, icono de confirmación y una breve oscilación de los mensajes de error. Las animaciones decorativas terminan: solo los indicadores de carga se repiten mientras se espera una operación.
- Formularios nativos con foco contenido en el diálogo. Escape cierra con transición; durante el guardado se bloquea el cierre para no interrumpir el resultado.
- Indicadores de carga, previews de imágenes y notificaciones cerrables. Sin demoras artificiales de red.
- Filtro por especie, ordenación y acción para limpiar filtros cuando no hay coincidencias.
- Se usa CSS y Web Animations API sin dependencias adicionales de frontend. Las animaciones se omiten con movimiento reducido y se cancelan si la preferencia cambia durante una transición.

## Verificación

42 comprobaciones de API y archivos superadas mediante HTTP real; 21 comprobaciones de frontend superadas en Chromium con pantallas de escritorio y móvil. Se verificaron formularios, imágenes, filtros, ordenación y su animación, posición del indicador de navegación, flujo detalle a edición, borrado y su cancelación, Escape, ausencia de desbordamiento horizontal en móvil y movimiento reducido. Se revisaron capturas de escritorio y móvil con datos temporales.
