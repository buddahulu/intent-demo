const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Agent Payment MVP Services...\n');

// 启动注册服务
const registry = spawn('node', [path.join(__dirname, 'services/registry.js')], {
  stdio: 'inherit',
  env: { ...process.env, REGISTRY_PORT: '3001' }
});

// 等待注册服务启动后启动商户 Agent
setTimeout(() => {
  const merchant = spawn('node', [path.join(__dirname, 'agents/merchant.js')], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      MERCHANT_PORT: '3002',
      REGISTRY_URL: 'http://localhost:3001'
    }
  });

  merchant.on('error', (err) => {
    console.error('Merchant agent error:', err);
  });

  // 等待商户服务启动后注册用户 Agent
  setTimeout(async () => {
    // 自动注册商户 Agent 到发现服务
    try {
      const response = await fetch('http://localhost:3001/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '美味轩中餐厅',
          type: 'restaurant',
          location: '北京市朝阳区三里屯',
          endpoint: 'http://localhost:3002',
          description: '正宗川菜，环境优雅，适合家庭聚餐和朋友聚会',
          capabilities: ['menu_query', 'availability_check', 'booking', 'payment'],
          metadata: {
            cuisine: '川菜',
            rating: 4.8,
            priceRange: '¥¥¥'
          }
        })
      });
      
      if (response.ok) {
        console.log('\n✅ Merchant agent registered successfully\n');
      }
    } catch (err) {
      console.log('\n⚠️  Failed to auto-register merchant:', err.message);
    }

    // 启动用户 Agent
    const userAgent = spawn('node', [path.join(__dirname, 'agents/user-agent.js')], {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        USER_AGENT_PORT: '3003',
        REGISTRY_URL: 'http://localhost:3001'
      }
    });

    userAgent.on('error', (err) => {
      console.error('User agent error:', err);
    });

  }, 2000);

}, 2000);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down services...');
  registry.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down services...');
  registry.kill();
  process.exit(0);
});
