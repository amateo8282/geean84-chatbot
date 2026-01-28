# 인생84

기안84 페르소나 챗봇. 기안84의 솔직하고 따뜻한 말투로 대화할 수 있습니다.

## 기술 스택

- React 19 + Vite
- Tailwind CSS v4
- Framer Motion
- Google Gemini API

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. API 키 설정

```bash
cp .env.example .env
```

`.env` 파일에 Gemini API 키 입력:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

API 키는 [Google AI Studio](https://aistudio.google.com/apikey)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:5173 접속

## 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/
│   ├── ChatContainer.jsx   # 채팅 컨테이너
│   ├── ChatInput.jsx       # 입력창
│   ├── DrawnBorder.jsx     # 손그림 스타일 테두리
│   ├── FloatingImage.jsx   # 배경 플로팅 이미지
│   └── MessageBubble.jsx   # 메시지 말풍선
├── hooks/
│   └── useGemini.js        # Gemini API 훅
├── lib/
│   ├── gemini.js           # Gemini API 클라이언트
│   └── systemPrompt.js     # 기안84 말투 프롬프트
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## 라이선스

MIT
