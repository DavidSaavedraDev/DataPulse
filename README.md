# DataPulse – CSV Analyzer & Data Dashboard

DataPulse es una aplicación web estática para explorar archivos CSV desde un dashboard moderno, sin backend y sin subir datos a ningún servicio. Detecta automáticamente las columnas, encuentra valores vacíos, calcula estadísticas y crea gráficos interactivos.

> **Privacidad primero:** todo el procesamiento ocurre localmente en el navegador. El contenido de tus archivos no sale de tu computador.

## Características

- Carga mediante selector de archivos o arrastrar y soltar.
- Detección automática de encabezados y columnas numéricas.
- Tarjetas de resumen para registros, columnas, valores vacíos y columnas numéricas.
- Búsqueda instantánea y paginación de registros.
- Estadísticas de mínimo, máximo, promedio y suma.
- Gráficos de barras, líneas, pie y dona con Chart.js.
- Exportación del CSV procesado y descarga de un resumen `.txt`.
- Diseño responsive con tema oscuro y mensajes de error claros.

## Tecnologías

HTML5 · CSS3 · JavaScript ES6+ · [Chart.js](https://www.chartjs.org/) · [PapaParse](https://www.papaparse.com/)

## Estructura

```text
DataPulse/
├── index.html
├── css/styles.css
├── js/app.js
├── assets/
├── examples/sales_sample.csv
├── README.md
├── LICENSE
└── .gitignore
```

## Instalación y ejecución

No requiere compilación ni dependencias locales. Clona o descarga el proyecto y abre `index.html` en un navegador moderno. Para una experiencia más consistente, puedes servir la carpeta con cualquier servidor estático local:

```bash
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Ejemplo de uso

1. Abre DataPulse y carga un archivo `.csv`, o pulsa **Cargar dataset de ejemplo**.
2. Revisa las tarjetas de calidad y las estadísticas numéricas.
3. Usa el buscador y la paginación para explorar los registros.
4. Elige el tipo de gráfico y sus columnas desde el panel de visualización.
5. Exporta el CSV procesado o descarga el resumen del análisis.

## Publicar en GitHub Pages

1. Crea un repositorio público en GitHub y sube la rama `main`.
2. En **Settings → Pages**, selecciona **Deploy from a branch**.
3. Selecciona la rama `main`, carpeta `/ (root)` y pulsa **Save**.
4. GitHub mostrará la URL de Pages cuando termine el despliegue.

El proyecto está preparado para GitHub Pages porque usa únicamente archivos estáticos y CDNs públicos.

## Autor y licencia

Creado por **David Saavedra**. Publicado bajo la [Licencia MIT](LICENSE).
