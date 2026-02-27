#!/bin/bash

# 日本旅游意图识别 Demo 测试脚本

API_URL="https://grass-rounds-prescribed-secrets.trycloudflare.com/api/search"

echo "=========================================="
echo "日本旅游意图识别 Demo 测试"
echo "=========================================="
echo ""

# 测试 1: 京都旅游
echo "测试 1: 京都文化游"
echo "-------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "日本京都5日游攻略",
    "intent": "travel",
    "answers": {
      "destination": "亚洲周边",
      "duration": "一周左右",
      "budget": "预算5000-10000",
      "style": "休闲度假"
    },
    "userInput": "计划带家人去日本京都玩一周"
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'查询: {d[\"query\"]}'); print(f'摘要: {d[\"summary\"]}'); print(f'景点: {len(d[\"attractions\"])}个'); print(f'酒店: {len(d[\"hotels\"])}个'); print(f'美食: {len(d[\"foods\"])}个'); print(f'攻略: {len(d[\"guides\"])}个')"

echo ""

# 测试 2: 大阪旅游
echo "测试 2: 大阪美食游"
echo "-------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "日本大阪3日游攻略",
    "intent": "travel",
    "answers": {
      "destination": "亚洲周边",
      "duration": "3-5天",
      "budget": "预算2000-5000",
      "style": "美食探索"
    },
    "userInput": "想去大阪吃美食"
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'查询: {d[\"query\"]}'); print(f'摘要: {d[\"summary\"]}'); print(f'景点: {len(d[\"attractions\"])}个'); print(f'酒店: {len(d[\"hotels\"])}个'); print(f'美食: {len(d[\"foods\"])}个'); print(f'攻略: {len(d[\"guides\"])}个')"

echo ""

# 测试 3: 东京旅游
echo "测试 3: 东京购物游"
echo "-------------------"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "日本东京7日游攻略",
    "intent": "travel",
    "answers": {
      "destination": "亚洲周边",
      "duration": "一周左右",
      "budget": "预算10000以上",
      "style": "打卡景点"
    },
    "userInput": "想去东京购物"
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'查询: {d[\"query\"]}'); print(f'摘要: {d[\"summary\"]}'); print(f'景点: {len(d[\"attractions\"])}个'); print(f'酒店: {len(d[\"hotels\"])}个'); print(f'美食: {len(d[\"foods\"])}个'); print(f'攻略: {len(d[\"guides\"])}个')"

echo ""
echo "=========================================="
echo "测试完成！"
echo "前端访问: https://grass-rounds-prescribed-secrets.trycloudflare.com"
echo "=========================================="
