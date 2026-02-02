@echo off
cd /d "C:\Users\sharon\PR\成交資料-測試"
echo 部署中...
npx wrangler pages deploy dist --project-name=real-estate-map-explorer > deploy-log.txt 2>&1
echo 完成！结果已保存到 deploy-log.txt
type deploy-log.txt
pause
