# 🐾 Instagram Auto Post - 레디

AI 기반 Instagram 자동 게시 시스템입니다. Claude AI를 사용해 "레디" 캐릭터의 일상적인 개발 이야기를 생성하고, 자동으로 Instagram에 게시합니다.

## ✨ 주요 기능

- 🤖 **AI 컨텐츠 생성**: Claude AI로 개발자 일상 게시글 자동 생성
- 📱 **Instagram 자동 업로드**: 생성된 컨텐츠를 자동으로 Instagram에 게시
- ⏰ **PM2 스케줄링**: PM2를 사용한 안정적인 백그라운드 실행
- 🧪 **테스트 모드**: 실제 업로드 전 미리보기 기능
- 📊 **로깅 시스템**: 상세한 실행 로그 및 에러 추적
- 🔄 **자동 재시작**: PM2의 cron restart로 안정적인 운영

## 🚀 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치
```bash


git clone <repository-url>
cd instagram-auto-post
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
# Claude AI API 설정
ANTHROPIC_API_KEY=your_claude_api_key_here

# Instagram 계정 설정
INSTAGRAM_USERNAME=your_instagram_username
INSTAGRAM_PASSWORD=your_instagram_password

# 스케줄 설정
SCHEDULE_HOUR=9
FORCE_RUN=false

# 게시글 설정
MAX_CAPTION_LENGTH=2000
USE_HASHTAGS=true

# 환경 설정
NODE_ENV=development
```

### 3. 필수 디렉토리 생성
```bash
mkdir logs data images
```

## 📋 사용법

### 기본 명령어

```bash
# 테스트 실행 (업로드 안함)
npm start test

# 테스트 + 실제 업로드
npm start test -- --upload

# 즉시 업로드
npm start now

# 단일 스케줄 실행
npm start schedule
```

### PM2 명령어 (권장)

```bash
# PM2로 백그라운드 실행 시작
npm run pm2:start

# PM2 상태 확인
npm run pm2:status

# PM2 로그 확인
npm run pm2:logs

# PM2 모니터링
npm run pm2:monit

# PM2 재시작
npm run pm2:restart

# PM2 중지
npm run pm2:stop

# PM2 완전 삭제
npm run pm2:delete
```

### 직접 PM2 명령어

```bash
# PM2 설치 (글로벌)
npm install -g pm2

# 직접 PM2 명령어 사용
pm2 start ecosystem.config.js
pm2 logs instagram-auto-post
pm2 restart instagram-auto-post
pm2 stop instagram-auto-post
pm2 delete instagram-auto-post
```

## ⚙️ PM2 설정

`ecosystem.config.js` 파일에서 PM2 설정을 관리합니다:

```javascript
module.exports = {
  apps: [{
    name: 'instagram-auto-post',
    script: 'src/index.js',
    args: 'schedule',
    cron_restart: '0 9 * * *', // 매일 오전 9시 재시작
    autorestart: true,
    max_memory_restart: '1G',
    // ... 기타 설정
  }]
};
```

### 주요 PM2 설정 항목

- **cron_restart**: 매일 오전 9시에 자동 재시작
- **autorestart**: 에러 발생 시 자동 재시작
- **max_memory_restart**: 메모리 사용량 초과 시 재시작
- **error_file, out_file**: 로그 파일 위치

## 📁 프로젝트 구조

```
instagram-auto-post/
├── src/
│   ├── config/
│   │   └── logger.js           # 로깅 설정
│   ├── services/
│   │   ├── claudeService.js    # Claude AI 서비스
│   │   ├── instagramService.js # Instagram API 서비스
│   │   └── schedulerService.js # PM2 스케줄러 서비스
│   ├── index.js               # 메인 애플리케이션
│   └── test.js               # 테스트 스크립트
├── logs/                     # 로그 파일들
├── data/                     # 데이터 파일들
├── images/                   # 이미지 파일들
├── ecosystem.config.js       # PM2 설정
├── package.json             # 패키지 설정
├── .env                     # 환경 변수
└── README.md               # 이 파일
```

## 🎯 컨텐츠 생성 규칙

### 캐릭터 설정
- **이름**: 레디 🐾
- **성격**: 귀엽고 친근하면서도 실력 있는 개발자
- **컨셉**: 일상적인 개발 경험을 재미있게 공유

### 게시글 주제
- 일상적인 개발 경험 (버그, 새로운 기술 학습 등)
- 개발자 문화와 유머
- 기술 트렌드에 대한 생각
- 학습과 성장 경험담

### 해시태그 전략
- 기본 태그: `#레디 #개발자일상 #코딩 #프로그래밍`
- 관련 태그: `#웹개발 #앱개발 #프론트엔드 #백엔드`
- 트렌드 태그: `#AI개발 #개발자소통 #테크트렌드`

## 🔧 개발 및 디버깅

### 개발 모드 실행
```bash
npm run dev
```

### 로그 확인
```bash
# 실시간 로그 확인
tail -f logs/combined.log

# PM2 로그 확인
pm2 logs instagram-auto-post --lines 100
```

### 테스트 방법
```bash
# 컨텐츠 생성 테스트만
npm start test

# 실제 업로드 테스트 (주의!)
npm start test -- --upload
```

## 🚨 주의사항

1. **Instagram 계정 보안**: 2FA가 설정된 계정은 별도 앱 비밀번호 필요
2. **API 제한**: Instagram API 호출 제한에 주의
3. **컨텐츠 품질**: 생성된 컨텐츠 검토 후 업로드 권장
4. **백업**: 중요한 데이터는 정기적으로 백업

## 📊 모니터링

### PM2 모니터링
```bash
# PM2 대시보드
pm2 monit

# 프로세스 상태
pm2 status

# 메모리 사용량
pm2 show instagram-auto-post
```

### 로그 모니터링
```bash
# 에러 로그만
tail -f logs/err.log

# 전체 로그
tail -f logs/combined.log
```

## 🔄 운영 가이드

### 일일 체크리스트
- [ ] PM2 프로세스 상태 확인
- [ ] 로그 에러 확인
- [ ] Instagram 업로드 성공 여부 확인
- [ ] 메모리 사용량 확인

### 문제 해결
```bash
# 프로세스가 죽었을 때
pm2 restart instagram-auto-post

# 메모리 누수 의심 시
pm2 reload instagram-auto-post

# 완전 재시작
pm2 delete instagram-auto-post
npm run pm2:start
```

## 📝 환경별 설정

### 개발 환경
```env
NODE_ENV=development
FORCE_RUN=true
SCHEDULE_HOUR=현재시간
```

### 프로덕션 환경
```env
NODE_ENV=production
FORCE_RUN=false
SCHEDULE_HOUR=9
```

## 🤝 기여하기

1. 이슈나 개선사항 제안
2. 브랜치 생성 후 개발
3. 테스트 완료 후 PR 제출

## 📄 라이선스

MIT License

## 📞 지원

- GitHub Issues: 버그 리포트 및 기능 요청
- Wiki: 상세한 사용법 및 FAQ

---

**⚠️ 중요**: 이 도구는 교육 및 개인 사용 목적으로 제작되었습니다. Instagram의 이용약관을 준수하여 사용하세요.
