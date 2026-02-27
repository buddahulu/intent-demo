#!/bin/bash

# Agent Payment MVP - 服务管理脚本

cd /root/.openclaw/workspace/agent-payment-mvp

ACTION=${1:-start}

start_services() {
    echo "🚀 Starting Agent Payment MVP services..."
    
    # 启动注册服务
    if ! pgrep -f "node.*registry" > /dev/null; then
        REGISTRY_PORT=3001 node services/registry.js > /tmp/registry.log 2>&1 &
        echo "Registry started on port 3001"
    fi
    sleep 2
    
    # 启动商户服务
    if ! pgrep -f "node.*merchant" > /dev/null; then
        MERCHANT_PORT=3002 REGISTRY_URL=http://localhost:3001 node agents/merchant.js > /tmp/merchant.log 2>&1 &
        echo "Merchant started on port 3002"
    fi
    sleep 2
    
    # 启动用户服务
    if ! pgrep -f "node.*user-agent" > /dev/null; then
        USER_AGENT_PORT=3003 REGISTRY_URL=http://localhost:3001 node agents/user-agent.js > /tmp/user-agent.log 2>&1 &
        echo "User Agent started on port 3003"
    fi
    sleep 2
    
    # 注册商户
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
        }' > /dev/null 2>&1
    
    echo "✅ Services started!"
    echo ""
    echo "Local URLs:"
    echo "  Registry:  http://localhost:3001"
    echo "  Merchant:  http://localhost:3002"
    echo "  UserAgent: http://localhost:3003"
}

start_tunnels() {
    echo "🌐 Starting Cloudflare Tunnels..."
    
    # 检查 cloudflared
    if ! command -v cloudflared &> /dev/null; then
        echo "❌ cloudflared not found"
        return 1
    fi
    
    # 启动 tunnels
    cloudflared tunnel --url http://localhost:3001 > /tmp/tunnel-registry.log 2>&1 &
    sleep 5
    
    cloudflared tunnel --url http://localhost:3002 > /tmp/tunnel-merchant.log 2>&1 &
    sleep 5
    
    cloudflared tunnel --url http://localhost:3003 > /tmp/tunnel-user.log 2>&1 &
    sleep 5
    
    # 获取 URLs
    REGISTRY_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-registry.log | head -1)
    MERCHANT_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-merchant.log | head -1)
    USER_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-user.log | head -1)
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  🌐 PUBLIC URLS"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "📋 Registry:  ${REGISTRY_URL}"
    echo "🍽️  Merchant:  ${MERCHANT_URL}"
    echo "👤 UserAgent: ${USER_URL}"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    
    # 保存到文件
    cat > /tmp/agent-mvp-urls.txt << EOF
REGISTRY_URL=${REGISTRY_URL}
MERCHANT_URL=${MERCHANT_URL}
USER_URL=${USER_URL}
EOF
}

stop_services() {
    echo "🛑 Stopping services..."
    pkill -f "node.*registry" 2>/dev/null
    pkill -f "node.*merchant" 2>/dev/null
    pkill -f "node.*user-agent" 2>/dev/null
    pkill -f cloudflared 2>/dev/null
    echo "✅ All services stopped"
}

show_status() {
    echo "📊 Service Status:"
    echo ""
    
    if pgrep -f "node.*registry" > /dev/null; then
        echo "  ✅ Registry: Running (port 3001)"
    else
        echo "  ❌ Registry: Stopped"
    fi
    
    if pgrep -f "node.*merchant" > /dev/null; then
        echo "  ✅ Merchant: Running (port 3002)"
    else
        echo "  ❌ Merchant: Stopped"
    fi
    
    if pgrep -f "node.*user-agent" > /dev/null; then
        echo "  ✅ UserAgent: Running (port 3003)"
    else
        echo "  ❌ UserAgent: Stopped"
    fi
    
    if pgrep -f cloudflared > /dev/null; then
        echo "  ✅ Tunnels: Running"
        if [ -f /tmp/agent-mvp-urls.txt ]; then
            echo ""
            cat /tmp/agent-mvp-urls.txt
        fi
    else
        echo "  ❌ Tunnels: Stopped"
    fi
}

test_services() {
    echo "🧪 Testing services..."
    echo ""
    
    # 本地测试
    echo "Local tests:"
    curl -s http://localhost:3001/health && echo "  ✅ Registry OK"
    curl -s http://localhost:3002/health && echo "  ✅ Merchant OK"
    curl -s http://localhost:3003/health && echo "  ✅ UserAgent OK"
    
    # 公网测试
    if [ -f /tmp/agent-mvp-urls.txt ]; then
        source /tmp/agent-mvp-urls.txt
        echo ""
        echo "Public URL tests:"
        curl -s ${REGISTRY_URL}/health > /dev/null && echo "  ✅ Registry Tunnel OK"
        curl -s ${MERCHANT_URL}/health > /dev/null && echo "  ✅ Merchant Tunnel OK"
        curl -s ${USER_URL}/health > /dev/null && echo "  ✅ UserAgent Tunnel OK"
    fi
}

case $ACTION in
    start)
        start_services
        ;;
    tunnel)
        start_tunnels
        ;;
    all)
        start_services
        sleep 3
        start_tunnels
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        ;;
    status)
        show_status
        ;;
    test)
        test_services
        ;;
    *)
        echo "Usage: $0 {start|tunnel|all|stop|restart|status|test}"
        echo ""
        echo "Commands:"
        echo "  start   - Start local services only"
        echo "  tunnel  - Start Cloudflare tunnels only"
        echo "  all     - Start services and tunnels"
        echo "  stop    - Stop all services"
        echo "  restart - Restart local services"
        echo "  status  - Show service status"
        echo "  test    - Test services"
        ;;
esac
