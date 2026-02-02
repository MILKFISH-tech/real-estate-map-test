@echo off
chcp 65001 >nul
cls
echo ========================================
echo   部署到 Cloudflare Pages
echo ========================================
echo.
echo 步骤 1: 构建项目...
call npm run build
if errorlevel 1 (
    echo 构建失败！
    pause
    exit /b 1
)
echo 构建成功！
echo.
echo 步骤 2: 部署到 Cloudflare...
call npx wrangler pages deploy dist --project-name=real-estate-map-explorer
echo.
echo 完成！
pause
