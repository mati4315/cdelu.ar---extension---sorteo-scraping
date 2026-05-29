# Modulo de sorteo scraping - IAFAS

Sistema listo para correr local o subir a Hostinger/VPS con estas piezas:

- API REST para resultados IAFAS
- cache local persistente en JSON (adaptado para tu entorno actual)
- scraping con retry y rotacion simple de user-agent
- sincronizacion inteligente por ventanas horarias
- endpoint pensado para cron-job.org
- dashboard web estilo live monitoring
- WebSocket opcional para updates en vivo

## Estructura

- `server.js` → servidor Express principal
- `routes/api.js` → API publica
- `routes/admin.js` → login, settings, sync manual, logs
- `services/` → scraper, sync, persistencia local, websocket, scheduler
- `public/dashboard.html` → panel visual
- `scripts/hash-password.js` → genera hash bcrypt
- `iniciar-sistema-completo.bat` → arranque rapido en Windows

## Instalacion

```bash
npm install
copy .env.example .env
npm start
```

## Dashboard

Abrir:

```txt
http://localhost:3000/dashboard.html
```

## Login admin

Por defecto el `.env.example` deja:

- usuario: `admin`
- contraseña: `admin123`

**Cambialo antes de producción.**

Para usar hash bcrypt:

```bash
npm run hash:password -- mi_clave_segura
```

Pegá el hash en `ADMIN_PASSWORD_HASH` y borrá `ADMIN_PASSWORD`.

## Endpoints utiles

### Publicos

- `GET /api/health`
- `GET /api/hoy`
- `GET /api/live`
- `GET /api/history?limit=100`
- `GET /api/2026-05-29/nocturna`

### Admin

- `POST /api/admin/login`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `GET /api/admin/logs?limit=50`
- `POST /api/admin/sync-now`
- `POST /api/admin/clear-cache`
- `GET /api/admin/sync-window?slot=nocturna&secret=TU_SECRET`

## Cron-job.org recomendado

Crear 6 jobs, uno por sorteo, todos pegando al mismo endpoint con distinto `slot`.

Ejemplo:

```txt
GET https://tu-dominio.com/api/admin/sync-window?slot=nocturna&secret=TU_SECRET
```

### Ventanas sugeridas

- Previa → 10:10 a 10:25
- Primero → 11:55 a 12:10
- Matutina → 14:55 a 15:10
- Vespertina → 17:55 a 18:10
- Nocturna → 20:55 a 21:10
- Turista → 22:10 a 22:25

## Modo Hostinger

Para Hostinger compartido te conviene:

- `ENABLE_SCHEDULER=false`
- usar `cron-job.org`
- dejar `ENABLE_WEBSOCKET=false` si el plan no lo soporta

## Notas

- el selector HTML depende de que IAFAS no cambie demasiado la tabla
- si cambia el markup, hay que retocar `services/scraper.js`
- el sistema usa cache local como fallback cuando el scrape falla
- quedó en JSON local porque `better-sqlite3` no compila en este Windows + Node 24 sin Visual Studio Build Tools
