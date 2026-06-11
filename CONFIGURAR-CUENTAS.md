# Activar cuentas y registro en la nube (~20 minutos, gratis)

Mientras no hagas esto, la web funciona igualmente en **modo invitado** (progreso solo en el navegador). Hazlo cuando quieras activar cuentas.

## Paso 1 — Crear el proyecto Supabase (5 min)

1. Entra en **https://supabase.com** → Start your project → crea cuenta (puedes usar tu GitHub).
2. **New project**: nombre `awareness`, contraseña de base de datos (guárdala), **Region: Europe West (Ireland o Frankfurt)** — importante por RGPD.
3. Espera 1-2 min a que el proyecto arranque.

## Paso 2 — Crear las tablas (2 min)

1. Menú izquierdo → **SQL Editor** → New query.
2. Abre el archivo `supabase-setup.sql` de esta carpeta, copia TODO su contenido, pégalo y pulsa **Run**.
3. Debe decir "Success. No rows returned".

## Paso 3 — Configurar el enlace mágico (3 min)

1. Menú izquierdo → **Authentication → URL Configuration**.
2. En **Site URL** pon la dirección de tu web publicada, p. ej. `https://TU-USUARIO.github.io/awareness/`
3. En **Redirect URLs** añade esa misma dirección seguida de `cuenta.html`, p. ej. `https://TU-USUARIO.github.io/awareness/cuenta.html`

> El enlace mágico viene activado por defecto (Authentication → Sign In / Up → Email).

## Paso 4 — Conectar la web (2 min)

1. Menú izquierdo → **Project Settings → API**.
2. Copia dos valores: **Project URL** y **anon public** key.
3. Abre `assets/config.js` de esta carpeta y pégalos entre las comillas:

```js
window.AWARENESS_CONFIG = {
  SUPABASE_URL: "https://abcdefgh.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi..."
};
```

> La clave "anon public" está pensada para usarse en el navegador: no es un secreto. La seguridad la ponen las políticas RLS del SQL (cada usuario solo ve sus datos).

## Paso 5 — Republicar (2 min)

Sube el `config.js` modificado a GitHub (arrastrar y soltar, como siempre). En 1-2 minutos la web tendrá cuentas activas: botón "Cuenta" → email → enlace mágico.

## Cómo ver los datos que se van registrando

- En Supabase → **Table Editor** → `module_runs`: cada partida (usuario, módulo, nivel, métricas JSON, fecha).
- `session_runs`: sesiones guiadas completadas.
- Para análisis (correlaciones, perfil de 8 ejes): Table Editor → Export CSV, o pídemelo y preparo las consultas.

## Detalle importante del plan gratuito

El proyecto se **pausa tras 1 semana sin actividad** (se reactiva con un clic en el panel). Cuando haya usuarios regulares no pasará; al principio, entra al panel de vez en cuando o dime y programamos un ping semanal.
