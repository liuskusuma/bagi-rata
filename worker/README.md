# Bagi Rata bill reader (Cloudflare Worker)

The app's "Foto bill" button sends the photo here. The worker asks Claude (`claude-sonnet-5-5`) for the
items and prices and returns JSON. The Anthropic API key stays in the worker, so app users need no AI account.
If the worker is not set up or fails, the app falls back to the on-phone reader (Tesseract).

## Set up (Cloudflare dashboard, no install needed)

1. Anthropic: at console.anthropic.com add credit (Billing, minimum $5), set a monthly spend limit
   (Limits), and create an API key (API Keys).
2. Cloudflare: at dash.cloudflare.com go to Workers & Pages, Create, start from "Hello World",
   name it `bagi-rata-scan`, Deploy.
3. Edit code: replace everything in `worker.js` with the contents of `dist/worker.js`, then Deploy.
4. Settings, Variables and Secrets: add a **Secret** named `ANTHROPIC_API_KEY` with the key from step 1.
5. Put the worker URL (`https://bagi-rata-scan.<account>.workers.dev`) in `AI_URL` in the app.

Optional: bind a KV namespace as `LIMITS` to cap photos per visitor per day (`DAILY_LIMIT`, default 5),
`MODEL` to change the model, `ALLOWED_ORIGINS` (comma separated) to allow more sites.

## Develop

`npm install`, edit `src/index.js`, then `npm run build` to refresh `dist/worker.js`
(or `npx wrangler deploy` with `wrangler.toml`).
