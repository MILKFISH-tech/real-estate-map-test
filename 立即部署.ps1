Write-Host "开始部署..." -ForegroundColor Green

# 构建
Write-Host "构建中..." -ForegroundColor Yellow
& npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}

# 部署
Write-Host "部署中..." -ForegroundColor Yellow
& npx wrangler pages deploy dist --project-name=real-estate-map-explorer
if ($LASTEXITCODE -eq 0) {
    Write-Host "部署成功！" -ForegroundColor Green
} else {
    Write-Host "部署失败！" -ForegroundColor Red
}
