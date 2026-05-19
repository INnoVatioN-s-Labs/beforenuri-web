# beforenuri-web

Vite + React 기반 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev
```

개발 환경에서 소켓 서버 기본 주소는 `http://<현재호스트>:3000` 입니다.

별도 서버를 쓰려면 `.env` 파일을 만들고 아래 값을 설정하면 됩니다.

```env
VITE_SOCKET_URL=http://16.176.210.28:8080
```

샘플은 [.env.example](/Users/koyoungseok/Desktop/beforenuri/beforenuri-web/.env.example) 에 있습니다.

## 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 에 생성됩니다. 정적 호스팅 서비스에 `dist/` 를 그대로 배포할 수 있습니다.

운영 환경에서 `VITE_SOCKET_URL` 을 지정하지 않으면 프론트가 배포된 현재 origin으로 소켓 연결을 시도합니다. 즉, 리버스 프록시로 같은 도메인 아래 백엔드를 붙이는 구성이 기본값입니다.

## Docker 배포

```bash
docker build -t beforenuri-web .
docker run --rm -p 8080:80 beforenuri-web
```

컨테이너는 Nginx로 정적 파일을 서빙합니다.
