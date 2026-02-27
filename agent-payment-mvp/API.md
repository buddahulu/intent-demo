# Agent Payment MVP - API 文档

## 🌐 公网访问地址

| 服务 | 公网 URL | 本地地址 |
|------|----------|----------|
| 🔍 Agent Registry | https://soldiers-memo-galleries-handy.trycloudflare.com | http://localhost:3001 |
| 🍽️ Merchant Agent | https://leads-accepting-states-engine.trycloudflare.com | http://localhost:3002 |
| 👤 User Agent | https://some-fixtures-wishlist-doing.trycloudflare.com | http://localhost:3003 |

---

## 📋 Agent Registry API (发现服务)

### 健康检查
```bash
curl https://soldiers-memo-galleries-handy.trycloudflare.com/health
```

### 注册 Agent
```bash
curl -X POST https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新餐厅",
    "type": "restaurant",
    "location": "北京市海淀区",
    "endpoint": "http://localhost:3004",
    "description": "新开的餐厅",
    "capabilities": ["menu_query", "booking"],
    "metadata": {"cuisine": "粤菜", "rating": 4.5}
  }'
```

### 搜索 Agent
```bash
# 按类型搜索
curl "https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/search?type=restaurant"

# 按位置搜索
curl "https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/search?location=北京"

# 组合搜索
curl "https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/search?type=restaurant&location=三里屯"
```

### 获取 Agent 详情
```bash
curl https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/{agent_id}
```

### 更新 Agent
```bash
curl -X PUT https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/{agent_id} \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

### 删除 Agent
```bash
curl -X DELETE https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/{agent_id}
```

---

## 🍽️ Merchant Agent API (餐厅服务)

### 健康检查
```bash
curl https://leads-accepting-states-engine.trycloudflare.com/health
```

### 获取餐厅信息
```bash
curl https://leads-accepting-states-engine.trycloudflare.com/api/restaurant
```

### 获取菜单
```bash
# 获取全部菜单
curl https://leads-accepting-states-engine.trycloudflare.com/api/menu

# 按分类筛选
curl "https://leads-accepting-states-engine.trycloudflare.com/api/menu?category=热菜"
```

### 查询可用性
```bash
curl -X POST https://leads-accepting-states-engine.trycloudflare.com/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-27",
    "partySize": 4
  }'
```

### 创建预订
```bash
curl -X POST https://leads-accepting-states-engine.trycloudflare.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-27",
    "time": "18:30",
    "partySize": 4,
    "customerName": "张三",
    "customerPhone": "13800138000",
    "tableType": "medium",
    "specialRequests": "靠窗位置"
  }'
```

### 获取预订详情
```bash
curl https://leads-accepting-states-engine.trycloudflare.com/api/bookings/{booking_id}
```

### 取消预订
```bash
curl -X POST https://leads-accepting-states-engine.trycloudflare.com/api/bookings/{booking_id}/cancel
```

### 获取推荐菜品
```bash
curl "https://leads-accepting-states-engine.trycloudflare.com/api/recommendations?partySize=4"
```

---

## 👤 User Agent API (用户对话)

### 健康检查
```bash
curl https://some-fixtures-wishlist-doing.trycloudflare.com/health
```

### 自然语言预订
```bash
curl -X POST https://some-fixtures-wishlist-doing.trycloudflare.com/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "message": "订个餐厅，4人，今晚",
    "userId": "user_123"
  }'
```

**支持的表达方式：**
- "订个餐厅，4人，今晚"
- "明天中午2人位"
- "后天晚上6人，川菜"
- "三里屯附近餐厅，3人"

### 确认预订
```bash
curl -X POST https://some-fixtures-wishlist-doing.trycloudflare.com/api/book/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_xxx",
    "customerName": "张三",
    "customerPhone": "13800138000"
  }'
```

---

## 🧪 完整测试流程

```bash
# 1. 健康检查
curl https://soldiers-memo-galleries-handy.trycloudflare.com/health
curl https://leads-accepting-states-engine.trycloudflare.com/health
curl https://some-fixtures-wishlist-doing.trycloudflare.com/health

# 2. 搜索餐厅
curl "https://soldiers-memo-galleries-handy.trycloudflare.com/api/agents/search?type=restaurant"

# 3. 获取菜单
curl https://leads-accepting-states-engine.trycloudflare.com/api/menu

# 4. 自然语言预订
curl -X POST https://some-fixtures-wishlist-doing.trycloudflare.com/api/book \
  -H "Content-Type: application/json" \
  -d '{"message": "订个餐厅，4人，今晚", "userId": "user_123"}'

# 5. 确认预订（使用上一步返回的 conversationId）
curl -X POST https://some-fixtures-wishlist-doing.trycloudflare.com/api/book/confirm \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "xxx", "customerName": "张三", "customerPhone": "13800138000"}'
```

---

## 📊 系统架构

```
用户 → User Agent → Agent Registry → Merchant Agent
         ↓                ↓
    自然语言处理    服务发现与注册
```

---

## 🔧 技术栈

- **Node.js** + **Express** - 后端服务
- **内存存储** - 数据层
- **Cloudflare Tunnel** - 公网访问

---

## 🚀 本地启动

```bash
cd /root/.openclaw/workspace/agent-payment-mvp

# 安装依赖
npm install

# 启动所有服务
./manage.sh all

# 或分别启动
./manage.sh start    # 本地服务
./manage.sh tunnel   # 公网隧道

# 查看状态
./manage.sh status

# 测试
./manage.sh test

# 停止
./manage.sh stop
```
