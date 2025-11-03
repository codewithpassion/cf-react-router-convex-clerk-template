# react-router for cloudflare boilerplate

A modern, production-ready template for building full-stack React applications using React Router - published to cloudflare

## Features

- 🚀 Server-side rendering
- 🗄️ Convex real-time database
- 🪟 ShadCN components
- 🔑 Authentication with Clerk
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 🔍 Biome for linting
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Template application

This is a template project representing a simple Todo app.

To convert it into your own app, use `claude-code` and run the `/transform-to-app` command (see `.claude/commands/transform-to-app.md`).

example:
```
/transform-to-app confirm worktracking-app
```

This will remove all the `Todo-App` specifics and renmae it to `Worktracking-App`.

### Clerk

1. First, copy `.env.example` to `.env`

2. To use the authentication setup, to go `https://clerk.com` and create an accound. 

3. Then, within the Clerk dashboard, create an application, `Configure` > `API Keys` > `React Router`
And copy:
- VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
- CLERK_SECRET_KEY=sk_test_YOUR_KEY
and add then to you `.env`.

4. Then copy the `Frontend API URL` (right hand side in the clerk dashboard) and att `CLERK_JWT_ISSUER_DOMAIN=URL` to `.env`

5. Go to `JWT templates` > `Add new template` and select `Convex`


### Convex

For development, you can run convex locally.

1. Run `bun run convex:dev` 
2. Create a new project
3. create a `local` deployment
4. Convex will complain about a environment variable not being set - that's ok
5. in a new shell/terminal, run `./setup_convex_env.sh` - this will set the missing environment variable from `.env`

Now you're ready run roll!

### Installation

Install the dependencies:

```bash
bun install
```

### Development

Start the development server with HMR:

```bash
bun dev
```

Your application will be available at `http://localhost:5173`.

Check and lint:

```bash
bun check
```

## Previewing the Production Build

Preview the production build locally:

```bash
bun run preview
```

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
bun run deploy
```

To deploy a preview URL:

```sh
bunx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
bunx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
