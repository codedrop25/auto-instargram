#!/bin/bash

# Instagram Auto Post 중지 스크립트

echo "🛑 Instagram Auto Post 중지 중..."
echo "=================================="

# PM2 프로세스 중지
pm2 stop instagram-auto-post 2>/dev/null || echo "⚠️  실행 중인 프로세스가 없습니다."

# PM2 프로세스 삭제
pm2 delete instagram-auto-post 2>/dev/null || echo "⚠️  삭제할 프로세스가 없습니다."

# 상태 확인
echo "📊 현재 PM2 상태:"
pm2 status

echo ""
echo "✅ 중지 완료!"
