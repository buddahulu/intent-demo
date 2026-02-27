const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.USER_AGENT_PORT || 3003;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:3001';

app.use(cors());
app.use(bodyParser.json());

// 简单的自然语言解析
function parseBookingIntent(text) {
  const lowerText = text.toLowerCase();
  
  // 提取人数
  let partySize = 2;
  const peopleMatch = text.match(/(\d+)\s*人/);
  if (peopleMatch) {
    partySize = parseInt(peopleMatch[1]);
  }

  // 提取日期
  let date = new Date().toISOString().split('T')[0]; // 默认今天
  const today = new Date();
  
  if (lowerText.includes('明天')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
  } else if (lowerText.includes('后天')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    date = dayAfter.toISOString().split('T')[0];
  } else if (lowerText.includes('今晚') || lowerText.includes('今天')) {
    date = today.toISOString().split('T')[0];
  }

  // 提取时间偏好
  let timePreference = null;
  if (lowerText.includes('中午') || lowerText.includes('午餐')) {
    timePreference = 'lunch';
  } else if (lowerText.includes('晚上') || lowerText.includes('晚餐') || lowerText.includes('今晚')) {
    timePreference = 'dinner';
  }

  // 提取位置
  let location = null;
  const locationMatch = text.match(/(三里屯|国贸|望京|中关村|朝阳|海淀)/);
  if (locationMatch) {
    location = locationMatch[1];
  }

  // 提取菜系
  let cuisine = null;
  if (lowerText.includes('川菜')) cuisine = '川菜';
  else if (lowerText.includes('粤菜')) cuisine = '粤菜';
  else if (lowerText.includes('火锅')) cuisine = '火锅';
  else if (lowerText.includes('烧烤')) cuisine = '烧烤';

  return {
    intent: 'restaurant_booking',
    partySize,
    date,
    timePreference,
    location,
    cuisine,
    originalText: text
  };
}

// 调用发现服务搜索商户
async function searchMerchants(filters) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.location) queryParams.append('location', filters.location);

    const response = await fetch(`${REGISTRY_URL}/api/agents/search?${queryParams}`);
    const data = await response.json();
    
    return data.agents || [];
  } catch (error) {
    console.error('Error searching merchants:', error);
    return [];
  }
}

