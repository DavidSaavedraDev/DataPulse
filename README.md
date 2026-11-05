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

El repositorio incluye `.github/workflows/pages.yml`, que publica automáticamente el contenido estático cada vez que se actualiza `main`.

1. En GitHub entra a **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Ejecuta el workflow **Deploy DataPulse to GitHub Pages** desde la pestaña **Actions** si no se inició automáticamente.
4. GitHub mostrará la URL pública en el resumen del workflow y en **Settings → Pages**.

La URL esperada para este repositorio es `https://davidsaavedradev.github.io/DataPulse/`, salvo que GitHub tenga configurado un dominio personalizado. Si existe un dominio personalizado incorrecto, elimínalo en **Settings → Pages → Custom domain** para que la URL `github.io` funcione.

El proyecto usa únicamente archivos estáticos y CDNs públicos.

## Autor y licencia

Creado por **David Saavedra**. Publicado bajo la [Licencia MIT](LICENSE).
