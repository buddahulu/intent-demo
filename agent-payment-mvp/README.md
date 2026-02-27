# Agent Payment MVP

多 Agent 餐厅预订系统原型，展示 Agent 之间的发现、通信和支付流程。

## 架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   用户 Agent     │────▶│  Agent Registry │◀────│   商户 Agent     │
│  (自然语言接口)   │     │   (发现服务)     │     │  (餐厅服务)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         └───────────────────┬───────────────────────────┘
                             │
                    ┌─────────▼─────────┐
                    │     预订流程       │
                    │ 1. 搜索商户        │
                    │ 2. 查询可用性      │
                    │ 3. 创建预订        │
                    │ 4. 确认支付        │
                    └───────────────────┘
```

## 服务端口

| 服务 | 端口 | 描述 |
|------|------|------|
| Agent Registry | 3001 | 服务发现与注册 |
| Merchant Agent | 3002 | 餐厅商户服务 |
| User Agent | 3003 | 用户对话接口 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动所有服务

```bash
npm start
```

或者分别启动：

```bash
# 终端 1: 注册服务
npm run registry

# 终端 2: 商户 Agent
npm run merchant

# 终端 3: 用户 Agent
npm run user-agent
```

### 3. 运行测试

```bash
npm test
```

## API 文档

### Agent Registry (端口 3001)

#### 健康检查
```http
GET /health
```

#### 注册 Agent
```http
POST /api/agents/register
Content-Type: application/json

{
  "name": "餐厅名称",
  "type": "restaurant",
  "location": "北京市朝阳区",
  "endpoint": "http://localhost:3002",
  "description": "餐厅描述",
  "capabilities": ["menu_query", "booking"],
  "metadata": { "rating": 4.8 }
}
```

#### 搜索 Agent
```http
GET /api/agents/search?type=restaurant&location=北京
```

#### 获取 Agent
```http
GET /api/agents/:id
```

#### 更新 Agent
```http
PUT /api/agents/:id
Content-Type: application/json

{
  "status": "inactive"
}
```

#### 删除 Agent
```http
DELETE /api/agents/:id
```

### Merchant Agent (端口 3002)

#### 健康检查
```http
GET /health
```

#### 获取餐厅信息
```http
GET /api/restaurant
```

#### 获取菜单
```http
GET /api/menu?category=热菜
```

#### 查询可用性
```http
POST /api/availability
Content-Type: application/json

{
  "date": "2024-02-27",
  "partySize": 4
}
```

#### 创建预订
```http
POST /api/bookings
Content-Type: application/json

{
  "date": "2024-02-27",
  "time": "18:30",
  "partySize": 4,
  "customerName": "张三",
  "customerPhone": "13800138000",
  "tableType": "medium",
  "preOrder": [{"dishId": "dish_1", "quantity": 1}],
  "specialRequests": "靠窗位置"
}
```

#### 获取预订
```http
GET /api/bookings/:id
```

#### 取消预订
```http
POST /api/bookings/:id/cancel
```

#### 获取推荐菜品
```http
GET /api/recommendations?partySize=4
```

### User Agent (端口 3003)

#### 健康检查
```http
GET /health
```

#### 自然语言预订
```http
POST /api/book
Content-Type: application/json

{
  "message": "订个餐厅，4人，今晚",
  "userId": "user_123"
}
```

响应包含：
- 匹配的餐厅信息
- 可用时间段
- 推荐菜品
- 预估价格
- 对话 ID（用于确认）

#### 确认预订
```http
POST /api/book/confirm
Content-Type: application/json

{
  "conversationId": "conv_xxx",
  "customerName": "张三",
  "customerPhone": "13800138000",
  "tableType": "medium",
  "specialRequests": "靠窗位置"
}
```

#### 查询预订状态
```http
GET /api/bookings/:id
```

#### 获取对话状态
```http
GET /api/conversations/:id
```

## 测试示例

### 场景 1: 自然语言预订

```bash
# 1. 发送预订请求
curl -X POST http://localhost:3003/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "message": "订个餐厅，4人，今晚",
    "userId": "user_123"
  }'

# 2. 使用返回的 conversationId 确认预订
curl -X POST http://localhost:3003/api/book/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "xxx",
    "customerName": "张三",
    "customerPhone": "13800138000"
  }'
```

### 场景 2: 直接调用商户服务

```bash
# 查询可用时间
curl -X POST http://localhost:3002/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-27",
    "partySize": 4
  }'

# 创建预订
curl -X POST http://localhost:3002/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-27",
    "time": "18:30",
    "partySize": 4,
    "customerName": "张三",
    "customerPhone": "13800138000"
  }'
```

### 场景 3: 服务发现

```bash
# 注册新商户
curl -X POST http://localhost:3001/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新餐厅",
    "type": "restaurant",
    "location": "北京市海淀区",
    "endpoint": "http://localhost:3004"
  }'

# 搜索商户
curl "http://localhost:3001/api/agents/search?type=restaurant&location=北京"
```

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `REGISTRY_PORT` | 3001 | 注册服务端口 |
| `MERCHANT_PORT` | 3002 | 商户服务端口 |
| `USER_AGENT_PORT` | 3003 | 用户服务端口 |
| `REGISTRY_URL` | http://localhost:3001 | 注册服务地址 |
| `DB_PATH` | ./data/registry.db | 数据库路径 |

## 技术栈

- **Node.js** - 运行时
- **Express** - Web 框架
- **better-sqlite3** - 数据库
- **UUID** - 唯一标识符生成

## 项目结构

```
agent-payment-mvp/
├── services/
│   └── registry.js      # Agent 注册与发现服务
├── agents/
│   ├── merchant.js      # 商户 Agent (餐厅)
│   └── user-agent.js    # 用户 Agent
├── shared/
│   └── database.js      # SQLite 数据库封装
├── test/
│   └── test.js          # 测试脚本
├── data/                # 数据库文件
├── start.js             # 启动脚本
└── README.md
```

## 后续扩展

- [ ] 添加支付接口集成
- [ ] 实现 Agent 间加密通信
- [ ] 添加用户认证与授权
- [ ] 支持更多商户类型（酒店、机票等）
- [ ] 添加实时通知（WebSocket）
- [ ] 实现智能推荐算法
