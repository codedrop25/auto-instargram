@echo off
chcp 65001 >nul

echo 🐾 Instagram Auto Post - 레디
echo ==================================

:: Node.js 버전 확인
for /f "tokens=*" %%i in ('node -v') do set node_version=%%i
echo Node.js 버전: %node_version%

:: 필요한 폴더 생성
if not exist logs mkdir logs
if not exist data mkdir data
if not exist images mkdir images

:: .env 파일 존재 확인
if not exist .env (
    echo ❌ .env 파일이 없습니다!
    echo 📝 .env.example을 참고하여 .env 파일을 생성해주세요.
    pause
    exit /b 1
)

:: 의존성 설치 확인
if not exist node_modules (
    echo 📦 의존성을 설치합니다...
    npm install
)

echo.
echo 실행할 작업을 선택하세요:
echo 1) 테스트 실행 (게시글 생성만)
echo 2) 테스트 + 실제 업로드
echo 3) 즉시 업로드
echo 4) 스케줄러 시작
echo 5) 시스템 테스트
echo 6) 상태 확인
echo.
set /p choice="선택 (1-6): "

if "%choice%"=="1" (
    echo 🧪 테스트 모드 실행...
    npm start test
) else if "%choice%"=="2" (
    echo 🚀 테스트 + 실제 업로드 실행...
    npm start test -- --upload
) else if "%choice%"=="3" (
    echo ⚡ 즉시 업로드 실행...
    npm start now
) else if "%choice%"=="4" (
    echo ⏰ 스케줄러 시작...
    npm start schedule
) else if "%choice%"=="5" (
    echo 🔧 시스템 테스트 실행...
    npm test
) else if "%choice%"=="6" (
    echo 📊 상태 확인...
    npm start status
) else (
    echo ❌ 잘못된 선택입니다.
    echo 💡 사용법: npm start [test^|now^|schedule^|status]
)

pause
