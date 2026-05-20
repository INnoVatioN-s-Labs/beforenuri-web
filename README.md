# beforenuri-web

Vite + React 기반 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev
```

개발 환경에서 백엔드 기본 주소는 `http://<현재호스트>:8080` 입니다.

별도 서버를 쓰려면 `.env` 파일을 만들고 아래 값을 설정하면 됩니다.

```env
VITE_SOCKET_URL=https://api.beforenuri.cloud
```

샘플은 [.env.example](/Users/koyoungseok/Desktop/beforenuri/beforenuri-web/.env.example) 에 있습니다.

## 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 에 생성됩니다. 정적 호스팅 서비스에 `dist/` 를 그대로 배포할 수 있습니다.

운영 환경에서는 `VITE_SOCKET_URL=https://api.beforenuri.cloud` 설정을 권장합니다.

`beforenuri.cloud` 또는 `www.beforenuri.cloud`에서 실행될 때는 환경변수가 없더라도 기본적으로 `https://api.beforenuri.cloud`를 사용합니다.

## Docker 배포

```bash
docker build -t beforenuri-web .
docker run --rm -p 8080:80 beforenuri-web
```

컨테이너는 Nginx로 정적 파일을 서빙합니다.
