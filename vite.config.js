import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // ★ 1. PWA 플러그인 import

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // ★ 2. PWA 플러그인 설정 추가
      registerType: 'autoUpdate', // 서비스 워커 자동 업데이트
      devOptions: {
        enabled: true // 개발 환경에서도 활성화
      },
      manifest: {
        name: 'ticketmongo',
        short_name: 'ticketmongo',
        description: '더 쉽고 즐거운 티켓 예매',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});


// // https 설정
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import fs from 'fs';

// export default defineConfig({
//   server: {
//     https: {
//       key: fs.readFileSync('./certs/localhost-key.pem'),
//       cert: fs.readFileSync('./certs/localhost.pem'),
//     },
//     port: 3000,
//     proxy: {
//       // `/api` 로 시작하는 모든 요청을 스프링부트(8080)로 포워딩
//       '/api': {
//         target: 'https://localhost:8080',  // 백엔드가 HTTP 8080번 포트라면 이대로,
//         changeOrigin: true,
//         secure: false,                    // HTTPS 로 대상 서버를 호출할 때 인증서 검증을 끄고 싶으면 true→false
//       },
//     },
//   },
//   plugins: [react()],
// });
