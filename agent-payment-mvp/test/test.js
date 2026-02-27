// 测试脚本
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URLS = {
  registry: process.env.REGISTRY_URL || 'http://localhost:3001',
  merchant: process.env.MERCHANT_URL || 'http://localhost:3002',
  userAgent: process.env.USER_AGENT_URL || 'http://localhost:3003'
};

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await fn();
    console.log(`✅ Passed: ${name}`);
  } catch (error) {
    console.log(`❌ Failed: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('      Agent Payment MVP - Test Suite       ');
  console.log('═══════════════════════════════════════════');

  // 1. 健康检查
  await test('Registry Health Check', async () => {
    const res = await fetch(`${BASE_URLS.registry}/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Registry not healthy');
  });

  await test('Merchant Health Check', async () => {
    const res = await fetch(`${BASE_URLS.merchant}/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Merchant not healthy');
  });

  await test('User Agent Health Check', async () => {
    const res = await fetch(`${BASE_URLS.userAgent}/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('User Agent not healthy');
  });

  // 2. 商户 Agent 测试
  await test('Get Restaurant Info', async () => {
    const res = await fetch(`${BASE_URLS.merchant}/api/restaurant`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to get restaurant info');
    console.log(`   📍 ${data.restaurant.name}`);
  });

  await test('Get Menu', async () => {
    const res = await fetch(`${BASE_URLS.merchant}/api/menu`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to get menu');
    console.log(`   🍽️  ${data.count} dishes available`);
  });

  await test('Check Availability', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`${BASE_URLS.merchant}/api/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, partySize: 4 })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to check availability');
    console.log(`   📅 ${data.availability.length} time slots available`);
  });

  await test('Get Recommendations', async () => {
    const res = await fetch(`${BASE_URLS.merchant}/api/recommendations?partySize=4`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to get recommendations');
    console.log(`   💰 Estimated total: ¥${data.estimatedTotalWithFees}`);
  });

  // 3. 发现服务测试
  let registeredAgentId;
  await test('Register Agent', async () => {
    const res = await fetch(`${BASE_URLS.registry}/api/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '测试餐厅',
        type: 'restaurant',
        location: '北京市海淀区',
        endpoint: 'http://localhost:9999',
        description: '测试用餐厅',
        capabilities: ['test']
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to register agent');
    registeredAgentId = data.agent.id;
    console.log(`   📝 Agent registered: ${registeredAgentId}`);
  });

  await test('Search Agents', async () => {
    const res = await fetch(`${BASE_URLS.registry}/api/agents/search?type=restaurant`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to search agents');
    console.log(`   🔍 Found ${data.count} agents`);
  });

  await test('Get Agent by ID', async () => {
    const res = await fetch(`${BASE_URLS.registry}/api/agents/${registeredAgentId}`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to get agent');
    console.log(`   👤 ${data.agent.name}`);
  });

  // 4. 用户 Agent 测试
  let conversationId;
  await test('Natural Language Booking Query', async () => {
    const res = await fetch(`${BASE_URLS.userAgent}/api/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '订个餐厅，4人，今晚',
        userId: 'test_user_123'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to process booking query');
    conversationId = data.conversationId;
    console.log(`   💬 Conversation started: ${conversationId}`);
    console.log(`   🍽️  ${data.details.merchant.name}`);
  });

  await test('Confirm Booking', async () => {
    if (!conversationId) throw new Error('No conversation to confirm');
    
    const res = await fetch(`${BASE_URLS.userAgent}/api/book/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        customerName: '张三',
        customerPhone: '13800138000',
        specialRequests: '靠窗位置'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to confirm booking');
    console.log(`   ✅ Booking confirmed: ${data.booking.id}`);
    console.log(`   💰 Total: ¥${data.booking.pricing.total}`);
  });

  // 5. 清理测试数据
  await test('Delete Test Agent', async () => {
    const res = await fetch(`${BASE_URLS.registry}/api/agents/${registeredAgentId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to delete agent');
    console.log(`   🗑️  Test agent deleted`);
  });

  console.log('\n═══════════════════════════════════════════');
  console.log('              Test Complete!               ');
  console.log('═══════════════════════════════════════════\n');
}

runTests().catch(console.error);
