#!/usr/bin/env python3
"""使用 Perplexity API 搜索 GEO 电商自动化案例"""

import json
import urllib.request
from pathlib import Path


# 读取 API Key
config_path = Path.home() / '.openclaw' / 'openclaw.json'
with open(config_path, 'r') as f:
    config = json.load(f)


api_key = config['skills']['entries']['perplexity']['apiKey']


# 搜索查询
queries = [
    "GEO Generative Engine Optimization e-commerce automation success case studies 2024",
    "AI shopping assistant intent understanding case studies conversion rates",
    "Schema.org automated structured data e-commerce LLM SEO success examples",
    "对话式电商 AI 助手 案例 成功",
    "跨平台电商聚合 意图识别 成交转化 案例"
]


headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

for query in queries:
    print(f"\n{'='*70}")
    print(f"搜索: {query}")
    print('='*70)
    
    data = {
        "model": "sonar",
        "messages": [
            {
                "role": "system",
                "content": "You are a research assistant. Provide detailed case studies with specific numbers and sources."
            },
            {
                "role": "user",
                "content": query
            }
        ],
        "max_tokens": 1500
    }
    
    req = urllib.request.Request(
        "https://api.perplexity.ai/chat/completions",
        data=json.dumps(data).encode(),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            content = result['choices'][0]['message']['content']
            print(content)
    except Exception as e:
        print(f"Error: {e}")
