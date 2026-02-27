export interface IntentInfo {
  type: string
  label: string
  description: string
}

export interface Question {
  id: string
  question: string
  subtitle?: string
  options: { label: string; value: string }[]
}

// 意图识别
export function detectIntent(input: string): IntentInfo {
  const lowerInput = input.toLowerCase()
  
  // 商品采购
  if (/买|购|电脑|手机|相机|衣服|鞋|包|商品|产品|价格|多少钱/.test(lowerInput)) {
    return {
      type: 'shopping',
      label: '商品采购',
      description: '帮你找到最适合的商品，比较价格、性能和口碑'
    }
  }
  
  // 旅行规划
  if (/旅|游|玩|去|行程|酒店|机票|景点|度假|攻略/.test(lowerInput)) {
    return {
      type: 'travel',
      label: '旅行规划',
      description: '为你定制完整的旅行方案，包含行程、住宿和预算'
    }
  }
  
  // 命理咨询
  if (/命|运|势|八字|塔罗|星座|占卜|算命|运势/.test(lowerInput)) {
    return {
      type: 'divination',
      label: '命理咨询',
      description: '提供专业的命理分析，解答你的困惑'
    }
  }
  
  // 学习培训
  if (/学|课|教程|培训|技能|考试|证书/.test(lowerInput)) {
    return {
      type: 'learning',
      label: '学习培训',
      description: '推荐适合你的学习资源和课程'
    }
  }
  
  // 健康医疗
  if (/病|医|药|健康|症状|检查|医院/.test(lowerInput)) {
    return {
      type: 'health',
      label: '健康医疗',
      description: '提供健康相关的信息和建议'
    }
  }
  
  // 默认：通用咨询
  return {
    type: 'general',
    label: '通用咨询',
    description: '为你搜索相关信息和解决方案'
  }
}

