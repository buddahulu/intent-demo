#!/usr/bin/env python3
"""使用 Perplexity API 搜索意图电商和心理
咨询结合的案例"""

import json
import urllib.request
from pathlib import Path

config_path = Path.home() / '.openclaw' / 'openclaw.json'
with open(config_path, 'r') as f:
    config = json.load(f)

api_key = config['skills']['entries']['perplexity']['apiKey']

queries = [
    "AI 意图理解 心理咨询 用户需求拆解 案例",
    "conversational commerce intent understanding psychological counseling user needs",
    "AI shopping assistant mental model user intent decomposition case studies",
    "意图电商 用户心理分析 结构性需求拆解 成功案例",
    "AI therapist approach to user needs understanding ecommerce implementation"
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
                "content": "You are a research assistant. Provide detailed case studies with specific examples and implementation details."
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
