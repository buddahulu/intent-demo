import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../dist')));

// ============ LLM 生成问题 API ============
app.post('/api/question', async (req, res) => {
  try {
    const { intent, intentLabel, userInput, answers, questionCount } = req.body;
    const result = generateQuestion({
      intent,
      intentLabel,
      userInput,
      answers,
      questionCount
    });
    res.json(result);
  } catch (error) {
    console.error('生成问题错误:', error);
    res.status(500).json({ error: '生成问题失败' });
  }
});

// 生成问题的主函数
function generateQuestion({ intent, userInput, answers, questionCount }) {
  const answeredKeys = Object.keys(answers);
  
  switch (intent) {
    case 'travel':
      return generateTravelQuestion(userInput, answers, answeredKeys, questionCount);
    case 'shopping':
      return generateShoppingQuestion(userInput, answers, answeredKeys, questionCount);
    case 'learning':
      return generateLearningQuestion(userInput, answers, answeredKeys, questionCount);
    default:
      return generateGeneralQuestion(userInput, answers, answeredKeys, questionCount);
  }
}

// 旅游问题生成
function generateTravelQuestion(userInput, answers, answeredKeys, questionCount) {
  const isJapan = /日本|东京|大阪|京都|北海道|冲绳/.test(userInput);
  
  if (!answeredKeys.includes('destination')) {
    if (isJapan) {
      return {
        question: {
          id: 'destination',
          question: '你更偏好哪种日本风情？',
          subtitle: '这将决定推荐的城市和景点',
          options: [
            { label: '古都文化 - 寺庙、神社、传统街区', value: '京都' },
            { label: '现代都市 - 购物、美食、夜景', value: '东京' },
            { label: '美食之都 - 街头小吃、当地特色', value: '大阪' },
            { label: '自然风光 - 花海、温泉、雪景', value: '北海道' },
            { label: '海岛度假 - 海滩、潜水、慢生活', value: '冲绳' }
          ]
        }
      };
    }
    
    return {
      question: {
        id: 'destination',
        question: '你想去哪里旅游？',
        subtitle: '选择你的目的地类型',
        options: [
          { label: '国内热门城市', value: '国内热门' },
          { label: '国内小众景点', value: '国内小众' },
          { label: '日韩东南亚', value: '亚洲周边' },
          { label: '欧洲美洲', value: '欧美长途' }
        ]
      }
    };
  }

  if (!answeredKeys.includes('duration')) {
    const destination = answers.destination;
    return {
      question: {
        id: 'duration',
        question: `计划在${destination}玩几天？`,
        subtitle: '行程天数影响推荐内容',
        options: [
          { label: '2-3天 精华游', value: '2-3天' },
          { label: '4-5天 深度游', value: '4-5天' },
          { label: '一周 慢旅行', value: '一周' },
          { label: '十天以上 探索游', value: '十天以上' }
        ]
      }
    };
  }

  if (!answeredKeys.includes('budget')) {
    return {
      question: {
        id: 'budget',
        question: '你的旅行预算是多少？',
        subtitle: '包含机票、住宿、餐饮、交通',
        options: [
          { label: '经济型 - 5000元以下', value: '预算5000以下' },
          { label: '舒适型 - 5000-10000元', value: '预算5000-10000' },
          { label: '品质型 - 10000-20000元', value: '预算10000-20000' },
          { label: '豪华型 - 20000元以上', value: '预算20000以上' }
        ]
      }
    };
  }

  if (!answeredKeys.includes('style')) {
    const destination = answers.destination;
    const styleOptions = {
      '京都': [
        { label: '文化体验 - 寺庙、茶道、和服', value: '文化体验' },
        { label: '美食之旅 - 怀石料理、抹茶甜品', value: '美食之旅' },
        { label: '摄影打卡 - 樱花、红叶、古建筑', value: '摄影打卡' },
        { label: '休闲放松 - 温泉、庭院、慢生活', value: '休闲度假' }
      ],
      '东京': [
        { label: '购物血拼 - 潮牌、药妆、电子产品', value: '购物' },
        { label: '美食探索 - 寿司、拉面、居酒屋', value: '美食之旅' },
        { label: '城市观光 - 塔、神社、博物馆', value: '城市观光' },
        { label: '主题乐园 - 迪士尼、海贼王', value: '主题乐园' }
      ],
      '大阪': [
        { label: '吃货之旅 - 章鱼烧、大阪烧、串炸', value: '美食之旅' },
        { label: '城市漫步 - 道顿堀、心斋桥', value: '城市观光' },
        { label: '环球影城 - 哈利波特、任天堂', value: '主题乐园' },
        { label: '周边一日游 - 京都、奈良', value: '周边游' }
      ],
      '北海道': [
        { label: '自然风光 - 花田、湖泊、森林', value: '自然风光' },
        { label: '美食之旅 - 海鲜、拉面、甜品', value: '美食之旅' },
        { label: '温泉滑雪 - 温泉、滑雪场', value: '温泉滑雪' },
        { label: '自驾探索 - 自由行程、小众景点', value: '自驾' }
      ],
      '冲绳': [
        { label: '海岛度假 - 海滩、潜水、日落', value: '海岛度假' },
        { label: '文化体验 - 琉球文化、首里城', value: '文化体验' },
        { label: '亲子游 - 水族馆、沙滩、亲子活动', value: '亲子游' },
        { label: '美食之旅 - 海葡萄、冲绳面', value: '美食之旅' }
      ]
    };
    
    return {
      question: {
        id: 'style',
        question: `你想怎么玩${destination}？`,
        subtitle: '选择最吸引你的旅行方式',
        options: styleOptions[destination] || styleOptions['京都']
      }
    };
  }

  if (!answeredKeys.includes('companion')) {
    return {
      question: {
        id: 'companion',
        question: '和谁一起出行？',
        subtitle: '不同的同伴有不同的推荐重点',
        options: [
          { label: '独自一人', value: '独自' },
          { label: '情侣/夫妻', value: '情侣' },
          { label: '朋友结伴', value: '朋友' },
          { label: '家庭亲子', value: '亲子' },
          { label: '带父母', value: '带父母' }
        ]
      }
    };
  }

  return { complete: true };
}

