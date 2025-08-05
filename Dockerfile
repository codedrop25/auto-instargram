# Node.js 22 Alpine 이미지 사용
FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 애플리케이션 소스 복사
COPY src/ ./src/

# 필요한 디렉토리 생성
RUN mkdir -p logs data images

# 비루트 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S instagram -u 1001

# 권한 설정
RUN chown -R instagram:nodejs /app
USER instagram

# 포트 노출 (없음 - 스케줄러 애플리케이션)
# EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# 애플리케이션 시작
CMD ["npm", "start", "schedule"]
