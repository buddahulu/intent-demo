# 日本旅游意图识别 Demo

一个智能需求助手，当用户选择"日本旅游"意图后，根据用户回答的问题（目的地、天数、预算、风格）构造搜索查询，返回真实的搜索结果（景点、酒店、攻略等）。

## 在线演示

**公网访问地址**: https://grass-rounds-prescribed-secrets.trycloudflare.com

## 功能特性

1. **意图识别**: 自动识别用户输入中的日本旅游意图
2. **智能问答**: 根据旅游意图询问目的地、天数、预算、风格
3. **搜索查询构造**: 根据用户输入构造搜索查询，如"日本京都5日游攻略 预算5000"
4. **分类结果展示**: 以卡片形式展示景点、酒店、美食、攻略等分类结果

## 支持的日本城市

- 京都 - 古寺、神社、传统日式文化
- 东京 - 现代都市、购物、美食
- 大阪 - 美食之都、环球影城
- 北海道 - 自然风光、薰衣草花田
- 冲绳 - 海岛度假、美丽海水族馆

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Node.js + Express
- **搜索**: 模拟百度搜索数据（可接入真实 API）

## 本地运行

```bash
# 安装依赖
npm install

# 构建前端
npm run build

# 启动服务器
npm run server

# 访问 http://localhost:3000
```

## API 接口

### POST /api/search

搜索接口，根据查询返回分类结果。

**请求参数**:
```json
{
  "query": "日本京都5日游攻略",
  "intent": "travel",
  "answers": {
    "destination": "亚洲周边",
    "duration": "一周左右",
    "budget": "预算5000-10000",
    "style": "休闲度假"
  },
  "userInput": "计划带家人去日本京都玩一周"
}
```

**响应结果**:
```json
{
  "query": "日本京都5日游攻略",
  "summary": "基于你的京都一周左右旅游需求，为你找到以下推荐",
  "attractions": [...],  // 景点
  "hotels": [...],       // 酒店
  "foods": [...],        // 美食
  "guides": [...]        // 攻略
}
```

## 测试示例

### 示例 1: 京都文化游
- 输入: "计划带家人去日本京都玩一周"
- 目的地: 亚洲周边
- 天数: 一周左右
- 预算: 5000-10000元
- 风格: 休闲度假

### 示例 2: 大阪美食游
- 输入: "想去大阪吃美食"
- 目的地: 亚洲周边
- 天数: 3-5天
- 预算: 2000-5000元
- 风格: 美食探索

### 示例 3: 东京购物游
- 输入: "想去东京购物"
- 目的地: 亚洲周边
- 天数: 一周左右
- 预算: 10000元以上
- 风格: 打卡景点

## 项目结构

```
intent-demo/
├── src/
│   ├── pages/
│   │   ├── EntryPage.tsx        # 首页输入
│   │   ├── IntentConfirmPage.tsx # 意图确认
│   │   ├── QuestionFlowPage.tsx  # 问答流程
│   │   └── ResultPage.tsx        # 搜索结果（已改造）
│   ├── data/
│   │   └── intents.ts            # 意图配置
│   └── App.tsx
├── server/
│   └── index.js                  # Express 服务器
├── dist/                         # 构建输出
└── package.json
```

## 改造说明

### 改造内容

1. **ResultPage.tsx**: 
   - 添加了真实搜索 API 调用
   - 根据用户答案构建搜索查询
   - 分类展示景点、酒店、美食、攻略

2. **server/index.js**:
   - 新增 Express 服务器
   - 实现 `/api/search` 接口
   - 根据城市返回对应的景点、酒店、美食数据

3. **数据模拟**:
   - 目前使用本地模拟数据
   - 可接入真实百度搜索 API（Brave Search 等）

### 接入真实搜索

如需接入真实搜索，修改 `server/index.js`:

```javascript
// 使用 Brave Search API
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

async function performRealSearch(query) {
  const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
    headers: {
      'X-Subscription-Token': BRAVE_API_KEY
    },
    params: { q: query, count: 10 }
  });
  return await response.json();
}
```

## 许可证

MIT