// 购物问题生成
function generateShoppingQuestion(userInput, answers, answeredKeys, questionCount) {
  const isLaptop = /电脑|笔记本|MacBook|Mac/i.test(userInput);
  
  if (!answeredKeys.includes('category')) {
    if (isLaptop) {
      return {
        question: {
          id: 'category',
          question: '你主要用电脑做什么？',
          subtitle: '不同用途需要不同的配置',
          options: [
            { label: '办公文档、上网浏览', value: '办公' },
            { label: '视频剪辑、设计创作', value: '创作' },
            { label: '游戏娱乐', value: '游戏' },
            { label: '编程开发', value: '开发' }
          ]
        }
      };
    }
    
    return {
      question: {
        id: 'category',
        question: '你想购买什么类型的商品？',
        options: [
          { label: '数码电子', value: '数码电子' },
          { label: '服装配饰', value: '服装配饰' },
          { label: '家居用品', value: '家居用品' },
          { label: '美妆护肤', value: '美妆护肤' }
        ]
      }
    };
  }

  if (!answeredKeys.includes('budget')) {
    return {
      question: {
        id: 'budget',
        question: '你的预算是多少？',
        options: [
          { label: '4000-6000元', value: '预算4000-6000' },
          { label: '6000-9000元', value: '预算6000-9000' },
          { label: '9000-15000元', value: '预算9000-15000' },
          { label: '15000元以上', value: '预算15000以上' }
        ]
      }
    };
  }

  if (!answeredKeys.includes('priority')) {
    return {
      question: {
        id: 'priority',
        question: '你最看重什么？',
        options: [
          { label: '性价比', value: '性价比' },
          { label: '品牌口碑', value: '品牌' },
          { label: '功能性能', value: '性能' },
          { label: '外观设计', value: '外观' }
        ]
      }
    };
  }

  return { complete: true };
}

// 学习问题生成
function generateLearningQuestion(userInput, answers, answeredKeys, questionCount) {
  if (!answeredKeys.includes('field')) {
    return {
      question: {
        id: 'field',
        question: '你想学习哪门编程语言？',
        subtitle: '不同语言适合不同场景',
        options: [
          { label: 'Python - 人工智能/数据分析', value: 'Python' },
          { label: 'JavaScript - 网页开发', value: 'JavaScript' },
          { label: 'Java - 企业级开发', value: 'Java' },
          { label: 'Go - 云原生/后端', value: 'Go' }
        ]
      }
    };
  }

  if (!answeredKeys.includes('level')) {
    return {
      question: {
        id: 'level',
        question: '你目前的水平是？',
        options: [
          { label: '零基础', value: '零基础' },
          { label: '入门水平', value: '入门' },
          { label: '有一定基础', value: '中级' },
          { label: '想进阶提升', value: '进阶' }
        ]
      }
    };
  }

  if (!answeredKeys.includes('goal')) {
    return {
      question: {
        id: 'goal',
        question: '学习的主要目的是？',
        options: [
          { label: '工作需要', value: '工作需要' },
          { label: '考证提升', value: '考证提升' },
          { label: '转行就业', value: '转行就业' },
          { label: '个人兴趣', value: '个人兴趣' }
        ]
      }
    };
  }

  return { complete: true };
}