// 获取问题列表
export function getQuestions(intentType: string): Question[] {
  const questionMap: Record<string, Question[]> = {
    shopping: [
      {
        id: 'category',
        question: '你想购买什么类型的商品？',
        subtitle: '选择最符合你需求的品类',
        options: [
          { label: '数码电子', value: '数码电子' },
          { label: '服装配饰', value: '服装配饰' },
          { label: '家居用品', value: '家居用品' },
          { label: '美妆护肤', value: '美妆护肤' },
        ]
      },
      {
        id: 'budget',
        question: '你的预算范围是？',
        subtitle: '这有助于我们筛选合适的选项',
        options: [
          { label: '500元以下', value: '预算500以下' },
          { label: '500-2000元', value: '预算500-2000' },
          { label: '2000-5000元', value: '预算2000-5000' },
          { label: '5000元以上', value: '预算5000以上' },
        ]
      },
      {
        id: 'priority',
        question: '你最看重什么？',
        subtitle: '我们会根据优先级推荐',
        options: [
          { label: '性价比', value: '注重性价比' },
          { label: '品牌口碑', value: '注重品牌' },
          { label: '功能性能', value: '注重性能' },
          { label: '外观设计', value: '注重外观' },
        ]
      },
      {
        id: 'timeline',
        question: '你打算什么时候购买？',
        options: [
          { label: '马上买', value: '立即购买' },
          { label: '一周内', value: '一周内购买' },
          { label: '一个月内', value: '一个月内购买' },
          { label: '先了解看看', value: '观望中' },
        ]
      }
    ],
    
    travel: [
      {
        id: 'destination',
        question: '你想去哪里？',
        subtitle: '选择你的目的地类型',
        options: [
          { label: '国内热门城市', value: '国内热门' },
          { label: '国内小众景点', value: '国内小众' },
          { label: '日韩东南亚', value: '亚洲周边' },
          { label: '欧洲美洲', value: '欧美长途' },
        ]
      },
      {
        id: 'duration',
        question: '计划玩几天？',
        options: [
          { label: '周末2天', value: '2天' },
          { label: '3-5天', value: '3-5天' },
          { label: '一周左右', value: '7天左右' },
          { label: '十天以上', value: '10天以上' },
        ]
      },
      {
        id: 'budget',
        question: '人均预算是多少？',
        options: [
          { label: '2000元以下', value: '预算2000以下' },
          { label: '2000-5000元', value: '预算2000-5000' },
          { label: '5000-10000元', value: '预算5000-10000' },
          { label: '10000元以上', value: '预算10000以上' },
        ]
      },
      {
        id: 'style',
        question: '你喜欢什么旅行风格？',
        options: [
          { label: '休闲放松', value: '休闲度假' },
          { label: '打卡景点', value: '景点打卡' },
          { label: '美食探索', value: '美食之旅' },
          { label: '户外冒险', value: '户外冒险' },
        ]
      }
    ],
    
    divination: [
      {
        id: 'type',
        question: '你想咨询什么类型？',
        options: [
          { label: '八字命理', value: '八字命理' },
          { label: '塔罗占卜', value: '塔罗占卜' },
          { label: '星座运势', value: '星座运势' },
          { label: '其他', value: '其他咨询' },
        ]
      },
      {
        id: 'topic',
        question: '主要想了解哪方面？',
        options: [
          { label: '事业财运', value: '事业财运' },
          { label: '感情婚姻', value: '感情婚姻' },
          { label: '健康平安', value: '健康平安' },
          { label: '综合运势', value: '综合运势' },
        ]
      },
      {
        id: 'urgency',
        question: '这是关于近期还是长期？',
        options: [
          { label: '今年运势', value: '年度运势' },
          { label: '近期变化', value: '近期运势' },
          { label: '长期发展', value: '长期发展' },
          { label: '特定事件', value: '特定事件' },
        ]
      }
    ],
    
    learning: [
      {
        id: 'field',
        question: '你想学习什么领域？',
        options: [
          { label: '编程技术', value: '编程技术' },
          { label: '语言学习', value: '语言学习' },
          { label: '职业技能', value: '职业技能' },
          { label: '兴趣爱好', value: '兴趣爱好' },
        ]
      },
      {
        id: 'level',
        question: '你目前的水平是？',
        options: [
          { label: '零基础', value: '零基础' },
          { label: '入门水平', value: '入门' },
          { label: '有一定基础', value: '中级' },
          { label: '想进阶提升', value: '进阶' },
        ]
      },
      {
        id: 'goal',
        question: '学习的主要目的是？',
        options: [
          { label: '工作需要', value: '工作需要' },
          { label: '考证提升', value: '考证提升' },
          { label: '转行就业', value: '转行就业' },
          { label: '个人兴趣', value: '个人兴趣' },
        ]
      }
    ],
    
    health: [
      {
        id: 'topic',
        question: '你想了解什么健康话题？',
        options: [
          { label: '症状查询', value: '症状查询' },
          { label: '医院推荐', value: '医院推荐' },
          { label: '体检建议', value: '体检建议' },
          { label: '健康科普', value: '健康科普' },
        ]
      },
      {
        id: 'urgency',
        question: '紧急程度如何？',
        options: [
          { label: '很紧急', value: '紧急情况' },
          { label: '有点担心', value: '比较担心' },
          { label: '一般了解', value: '一般了解' },
          { label: '预防保健', value: '预防保健' },
        ]
      }
    ],
    
    general: [
      {
        id: 'detail',
        question: '能再具体描述一下你的需求吗？',
        subtitle: '这有助于我们更准确地帮助你',
        options: [
          { label: '需要专业建议', value: '专业建议' },
          { label: '想对比选项', value: '对比选项' },
          { label: '了解最新信息', value: '最新信息' },
          { label: '解决具体问题', value: '具体问题' },
        ]
      },
      {
        id: 'timeline',
        question: '你希望在多久内得到结果？',
        options: [
          { label: '马上需要', value: '立即' },
          { label: '今天内', value: '今天' },
          { label: '这几天', value: '近期' },
          { label: '不着急', value: '不着急' },
        ]
      }
    ]
  }
  
  return questionMap[intentType] || questionMap.general
}

