#!/bin/bash

# Instagram Auto Post 시작 스크립트

echo "🐾 Instagram Auto Post - 레디"
echo "=================================="

# 환경 변수 파일 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다. .env.example을 참고해서 생성해주세요."
    exit 1
fi

# 필수 디렉토리 생성
echo "📁 필수 디렉토리 생성 중..."
mkdir -p logs data images

# PM2 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2가 설치되지 않았습니다. 설치 중..."
    npm install -g pm2
fi

# 기존 프로세스 확인 및 정리
echo "🔍 기존 프로세스 확인 중..."
pm2 delete instagram-auto-post 2>/dev/null || true

# PM2로 애플리케이션 시작
echo "🚀 PM2로 애플리케이션 시작 중..."
pm2 start ecosystem.config.js

# 상태 확인
echo "📊 실행 상태 확인..."
pm2 status

echo ""
echo "✅ 시작 완료! 다음 명령어로 모니터링할 수 있습니다:"
echo "  pm2 logs instagram-auto-post  # 로그 확인"
echo "  pm2 monit                     # 실시간 모니터링"
echo "  pm2 status                    # 상태 확인"
echo ""
echo "🛑 중지하려면: pm2 stop instagram-auto-post"
