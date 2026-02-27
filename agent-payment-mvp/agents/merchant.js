const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.MERCHANT_PORT || 3002;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:3001';

app.use(cors());
app.use(bodyParser.json());

// 餐厅数据
const restaurantData = {
  name: '美味轩中餐厅',
  description: '正宗川菜，环境优雅，适合家庭聚餐和朋友聚会',
  location: '北京市朝阳区三里屯',
  cuisine: '川菜',
  rating: 4.8,
  priceRange: '¥¥¥',
  
  // 菜单
  menu: [
    { id: 'dish_1', name: '宫保鸡丁', price: 48, category: '热菜', description: '经典川菜，麻辣鲜香' },
    { id: 'dish_2', name: '麻婆豆腐', price: 32, category: '热菜', description: '嫩滑豆腐配特制辣酱' },
    { id: 'dish_3', name: '水煮鱼', price: 88, category: '招牌菜', description: '新鲜活鱼，麻辣过瘾' },
    { id: 'dish_4', name: '回锅肉', price: 52, category: '热菜', description: '传统川菜，肥而不腻' },
    { id: 'dish_5', name: '口水鸡', price: 46, category: '凉菜', description: '嫩滑鸡肉配麻辣酱汁' },
    { id: 'dish_6', name: '担担面', price: 28, category: '主食', description: '四川特色面食' },
    { id: 'dish_7', name: '酸辣汤', price: 22, category: '汤品', description: '开胃解腻' },
    { id: 'dish_8', name: '红糖糍粑', price: 26, category: '甜品', description: '传统四川甜品' }
  ],

  // 可用时间段（简化版，实际应该根据日期动态生成）
  timeSlots: [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ],

  // 桌位配置
  tables: {
    small: { capacity: 2, count: 6, price: 0 },    // 2人桌
    medium: { capacity: 4, count: 8, price: 0 },   // 4人桌
    large: { capacity: 8, count: 4, price: 100 },  // 8人桌，包厢费100
    xlarge: { capacity: 12, count: 2, price: 200 } // 12人桌，包厢费200
  }
};

// 预订存储（内存中）
const bookings = new Map();

// 生成可用桌位
function getAvailableTables(date, time, partySize) {
  const bookedTables = Array.from(bookings.values())
    .filter(b => b.date === date && b.time === time && b.status !== 'cancelled')
    .map(b => b.tableType);

  const available = [];
  for (const [type, config] of Object.entries(restaurantData.tables)) {
    const bookedCount = bookedTables.filter(t => t === type).length;
    const availableCount = config.count - bookedCount;
    
    if (availableCount > 0 && config.capacity >= partySize) {
      available.push({
        type,
        capacity: config.capacity,
        availableCount,
        roomFee: config.price,
        suitable: config.capacity >= partySize && config.capacity <= partySize + 2
      });
    }
  }

  return available.sort((a, b) => a.capacity - b.capacity);
}

// 计算订单总价
function calculateTotal(orderItems, tableType) {
  let foodTotal = 0;
  const itemDetails = [];

  for (const item of orderItems) {
    const dish = restaurantData.menu.find(d => d.id === item.dishId);
    if (dish) {
      const quantity = item.quantity || 1;
      const subtotal = dish.price * quantity;
      foodTotal += subtotal;
      itemDetails.push({
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity,
        subtotal
      });
    }
  }

  const roomFee = restaurantData.tables[tableType]?.price || 0;
  const serviceFee = Math.round(foodTotal * 0.1); // 10% 服务费
  const total = foodTotal + roomFee + serviceFee;

  return {
    items: itemDetails,
    foodTotal,
    roomFee,
    serviceFee,
    total
  };
}

// ========== API 路由 ==========

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'merchant-agent',
    restaurant: restaurantData.name,
    timestamp: new Date().toISOString()
  });
});

// 获取餐厅信息
app.get('/api/restaurant', (req, res) => {
  res.json({
    success: true,
    restaurant: {
      name: restaurantData.name,
      description: restaurantData.description,
      location: restaurantData.location,
      cuisine: restaurantData.cuisine,
      rating: restaurantData.rating,
      priceRange: restaurantData.priceRange
    }
  });
});

