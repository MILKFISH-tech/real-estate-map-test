@echo off
chcp 65001 >nul
echo 🚀 开始完全自动部署流程...
echo.

echo 📦 步骤 1: 构建项目...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)
echo ✅ 构建成功！
echo.

echo ☁️  步骤 2: 部署到 Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=real-estate-map-explorer
if errorlevel 1 (
    echo.
    echo 💡 可能需要登录 Cloudflare，正在尝试...
    echo.
    call npx wrangler login
    if errorlevel 1 (
        echo.
        echo ❌ 登录失败，请手动运行: npx wrangler login
        pause
        exit /b 1
    )
    echo.
    echo ✅ 登录成功！重新部署...
    echo.
    call npx wrangler pages deploy dist --project-name=real-estate-map-explorer
    if errorlevel 1 (
        echo.
        echo ❌ 部署失败！
        pause
        exit /b 1
    )
)

echo.
echo ✅ 部署成功！
echo.
pause
