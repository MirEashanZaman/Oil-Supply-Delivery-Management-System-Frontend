This is a [Next.js](https://nextjs.org) project for the oil supply and delivery management platform.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:5000 to view the app.

## Environment Configuration

Create a local environment file from the example template:

```bash
copy .env.example .env.local
```

Then set the actual values for your backend and app URL:

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:5000
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

For production deployment, set the same variables in your hosting environment or platform secrets. Do not hardcode live API URLs into the source code.

## Deployment Notes

- Use HTTPS for production.
- Set `NEXT_PUBLIC_API_ENDPOINT` to the live backend domain.
- Set `NEXT_PUBLIC_APP_URL` to the live frontend domain.
- Keep Pusher keys in environment variables, not in the repository.
- For local network testing, use the LAN IP value and keep the allowed dev origin list aligned in `next.config.ts`.

## Production Build

```bash
npm run build
```

## Deploy on Vercel

The app can be deployed to Vercel by setting the environment variables in the project dashboard before build.

Check the official Next.js deployment guide for more details: https://nextjs.org/docs/app/building-your-application/deploying