// 获取菜单
app.get('/api/menu', (req, res) => {
  const { category } = req.query;
  let menu = restaurantData.menu;
  
  if (category) {
    menu = menu.filter(item => item.category === category);
  }

  res.json({
    success: true,
    count: menu.length,
    menu
  });
});

// 查询可用时间和桌位
app.post('/api/availability', (req, res) => {
  try {
    const { date, partySize } = req.body;

    if (!date || !partySize) {
      return res.status(400).json({
        error: 'Missing required fields: date, partySize'
      });
    }

    const availability = [];
    for (const time of restaurantData.timeSlots) {
      const tables = getAvailableTables(date, time, parseInt(partySize));
      if (tables.length > 0) {
        availability.push({
          time,
          availableTables: tables
        });
      }
    }

    res.json({
      success: true,
      date,
      partySize,
      availability
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability', details: error.message });
  }
});

// 创建预订
app.post('/api/bookings', (req, res) => {
  try {
    const { 
      date, 
      time, 
      partySize, 
      customerName, 
      customerPhone, 
      tableType = 'small',
      preOrder = [],
      specialRequests = ''
    } = req.body;

    // 验证必填字段
    if (!date || !time || !partySize || !customerName || !customerPhone) {
      return res.status(400).json({
        error: 'Missing required fields: date, time, partySize, customerName, customerPhone'
      });
    }

    // 检查可用性
    const availableTables = getAvailableTables(date, time, parseInt(partySize));
    const selectedTable = availableTables.find(t => t.type === tableType);
    
    if (!selectedTable) {
      return res.status(400).json({
        error: 'Selected table type not available for this time slot',
        availableOptions: availableTables
      });
    }

    // 计算价格
    const pricing = calculateTotal(preOrder, tableType);

    // 创建预订
    const booking = {
      id: uuidv4(),
      date,
      time,
      partySize: parseInt(partySize),
      customerName,
      customerPhone,
      tableType,
      preOrder: pricing.items,
      specialRequests,
      pricing,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    bookings.set(booking.id, booking);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id: booking.id,
        restaurant: restaurantData.name,
        date: booking.date,
        time: booking.time,
        partySize: booking.partySize,
        customerName: booking.customerName,
        tableType: booking.tableType,
        status: booking.status,
        pricing: booking.pricing
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

// 获取预订详情
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.get(req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({
    success: true,
    booking: {
      id: booking.id,
      restaurant: restaurantData.name,
      date: booking.date,
      time: booking.time,
      partySize: booking.partySize,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      tableType: booking.tableType,
      preOrder: booking.preOrder,
      specialRequests: booking.specialRequests,
      status: booking.status,
      pricing: booking.pricing,
      createdAt: booking.createdAt
    }
  });
});

// 取消预订
app.post('/api/bookings/:id/cancel', (req, res) => {
  const booking = bookings.get(req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking already cancelled' });
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    bookingId: booking.id,
    status: booking.status
  });
});

// 获取推荐菜品
app.get('/api/recommendations', (req, res) => {
  const { partySize = 2 } = req.query;
  const size = parseInt(partySize);
  
  // 根据人数推荐菜品数量
  const recommendations = {
    coldDishes: restaurantData.menu.filter(i => i.category === '凉菜').slice(0, Math.min(2, size)),
    hotDishes: restaurantData.menu.filter(i => i.category === '热菜' || i.category === '招牌菜').slice(0, Math.min(3, size + 1)),
    soup: restaurantData.menu.filter(i => i.category === '汤品').slice(0, 1),
    staple: restaurantData.menu.filter(i => i.category === '主食').slice(0, Math.min(2, Math.ceil(size / 2))),
    dessert: restaurantData.menu.filter(i => i.category === '甜品').slice(0, 1)
  };

  const estimatedTotal = [
    ...recommendations.coldDishes,
    ...recommendations.hotDishes,
    ...recommendations.soup,
    ...recommendations.staple,
    ...recommendations.dessert
  ].reduce((sum, item) => sum + item.price, 0);

  res.json({
    success: true,
    partySize: size,
    recommendations,
    estimatedTotal,
    estimatedTotalWithFees: Math.round(estimatedTotal * 1.1) // 含服务费估算
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🍽️  Merchant Agent (Restaurant) running on port ${PORT}`);
  console.log(`   Restaurant: ${restaurantData.name}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