// 调用商户 Agent 获取信息
async function callMerchantAgent(endpoint, path, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${endpoint}${path}`, options);
    return await response.json();
  } catch (error) {
    console.error(`Error calling merchant agent at ${endpoint}${path}:`, error);
    return { error: error.message };
  }
}

// 存储对话状态
const conversations = new Map();

// ========== API 路由 ==========

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'user-agent',
    timestamp: new Date().toISOString()
  });
});

// 自然语言预订接口
app.post('/api/book', async (req, res) => {
  try {
    const { message, userId = uuidv4(), conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 解析用户意图
    const intent = parseBookingIntent(message);
    console.log('Parsed intent:', intent);

    // 搜索餐厅
    const merchants = await searchMerchants({
      type: 'restaurant',
      location: intent.location || '北京'
    });

    if (merchants.length === 0) {
      return res.json({
        success: false,
        message: '抱歉，没有找到符合条件的餐厅。请尝试其他位置或类型。',
        intent
      });
    }

    // 选择第一个商户（实际可以基于评分、距离等排序）
    const selectedMerchant = merchants[0];
    
    // 查询可用性
    const availabilityResponse = await callMerchantAgent(
      selectedMerchant.endpoint,
      '/api/availability',
      'POST',
      {
        date: intent.date,
        partySize: intent.partySize
      }
    );

    if (!availabilityResponse.success || !availabilityResponse.availability.length) {
      return res.json({
        success: false,
        message: `抱歉，${selectedMerchant.name} 在您选择的时间没有可用桌位。`,
        merchant: {
          name: selectedMerchant.name,
          location: selectedMerchant.location
        },
        intent
      });
    }

    // 根据时间偏好选择时段
    let selectedTimeSlot = availabilityResponse.availability[0];
    if (intent.timePreference === 'lunch') {
      selectedTimeSlot = availabilityResponse.availability.find(a => {
        const hour = parseInt(a.time.split(':')[0]);
        return hour >= 11 && hour <= 14;
      }) || availabilityResponse.availability[0];
    } else if (intent.timePreference === 'dinner') {
      selectedTimeSlot = availabilityResponse.availability.find(a => {
        const hour = parseInt(a.time.split(':')[0]);
        return hour >= 17;
      }) || availabilityResponse.availability[0];
    }

    // 获取推荐菜品
    const recommendationsResponse = await callMerchantAgent(
      selectedMerchant.endpoint,
      `/api/recommendations?partySize=${intent.partySize}`
    );

    // 保存对话状态
    const convId = conversationId || uuidv4();
    conversations.set(convId, {
      id: convId,
      userId,
      merchant: selectedMerchant,
      intent,
      selectedTimeSlot,
      recommendations: recommendationsResponse.recommendations || null,
      status: 'awaiting_confirmation'
    });

    // 构建回复
    const availableTables = selectedTimeSlot.availableTables
      .filter(t => t.suitable)
      .map(t => `${t.capacity}人桌${t.roomFee > 0 ? `(包厢费¥${t.roomFee})` : ''}`)
      .join('、');

    const response = {
      success: true,
      conversationId: convId,
      message: `为您找到 **${selectedMerchant.name}** 📍${selectedMerchant.location}\n\n` +
        `✅ ${intent.date} ${selectedTimeSlot.time} 有可用桌位\n` +
        `👥 适合 ${intent.partySize} 人的桌型: ${availableTables}\n\n` +
        (recommendationsResponse.success ? 
          `💡 推荐菜品（预估 ¥${recommendationsResponse.estimatedTotalWithFees}）：\n` +
          Object.entries(recommendationsResponse.recommendations)
            .filter(([_, items]) => items.length > 0)
            .map(([category, items]) => {
              const names = items.map(i => i.name).join('、');
              return `   ${category === 'coldDishes' ? '凉菜' : 
                      category === 'hotDishes' ? '热菜' : 
                      category === 'soup' ? '汤品' : 
                      category === 'staple' ? '主食' : 
                      category === 'dessert' ? '甜品' : category}: ${names}`;
            }).join('\n') : '') +
        `\n\n请回复 **"确认预订"** 完成预订，或告诉我您的具体需求（如指定时间、菜品等）。`,
      details: {
        merchant: {
          id: selectedMerchant.id,
          name: selectedMerchant.name,
          location: selectedMerchant.location,
          endpoint: selectedMerchant.endpoint
        },
        booking: {
          date: intent.date,
          time: selectedTimeSlot.time,
          partySize: intent.partySize,
          availableTables: selectedTimeSlot.availableTables
        },
        recommendations: recommendationsResponse.recommendations
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error processing booking request:', error);
    res.status(500).json({ 
      error: 'Failed to process booking request', 
      details: error.message 
    });
  }
});

// 确认预订
app.post('/api/book/confirm', async (req, res) => {
  try {
    const { conversationId, customerName, customerPhone, tableType, preOrder = [], specialRequests = '' } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    const conversation = conversations.get(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or expired' });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({
        error: 'Missing required fields: customerName, customerPhone'
      });
    }

    const { merchant, intent, selectedTimeSlot } = conversation;

    // 选择合适的桌型
    const selectedTable = tableType || 
      selectedTimeSlot.availableTables.find(t => t.suitable)?.type || 
      selectedTimeSlot.availableTables[0]?.type;

    // 调用商户 Agent 创建预订
    const bookingResponse = await callMerchantAgent(
      merchant.endpoint,
      '/api/bookings',
      'POST',
      {
        date: intent.date,
        time: selectedTimeSlot.time,
        partySize: intent.partySize,
        customerName,
        customerPhone,
        tableType: selectedTable,
        preOrder,
        specialRequests
      }
    );

    if (!bookingResponse.success) {
      return res.status(400).json({
        success: false,
        message: '预订失败: ' + (bookingResponse.error || 'Unknown error'),
        details: bookingResponse
      });
    }

    // 更新对话状态
    conversation.status = 'confirmed';
    conversation.bookingId = bookingResponse.booking.id;

    // 注册预订到发现服务
    try {
      await fetch(`${REGISTRY_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: merchant.id,
          userId: conversation.userId,
          data: bookingResponse.booking,
          status: 'confirmed'
        })
      });
    } catch (e) {
      console.log('Failed to register booking to registry:', e.message);
    }

    res.json({
      success: true,
      message: `🎉 预订成功！\n\n` +
        `📍 ${merchant.name}\n` +
        `📅 ${bookingResponse.booking.date} ${bookingResponse.booking.time}\n` +
        `👥 ${bookingResponse.booking.partySize} 人\n` +
        `🪑 ${bookingResponse.booking.tableType === 'small' ? '小桌' : 
             bookingResponse.booking.tableType === 'medium' ? '中桌' : 
             bookingResponse.booking.tableType === 'large' ? '大桌(包厢)' : '特大桌(包厢)'}\n` +
        `💰 预估费用: ¥${bookingResponse.booking.pricing.total}\n` +
        `📋 预订号: ${bookingResponse.booking.id}\n\n` +
        `我们会发送确认短信到 ${customerPhone}，请准时到达！`,
      booking: bookingResponse.booking,
      conversationId
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ 
      error: 'Failed to confirm booking', 
      details: error.message 
    });
  }
});

// 查询预订状态
app.get('/api/bookings/:id', async (req, res) => {
  try {
    // 这里应该通过发现服务查询
    const response = await fetch(`${REGISTRY_URL}/api/bookings/${req.params.id}`);
    const data = await response.json();
    
    if (!data.success) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ error: 'Failed to get booking', details: error.message });
  }
});

// 获取对话状态
app.get('/api/conversations/:id', (req, res) => {
  const conversation = conversations.get(req.params.id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json({
    success: true,
    conversation: {
      id: conversation.id,
      status: conversation.status,
      merchant: {
        name: conversation.merchant.name,
        location: conversation.merchant.location
      },
      intent: conversation.intent,
      bookingId: conversation.bookingId
    }
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`👤 User Agent running on port ${PORT}`);
  console.log(`   Registry: ${REGISTRY_URL}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
