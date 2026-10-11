# shirokuro-tsukenai-lever

YouTube「白黒つけない会議」のレバーを再現したファンメイドの Web アプリ。

- フロントエンド: Vite + React（GitHub Pages）
- バックエンド: Cloudflare Workers + Durable Objects（`worker/`）

## ローカル開発

```sh
pnpm install
pnpm dev:worker   # Worker を http://localhost:8787 で起動
pnpm dev          # 別ターミナルでフロントエンドを起動
```

フロントエンドは `.env.development` の `VITE_API_URL`（`http://localhost:8787`）に接続する。

E2E テスト（Worker と Vite は自動で起動される）:

```sh
pnpm exec playwright test
```

## デプロイ

### Worker（手動）

初回のみ:

1. [Cloudflare](https://dash.cloudflare.com/sign-up) のアカウントを作成する（無料プランでよい）
2. ダッシュボードの「Workers & Pages」を一度開き、workers.dev のサブドメインを決める
3. `pnpm wrangler login` でブラウザ認証する

デプロイ（Worker のコードを変更したときに毎回）:

```sh
pnpm deploy:worker
```

Durable Object はデプロイ時に `wrangler.jsonc` の `migrations` に従って自動で作成されるので、ダッシュボードでの作業は不要。

初回デプロイ後、表示された `https://shirokuro-tsukenai-lever.<subdomain>.workers.dev` を `.env.production` の `VITE_API_URL` に設定してコミットする。

### フロントエンド

`main` への push で GitHub Actions が GitHub Pages にデプロイする。