// 生成搜索结果
export function generateResults(intentType: string, _answers: Record<string, string>) {
  const resultMap: Record<string, any[]> = {
    shopping: [
      {
        id: '1',
        title: '小米14 Pro',
        description: '徕卡光学镜头，骁龙8 Gen3，2K超视感屏，性价比极高的旗舰手机',
        price: '¥4999',
        rating: 4.8,
        url: 'https://www.mi.com',
        tags: ['数码', '手机', '高性价比']
      },
      {
        id: '2',
        title: 'iPhone 15 Pro',
        description: 'A17 Pro芯片，钛金属设计，专业级摄像系统',
        price: '¥7999',
        rating: 4.9,
        url: 'https://www.apple.com',
        tags: ['数码', '手机', '品牌旗舰']
      },
      {
        id: '3',
        title: '华为 Mate 60 Pro',
        description: '卫星通话，玄武钢化昆仑玻璃，全焦段超清影像',
        price: '¥6999',
        rating: 4.7,
        url: 'https://www.huawei.com',
        tags: ['数码', '手机', '国产旗舰']
      }
    ],
    
    travel: [
      {
        id: '1',
        title: '京都5日深度游',
        description: '清水寺、金阁寺、岚山竹林，体验正宗日式文化',
        price: '¥6800/人',
        url: 'https://travel.example.com/kyoto',
        tags: ['日本', '文化', '深度游']
      },
      {
        id: '2',
        title: '三亚海棠湾度假套餐',
        description: '五星酒店3晚+接送机+免税店折扣券',
        price: '¥3999/人',
        url: 'https://travel.example.com/sanya',
        tags: ['海南', '度假', '亲子']
      },
      {
        id: '3',
        title: '云南大理丽江7日游',
        description: '苍山洱海、古城漫步、纳西文化体验',
        price: '¥3580/人',
        url: 'https://travel.example.com/yunnan',
        tags: ['云南', '风景', '慢生活']
      }
    ],
    
    divination: [
      {
        id: '1',
        title: '2024年流年运势详批',
        description: '专业命理师一对一分析，包含事业、财运、感情全方位解读',
        price: '¥298',
        url: 'https://divination.example.com/year',
        tags: ['八字', '年度运势', '专业']
      },
      {
        id: '2',
        title: '塔罗牌在线占卜',
        description: 'AI智能解牌+真人复核，爱情、事业、抉择问题',
        price: '¥68',
        url: 'https://divination.example.com/tarot',
        tags: ['塔罗', '即时', 'AI解牌']
      },
      {
        id: '3',
        title: '星座月度运势订阅',
        description: '每月1日推送，包含幸运日、开运建议、注意事项',
        price: '¥18/月',
        url: 'https://divination.example.com/horoscope',
        tags: ['星座', '订阅', '日常']
      }
    ],
    
    learning: [
      {
        id: '1',
        title: 'Python全栈开发训练营',
        description: '从零基础到项目实战，包含Web开发、数据分析、自动化',
        price: '¥2999',
        url: 'https://learning.example.com/python',
        tags: ['编程', '系统课程', '实战']
      },
      {
        id: '2',
        title: '商务英语速成班',
        description: '30天突破口语瓶颈，外企面试、商务谈判场景训练',
        price: '¥1599',
        url: 'https://learning.example.com/english',
        tags: ['语言', '职场', '短期']
      },
      {
        id: '3',
        title: 'PMP项目管理认证',
        description: '全套备考资料+模拟题库+考前冲刺，通过率95%',
        price: '¥3999',
        url: 'https://learning.example.com/pmp',
        tags: ['证书', '管理', '认证']
      }
    ],
    
    health: [
      {
        id: '1',
        title: '三甲医院在线问诊',
        description: '全国三甲医院专家，24小时内回复，支持图文/视频',
        price: '¥50-200',
        url: 'https://health.example.com/consult',
        tags: ['在线问诊', '专家', '便捷']
      },
      {
        id: '2',
        title: '全面体检套餐',
        description: '包含血常规、B超、心电图等30+项检查，全国连锁',
        price: '¥599',
        url: 'https://health.example.com/checkup',
        tags: ['体检', '预防', '全面']
      },
      {
        id: '3',
        title: '心理健康评估',
        description: '专业心理量表+AI初筛+咨询师解读，关注心理健康',
        price: '¥99',
        url: 'https://health.example.com/mental',
        tags: ['心理', '评估', '专业']
      }
    ],
    
    general: [
      {
        id: '1',
        title: '智能助手专业版',
        description: '更强大的AI能力，支持长文本、文件分析、联网搜索',
        price: '¥30/月',
        url: 'https://ai.example.com/pro',
        tags: ['AI工具', '效率', '专业']
      },
      {
        id: '2',
        title: '行业报告数据库',
        description: '覆盖100+行业，每日更新，支持下载和定制',
        price: '¥199/月',
        url: 'https://data.example.com/reports',
        tags: ['数据', '报告', '商业']
      },
      {
        id: '3',
        title: '专家咨询服务',
        description: '各领域资深专家，1对1深度交流，解决复杂问题',
        price: '¥500/小时',
        url: 'https://expert.example.com',
        tags: ['专家', '咨询', '深度']
      }
    ]
  }
  
  return resultMap[intentType] || resultMap.general
}
