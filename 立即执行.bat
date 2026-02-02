@echo off
cd /d "C:\Users\sharon\PR\成交資料-測試"
echo 正在部署到 Cloudflare Pages...
echo.
npx wrangler pages deploy dist --project-name=real-estate-map-explorer
echo.
echo 部署完成！
pause
