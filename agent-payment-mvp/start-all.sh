#!/bin/bash

cd /root/.openclaw/workspace/agent-payment-mvp

# 停止已有服务
pkill -f "node.*registry" 2>/dev/null
pkill -f "node.*merchant" 2>/dev/null
pkill -f "node.*user-agent" 2>/dev/null
sleep 1

echo "Starting Agent Payment MVP services..."

# 启动注册服务
REGISTRY_PORT=3001 node services/registry.js &
REGISTRY_PID=$!
echo "Registry started (PID: $REGISTRY_PID)"

sleep 2

# 启动商户服务
MERCHANT_PORT=3002 REGISTRY_URL=http://localhost:3001 node agents/merchant.js &
MERCHANT_PID=$!
echo "Merchant started (PID: $MERCHANT_PID)"

sleep 2

# 启动用户服务
USER_AGENT_PORT=3003 REGISTRY_URL=http://localhost:3001 node agents/user-agent.js &
USER_PID=$!
echo "User Agent started (PID: $USER_PID)"

sleep 2

# 注册商户到发现服务
curl -s -X POST http://localhost:3001/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "美味轩中餐厅",
    "type": "restaurant",
    "location": "北京市朝阳区三里屯",
    "endpoint": "http://localhost:3002",
    "description": "正宗川菜，环境优雅，适合家庭聚餐和朋友聚会",
    "capabilities": ["menu_query", "availability_check", "booking", "payment"],
    "metadata": {"cuisine": "川菜", "rating": 4.8, "priceRange": "¥¥¥"}
  }' > /dev/null

echo "Merchant registered to registry"

# 保存 PID
echo $REGISTRY_PID > /tmp/agent-mvp.pids
echo $MERCHANT_PID >> /tmp/agent-mvp.pids
echo $USER_PID >> /tmp/agent-mvp.pids

echo ""
echo "All services started!"
echo "Registry:  http://localhost:3001"
echo "Merchant:  http://localhost:3002"
echo "UserAgent: http://localhost:3003"
