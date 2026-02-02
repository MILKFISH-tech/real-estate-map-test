<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 三灜地產 · 數位成交地圖

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 本地運行

**前置需求:** Node.js

1. 安裝依賴：
   ```bash
   npm install
   ```
2. 設置 `GEMINI_API_KEY` 環境變數（在 `.env.local` 文件中）
3. 運行應用：
   ```bash
   npm run dev
   ```

## 部署到 Cloudflare Pages

### 自動部署

運行以下命令即可自動部署：

```bash
npm run deploy
```

或使用批處理文件：

```bash
start-deploy.bat
```

### GitHub Actions 自動部署

當代碼推送到 `main` 或 `master` 分支時，會自動部署到 Cloudflare Pages。

需要在 GitHub 倉庫設置以下 Secrets：
- `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID
- `GEMINI_API_KEY` - Gemini API 密鑰（如果需要）

## 推送到 GitHub

### 方法 1: 使用腳本（推薦）

1. 在 GitHub 上創建新倉庫
2. 運行推送腳本：
   ```bash
   .\push-to-github.ps1 YOUR_USERNAME YOUR_REPO_NAME
   ```

### 方法 2: 手動推送

1. 在 GitHub 上創建新倉庫
2. 添加遠程倉庫：
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
