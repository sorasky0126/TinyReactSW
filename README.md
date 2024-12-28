# TinyReactApi

## 概要

TinyReactApiは、ServiceWorkerを利用して、ブラウザ上でTypeScriptやTSXをトランスパイル(Babel Standaloneを利用)してReactアプリケーションを実行するためのスクリプト群です。

ブラウザの仕様上、単純な静的HTTPサーバーが必要ですが、それ以外は基本的にブラウザ上で完結します。

## 使い方

1. このリポジトリをクローンします。
2. クローンしたディレクトリに移動します。
3. `npm install`を実行します。(VSCode上でTypeScript/TSXを快適にコーディングするためのものなのでそれ以外では不要)
4. App.tsxを編集します。import文で他のファイルのTSXコンポーネントも読み込むことができます。
5. API機能を使う場合は、api.jsを編集します。
6. HTTPサーバーを起動してindex.htmlをブラウザで開きます。(VSCodeの場合は、Live Serverを使うとホットリロードができて便利です)

## API機能

TinyReactApiは、Service Workerを利用して、ブラウザ内であたかもWebAPIを実行したかのような動作をさせることができます。
`/api`ディレクトリへのリクエストをAPIリクエストとして扱い、`api.js`内のfetch関数を呼び出す形でAPIリクエストを処理します。
CloudFlare WorkersのようなEdge Functionのモックやテストでの利用を想定しています。

## ライセンス

MITライセンスです。
