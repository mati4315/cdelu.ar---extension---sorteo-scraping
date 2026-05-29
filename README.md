# Modulo de sorteo scraping - IAFAS

Sistema listo para correr local o subir a Hostinger/VPS con estas piezas:

- API REST para resultados IAFAS
- Persistencia robusta en base de datos MySQL (ideal para Hostinger remoto)
- Scraping avanzado con retry y rotación extendida de 14 User-Agents (Mobile y Desktop)
- Sincronización inteligente por ventanas horarias (gestiona los sorteos automáticamente)
- Endpoint único de seguridad pensado para cron-job.org a 1 minuto
- Dashboard web estilo live monitoring
- WebSocket opcional para updates en vivo

## Estructura

- `server.js` → Servidor Express principal
- `routes/api.js` → API pública
- `routes/admin.js` → Rutas administrativas, login, settings, sync manual y automatizado
- `services/` → Scraper, persistencia MySQL (`mysql.js`), sincronización (`sync.js`), variables (`constants.js`)
- `setup-mysql.js` → Script de inicialización de tablas de base de datos
- `public/dashboard.html` → Panel visual de control
- `iniciar-sistema-completo.bat` → Arranque rápido en Windows (liberador automático de puerto)

## Instalación y Configuración

```bash
npm install
copy .env.example .env
```

Configura tus credenciales de MySQL en el `.env` junto con tu `CRON_SECRET`.
Luego puedes crear las tablas iniciales e iniciar el sistema:

```bash
node setup-mysql.js
npm start
```
*(También puedes usar `iniciar-sistema-completo.bat` en Windows)*

## Dashboard

El puerto por defecto es ahora **8872**. Abrir:

```txt
http://localhost:8872/dashboard.html
```

## Login Admin

Por defecto el `.env.example` deja:
- usuario: `admin`
- contraseña: `admin123`
*(Cámbialo antes de producción y asegúrate de tener el `.env` fuera del control de versiones).*

## Endpoints útiles

### Públicos
- `GET /api/health`
- `GET /api/hoy`
- `GET /api/live`
- `GET /api/history?limit=100`

### Admin
- `POST /api/admin/login`
- `GET /api/admin/settings`
- `GET /api/admin/logs?limit=50`
- `POST /api/admin/sync-now`
- `GET /api/admin/sync-window` *(Requiere header de seguridad)*

## Automatización con Cron-job.org

Para Hostinger compartido, la mejor forma de no agotar recursos y mantener la app activa es con **un solo cron externo configurado cada 1 minuto**.

**Configuración en Cron-job.org:**
- **URL:** `https://tu-dominio.com/api/admin/sync-window`
- **Schedule:** Cada 1 minuto.
- **Headers:** 
  - Key: `x-cron-secret`
  - Value: *(Lo que hayas puesto en `CRON_SECRET` de tu `.env`)*

El sistema automáticamente determinará si es la hora correcta de un sorteo (Previa, Primero, Matutina, Vespertina, Nocturna, Turista) y solo entonces ejecutará el scraping, previniendo sobrecarga en tu hosting.

## Modo Hostinger (Producción)

Asegúrate de:
- Configurar las variables `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` apuntando a tu base remota de Hostinger.
- Apagar el scheduler interno si vas a usar cron externo: `ENABLE_SCHEDULER=false`
- Configurar un buen `CRON_SECRET`.

## Notas

- El selector HTML depende de que IAFAS no cambie demasiado la tabla. Si cambia el markup, hay que retocar `services/scraper.js`.
- El sistema cuenta con 14 User-Agents para evitar bloqueos. En caso de fallas, revisa los *Sync Logs* desde el Dashboard.
