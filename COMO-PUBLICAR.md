# Cómo publicar Awareness en internet (paso a paso, ~15 minutos)

No necesitas instalar nada. Todo se hace desde el navegador.

## Paso 1 — Crear la cuenta de GitHub (5 min)

1. Entra en **https://github.com/signup**
2. Usa tu email, elige un nombre de usuario (aparecerá en la dirección web, p. ej. si eliges `luz-awareness`, la web será `luz-awareness.github.io/awareness`).
3. Confirma el email y entra.

## Paso 2 — Crear el repositorio (2 min)

1. Arriba a la derecha, pulsa **+** → **New repository**.
2. Repository name: **awareness**
3. Marca **Public** (necesario para que la web sea gratis).
4. Pulsa **Create repository**.

## Paso 3 — Subir los archivos (5 min)

1. En la página del repositorio recién creado, pulsa el enlace **uploading an existing file**.
2. Abre en tu ordenador la carpeta **awareness-web** y arrastra TODO SU CONTENIDO (no la carpeta en sí, sino lo que hay dentro: `index.html`, `entrenamiento`, `intuicion`, etc.) a la zona de subida del navegador.
3. Espera a que suban todos los archivos (verás la lista).
4. Abajo, en "Commit changes", escribe algo como `Primera versión` y pulsa **Commit changes**.

> Si el arrastre de carpetas no funciona en tu navegador, prueba con Chrome o Edge.

## Paso 4 — Activar la web (2 min)

1. En el repositorio, ve a **Settings** (pestaña de arriba) → **Pages** (menú izquierdo).
2. En "Build and deployment" → Source: **Deploy from a branch**.
3. Branch: **main**, carpeta **/ (root)** → **Save**.
4. Espera 1–2 minutos y recarga la página: arriba aparecerá tu dirección:
   **https://TU-USUARIO.github.io/awareness/**

¡Eso es todo! Esa dirección ya funciona en cualquier móvil u ordenador.

## Para actualizar la web más adelante

Repite el Paso 3: arrastra los archivos nuevos o modificados (GitHub reemplaza los que tengan el mismo nombre). La web se actualiza sola en 1–2 minutos.

## Problemas comunes

- **La página sale en blanco o da 404**: espera 2 minutos más; la primera publicación tarda. Comprueba que `index.html` está en la raíz del repositorio (no dentro de una subcarpeta `awareness-web`).
- **Un módulo no carga**: dime cuál y lo reviso.
- **Quieres dominio propio** (p. ej. awareness.es): se compra aparte (~12 €/año) y se conecta desde Settings → Pages → Custom domain. Te guío cuando quieras.
