# Cloudflare Pages 部署指南

## 自动部署设置

### 方法 1: 使用 Wrangler CLI（推荐）

1. **首次部署需要登录 Cloudflare**
   ```bash
   npx wrangler login
   ```

2. **部署到 Cloudflare Pages**
   ```bash
   npm run deploy
   ```

### 方法 2: 使用 GitHub Actions（自动部署）

当代码推送到 GitHub 的 main 或 master 分支时，会自动部署。

**需要在 GitHub 仓库设置以下 Secrets：**

1. `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
   - 获取方式：Cloudflare Dashboard → My Profile → API Tokens → Create Token
   - 权限：Account.Cloudflare Pages:Edit

2. `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID
   - 获取方式：Cloudflare Dashboard → 右侧边栏可以看到 Account ID

3. `GEMINI_API_KEY` - Gemini API 密钥（如果需要）

## 手动部署步骤

1. 构建项目
   ```bash
   npm run build
   ```

2. 部署到 Cloudflare Pages
   ```bash
   npx wrangler pages deploy dist
   ```

## 注意事项

- 首次部署需要登录 Cloudflare 账号
- 部署后会在终端显示部署 URL
- 项目名称可以在 `wrangler.toml` 中修改
