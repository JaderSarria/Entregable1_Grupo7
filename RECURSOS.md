# Imágenes del proyecto

Las cuatro fotografías de referencia se generaron para esta interfaz con la herramienta integrada de generación de imágenes. Se exportaron a WebP para reducir su peso, sin cambiar el contenido. No son fotografías de los animales registrados ni se añaden a los archivos JSON. Las imágenes cargadas por el usuario tienen prioridad; las referencias se identifican en pantalla y no aparecen en la galería de fotos propias.

| Recurso local | Uso |
|---|---|
| `public/assets/companeros.webp` | Cabecera decorativa |
| `public/assets/perro.webp` | Referencia para perros sin foto |
| `public/assets/gato.webp` | Referencia para gatos sin foto |
| `public/assets/conejo.webp` | Referencia para conejos sin foto |

El fondo de contornos de la cabecera se dibuja con Canvas 2D en `public/visuals.js`. Es decorativo, no impide seleccionar texto ni usar controles y se queda estático con movimiento reducido. No se usan imágenes, fuentes o bibliotecas remotas.

## Prompts utilizados

### Cabecera

Use case: photorealistic-natural. Asset type: wide editorial header photograph for a Spanish pet management web application. A relaxed golden retriever beside a small tabby cat, both sitting naturally together on a warm ivory linen surface in a sunlit quiet home with a softly blurred olive green garden behind them. Wide horizontal composition around 3:2, pets centered together, plenty of breathing room, full ears, natural realistic anatomy, no accessories, no hands or people. Beautiful natural daylight, warm film-like color grading, fine fur detail, gentle tactile editorial photography, muted cream, sage and olive palette. Professional and candid rather than glossy advertising. No text, no letters, no logo, no watermark. This is decorative imagery, not a mockup or screenshot.

### Perro

Use case: photorealistic-natural. Asset type: decorative reference photo for a pet profile card, landscape 3:2. A single friendly golden retriever, head and upper chest, sitting on an ivory wool rug beside a sunlit window, softly blurred pale olive and warm cream background, relaxed closed mouth, natural candid expression, lifelike fur texture, beautiful directional daylight, subtle editorial film warmth. Head centered, ears entirely visible, generous space above head. Professional pet portrait, calm, elegant, tactile. No people, no collar, no accessories, no text, no logo, no watermark. This is an illustrative reference photograph, not a UI mockup.

### Gato

Use case: photorealistic-natural. Asset type: decorative reference photo for a pet profile card, landscape 3:2. A single beautiful striped brown tabby cat, head and upper chest, sitting on an ivory linen armchair beside a sunlit window, softly blurred muted sage green and warm cream background, natural relaxed attentive expression looking slightly to side, realistic anatomy, beautiful fur detail, soft directional daylight, subtle editorial film warmth. Face centered, both ears entirely visible, generous breathing room above head. Professional pet portrait, quiet, elegant, tactile. No people, no collar, no accessories, no text, no logo, no watermark. This is an illustrative reference photograph, not a UI mockup.

### Conejo

Use case: photorealistic-natural. Asset type: decorative reference photo for a pet profile card, landscape 3:2. A single small cream and brown rabbit with both long ears fully visible, sitting naturally on a warm ivory wool rug by a sunlit window, softly blurred muted olive house plants and warm cream background. Natural realistic animal anatomy, beautiful fine fur detail, soft directional daylight, subtle editorial film warmth. Rabbit centered with generous breathing room above ears. Professional pet portrait, quiet, elegant, tactile. No people, no accessories, no text, no logo, no watermark. This is an illustrative reference photograph, not a UI mockup.
