# 检查部署状态脚本
Write-Host "检查部署状态..." -ForegroundColor Cyan
Write-Host ""

# 检查构建状态
if (Test-Path "dist\index.html") {
    Write-Host "✅ 构建成功 - dist 目录存在" -ForegroundColor Green
    $fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
    Write-Host "   文件数量: $fileCount" -ForegroundColor Gray
} else {
    Write-Host "❌ 构建未完成 - dist 目录不存在" -ForegroundColor Red
    Write-Host "   请先运行: npm run build" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "要开始部署，请运行以下命令之一:" -ForegroundColor Cyan
Write-Host "  1. npm run deploy" -ForegroundColor White
Write-Host "  2. .\start-deploy.bat" -ForegroundColor White
Write-Host "  3. node deploy.js" -ForegroundColor White
Write-Host ""