// 通用问题生成
function generateGeneralQuestion(userInput, answers, answeredKeys, questionCount) {
  if (questionCount === 0) {
    return {
      question: {
        id: 'detail',
        question: '能再具体描述一下你的需求吗？',
        options: [
          { label: '需要专业建议', value: '专业建议' },
          { label: '想对比选项', value: '对比选项' },
          { label: '了解最新信息', value: '最新信息' },
          { label: '解决具体问题', value: '具体问题' }
        ]
      }
    };
  }

  return { complete: true };
}

// ============ 搜索 API - 返回结构化数据 ============
app.post('/api/search', async (req, res) => {
  try {
    const { query, intent, answers, userInput } = req.body;
    console.log('搜索:', { query, intent, answers });

    const searchResults = generateStructuredResults(query, intent, answers);
    res.json(searchResults);
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// 生成结构化搜索结果
function generateStructuredResults(query, intent, answers) {
  const isJapanTravel = /日本|东京|大阪|京都|北海道|冲绳/.test(query);
  
  if (isJapanTravel || intent === 'travel') {
    const destination = answers?.destination || '日本';
    const style = answers?.style || '';
    const companion = answers?.companion || '';
    const budget = answers?.budget || '';
    
    return {
      query: query,
      summary: `基于你的${destination}${style ? '·' + style : ''}需求，为你找到以下推荐`,
      attractions: getStructuredAttractions(destination, style),
      hotels: getStructuredHotels(destination, companion, budget),
      foods: getStructuredFoods(destination),
      guides: getStructuredGuides(destination, answers?.duration)
    };
  }
  
  return {
    query: query,
    summary: `搜索关键词：${query}`,
    attractions: [],
    hotels: [],
    foods: [],
    guides: []
  };
}

// 结构化景点数据
function getStructuredAttractions(destination, style) {
  const attractionsDB = {
    '京都': {
      '文化体验': [
        {
          id: 'k1',
          name: '清水寺',
          description: '京都最古老的寺院，世界文化遗产，悬空的清水舞台可俯瞰京都市区',
          rating: 4.8,
          reviews: 12580,
          tags: ['世界遗产', '寺庙', '必游'],
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
          location: '东山区',
          openTime: '06:00-18:00',
          price: '400日元'
        },
        {
          id: 'k2',
          name: '金阁寺',
          description: '金碧辉煌的舍利殿倒映在镜湖池中，是日本最具代表性的景观',
          rating: 4.7,
          reviews: 10234,
          tags: ['世界遗产', '庭园', '摄影'],
          image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400',
          location: '北区',
          openTime: '09:00-17:00',
          price: '400日元'
        },
        {
          id: 'k3',
          name: '伏见稻荷大社',
          description: '以千本鸟居闻名世界，供奉稻荷神，是京都最具代表性的神社',
          rating: 4.9,
          reviews: 15678,
          tags: ['神社', '免费', '登山'],
          image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400',
          location: '伏见区',
          openTime: '全天开放',
          price: '免费'
        },
        {
          id: 'k4',
          name: '岚山竹林',
          description: '电影《卧虎藏龙》取景地，竹林小径如梦如幻',
          rating: 4.6,
          reviews: 8923,
          tags: ['自然', '摄影', '散步'],
          image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
          location: '右京区',
          openTime: '全天开放',
          price: '免费'
        }
      ],
      '美食之旅': [
        {
          id: 'k5',
          name: '锦市场',
          description: '京都的厨房，品尝各种京都特色小吃和新鲜食材',
          rating: 4.5,
          reviews: 7654,
          tags: ['市场', '小吃', '购物'],
          image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
          location: '中京区',
          openTime: '09:00-18:00',
          price: '免费'
        },
        {
          id: 'k6',
          name: '先斗町',
          description: '京都著名的花街，两侧是传统的料亭和茶屋，夜晚灯笼亮起别有风情',
          rating: 4.4,
          reviews: 5432,
          tags: ['历史街区', '夜景', '餐饮'],
          image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400',
          location: '东山区',
          openTime: '全天开放',
          price: '免费'
        }
      ],
      'default': [
        {
          id: 'k1',
          name: '清水寺',
          description: '京都最古老的寺院，建于公元778年，世界文化遗产',
          rating: 4.8,
          reviews: 12580,
          tags: ['世界遗产', '寺庙', '必游'],
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
          location: '东山区',
          openTime: '06:00-18:00',
          price: '400日元'
        },
        {
          id: 'k2',
          name: '伏见稻荷大社',
          description: '以数千座朱红色鸟居闻名，是京都最具代表性的神社',
          rating: 4.9,
          reviews: 15678,
          tags: ['神社', '免费', '登山'],
          image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400',
          location: '伏见区',
          openTime: '全天开放',
          price: '免费'
        },
        {
          id: 'k3',
          name: '金阁寺',
          description: '金碧辉煌的舍利殿，日本最具代表性的景观之一',
          rating: 4.7,
          reviews: 10234,
          tags: ['世界遗产', '庭园', '摄影'],
          image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400',
          location: '北区',
          openTime: '09:00-17:00',
          price: '400日元'
        },
        {
          id: 'k4',
          name: '岚山',
          description: '京都著名风景区，以竹林小径、渡月桥、天龙寺闻名',
          rating: 4.6,
          reviews: 8923,
          tags: ['自然', '摄影', '散步'],
          image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
          location: '右京区',
          openTime: '全天开放',
          price: '免费'
        }
      ]
    },
    '东京': {
      'default': [
        {
          id: 't1',
          name: '浅草寺',
          description: '东京最古老的寺庙，雷门大灯笼是标志性景观',
          rating: 4.6,
          reviews: 18923,
          tags: ['寺庙', '传统', '购物街'],
          image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400',
          location: '台东区',
          openTime: '06:00-17:00',
          price: '免费'
        },
        {
          id: 't2',
          name: '东京塔',
          description: '东京地标建筑，高333米，可俯瞰东京全景',
          rating: 4.5,
          reviews: 14567,
          tags: ['地标', '夜景', '观景台'],
          image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400',
          location: '港区',
          openTime: '09:00-23:00',
          price: '1200日元起'
        },
        {
          id: 't3',
          name: '涩谷十字路口',
          description: '世界上最繁忙的十字路口，每次绿灯都有数千人同时穿行',
          rating: 4.4,
          reviews: 12345,
          tags: ['地标', '免费', '摄影'],
          image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400',
          location: '涩谷区',
          openTime: '全天开放',
          price: '免费'
        }
      ]
    },
    '大阪': {
      'default': [
        {
          id: 'o1',
          name: '大阪城',
          description: '日本三大名城之一，丰臣秀吉的居城，天守阁展示丰富历史文物',
          rating: 4.5,
          reviews: 11234,
          tags: ['城堡', '历史', '樱花'],
          image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400',
          location: '中央区',
          openTime: '09:00-17:00',
          price: '600日元'
        },
        {
          id: 'o2',
          name: '道顿堀',
          description: '大阪最繁华的商业区，巨型广告牌和美食闻名',
          rating: 4.4,
          reviews: 15678,
          tags: ['美食', '购物', '夜景'],
          image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400',
          location: '中央区',
          openTime: '全天开放',
          price: '免费'
        },
        {
          id: 'o3',
          name: '环球影城日本',
          description: '哈利波特魔法世界、超级任天堂世界是热门区域',
          rating: 4.8,
          reviews: 9876,
          tags: ['主题乐园', '亲子', '娱乐'],
          image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400',
          location: '此花区',
          openTime: '08:30-21:00',
          price: '7800日元起'
        }
      ]
    }
  };
  
  const destData = attractionsDB[destination] || attractionsDB['京都'];
  return destData[style] || destData['default'] || [];
}

// 结构化酒店数据
function getStructuredHotels(destination, companion, budget) {
  const hotelsDB = {
    '京都': [
      {
        id: 'h1',
        name: '京都四季酒店',
        description: '位于东山区的五星级豪华酒店，拥有传统日式庭院设计',
        price: '¥3500',
        priceLevel: '豪华',
        rating: 4.9,
        reviews: 856,
        location: '东山区',
        distance: '距清水寺1.2km',
        tags: ['五星级', '温泉', '庭园', '服务一流'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        facilities: ['温泉', '餐厅', 'SPA', '接送服务']
      },
      {
        id: 'h2',
        name: '虹夕诺雅京都',
        description: '乘船入住的浪漫度假村，融合传统日式美学与现代舒适',
        price: '¥5000',
        priceLevel: '奢华',
        rating: 4.9,
        reviews: 623,
        location: '西京区',
        distance: '岚山风景区内',
        tags: ['度假村', '乘船入住', '隐私', '极致体验'],
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
        facilities: ['温泉', '怀石料理', '私人码头', '管家服务']
      },
      {
        id: 'h3',
        name: '京都站前酒店',
        description: '交通便利，靠近JR京都站，适合商务和家庭出行',
        price: '¥680',
        priceLevel: '经济',
        rating: 4.3,
        reviews: 2341,
        location: '下京区',
        distance: '距京都站200m',
        tags: ['交通便利', '性价比高', '家庭友好'],
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        facilities: ['免费WiFi', '早餐', '行李寄存']
      },
      {
        id: 'h4',
        name: '京都丽思卡尔顿',
        description: '鸭川河畔的奢华酒店，可欣赏河景，服务细致入微',
        price: '¥4200',
        priceLevel: '豪华',
        rating: 4.8,
        reviews: 567,
        location: '中京区',
        distance: '鸭川河畔',
        tags: ['河景', '奢华', '服务', '位置佳'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        facilities: ['米其林餐厅', 'SPA', '健身房', '礼宾服务']
      }
    ],
    '东京': [
      {
        id: 't1',
        name: '东京帝国酒店',
        description: '历史悠久的豪华酒店，接待过众多国家元首和名人',
        price: '¥3800',
        priceLevel: '豪华',
        rating: 4.8,
        reviews: 1234,
        location: '千代田区',
        distance: '距皇居500m',
        tags: ['历史', '服务', '位置佳'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        facilities: ['多餐厅', 'SPA', '健身房', '商务中心']
      },
      {
        id: 't2',
        name: '新宿格拉斯丽酒店',
        description: '以巨型哥斯拉头像闻名的特色酒店，位于新宿歌舞伎町',
        price: '¥1200',
        priceLevel: '舒适',
        rating: 4.4,
        reviews: 3456,
        location: '新宿区',
        distance: '距新宿站300m',
        tags: ['特色', '便利', '娱乐区'],
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        facilities: ['餐厅', '便利店', '按摩']
      }
    ],
    '大阪': [
      {
        id: 'o1',
        name: '大阪万豪酒店',
        description: '位于日本第一高楼阿倍野Harukas，可俯瞰大阪全景',
        price: '¥2800',
        priceLevel: '豪华',
        rating: 4.7,
        reviews: 987,
        location: '阿倍野区',
        distance: '距天王寺站直连',
        tags: ['高层景观', '豪华', '购物便利'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        facilities: ['观景台', '餐厅', '泳池', '健身房']
      },
      {
        id: 'o2',
        name: '心斋桥胶囊旅馆',
        description: '体验日本特色胶囊住宿，价格实惠，位置绝佳',
        price: '¥280',
        priceLevel: '经济',
        rating: 4.1,
        reviews: 4567,
        location: '中央区',
        distance: '距心斋桥站100m',
        tags: ['胶囊旅馆', '经济', '背包客'],
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
        facilities: ['公共浴室', '储物柜', 'WiFi']
      }
      ]
  };
  
  return hotelsDB[destination] || hotelsDB['京都'];
}

// 结构化美食数据
function getStructuredFoods(destination) {
  const foodsDB = {
    '京都': [
      {
        id: 'f1',
        name: '菊乃井',
        description: '米其林三星怀石料理，注重季节感和摆盘艺术',
        category: '怀石料理',
        price: '¥15000',
        priceLevel: '高端',
        rating: 4.8,
        reviews: 456,
        location: '东山区',
        tags: ['米其林三星', '传统', '预约制'],
        image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400',
        signature: '季节怀石套餐'
      },
      {
        id: 'f2',
        name: '中村藤吉',
        description: '宇治抹茶老铺，抹茶甜品闻名世界',
        category: '甜品',
        price: '¥800',
        priceLevel: '中等',
        rating: 4.6,
        reviews: 2341,
        location: '宇治市',
        tags: ['抹茶', '老字号', '必吃'],
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        signature: '抹茶芭菲、抹茶冰淇淋'
      },
      {
        id: 'f3',
        name: '顺正汤豆腐',
        description: '南禅寺旁的名店，清淡鲜美的汤豆腐',
        category: '汤豆腐',
        price: '¥3000',
        priceLevel: '中等',
        rating: 4.5,
        reviews: 1234,
        location: '东山区',
        tags: ['汤豆腐', '庭园', '素食'],
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        signature: '汤豆腐套餐'
      },
      {
        id: 'f4',
        name: '一兰拉面',
        description: '豚骨汤底浓郁，单人隔间用餐体验独特',
        category: '拉面',
        price: '¥980',
        priceLevel: '平价',
        rating: 4.4,
        reviews: 5678,
        location: '中京区',
        tags: ['拉面', '连锁', '24小时'],
        image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400',
        signature: '天然豚骨拉面'
      }
    ],
    '东京': [
      {
        id: 't1',
        name: '大和寿司',
        description: '筑地市场人气寿司店，新鲜食材直达',
        category: '寿司',
        price: '¥4000',
        priceLevel: '高端',
        rating: 4.7,
        reviews: 1234,
        location: '中央区',
        tags: ['寿司', '新鲜', '人气'],
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
        signature: '特选寿司套餐'
      },
      {
        id: 't2',
        name: '一兰拉面',
        description: '起源于福冈的知名拉面，东京多家分店',
        category: '拉面',
        price: '¥980',
        priceLevel: '平价',
        rating: 4.5,
        reviews: 8901,
        location: '新宿区',
        tags: ['拉面', '连锁', '24小时'],
        image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400',
        signature: '天然豚骨拉面'
      }
    ],
    '大阪': [
      {
        id: 'o1',
        name: '千房',
        description: '道顿堀人气大阪烧名店，铁板烧制的 savory pancake',
        category: '大阪烧',
        price: '¥1200',
        priceLevel: '平价',
        rating: 4.5,
        reviews: 3456,
        location: '中央区',
        tags: ['大阪烧', '人气', '道顿堀'],
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c0a0f9d8?w=400',
        signature: '特制大阪烧'
      },
      {
        id: 'o2',
        name: '元祖串炸达摩',
        description: '新世界通天阁的串炸名店，外酥里嫩',
        category: '串炸',
        price: '¥800',
        priceLevel: '平价',
        rating: 4.3,
        reviews: 2345,
        location: '浪速区',
        tags: ['串炸', '老字号', '通天阁'],
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
        signature: '串炸套餐'
      }
    ]
  };
  
  return foodsDB[destination] || foodsDB['京都'];
}

// 结构化攻略数据
function getStructuredGuides(destination, duration) {
  const durationText = duration || '5日';
  
  return [
    {
      id: 'g1',
      title: `${destination}${durationText.replace('左右', '').replace('以上', '+')}游完整攻略`,
      summary: `详细行程安排、交通指南、住宿推荐、美食攻略。包含签证办理、交通卡购买、必去景点、隐藏美食等实用信息。`,
      source: '携程攻略',
      readTime: '15分钟',
      tags: ['行程规划', '交通', '美食'],
      image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400',
      url: `https://you.ctrip.com/travels/${destination === '京都' ? 'kyoto143' : destination === '东京' ? 'tokyo298' : 'japan100041'}/`
    },
    {
      id: 'g2',
      title: '日本自由行签证办理指南2024',
      summary: '最新签证政策解读，单次/多次签证申请材料清单，办理流程详解，常见问题解答。含签证中心地址和预约方式。',
      source: 'VFS Global',
      readTime: '8分钟',
      tags: ['签证', '行前准备'],
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      url: 'https://www.vfsglobal.cn/japan/china/'
    },
    {
      id: 'g3',
      title: `${destination}交通完全指南`,
      summary: 'JR Pass、地铁一日券、巴士周游券怎么选？详细线路图和换乘指南，省钱交通攻略。',
      source: 'Japan Guide',
      readTime: '12分钟',
      tags: ['交通', '省钱攻略'],
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400',
      url: 'https://www.japan-guide.com/'
    },
    {
      id: 'g4',
      title: `${destination}美食地图： locals推荐`,
      summary: '避开游客陷阱，当地人推荐的隐藏美食店。从平价小吃到米其林，满足不同预算。',
      source: 'Tabelog',
      readTime: '10分钟',
      tags: ['美食', '当地人推荐'],
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
      url: 'https://tabelog.com/'
    }
  ];
}

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
