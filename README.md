# SABOTEN

サボテンかわいい、みんなで割り勘しよ。

## 招待URLのOGP

`/<roomのUUID>` は Pages Functions (`pages/functions/[roomId].ts`) で静的HTMLの
title・og:title・og:urlを差し替え、descriptionは共通のままにする。D1から取得するのはroom名のみで、存在しないroomや
DBエラーの場合は従来のHTMLを返す。トップページと静的アセットは `_routes.json` でFunctionsの対象外にしている。

`pnpm deploy:app` で静的アセットとFunctionsをまとめてデプロイする。
API用の `wrangler.toml` とPages用の `pages/wrangler.toml` は同じD1データベースを参照する。
ビルド後のローカル確認は `pnpm exec wrangler pages dev --cwd pages` を使う（ローカルD1はAPI用とは別になる）。
