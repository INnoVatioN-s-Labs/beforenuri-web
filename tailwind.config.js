/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PC통신 단말기 테마 토큰 (pc-tongsin-design-spec.md 기준)
        terminal: {
          bg: '#000078',      // 기본 배경 (진한 파랑)
          bgAlt: '#00005f',   // 보조 배경 / 버튼
          border: '#000044',  // 상단 바 구분 테두리
          text: '#f8f8f8',    // 본문 텍스트
          dim: '#9aa1ff',     // 힌트 / 메타 / 프롬프트
          line: '#aeb5ff',    // 구분선
          accent: '#ffff66',  // 강조 (노랑)
          input: '#83ff9b',   // 입력 텍스트 (연두)
          error: '#ff8a8a',   // 경고 (연빨강)
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'D2Coding', '"Nanum Gothic Coding"', '"Malgun Gothic"', 'monospace'],
      },
    },
  },
  plugins: [],
}
