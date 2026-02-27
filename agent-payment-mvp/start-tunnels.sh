#!/bin/bash

# 为每个服务创建 Cloudflare Tunnel

echo "Creating Cloudflare Tunnels for Agent Payment MVP..."

# 注册服务 (3001)
echo "Starting tunnel for Registry (3001)..."
cloudflared tunnel --url http://localhost:3001 &
REGISTRY_TUNNEL_PID=$!

sleep 3

# 商户服务 (3002)
echo "Starting tunnel for Merchant (3002)..."
cloudflared tunnel --url http://localhost:3002 &
MERCHANT_TUNNEL_PID=$!

sleep 3

# 用户服务 (3003)
echo "Starting tunnel for User Agent (3003)..."
cloudflared tunnel --url http://localhost:3003 &
USER_TUNNEL_PID=$!

echo ""
echo "Tunnels started! Check the output above for public URLs."
echo ""
echo "Press Ctrl+C to stop all tunnels"

# 等待中断
trap "kill $REGISTRY_TUNNEL_PID $MERCHANT_TUNNEL_PID $USER_TUNNEL_PID 2>/dev/null; exit" INT TERM
wait
