#!/bin/bash

cd /root/.openclaw/workspace/agent-payment-mvp

# 停止已有服务
pkill -f "node.*registry" 2>/dev/null
pkill -f "node.*merchant" 2>/dev/null
pkill -f "node.*user-agent" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null
sleep 1

echo "═══════════════════════════════════════════"
echo "  Agent Payment MVP - Starting Services   "
echo "═══════════════════════════════════════════"
echo ""

# 启动注册服务
echo "[1/6] Starting Registry Service on port 3001..."
REGISTRY_PORT=3001 node services/registry.js > /tmp/registry.log 2>&1 &
sleep 3

# 启动商户服务
echo "[2/6] Starting Merchant Agent on port 3002..."
MERCHANT_PORT=3002 REGISTRY_URL=http://localhost:3001 node agents/merchant.js > /tmp/merchant.log 2>&1 &
sleep 3

# 启动用户服务
echo "[3/6] Starting User Agent on port 3003..."
USER_AGENT_PORT=3003 REGISTRY_URL=http://localhost:3001 node agents/user-agent.js > /tmp/user-agent.log 2>&1 &
sleep 3

# 注册商户到发现服务
echo "[4/6] Registering merchant to registry..."
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

# 启动 Cloudflare Tunnels
echo "[5/6] Starting Cloudflare Tunnels..."

cloudflared tunnel --url http://localhost:3001 > /tmp/tunnel-registry.log 2>&1 &
sleep 5
REGISTRY_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-registry.log | head -1)

cloudflared tunnel --url http://localhost:3002 > /tmp/tunnel-merchant.log 2>&1 &
sleep 5
MERCHANT_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-merchant.log | head -1)

cloudflared tunnel --url http://localhost:3003 > /tmp/tunnel-user.log 2>&1 &
sleep 5
USER_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-user.log | head -1)

# 保存 URLs
echo "[6/6] Saving configuration..."
cat > /tmp/agent-mvp-urls.txt << EOF
═══════════════════════════════════════════════════════════════
  Agent Payment MVP - Public URLs
═══════════════════════════════════════════════════════════════

📋 Agent Registry (发现服务)
   URL: ${REGISTRY_URL}
   Local: http://localhost:3001

🍽️  Merchant Agent (餐厅服务)
   URL: ${MERCHANT_URL}
   Local: http://localhost:3002

👤 User Agent (用户对话)
   URL: ${USER_URL}
   Local: http://localhost:3003

═══════════════════════════════════════════════════════════════

测试命令:

# 健康检查
curl ${REGISTRY_URL}/health
curl ${MERCHANT_URL}/health
curl ${USER_URL}/health

# 搜索餐厅
curl "${REGISTRY_URL}/api/agents/search?type=restaurant"

# 获取菜单
curl ${MERCHANT_URL}/api/menu

# 自然语言预订
curl -X POST ${USER_URL}/api/book \\
  -H "Content-Type: application/json" \\
  -d '{"message": "订个餐厅，4人，今晚", "userId": "user_123"}'

═══════════════════════════════════════════════════════════════
EOF

cat /tmp/agent-mvp-urls.txt

echo ""
echo "✅ All services started successfully!"
echo ""
echo "日志文件:"
echo "  Registry:  /tmp/registry.log"
echo "  Merchant:  /tmp/merchant.log"
echo "  UserAgent: /tmp/user-agent.log"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 保持运行
trap "echo 'Stopping services...'; pkill -f cloudflared; pkill -f 'node.*registry'; pkill -f 'node.*merchant'; pkill -f 'node.*user-agent'; exit" INT TERM
while true; do sleep 1; done
