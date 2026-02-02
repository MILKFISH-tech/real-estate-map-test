@echo off
chcp 65001 >nul
cls
echo ========================================
echo   完整自動部署到 Cloudflare Pages
echo ========================================
echo.

echo [1/3] 構建項目...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 構建失敗！請檢查錯誤訊息
    pause
    exit /b 1
)
echo ✅ 構建成功！
echo.

echo [2/3] 檢查構建文件...
if not exist "dist\index.html" (
    echo ❌ 錯誤：dist\index.html 不存在！
    pause
    exit /b 1
)
echo ✅ 構建文件檢查通過
echo.

echo [3/3] 部署到 Cloudflare Pages...
echo    項目名稱: real-estate-map-explorer
echo    帳戶 ID: B307F22959FE676C09CBAC1C9DE60F70
echo.
call npx wrangler pages deploy dist --project-name=real-estate-map-explorer

if errorlevel 1 (
    echo.
    echo ❌ 部署失敗！
    echo.
    echo 請檢查：
    echo 1. 是否已登錄 Cloudflare (運行: npx wrangler login)
    echo 2. 項目名稱是否已存在
    echo 3. 網絡連接是否正常
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ 部署成功！
echo ========================================
echo.
echo 請在 Cloudflare 儀表板查看：
echo https://dash.cloudflare.com
echo.
pause
