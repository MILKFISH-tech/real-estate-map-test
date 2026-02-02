import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readdirSync } from 'fs';

console.log('🚀 开始完全自动部署流程...\n');

try {
  // 步骤 1: 构建项目
  console.log('📦 步骤 1: 构建项目...');
  try {
    execSync('npm run build', { stdio: 'inherit', shell: true });
  } catch (buildError) {
    console.error('❌ 构建失败:', buildError.message);
    throw buildError;
  }
  
  // 步骤 2: 检查 dist 目录
  if (!existsSync('dist')) {
    console.error('❌ 错误: dist 目录不存在！');
    process.exit(1);
  }
  
  const distFiles = readdirSync('dist');
  console.log(`✅ 构建成功！找到 ${distFiles.length} 个文件\n`);

  // 步骤 3: 部署到 Cloudflare Pages
  console.log('☁️  步骤 2: 部署到 Cloudflare Pages...');
  console.log('   项目名称: real-estate-map-explorer');
  console.log('   部署目录: dist\n');
  
  try {
    execSync('npx wrangler pages deploy dist --project-name=real-estate-map-explorer', { 
      stdio: 'inherit',
      shell: true 
    });
    console.log('\n✅ 部署成功！');
  } catch (deployError) {
    console.error('\n❌ 部署失败！');
    const errorMsg = deployError.message || deployError.toString();
    if (errorMsg.includes('not authenticated') || errorMsg.includes('login') || errorMsg.includes('authentication')) {
      console.log('\n💡 提示: 需要先登录 Cloudflare');
      console.log('   正在尝试自动登录...');
      try {
        execSync('npx wrangler login', { stdio: 'inherit', shell: true });
        console.log('\n✅ 登录成功！重新尝试部署...');
        execSync('npx wrangler pages deploy dist --project-name=real-estate-map-explorer', { 
          stdio: 'inherit',
          shell: true 
        });
        console.log('\n✅ 部署成功！');
      } catch (loginError) {
        console.log('\n❌ 自动登录失败，请手动运行: npx wrangler login');
        throw loginError;
      }
    } else {
      throw deployError;
    }
  }
} catch (error) {
  console.error('\n❌ 部署流程失败！');
  console.error('错误详情:', error.message || error);
  process.exit(1);
}
