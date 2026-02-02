# GitHub 设置脚本
Write-Host "🚀 GitHub 仓库设置向导" -ForegroundColor Green
Write-Host ""

# 检查是否已初始化 Git
if (-not (Test-Path ".git")) {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Yellow
    git init
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "发现未提交的更改，正在添加..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit: 三灜地產數位成交地圖 - 包含 Cloudflare Pages 自動部署配置"
    Write-Host "✅ 文件已提交" -ForegroundColor Green
} else {
    Write-Host "✅ 所有文件已提交" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 下一步操作：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 在 GitHub 上创建新仓库：" -ForegroundColor White
Write-Host "   - 访问 https://github.com/new" -ForegroundColor Gray
Write-Host "   - 输入仓库名称（例如：real-estate-map-explorer）" -ForegroundColor Gray
Write-Host "   - 选择 Public 或 Private" -ForegroundColor Gray
Write-Host "   - 不要初始化 README、.gitignore 或 license" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 添加远程仓库并推送：" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "或者运行以下命令（替换 YOUR_USERNAME 和 YOUR_REPO_NAME）：" -ForegroundColor White
Write-Host "   .\push-to-github.ps1 YOUR_USERNAME YOUR_REPO_NAME" -ForegroundColor Yellow
Write-Host ""
