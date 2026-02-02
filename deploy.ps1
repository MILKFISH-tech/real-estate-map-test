# Cloudflare Pages 自动部署脚本
Write-Host "开始自动部署流程..." -ForegroundColor Green

# 步骤 1: 构建项目
Write-Host "`n步骤 1: 构建项目..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}
Write-Host "构建成功！" -ForegroundColor Green

# 步骤 2: 检查 dist 目录
if (-not (Test-Path "dist")) {
    Write-Host "错误: dist 目录不存在！" -ForegroundColor Red
    exit 1
}

# 步骤 3: 部署到 Cloudflare Pages
Write-Host "`n步骤 2: 部署到 Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy dist --project-name=real-estate-map-explorer

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n部署成功！" -ForegroundColor Green
} else {
    Write-Host "`n部署失败！可能需要先登录 Cloudflare。" -ForegroundColor Red
    Write-Host "请运行: npx wrangler login" -ForegroundColor Yellow
}
