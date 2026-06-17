// 백엔드 베이스 URL/엔드포인트 해석. 환경(개발/운영)에 따라 호스트를 결정한다.

export function getBackendBaseUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return `http://${window.location.hostname}:8080`;
  }

  if (
    window.location.hostname === 'beforenuri.cloud' ||
    window.location.hostname === 'www.beforenuri.cloud'
  ) {
    return 'https://api.beforenuri.cloud';
  }

  return window.location.origin;
}

export function getApiUrl(path: string) {
  return `${getBackendBaseUrl()}${path}`;
}

export function getWebSocketUrl(path: string) {
  const baseUrl = getBackendBaseUrl();

  if (baseUrl.startsWith('https://')) {
    return `wss://${baseUrl.slice('https://'.length)}${path}`;
  }

  if (baseUrl.startsWith('http://')) {
    return `ws://${baseUrl.slice('http://'.length)}${path}`;
  }

  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${path}`;
}
