# Setup de ¿Qué Como?

## 1. Supabase (base de datos + login)

1. Entrá a **supabase.com** → New project
2. Poné un nombre (ej: `quecomo`) y guardá la contraseña
3. Esperá que cargue (~2 min)
4. Ir a **SQL Editor** → pegá el contenido de `supabase-schema.sql` → Run
5. Ir a **Authentication → Providers** → activar **Google** (necesitás credenciales de Google Cloud Console)
6. Ir a **Project Settings → API** → copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Variables de entorno

Completar `.env.local` con los valores de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-... (ya está cargada)
```

## 3. Correr localmente

```bash
cd APP/quecomo
npm install
npm run dev
```

Abrir http://localhost:3000

## 4. Deploy en Vercel

1. Subir el proyecto a GitHub (nuevo repositorio)
2. Ir a **vercel.com** → Import project → seleccionar el repo
3. En **Environment Variables** agregar las 3 variables del .env.local
4. Deploy

## 5. Hacer que funcione como app en iPhone

1. Abrir el link de Vercel en Safari en el iPhone
2. Tocar el botón de compartir (⬆️)
3. "Agregar a pantalla de inicio"
4. ¡Listo! Se instala como app
