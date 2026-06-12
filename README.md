<img src=https://github.com/DrCMWither/TeLaXgram/blob/master/assets/logo.png width=300 />

# TeLaXgram

TeLaXgram is a Cloudflare Worker Telegram bot frame that turns inline text into Telegram Rich Messages, including tables and LaTeX formulas.

## Prerequisites

Before you begin, ensure you have the following:
* [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
* A [Cloudflare](https://dash.cloudflare.com/) account and the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed & authenticated.
* A Telegram Bot Token (obtainable via [@BotFather](https://t.me/BotFather) on Telegram).

## Setup

```bash
npm install
cp .dev.vars.example .dev.vars
```

Fill `.dev.vars` is for local development. Do not commit it.

For deployment:

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
npx wrangler deploy
```

Optional long draft storage:

```bash
npx wrangler kv namespace create DOCS
```

Then uncomment the `[[kv_namespaces]]` block in `wrangler.toml` and replace the placeholder `id`.

## Enable Telegram inline mode

In BotFather:

```text
/setinline
```

## Set webhook

```bash
export BOT_TOKEN="114514:xxx"
export WEBHOOK_SECRET="replace-this-with-a-long-random-string"
export WORKER_URL="https://telaxgram.your-subdomain.workers.dev"
npm run set-webhook
```

## Usage

### Rich Markdown

```text
@YourBot md: # Title\NInline formula: $E=mc^2$
```

### Quick table

```text
@YourBot table: Key|val; Time|**42** <sup>ms</sup>; Status|==OK==; Formula|$E=mc^2$
```

### Block formula

```text
@YourBot math: \int_0^1 x^2 dx = \frac{1}{3}
```

### Rich HTML

```text
@YourBot html: <table bordered striped><tr><th>A</th><th>B</th></tr><tr><td>$x$</td><td>1</td></tr></table><tg-math-block>E=mc^2</tg-math-block>
```

### Long draft

```text
/save md:
# Report

| A | B |
|---|---|
| $x$ | 1 |

$$
E = mc^2
$$
```

Then use:

```text
@YourBot ref:<key>
```
