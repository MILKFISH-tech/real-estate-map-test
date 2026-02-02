# 完全自动部署脚本
$ErrorActionPreference = "Stop"

Write-Host "🚀 开始完全自动部署流程..." -ForegroundColor Green
Write-Host ""

# 步骤 1: 构建项目
Write-Host "📦 步骤 1: 构建项目..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "构建失败，退出代码: $LASTEXITCODE"
    }
    Write-Host "✅ 构建成功！" -ForegroundColor Green
} catch {
    Write-Host "❌ 构建失败: $_" -ForegroundColor Red
    exit 1
}

# 步骤 2: 检查 dist 目录
if (-not (Test-Path "dist")) {
    Write-Host "❌ 错误: dist 目录不存在！" -ForegroundColor Red
    exit 1
}

$fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
Write-Host "   找到 $fileCount 个文件" -ForegroundColor Cyan
Write-Host ""

# 步骤 3: 部署到 Cloudflare Pages
Write-Host "☁️  步骤 2: 部署到 Cloudflare Pages..." -ForegroundColor Yellow
Write-Host "   项目名称: real-estate-map-explorer" -ForegroundColor Cyan
Write-Host ""

try {
    npx wrangler pages deploy dist --project-name=real-estate-map-explorer
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 部署成功！" -ForegroundColor Green
    } else {
        throw "部署失败，退出代码: $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "❌ 部署失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 可能需要先登录 Cloudflare" -ForegroundColor Yellow
    Write-Host "   正在尝试自动登录..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npx wrangler login
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ 登录成功！重新尝试部署..." -ForegroundColor Green
            Write-Host ""
            npx wrangler pages deploy dist --project-name=real-estate-map-explorer
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ 部署成功！" -ForegroundColor Green
            } else {
                throw "重新部署失败"
            }
        } else {
            throw "登录失败"
        }
    } catch {
        Write-Host ""
        Write-Host "❌ 自动登录失败，请手动运行: npx wrangler login" -ForegroundColor Red
        exit 1
    }
}
