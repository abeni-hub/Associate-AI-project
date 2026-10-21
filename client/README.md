# CivicLink Ethiopia

A public-facing citizen services landing page for preparing bureau visits, finding room-by-room guidance, reading community updates, and sharing post-visit feedback.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

## Project notes

- Service requirements, room routes, and community notices are illustrative sample content in `src/App.jsx`.
- Hero carousel photography is representative stock imagery; replace it with official bureau photos before public rollout.
- The feedback form is an interactive front-end preview. Connect it to the project’s feedback API before using it to collect or route submissions.
- The page uses React and Vite with no additional runtime UI packages.
