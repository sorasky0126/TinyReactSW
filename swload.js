// ブラウザからロードされたので、このスクリプトをサービスワーカーに登録
if ('serviceWorker' in navigator) {
  // サービスワーカー登録前にページロードがされた場合、トランスパイルせずエラーになるので登録後にリロードする。
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    window.location.reload(true);
  });

  // サービスワーカー登録
  if (!navigator.serviceWorker.controller) {
    navigator.serviceWorker.register('sw.js', { type: "module" }).then(() => {
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  }
}