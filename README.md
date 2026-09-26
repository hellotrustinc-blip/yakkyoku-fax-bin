# 薬局FAX便（案内ページ）

薬局向けFAX送信代行サービス「薬局FAX便」の案内ページです（1ページ・静的HTML・運営: 株式会社トラスト）。

## 構成
- `index.html` — 本文（日本語・スマホ幅対応・外部CDN不使用）
- `style.css` — スタイル
- `assets/flyer_sample.png` — 紙面見本画像（架空データで生成。出所は `assets/SOURCES.md`）
- `tools/site_check.js` — 公開前検査（文言・リンク・画像出所の機械検査）

## 公開
GitHub Pages（リポジトリ `yakkyoku-fax-bin`・ブランチ main・ルート /）で公開しています。
更新手順: ファイルを直す → `node tools/site_check.js` が全PASS → commit → push（数十秒で反映）。

## 独自ドメイン（後日）
Settings → Pages → Custom domain にドメインを設定し、ドメイン提供元でCNAMEレコードをGitHub Pagesへ向ける。
