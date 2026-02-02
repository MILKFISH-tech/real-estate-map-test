# 推送到 GitHub 脚本
param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName
)

Write-Host "🚀 推送到 GitHub..." -ForegroundColor Green
Write-Host ""

# 设置远程仓库
$remoteUrl = "https://github.com/$Username/$RepoName.git"
Write-Host "远程仓库: $remoteUrl" -ForegroundColor Cyan

# 检查是否已有远程仓库
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "更新远程仓库地址..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
} else {
    Write-Host "添加远程仓库..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
}

# 设置主分支为 main
Write-Host "设置主分支为 main..." -ForegroundColor Yellow
git branch -M main 2>$null

# 推送到 GitHub
Write-Host "推送到 GitHub..." -ForegroundColor Yellow
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 成功推送到 GitHub！" -ForegroundColor Green
    Write-Host "   仓库地址: https://github.com/$Username/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ 推送失败！" -ForegroundColor Red
    Write-Host "   请检查：" -ForegroundColor Yellow
    Write-Host "   1. GitHub 仓库是否已创建" -ForegroundColor Gray
    Write-Host "   2. 用户名和仓库名是否正确" -ForegroundColor Gray
    Write-Host "   3. 是否有推送权限" -ForegroundColor Gray
}
