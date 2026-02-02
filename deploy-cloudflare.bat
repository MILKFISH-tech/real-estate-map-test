@echo off
chcp 65001 >nul
echo ========================================
echo  🚀 Cloudflare Pages 自動部署
echo ========================================
echo.

echo 📦 步驟 1: 構建項目...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 構建失敗！
    pause
    exit /b 1
)
echo ✅ 構建成功！
echo.

echo ☁️  步驟 2: 部署到 Cloudflare Pages...
echo    項目名稱: real-estate-map-explorer
echo.
call npx wrangler pages deploy dist --project-name=real-estate-map-explorer

if errorlevel 1 (
    echo.
    echo 💡 可能需要登錄 Cloudflare
    echo    正在嘗試登錄...
    echo.
    call npx wrangler login
    if errorlevel 1 (
        echo.
        echo ❌ 登錄失敗，請手動運行: npx wrangler login
        pause
        exit /b 1
    )
    echo.
    echo ✅ 登錄成功！重新部署...
    echo.
    call npx wrangler pages deploy dist --project-name=real-estate-map-explorer
    if errorlevel 1 (
        echo.
        echo ❌ 部署失敗！
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo  ✅ 部署成功！
echo ========================================
echo.
pause
