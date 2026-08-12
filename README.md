# Basictrick

Trusted Telegram Community website — Shop, Method, Tools (Facebook checkers + Adsterra generator), Contact, and Admin.

## Stack

- TanStack Start + React + Tailwind
- JSON file store in `data/store.json` (auto-seeded)
- Admin at `/admin` (password from `ADMIN_PASSWORD`)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Default admin password: `basictrick-admin`

## Main routes

- `/` — Home
- `/shop` — Products (Telegram checkout)
- `/method` — Method guides
- `/tools` — Community tools catalog (sidebar categories)
- `/tools/adsterra-image-generator` — Play-button creative generator
- `/tools/check-live-uid` (and other Facebook ID tools)
- `/contact`
- `/admin`

## API (Telegram bot later)

- `GET /api/tools`
- `GET|POST /api/access/validate?key=`
- `GET /api/access`
