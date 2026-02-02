# 立即部署到 Cloudflare Pages
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🚀 開始部署到 Cloudflare Pages" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步驟 1: 構建項目
Write-Host "📦 步驟 1: 構建項目..." -ForegroundColor Yellow
try {
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 構建失敗！" -ForegroundColor Red
        Write-Host $buildResult
        exit 1
    }
    Write-Host "✅ 構建成功！" -ForegroundColor Green
} catch {
    Write-Host "❌ 構建錯誤: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步驟 2: 檢查 dist 目錄
if (-not (Test-Path "dist")) {
    Write-Host "❌ 錯誤: dist 目錄不存在！" -ForegroundColor Red
    exit 1
}

$fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
Write-Host "   找到 $fileCount 個文件" -ForegroundColor Gray
Write-Host ""

# 步驟 3: 部署到 Cloudflare Pages
Write-Host "☁️  步驟 2: 部署到 Cloudflare Pages..." -ForegroundColor Yellow
Write-Host "   項目名稱: real-estate-map-explorer" -ForegroundColor Cyan
Write-Host ""

try {
    $deployResult = npx wrangler pages deploy dist --project-name=real-estate-map-explorer 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host " ✅ 部署成功！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host $deployResult
    } else {
        throw "部署失敗，退出代碼: $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "❌ 部署失敗: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 可能需要先登錄 Cloudflare" -ForegroundColor Yellow
    Write-Host "   正在嘗試登錄..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npx wrangler login
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ 登錄成功！重新嘗試部署..." -ForegroundColor Green
            Write-Host ""
            $deployResult = npx wrangler pages deploy dist --project-name=real-estate-map-explorer 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Cyan
                Write-Host " ✅ 部署成功！" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Cyan
                Write-Host $deployResult
            } else {
                Write-Host "❌ 重新部署失敗" -ForegroundColor Red
                Write-Host $deployResult
                exit 1
            }
        } else {
            Write-Host "❌ 登錄失敗" -ForegroundColor Red
            Write-Host "   請手動運行: npx wrangler login" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "❌ 自動登錄失敗: $_" -ForegroundColor Red
        Write-Host "   請手動運行: npx wrangler login" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
