import 'https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js';
import api from './api.js';

// 追加するヘッダー
const appendHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin'
};

// トランスパイルを行う拡張子の配列
const suffixList = ['tsx', 'ts'];

//イベントリスナーの登録
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', async event => {
  const { request } = event;
  if (request.url.includes('/api/')) {
    //apiディレクトリにアクセスした場合はAPIのリクエストとして扱う
    event.respondWith(api.fetch(request));
  } else {
    //それ以外のリクエストはTypeScriptトランスパイルリクエストとして扱う
    event.respondWith(handleJSRequest(request));
  }
});

// TypeScriptトランスパイルリクエストを処理
const handleJSRequest = async request => {
  // リクエストの拡張子が.js, .tsx, .tsの場合は拡張子のないURLに変換
  const baseURL = request.url.replace(/\.(js|tsx|ts)$/, '');

  // URLに拡張子がない場合、suffixListに設定した拡張子を順に付与してファイルが存在するか確認、あればトランスパイルして返す
  if (baseURL.match(/\.[a-zA-Z0-9]+$/) === null) {
    for (const suffix of suffixList) {
      const transpileURL = `${baseURL}.${suffix}`;
      const response = await fetchWithCheck(transpileURL);
      if (response !== null) {
        const tsCode = await response.text();
        const jsCode = transpileToJS(tsCode, transpileURL);
        let newHeaders = new Headers(appendHeaders);
        newHeaders.set('Content-Type', 'application/javascript');
        return new Response(jsCode, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }
    }
  }

  // 拡張子付きのURLまたは該当のファイルが存在しない場合はそのままリクエストを処理
  const response = await fetch(request.url);
  if (response.ok) {
    // ファイルが存在するリクエストの場合はヘッダーを追加してレスポンスを返す
    let newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(appendHeaders)) {
      newHeaders.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } else {
    // ファイルが存在しない場合はレスポンスをそのまま返す
    return response;
  }
}

// ファイルが存在するか確認
const fetchWithCheck = async url => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    // ファイルが存在しない場合はnullを返す
  }
  return null;
}

// TypeScriptをJavaScriptにトランスパイル
const transpileToJS = (tsCode, url) => {
  // TypeScriptのプリセットを登録
  if (!Object.hasOwn(Babel.availablePresets, 'tsx')) {
    Babel.registerPreset('tsx', {
      presets: [
        [Babel.availablePresets['typescript'],
        { allExtensions: true, isTSX: true }
        ]],
    },
    );
  }

  // urlからファイル名を取得
  let fname = url.substring(url.lastIndexOf('/') + 1);

  // Babelでトランスパイル
  let jsCode = '';
  try {
    jsCode = Babel.transform(tsCode, {
      presets: ['tsx', 'react'],
      sourceType: 'module',
      filename: fname
    }).code;
  } catch (error) {
    // トランスパイルエラーが発生した場合はブラウザにエラーメッセージを出力するJavaScriptコードを返す
    jsCode += 'const message = `' + error.message + '`;';
    jsCode += 'document.body.style.backgroundColor = "lightgray";';
    jsCode += 'document.body.innerHTML = `<h1 style="color: red;">Transpile error</h1>`;';
    jsCode += 'document.body.innerHTML += `<pre>${message}</pre>`;';
    jsCode += 'console.error(`Transpile error: ${message}`);';
  }

  return jsCode;
}
