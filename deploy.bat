@echo off
echo 开始自动部署流程...
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

echo 步骤 2: 部署到 Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=real-estate-map-explorer
if errorlevel 1 (
    echo.
    echo 部署失败！可能需要先登录 Cloudflare。
    echo 请运行: npx wrangler login
    pause
    exit /b 1
)

echo.
echo 部署成功！
pause
