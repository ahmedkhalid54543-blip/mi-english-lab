/**
 * Mi English 场景学习 v1.9
 * 结构: 场景大厅 + 场景详情(词汇图谱/互动问答)
 */

const SCENARIO_PROGRESS_KEY = 'mi-english-scenario-progress-v1';
const SCENARIO_MISTAKES_KEY = 'mi-english-scenario-mistakes-v1';
const SCENE_PASS_RATE = 0.8;
const SCENE_CORRECT_XP = 4;
const SCENE_PASS_BONUS_XP = 10;
const UNIVERSAL_RESCUE_SENTENCE = 'That is a great question, and I want to give you the most accurate answer, so let me quickly confirm the exact details for you and I will come back to you in one minute.';

const CATEGORY_LABELS = {
  all: '全部场景',
  'Store Service': '门店服务',
  'Partner Communication': '协作沟通',
  'Presentation Skills': '产品讲解',
  'Cross-cultural Meeting': '跨文化会议'
};

const SCENARIOS = [
  {
    id: 'store-service-needs',
    category: 'Store Service',
    title: '门店接待全流程',
    subtitle: 'Store Service & Needs',
    summary: '按真实门店接待链路训练：开场欢迎、需求确认、介绍演示、异议处理、不会说时救场、成交道别。',
    audience: '岗位覆盖: 零售管理部 / 中国区门店 / 新零售',
    level: 'A2-B1',
    duration: 12,
    lessons: ['L02', 'L17', 'L19'],
    icon: 'fa-store',
    image: 'assets/scenes/store-service-needs.jpg',
    colors: ['#ffd7bf', '#dbeafe'],
    universalRescue: "That's a great question. Let me check and get back to you right away.",
    journeyIntro: '你是一名门店销售顾问。目标是在一次完整接待中，既专业又自然地完成需求确认、推荐、答疑和成交闭环。',
    flowSteps: [
      {
        id: 'greeting',
        title: '开场欢迎',
        goal: '建立信任',
        coachTip: '先欢迎再提开放问题，让顾客自然开口。',
        rescue: 'Welcome! What brings you in today?'
      },
      {
        id: 'needs',
        title: '需求确认',
        goal: '问出重点',
        coachTip: '不要立刻推荐，先确认优先级和预算区间。',
        rescue: 'To recommend the right one, may I ask your top priority?'
      },
      {
        id: 'demo',
        title: '介绍与演示',
        goal: '给出方案',
        coachTip: '先说“为什么推荐”，再给“可感知体验”。',
        rescue: 'Based on your needs, this one is a good fit. Let me show you quickly.'
      },
      {
        id: 'objection',
        title: '异议处理',
        goal: '稳住意向',
        coachTip: '先共情，再给替代路径，例如分期或以旧换新。',
        rescue: 'I understand your concern. Let us look at value and plan options.'
      },
      {
        id: 'unknown',
        title: '不会说时救场',
        goal: '保持专业',
        coachTip: '不硬答，明确“我去确认 + 返回时间”。',
        rescue: 'Great question. Let me verify the exact info and come back in one minute.'
      },
      {
        id: 'closing',
        title: '成交与道别',
        goal: '完成闭环',
        coachTip: '成交时主动陪同到收银，并补充售后与感谢。',
        rescue: 'I will assist checkout and prepare your receipt and warranty details.'
      }
    ],
    vocab: [
      { en: 'store entrance', zh: '店门口', phonetic: '/stɔːr ˈentrəns/', usage: 'Please welcome walk-in customers at the store entrance.' },
      { en: 'budget range', zh: '预算区间', phonetic: '/ˈbʌdʒɪt reɪndʒ/', usage: 'May I know your budget range first?' },
      { en: 'product demo area', zh: '产品体验区', phonetic: '/ˈprɒdʌkt ˈdɛməʊ ˈeəriə/', usage: 'Let us move to the product demo area for a quick trial.' },
      { en: 'in stock', zh: '有库存', phonetic: '/ɪn stɒk/', usage: 'This model is in stock in black and blue.' },
      { en: 'payment plan', zh: '分期方案', phonetic: '/ˈpeɪmənt plæn/', usage: 'We can also check a flexible payment plan for you.' },
      { en: 'shopping bag', zh: '购物袋', phonetic: '/ˈʃɒpɪŋ bæɡ/', usage: 'Here is your shopping bag. Thank you for choosing us.' }
    ],
    quiz: [
      {
        id: 'Q1',
        stepId: 'greeting',
        situation: '开场欢迎',
        promptEn: 'A foreign customer walks in and looks around. How do you open the conversation?',
        promptZh: '一位外国顾客刚进店在看样机，你会怎么开场？',
        options: [
          { label: 'A', en: 'Welcome! What are you looking for today?', zh: '欢迎光临！您今天主要想看哪类产品？' },
          { label: 'B', en: 'Need help?', zh: '需要帮助吗？' },
          { label: 'C', en: 'This is our newest model.', zh: '这是我们最新款。' }
        ],
        answerIndex: 0,
        rationale: '完整欢迎 + 开放提问，既礼貌又能快速进入需求确认。',
        upgrade: 'Welcome in. What matters most for your next phone today?'
      },
      {
        id: 'Q2',
        stepId: 'needs',
        situation: '需求确认',
        promptEn: 'The customer says: "I need a good camera and long battery life." What is your best follow-up?',
        promptZh: '顾客说“我想要拍照好、续航长”，你接下来怎么问最专业？',
        options: [
          { label: 'A', en: 'Which is more important for you, camera quality or battery life?', zh: '对您来说，拍照和续航哪个优先级更高？' },
          { label: 'B', en: 'Then you should buy our top model.', zh: '那您就买我们最高配吧。' },
          { label: 'C', en: 'Most customers choose the 256GB version.', zh: '多数顾客都选256GB版本。' }
        ],
        answerIndex: 0,
        rationale: '先收集决策信息再推荐，会让建议更有针对性、更像顾问。',
        upgrade: 'I can tailor two options once I know your top priority and budget.'
      },
      {
        id: 'Q3',
        stepId: 'demo',
        situation: '介绍与演示',
        promptEn: 'You now know the customer values camera and has a mid-range budget. How do you move forward?',
        promptZh: '你已了解顾客重视拍照且预算中档，下一句怎么推进最顺？',
        options: [
          { label: 'A', en: 'Based on your needs, this model is a strong fit. Would you like a quick camera demo?', zh: '基于您的需求，这款很匹配。要不要我给您做个快速拍照演示？' },
          { label: 'B', en: 'This model is popular, so it should be fine.', zh: '这款卖得很好，应该没问题。' },
          { label: 'C', en: 'Please read this brochure first.', zh: '您先看看这份宣传册。' }
        ],
        answerIndex: 0,
        rationale: '“推荐理由 + 立即体验”是门店转化效率最高的组合动作。',
        upgrade: 'I can show portrait mode and night shots in one minute.'
      },
      {
        id: 'Q4',
        stepId: 'objection',
        situation: '异议处理',
        promptEn: 'After the demo, the customer says: "It looks good, but the price is a bit high."',
        promptZh: '试机后顾客说“看起来不错，但价格有点高”，你怎么回应更稳？',
        options: [
          { label: 'A', en: 'I understand. We can compare total value, trade-in, and monthly payment options.', zh: '理解，我们可以一起看总价值、以旧换新和月付方案。' },
          { label: 'B', en: 'Price is fixed, but quality is better.', zh: '价格是固定的，不过品质更好。' },
          { label: 'C', en: 'This is normal for new models.', zh: '新机这个价位很正常。' }
        ],
        answerIndex: 0,
        rationale: '先共情再给可选路径，能降低抗拒感并保留购买意向。',
        upgrade: 'If you want, I can estimate your trade-in value right now.'
      },
      {
        id: 'Q5',
        stepId: 'unknown',
        situation: '不会说时救场',
        promptEn: 'The customer asks a technical detail you are not 100% sure about. What should you say?',
        promptZh: '顾客追问一个你不完全确定的技术细节，怎么答才专业？',
        options: [
          { label: 'A', en: 'Great question. Let me confirm the exact spec and come back in one minute.', zh: '这个问题很好，我去确认准确参数，一分钟内回复您。' },
          { label: 'B', en: 'I am not sure. Maybe it is around that level.', zh: '我不太确定，可能大概是那个水平。' },
          { label: 'C', en: 'Please check it online later.', zh: '您可以稍后自己上网查一下。' }
        ],
        answerIndex: 0,
        rationale: '关键是“承认需核实 + 明确返回时间”，避免硬答导致信任下降。',
        upgrade: 'Thanks for waiting. Here is the official spec from our product sheet.'
      },
      {
        id: 'Q6',
        stepId: 'closing',
        situation: '成交与道别',
        promptEn: 'The customer decides to buy. How do you close the service professionally?',
        promptZh: '顾客决定购买后，怎么收口最完整？',
        options: [
          { label: 'A', en: 'Great choice. I will assist checkout and prepare your receipt and warranty details.', zh: '非常好的选择，我带您去收银并准备好小票和保修信息。' },
          { label: 'B', en: 'Please pay at the cashier over there.', zh: '请到那边收银台付款。' },
          { label: 'C', en: 'Thanks. Come again next time.', zh: '谢谢，下次再来。' }
        ],
        answerIndex: 0,
        rationale: '主动陪同结账 + 售后信息说明，才是完整服务闭环。',
        upgrade: 'If you need setup support, we are happy to help anytime.'
      }
    ]
  },
  {
    id: 'product-introduction',
    category: 'Presentation Skills',
    title: '产品介绍与对比推荐',
    subtitle: 'Product Introduction',
    summary: '对齐门店和GTM常见表达，突出卖点，不做硬推。',
    audience: '岗位覆盖: 零售管理部 / 手机GTM / AIoTGTM',
    level: 'B1',
    duration: 10,
    lessons: ['L03', 'L08', 'L12'],
    icon: 'fa-mobile-screen-button',
    image: 'assets/scenes/product-introduction.jpg',
    colors: ['#ffe2cf', '#d6f4ff'],
    universalRescue: "Good question. Let me show you a quick comparison so you can see the difference.",
    journeyIntro: '你在门店接待一位有明确购买意向的顾客。目标是完成一条完整的讲解链路：先确认关注点，再演示价值，处理价格顾虑，最后自然推进成交。',
    flowSteps: [
      {
        id: 'open',
        title: '开场框定',
        goal: '建立预期',
        coachTip: '先说明演示结构和时长，让顾客愿意继续听。',
        rescue: 'Let me walk you through this in two minutes.'
      },
      {
        id: 'need',
        title: '确认关注点',
        goal: '明确重点',
        coachTip: '先确认客户最看重什么，再进入对比讲解。',
        rescue: 'Before we compare, may I confirm your top priority?'
      },
      {
        id: 'demo',
        title: '演示关键差异',
        goal: '建立价值',
        coachTip: '讲差异时聚焦 1-2 个核心卖点并给可感知体验。',
        rescue: 'Let me show you the key difference with a quick demo.'
      },
      {
        id: 'objection',
        title: '处理价格顾虑',
        goal: '降低阻力',
        coachTip: '先共情，再给方案路径（分期、以旧换新、长期价值）。',
        rescue: 'I understand your concern. Let us compare the value and options.'
      },
      {
        id: 'assurance',
        title: '强化购买信心',
        goal: '消除风险',
        coachTip: '用售后与保修信息降低顾客的决策焦虑。',
        rescue: 'We have clear warranty and after-sales support in your city.'
      },
      {
        id: 'close',
        title: '自然推进成交',
        goal: '完成闭环',
        coachTip: '不强推，用“我先帮你准备”保持节奏。',
        rescue: 'If you like, I can prepare this option while you decide.'
      }
    ],
    vocab: [
      { en: 'key feature', zh: '核心卖点', phonetic: '/kiː ˈfiːtʃər/', usage: 'The key feature is low-light camera performance.' },
      { en: 'battery life', zh: '续航表现', phonetic: '/ˈbætəri laɪf/', usage: 'Battery life can support a full working day.' },
      { en: 'camera stabilization', zh: '防抖能力', phonetic: '/ˈkæmərə ˌsteɪbəlaɪˈzeɪʃən/', usage: 'This model has better camera stabilization for video.' },
      { en: 'side-by-side comparison', zh: '并排对比', phonetic: '/saɪd baɪ saɪd kəmˈpærɪsən/', usage: 'Let us do a side-by-side comparison.' },
      { en: 'trade-in value', zh: '以旧换新价值', phonetic: '/ˈtreɪd ɪn ˈvæljuː/', usage: 'You can save more with trade-in value.' },
      { en: 'after-sales support', zh: '售后支持', phonetic: '/ˈɑːftər seɪlz səˈpɔːrt/', usage: 'After-sales support is available at local service centers.' }
    ],
    quiz: [
      {
        id: 'Q1',
        stepId: 'open',
        situation: '开场展示',
        promptEn: 'How do you start a product demo professionally?',
        promptZh: '如何开启演示更专业？',
        options: [
          { label: 'A', en: 'I will quickly show the main highlights first.', zh: '我先快速给您看几个主要亮点。' },
          { label: 'B', en: 'Let me walk you through the key features in 2 minutes.', zh: '我用两分钟带您看核心卖点。' },
          { label: 'C', en: 'Before demo, may I know your main use case?', zh: '演示前我想先确认您的主要使用场景。' }
        ],
        answerIndex: 1,
        rationale: '限定时间并说明目标，客户更愿意听下去。',
        upgrade: 'I will focus on camera, battery, and smoothness.'
      },
      {
        id: 'Q2',
        stepId: 'need',
        situation: '对比提问',
        promptEn: 'Customer asks: "What is the difference vs last year?"',
        promptZh: '顾客问和去年款差别，你怎么答？',
        options: [
          { label: 'A', en: 'Design is similar, with moderate upgrades this year.', zh: '外观相近，但今年有中等幅度升级。' },
          { label: 'B', en: 'The biggest upgrades are battery life and camera stabilization.', zh: '最大升级是续航和防抖。' },
          { label: 'C', en: 'Performance is better, but I need to check exact numbers.', zh: '性能确实更好，不过具体参数我再核对一下。' }
        ],
        answerIndex: 1,
        rationale: '抓两点关键升级，信息密度高且易记。',
        upgrade: 'You can feel the difference in this quick video test.'
      },
      {
        id: 'Q3',
        stepId: 'demo',
        situation: '引导试机',
        promptEn: 'How do you invite a hands-on trial?',
        promptZh: '如何邀请用户上手体验？',
        options: [
          { label: 'A', en: 'You can test the camera right now.', zh: '现在可以直接试拍。' },
          { label: 'B', en: 'You can watch me demonstrate it first.', zh: '我先给您演示，您再看要不要试。' },
          { label: 'C', en: 'Hands-on trial is available after checkout.', zh: '付款后也可以再体验。' }
        ],
        answerIndex: 0,
        rationale: '让用户上手比口头描述更有说服力。',
        upgrade: 'Try portrait mode first, then we compare details.'
      },
      {
        id: 'Q4',
        stepId: 'objection',
        situation: '价格敏感',
        promptEn: 'Customer says price is high. What is better?',
        promptZh: '顾客觉得贵，怎么回应更好？',
        options: [
          { label: 'A', en: 'If budget is tight, we can simplify accessories first.', zh: '如果预算紧，可以先简化配件方案。' },
          { label: 'B', en: 'I understand. Let us compare long-term value and trade-in options.', zh: '理解，我们可以对比长期价值和以旧换新方案。' },
          { label: 'C', en: 'This model is expensive mainly because it is new.', zh: '这款价格高主要因为是新品。' }
        ],
        answerIndex: 1,
        rationale: '先共情，再给解决路径，避免对抗。',
        upgrade: 'Your monthly cost can be lower with the current plan.'
      },
      {
        id: 'Q5',
        stepId: 'assurance',
        situation: '担心售后',
        promptEn: 'Customer worries about after-sales support.',
        promptZh: '顾客担心售后，你怎么说？',
        options: [
          { label: 'A', en: 'Warranty is standard; details are available online.', zh: '保修是标准政策，详细条款官网可查。' },
          { label: 'B', en: 'We provide nationwide after-sales support and clear warranty terms.', zh: '我们有全国售后网点和清晰保修条款。' },
          { label: 'C', en: 'Most users have no issues, so it should be fine.', zh: '大多数用户都没问题，基本可以放心。' }
        ],
        answerIndex: 1,
        rationale: '给出具体保障信息，能降低购买风险感知。',
        upgrade: 'I can show the service policy in your city right now.'
      },
      {
        id: 'Q6',
        stepId: 'close',
        situation: '收尾推动',
        promptEn: 'How do you close without pressure?',
        promptZh: '如何不强推地推进成交？',
        options: [
          { label: 'A', en: 'This offer is good today, so you may decide now.', zh: '今天优惠不错，您可以考虑今天定下来。' },
          { label: 'B', en: 'Would you like me to prepare this option while you decide?', zh: '您考虑时我先帮您准备这款，可以吗？' },
          { label: 'C', en: 'Take your time, and contact me if you need details later.', zh: '您可以慢慢考虑，后续需要信息随时联系我。' }
        ],
        answerIndex: 1,
        rationale: '给客户空间，同时保持成交节奏。',
        upgrade: 'I can also note this as your preferred configuration.'
      }
    ]
  },
  {
    id: 'inventory-allocation',
    category: 'Partner Communication',
    title: '库存协同与调拨沟通',
    subtitle: 'Inventory & Allocation',
    summary: '门店、销售管理和渠道接口常见沟通，重点在时间承诺和透明更新。',
    audience: '岗位覆盖: 零售管理部 / 销售管理部 / 渠道接口',
    level: 'B1',
    duration: 9,
    lessons: ['L04', 'L13', 'L18'],
    icon: 'fa-box-open',
    image: 'assets/scenes/inventory-allocation.jpg',
    colors: ['#d2f9ea', '#dcf0ff'],
    universalRescue: "Let me check the latest status and update you with an exact timeline shortly.",
    journeyIntro: '你需要把一次“缺货请求”处理成“可执行协同”：先稳住客户，再拉通仓配，再对内汇报风险，最后给出预订方案。',
    flowSteps: [
      {
        id: 'acknowledge',
        title: '缺货当下回应',
        goal: '先稳住客户',
        coachTip: '回应要包含“现状 + 立即动作”，不要只说缺货。',
        rescue: 'Let me check the transfer options and update you shortly.'
      },
      {
        id: 'sync',
        title: '内部快速协同',
        goal: '拿到承诺',
        coachTip: '内部沟通必须带数量和时间点，避免模糊请求。',
        rescue: 'Could you confirm quantity and ETA for this request?'
      },
      {
        id: 'update',
        title: '对客进度更新',
        goal: '建立信任',
        coachTip: '更新时优先给“最新状态 + 预计时间”。',
        rescue: 'Thanks for waiting. I will share the latest ETA with you now.'
      },
      {
        id: 'alternative',
        title: '替代方案引导',
        goal: '减少流失',
        coachTip: '先尊重意愿，再提供可替代方案，不要强推。',
        rescue: 'If you prefer not to wait, I can show a close alternative in stock.'
      },
      {
        id: 'report',
        title: '风险上报管理',
        goal: '争取资源',
        coachTip: '对经理汇报要有量化口径和时间窗口。',
        rescue: 'Current safety stock is limited. We need replenishment before Friday.'
      },
      {
        id: 'reserve',
        title: '预订收口',
        goal: '锁定意向',
        coachTip: '愿意等待的客户，优先给“预订 + 锁价”方案。',
        rescue: 'We can place a backorder now and lock the current price for you.'
      }
    ],
    vocab: [
      { en: 'inventory check', zh: '库存核查', phonetic: '/ˈɪnvəntəri tʃek/', usage: 'I will complete an inventory check in ten minutes.' },
      { en: 'transfer request', zh: '调拨申请', phonetic: '/ˈtrænsfər rɪˈkwest/', usage: 'We raised a transfer request to the nearby warehouse.' },
      { en: 'lead time', zh: '到货周期', phonetic: '/liːd taɪm/', usage: 'Current lead time is about three working days.' },
      { en: 'safety stock', zh: '安全库存', phonetic: '/ˈseɪfti stɒk/', usage: 'We need safety stock before the campaign starts.' },
      { en: 'replenishment', zh: '补货', phonetic: '/rɪˈplenɪʃmənt/', usage: 'Replenishment is planned for Thursday afternoon.' },
      { en: 'backorder', zh: '缺货预订', phonetic: '/ˈbækɔːrdər/', usage: 'You can place a backorder and lock the current price.' }
    ],
    quiz: [
      {
        id: 'Q1',
        stepId: 'acknowledge',
        situation: '缺货当下',
        promptEn: 'Customer asks for a model that is out of stock.',
        promptZh: '顾客要的机型缺货，怎么说更稳妥？',
        options: [
          { label: 'A', en: 'This color is unavailable today, and I am checking incoming stock now.', zh: '这个颜色今天没有，我正在核查到货计划。' },
          { label: 'B', en: 'This color is out of stock now. I can check transfer options for you.', zh: '这个颜色暂时缺货，我可以马上帮您查调拨方案。' },
          { label: 'C', en: 'We may restock soon, but I do not have a confirmed ETA yet.', zh: '预计会补货，但目前还没有确认到店时间。' }
        ],
        answerIndex: 1,
        rationale: '问题+动作一起说，用户会更安心。',
        upgrade: 'I will update you with an exact ETA today.'
      },
      {
        id: 'Q2',
        stepId: 'sync',
        situation: '内部协同',
        promptEn: 'How do you ask warehouse for support quickly?',
        promptZh: '你要给仓库发支持请求，怎么表达？',
        options: [
          { label: 'A', en: 'Please prioritize this transfer request today.', zh: '请今天优先处理这笔调拨。' },
          { label: 'B', en: 'Could you confirm if we can transfer 20 units by tomorrow noon?', zh: '请确认是否可在明天中午前调拨20台。' },
          { label: 'C', en: 'Could you move whatever stock is convenient first?', zh: '方便的话先调一些库存过来。' }
        ],
        answerIndex: 1,
        rationale: '带数量和时间点，协作效率最高。',
        upgrade: 'This request is linked to weekend traffic in Store A.'
      },
      {
        id: 'Q3',
        stepId: 'update',
        situation: '客户催进度',
        promptEn: 'Customer asks for an update again after two hours.',
        promptZh: '顾客两小时后追问进度，怎么回？',
        options: [
          { label: 'A', en: 'Latest status is still pending transfer approval.', zh: '最新状态是调拨审批还在处理中。' },
          { label: 'B', en: 'Thanks for waiting. The transfer is confirmed and ETA is tomorrow 3 PM.', zh: '感谢等待，调拨已确认，预计明天下午3点到店。' },
          { label: 'C', en: 'No new update yet; I will message you once there is progress.', zh: '目前还没有新进展，一有更新我第一时间通知您。' }
        ],
        answerIndex: 1,
        rationale: '给明确状态与时间，是最关键的信任点。',
        upgrade: 'I will send you a message once it arrives.'
      },
      {
        id: 'Q4',
        stepId: 'alternative',
        situation: '临时替代',
        promptEn: 'How do you offer an alternative model politely?',
        promptZh: '如何礼貌推荐替代机型？',
        options: [
          { label: 'A', en: 'The closest alternative has similar battery performance.', zh: '这款替代机型在续航上最接近。' },
          { label: 'B', en: 'If you prefer not to wait, this model has similar performance and is in stock.', zh: '如果您不想等，这款性能接近且现货可提。' },
          { label: 'C', en: 'If you wait 2-3 days, your original choice may arrive.', zh: '如果您愿意等2-3天，原机型可能就会到货。' }
        ],
        answerIndex: 1,
        rationale: '尊重客户选择权，不强制替代。',
        upgrade: 'You can compare both side by side before deciding.'
      },
      {
        id: 'Q5',
        stepId: 'report',
        situation: '向经理汇报',
        promptEn: 'How do you report stock risk to your manager?',
        promptZh: '怎么向经理汇报库存风险？',
        options: [
          { label: 'A', en: 'Current stock is tight and may affect weekend sell-out.', zh: '当前库存偏紧，可能影响周末动销。' },
          { label: 'B', en: 'Current safety stock covers 2 days. We need replenishment before Friday campaign.', zh: '当前安全库存仅够2天，周五活动前需要补货。' },
          { label: 'C', en: 'No immediate risk yet, but we should monitor daily.', zh: '目前风险可控，但建议按天跟踪。' }
        ],
        answerIndex: 1,
        rationale: '风险表达要有量化和截止时间。',
        upgrade: 'I suggest moving 30 units from Region B as backup.'
      },
      {
        id: 'Q6',
        stepId: 'reserve',
        situation: '预订方案',
        promptEn: 'Customer is willing to wait. What can you propose?',
        promptZh: '顾客愿意等货，如何给方案？',
        options: [
          { label: 'A', en: 'We can reserve your order once stock arrives.', zh: '到货后我可以优先为您预留。' },
          { label: 'B', en: 'We can place a backorder now and lock your price.', zh: '我们现在可先做缺货预订并锁定价格。' },
          { label: 'C', en: 'I can note your contact and update you every week.', zh: '我可以登记联系方式，每周同步到货进展。' }
        ],
        answerIndex: 1,
        rationale: '预订+锁价能显著降低流失。',
        upgrade: 'I will notify you once the shipment is checked in.'
      }
    ]
  },
  {
    id: 'channel-weekly-review',
    category: 'Partner Communication',
    title: '渠道周会动销复盘',
    subtitle: 'Channel Weekly Review',
    summary: '覆盖销售管理与国际销售周会语境，强调数据、归因和行动闭环。',
    audience: '岗位覆盖: 销售管理部 / 国际销售部 / 地区团队',
    level: 'B1-B2',
    duration: 11,
    lessons: ['L07', 'L10', 'L18'],
    icon: 'fa-chart-line',
    image: 'assets/scenes/channel-weekly-review.jpg',
    colors: ['#ffe6bf', '#e9ddff'],
    universalRescue: "Good point. Let me pull the data and follow up after this call.",
    journeyIntro: '你在主持一次渠道周会。目标是把“数据讨论”转成“行动闭环”：先框会议，再看问题，再对齐口径，最后明确 owner 和截止时间。',
    flowSteps: [
      {
        id: 'frame',
        title: '开场框架',
        goal: '统一节奏',
        coachTip: '开场先给会议目标、议程和时长。',
        rescue: 'Let us align agenda, data, and next actions in this call.'
      },
      {
        id: 'diagnosis',
        title: '识别问题点',
        goal: '聚焦核心',
        coachTip: '先给关键数据，再给待验证假设。',
        rescue: 'The number changed this week, and we need to verify the root cause.'
      },
      {
        id: 'align-data',
        title: '对齐数据口径',
        goal: '减少争论',
        coachTip: '有分歧时先对齐数据源，再讨论结论。',
        rescue: 'Can we align on one data source before deciding actions?'
      },
      {
        id: 'action',
        title: '拆解行动项',
        goal: '可执行',
        coachTip: '每个动作都要 owner + deadline。',
        rescue: 'Each action should have one owner and one clear deadline.'
      },
      {
        id: 'target',
        title: '锁定目标',
        goal: '达成承诺',
        coachTip: '基于现实产能确认下周目标，不留模糊空间。',
        rescue: 'Can we confirm next week target based on current capacity?'
      },
      {
        id: 'recap',
        title: '会后闭环',
        goal: '推进执行',
        coachTip: '结尾给出纪要发送时间和复核机制。',
        rescue: 'I will send a recap with owners and deadlines right after this call.'
      }
    ],
    vocab: [
      { en: 'sell-out', zh: '终端出货', phonetic: '/sel aʊt/', usage: 'Sell-out improved by 12% week over week.' },
      { en: 'attach rate', zh: '加购率', phonetic: '/əˈtætʃ reɪt/', usage: 'Attach rate for accessories reached 28%.' },
      { en: 'stock turnover', zh: '库存周转', phonetic: '/stɒk ˈtɜːrnˌoʊvər/', usage: 'Stock turnover is slower in North stores.' },
      { en: 'root cause', zh: '根因', phonetic: '/ruːt kɔːz/', usage: 'The root cause is delayed campaign materials.' },
      { en: 'action owner', zh: '行动负责人', phonetic: '/ˈækʃən ˈoʊnər/', usage: 'Please assign one action owner per task.' },
      { en: 'weekly target', zh: '周目标', phonetic: '/ˈwiːkli ˈtɑːrɡɪt/', usage: 'Let us align weekly targets before Friday.' }
    ],
    quiz: [
      {
        id: 'Q1',
        stepId: 'frame',
        situation: '会议开场',
        promptEn: 'How do you open a weekly review call?',
        promptZh: '周会开场怎么说更专业？',
        options: [
          { label: 'A', en: 'Let us review sell-out, stock, and next-week actions in 20 minutes.', zh: '我们用20分钟对齐动销、库存和下周动作。' },
          { label: 'B', en: 'Let us start with campaign ideas, then data if time allows.', zh: '我们先聊活动想法，有时间再看数据。' },
          { label: 'C', en: 'I will share the key numbers in chat after the call.', zh: '核心数据我会后发群里。' }
        ],
        answerIndex: 0,
        rationale: '时间+议题清晰，会议效率更高。',
        upgrade: 'I will share one decision summary at the end.'
      },
      {
        id: 'Q2',
        stepId: 'diagnosis',
        situation: '数据变化',
        promptEn: 'Sell-out dropped in one region. What is better?',
        promptZh: '某地区动销下滑，怎么说更可执行？',
        options: [
          { label: 'A', en: 'This week sell-out is below target in Region C.', zh: '本周C区域动销低于目标。' },
          { label: 'B', en: 'Sell-out is down 8%. Let us verify if stock display and promoter coverage are the root causes.', zh: '动销下降8%，我们先核查陈列和导购覆盖是否是根因。' },
          { label: 'C', en: 'Demand may be weak, but we still need more evidence.', zh: '可能是需求走弱，但还需要更多证据。' }
        ],
        answerIndex: 1,
        rationale: '数据+假设+验证路径是标准复盘表达。',
        upgrade: 'I will bring photo checks before tomorrow noon.'
      },
      {
        id: 'Q3',
        stepId: 'align-data',
        situation: '合作方异议',
        promptEn: 'Partner disagrees with your numbers.',
        promptZh: '合作方对数据有异议，怎么接？',
        options: [
          { label: 'A', en: 'Could you share your source? Our dashboard shows a different number.', zh: '能否同步一下你们的数据源？我们的看板口径不一致。' },
          { label: 'B', en: 'Let us align the data source first, then we decide actions.', zh: '我们先统一数据口径，再决定动作。' },
          { label: 'C', en: 'Let us skip this disagreement and move to actions first.', zh: '这块先不争，先推进动作。' }
        ],
        answerIndex: 1,
        rationale: '先对齐口径再决策，避免争论循环。',
        upgrade: 'Can we use the same dashboard snapshot by EOD?'
      },
      {
        id: 'Q4',
        stepId: 'action',
        situation: '行动拆解',
        promptEn: 'How do you assign next steps clearly?',
        promptZh: '如何明确分配下一步动作？',
        options: [
          { label: 'A', en: 'Each team sends an update by Friday noon.', zh: '请各团队周五中午前同步进展。' },
          { label: 'B', en: 'Each action needs one owner and one deadline.', zh: '每个动作都要有一个负责人和一个截止时间。' },
          { label: 'C', en: 'I will summarize task ownership after this meeting.', zh: '我会后统一补负责人。' }
        ],
        answerIndex: 1,
        rationale: 'owner+deadline 是执行闭环基础。',
        upgrade: 'I will track all items in the shared action log.'
      },
      {
        id: 'Q5',
        stepId: 'target',
        situation: '目标确认',
        promptEn: 'How do you lock next-week target politely?',
        promptZh: '怎么礼貌锁定下周目标？',
        options: [
          { label: 'A', en: 'If weekend traffic improves, can we stretch to this target?', zh: '如果周末客流回升，我们可以冲这个目标吗？' },
          { label: 'B', en: 'Can we confirm this as next week\'s target based on current capacity?', zh: '基于当前产能，我们确认这个作为下周目标可以吗？' },
          { label: 'C', en: 'Let us keep the target flexible and revisit next week.', zh: '先保持弹性目标，下周再定。' }
        ],
        answerIndex: 1,
        rationale: '在尊重对方条件下锁目标，阻力更低。',
        upgrade: 'We can review mid-week and adjust if needed.'
      },
      {
        id: 'Q6',
        stepId: 'recap',
        situation: '会议收尾',
        promptEn: 'How do you close the call?',
        promptZh: '会议结尾怎么说更完整？',
        options: [
          { label: 'A', en: 'Thanks everyone, we can close here for today.', zh: '感谢大家，今天会议到这里。' },
          { label: 'B', en: 'Thanks everyone. I will send the recap with owners and deadlines in 30 minutes.', zh: '感谢大家，我会在30分钟内发会议纪要，含负责人和截止时间。' },
          { label: 'C', en: 'I will share notes tomorrow if there are no changes.', zh: '如果没有变化，我明天再发纪要。' }
        ],
        answerIndex: 1,
        rationale: '纪要时效承诺能显著提升执行率。',
        upgrade: 'Please flag any corrections before EOD today.'
      }
    ]
  },
  {
    id: 'dealer-partner-communication',
    category: 'Partner Communication',
    title: '经销商伙伴沟通与铺货推进',
    subtitle: 'Dealer Partner Communication',
    summary: '覆盖城市管理与销售管理高频协同：需求确认、政策说明、陈列标准、铺货承诺与会后闭环。',
    audience: '岗位覆盖: 城市管理 / 销售管理 / 渠道接口',
    level: 'B1-B2',
    duration: 12,
    lessons: ['L04', 'L10', 'L18'],
    icon: 'fa-handshake',
    image: 'assets/scenes/dealer-partner-communication.jpg',
    colors: ['#ffe3d1', '#d8ecff'],
    universalRescue: "Thanks for raising that. Let me confirm the details and circle back to you today.",
    journeyIntro: '你在和经销商伙伴推进一次重点机型铺货。目标是先确认需求与节奏，再对齐政策与陈列标准，最后锁定订单和复盘机制。',
    flowSteps: [
      {
        id: 'align-goal',
        title: '开场对齐目标',
        goal: '建立同频',
        coachTip: '先讲共同目标和会议输出，避免沟通发散。',
        rescue: 'Let us align on this week goals and expected output first.'
      },
      {
        id: 'clarify-demand',
        title: '确认需求与缺口',
        goal: '拿到关键数据',
        coachTip: '需求沟通要带数量、渠道类型和时间窗口。',
        rescue: 'Could you share required volume and timing by channel?'
      },
      {
        id: 'explain-policy',
        title: '解释政策口径',
        goal: '降低误解',
        coachTip: '政策表达要清晰边界：适用条件、周期和结算方式。',
        rescue: 'Let me clarify policy scope, period, and settlement terms.'
      },
      {
        id: 'display-standard',
        title: '推进陈列执行',
        goal: '确保落地',
        coachTip: '陈列沟通用“标准 + 截止时间 + 验收方式”。',
        rescue: 'Can we align display standards and complete checks by Friday?'
      },
      {
        id: 'confirm-allocation',
        title: '锁定铺货承诺',
        goal: '形成承诺',
        coachTip: '把“承诺数量 + 到货时间 + 风险预案”一次讲清。',
        rescue: 'We can confirm allocation quantity with ETA and backup plan.'
      },
      {
        id: 'close-loop',
        title: '会后闭环跟进',
        goal: '持续推进',
        coachTip: '会后必须给纪要与责任人，避免只聊不做。',
        rescue: 'I will send a recap with owners and next checkpoints today.'
      }
    ],
    vocab: [
      { en: 'channel partner', zh: '渠道伙伴', phonetic: '/ˈtʃænəl ˈpɑːrtnər/', usage: 'We need closer sync with channel partners this week.' },
      { en: 'sell-through', zh: '终端动销', phonetic: '/sel θruː/', usage: 'Sell-through is below target in several stores.' },
      { en: 'rebate policy', zh: '返利政策', phonetic: '/ˈriːbeɪt ˈpɒləsi/', usage: 'Please confirm the rebate policy for this campaign.' },
      { en: 'display compliance', zh: '陈列达标', phonetic: '/dɪˈspleɪ kəmˈplaɪəns/', usage: 'Display compliance will be checked every Friday.' },
      { en: 'allocation plan', zh: '铺货分配方案', phonetic: '/ˌæləˈkeɪʃən plæn/', usage: 'We shared the allocation plan by channel tier.' },
      { en: 'weekly run rate', zh: '周动销速率', phonetic: '/ˈwiːkli rʌn reɪt/', usage: 'Weekly run rate is the base for next shipment decisions.' }
    ],
    quiz: [
      {
        id: 'Q1',
        stepId: 'align-goal',
        situation: '会议开场',
        promptEn: 'How do you open a dealer sync call professionally?',
        promptZh: '你怎么开一场经销商对齐会更专业？',
        options: [
          { label: 'A', en: 'Let us start with today issues and solve them one by one.', zh: '我们先把今天的问题一个个解决。' },
          { label: 'B', en: 'Let us align this week goals, key risks, and expected output in 20 minutes.', zh: '我们先用20分钟对齐本周目标、风险和会议输出。' },
          { label: 'C', en: 'We can review policy first and discuss execution later.', zh: '我们先讲政策，再看执行。' }
        ],
        answerIndex: 1,
        rationale: '目标+风险+输出一次讲清，最利于后续协同。',
        upgrade: 'I will summarize decisions and owners at the end of this call.'
      },
      {
        id: 'Q2',
        stepId: 'clarify-demand',
        situation: '需求确认',
        promptEn: 'Partner asks for more units. What is the best follow-up?',
        promptZh: '合作方说要追加铺货，你下一句怎么问最关键？',
        options: [
          { label: 'A', en: 'How many more units do you need and by which date?', zh: '你们大概还需要多少台、希望哪天到货？' },
          { label: 'B', en: 'We can try to support, but supply is limited this week.', zh: '我们尽量支持，但本周供应紧张。' },
          { label: 'C', en: 'Please send your request in email later.', zh: '请稍后邮件发需求。' }
        ],
        answerIndex: 0,
        rationale: '需求沟通最关键是“数量+时间”，否则无法排资源。',
        upgrade: 'Please break volume by city and channel type for faster allocation.'
      },
      {
        id: 'Q3',
        stepId: 'explain-policy',
        situation: '政策解释',
        promptEn: 'Partner is confused about rebate terms. How do you explain clearly?',
        promptZh: '合作方对返利政策有疑问，怎么解释更清楚？',
        options: [
          { label: 'A', en: 'This policy applies to flagship stores and runs from April to June with monthly settlement.', zh: '该政策适用于旗舰门店，4到6月执行，按月结算。' },
          { label: 'B', en: 'This is our standard rebate policy for main models.', zh: '这是主销机型的标准返利政策。' },
          { label: 'C', en: 'You can check details in the policy deck.', zh: '详细内容可以看政策文档。' }
        ],
        answerIndex: 0,
        rationale: '明确“范围+周期+结算方式”才能避免误解和争议。',
        upgrade: 'I can share one example calculation right now for transparency.'
      },
      {
        id: 'Q4',
        stepId: 'display-standard',
        situation: '陈列要求',
        promptEn: 'How do you push display execution without sounding aggressive?',
        promptZh: '怎么推进陈列执行又不显得强硬？',
        options: [
          { label: 'A', en: 'Please follow our display guideline exactly this week.', zh: '请本周严格按我们的陈列标准执行。' },
          { label: 'B', en: 'Can we align on the display checklist and finish photo verification by Friday?', zh: '我们先对齐陈列清单，并在周五前完成照片验收可以吗？' },
          { label: 'C', en: 'Display quality is important, so we need better execution.', zh: '陈列质量很重要，所以执行要更好。' }
        ],
        answerIndex: 1,
        rationale: '“共识 + 截止时间 + 验收方式”比命令式表达更有效。',
        upgrade: 'I can send a one-page checklist after this call.'
      },
      {
        id: 'Q5',
        stepId: 'confirm-allocation',
        situation: '铺货承诺',
        promptEn: 'How do you confirm allocation commitment professionally?',
        promptZh: '如何专业地确认铺货承诺？',
        options: [
          { label: 'A', en: 'We can commit 300 units this week, with ETA by Thursday and backup from Region B if delayed.', zh: '本周可承诺300台，周四前到货，若延迟将从B区补位。' },
          { label: 'B', en: 'We will try our best to support your target.', zh: '我们会尽力支持你们目标。' },
          { label: 'C', en: 'Current supply is tight, so quantity is not final yet.', zh: '当前供应紧张，数量暂时还不能定。' }
        ],
        answerIndex: 0,
        rationale: '承诺必须具体，尤其是数量、时间和风险预案。',
        upgrade: 'I will update you by 6 PM if any change happens.'
      },
      {
        id: 'Q6',
        stepId: 'close-loop',
        situation: '会后跟进',
        promptEn: 'What is a strong closing sentence for partner follow-up?',
        promptZh: '会后跟进的强表达是哪句？',
        options: [
          { label: 'A', en: 'I will send meeting notes later.', zh: '我稍后发会议纪要。' },
          { label: 'B', en: 'I will send a recap today with owners, deadlines, and next checkpoint time.', zh: '今天我会发纪要，包含负责人、截止时间和下次检查点。' },
          { label: 'C', en: 'Please keep updating us in the group.', zh: '请大家在群里持续同步。' }
        ],
        answerIndex: 1,
        rationale: '闭环沟通要把执行责任和时间机制写清楚。',
        upgrade: 'If needed, we can do a quick 15-minute checkpoint on Wednesday.'
      }
    ]
  },
  {
    id: 'gtm-strategy-briefing',
    category: 'Presentation Skills',
    title: '产品卖点与市场策略汇报',
    subtitle: 'Product Pitch & GTM Briefing',
    summary: '面向手机GTM、AIoT GTM和参谋岗位，训练从定位到行动建议的一整套英文汇报表达。',
    audience: '岗位覆盖: 手机GTM / AIoT GTM / 参谋部 / 国际市场',
    level: 'B1-B2',
    duration: 12,
    lessons: ['L03', 'L11', 'L16'],
    icon: 'fa-bullseye',
    image: 'assets/scenes/gtm-strategy-briefing.jpg',
    colors: ['#f8e0ff', '#d9edff'],
    universalRescue: "That's an important point. Let me prepare the supporting data and share it with you shortly.",
    journeyIntro: '你需要向跨团队做一次产品与市场策略汇报。目标是讲清市场背景、产品定位、竞品差异、上市节奏和行动建议，并推动会后共识。',
    flowSteps: [
      {
        id: 'context',
        title: '交代市场背景',
        goal: '统一语境',
        coachTip: '先讲市场变化和目标用户，再进入产品内容。',
        rescue: 'Let us start with market context and target segment updates.'
      },
      {
        id: 'positioning',
        title: '定义产品定位',
        goal: '讲清价值',
        coachTip: '定位表达要包含用户痛点和核心价值主张。',
        rescue: 'Our value proposition is clear performance with practical pricing.'
      },
      {
        id: 'comparison',
        title: '竞品差异说明',
        goal: '建立优势',
        coachTip: '对比要具体，用可验证指标，不用空泛形容词。',
        rescue: 'The key differentiator is battery efficiency under daily use.'
      },
      {
        id: 'timeline',
        title: '汇报GTM节奏',
        goal: '管理预期',
        coachTip: '时间线要给里程碑和依赖条件。',
        rescue: 'Here is the launch timeline with milestones and dependencies.'
      },
      {
        id: 'recommendation',
        title: '提出行动建议',
        goal: '推动决策',
        coachTip: '建议必须有优先级、资源需求和预期结果。',
        rescue: 'I recommend three actions with clear priority and impact.'
      },
      {
        id: 'alignment',
        title: '确认会后共识',
        goal: '形成闭环',
        coachTip: '结束前复述决策与owner，确保跨团队同步。',
        rescue: 'Before closing, let me confirm decisions, owners, and next steps.'
      }
    ],
    vocab: [
      { en: 'value proposition', zh: '价值主张', phonetic: '/ˈvæljuː ˌprɒpəˈzɪʃən/', usage: 'Our value proposition focuses on durable performance.' },
      { en: 'target segment', zh: '目标客群', phonetic: '/ˈtɑːrɡɪt ˈseɡmənt/', usage: 'The target segment is young professionals in tier-one cities.' },
      { en: 'key differentiator', zh: '核心差异点', phonetic: '/kiː ˌdɪfəˈrenʃieɪtər/', usage: 'Battery stability is our key differentiator.' },
      { en: 'launch timeline', zh: '上市节奏', phonetic: '/lɔːntʃ ˈtaɪmlaɪn/', usage: 'We need to align the launch timeline across teams.' },
      { en: 'conversion funnel', zh: '转化漏斗', phonetic: '/kənˈvɜːrʒən ˈfʌnl/', usage: 'The conversion funnel shows a drop at trial-to-purchase stage.' },
      { en: 'action plan', zh: '行动方案', phonetic: '/ˈækʃən plæn/', usage: 'This action plan focuses on high-impact channels first.' }
    ],
    quiz: [
      {
        id: 'Q1',
        stepId: 'context',
        situation: '汇报开场',
        promptEn: 'How do you open a GTM briefing clearly?',
        promptZh: '如何清晰开启一场 GTM 汇报？',
        options: [
          { label: 'A', en: 'Let us jump into product highlights directly.', zh: '我们先直接看产品亮点。' },
          { label: 'B', en: 'I will start with market context, target segment, and today decision focus.', zh: '我先讲市场背景、目标客群和今天要决策的重点。' },
          { label: 'C', en: 'I prepared several slides for your review today.', zh: '我今天准备了几页汇报给大家看。' }
        ],
        answerIndex: 1,
        rationale: '先给语境和决策目标，听众更容易跟上并参与讨论。',
        upgrade: 'This will help us align faster on what to prioritize this quarter.'
      },
      {
        id: 'Q2',
        stepId: 'positioning',
        situation: '产品定位',
        promptEn: 'Which sentence defines positioning better?',
        promptZh: '哪句话更像有效的产品定位表达？',
        options: [
          { label: 'A', en: 'This model is designed for users who want stable battery and camera quality at practical pricing.', zh: '这款面向追求续航稳定和拍照质量、同时关注实用价格的用户。' },
          { label: 'B', en: 'This model is competitive and balanced in most aspects.', zh: '这款整体比较均衡，也很有竞争力。' },
          { label: 'C', en: 'This model continues our previous positioning direction.', zh: '这款延续了我们之前的定位方向。' }
        ],
        answerIndex: 0,
        rationale: '定位要包含目标人群、核心价值和价格带，不宜空泛。',
        upgrade: 'The core promise is less charging anxiety during heavy daily usage.'
      },
      {
        id: 'Q3',
        stepId: 'comparison',
        situation: '竞品对比',
        promptEn: 'How do you present competitive difference with evidence?',
        promptZh: '如何用证据说清竞品差异？',
        options: [
          { label: 'A', en: 'Compared with Competitor X, we deliver 15% longer battery runtime in the same usage test.', zh: '与竞品X相比，在同测场景下我们续航时长提升15%。' },
          { label: 'B', en: 'Our product experience is generally better than competitors.', zh: '我们的综合体验整体优于竞品。' },
          { label: 'C', en: 'Competitors are strong, but we still have some advantages.', zh: '竞品很强，但我们也有一些优势。' }
        ],
        answerIndex: 0,
        rationale: '用可验证数据表达差异，最容易建立可信度。',
        upgrade: 'This advantage is most visible in heavy video and navigation scenarios.'
      },
      {
        id: 'Q4',
        stepId: 'timeline',
        situation: '节奏汇报',
        promptEn: 'How do you explain launch timeline professionally?',
        promptZh: '如何专业汇报上市节奏？',
        options: [
          { label: 'A', en: 'We aim to launch in May if all teams are ready.', zh: '如果各团队准备好，我们目标5月上市。' },
          { label: 'B', en: 'Milestone one is channel training by April 10, then preheat content by April 20, and launch week starts May 1.', zh: '第一里程碑是4月10日前完成渠道培训，4月20日前完成预热内容，5月1日进入上市周。' },
          { label: 'C', en: 'Timeline is on track and we are moving as planned.', zh: '整体节奏正常推进中。' }
        ],
        answerIndex: 1,
        rationale: '时间线汇报要有里程碑，不是笼统地说“按计划”。',
        upgrade: 'Legal approval is the key dependency for material release.'
      },
      {
        id: 'Q5',
        stepId: 'recommendation',
        situation: '行动建议',
        promptEn: 'How do you make action recommendations more convincing?',
        promptZh: '如何让行动建议更有说服力？',
        options: [
          { label: 'A', en: 'I suggest we invest more in marketing to improve awareness.', zh: '我建议加大营销投入提升认知。' },
          { label: 'B', en: 'I recommend prioritizing top 20 stores, reallocating demo budget, and reviewing conversion weekly.', zh: '我建议优先覆盖前20门店、重分配体验预算，并按周复盘转化。' },
          { label: 'C', en: 'We should continue current strategy and optimize gradually.', zh: '建议延续当前策略并逐步优化。' }
        ],
        answerIndex: 1,
        rationale: '建议要具体到动作、范围和复盘机制，才能落地。',
        upgrade: 'Expected impact is plus 3 points in trial-to-purchase conversion.'
      },
      {
        id: 'Q6',
        stepId: 'alignment',
        situation: '结尾对齐',
        promptEn: 'What is the best closing line for cross-team alignment?',
        promptZh: '跨团队汇报结尾，哪句最稳？',
        options: [
          { label: 'A', en: 'Thanks everyone, we can continue details offline.', zh: '感谢大家，细节我们线下再聊。' },
          { label: 'B', en: 'Before we close, let me recap decisions, owners, and deadlines to confirm alignment.', zh: '结束前我复述决策、负责人和截止时间，确认我们已对齐。' },
          { label: 'C', en: 'I will send slides later for everyone to review.', zh: '我稍后发PPT给大家复看。' }
        ],
        answerIndex: 1,
        rationale: '收尾复述是跨团队执行闭环的关键动作。',
        upgrade: 'Please flag any local constraints within 24 hours.'
      }
    ]
  },
  {
    id: 'cross-cultural-alignment',
    category: 'Cross-cultural Meeting',
    title: '跨文化协同与共识推进',
    subtitle: 'Cross-cultural Alignment',
    summary: '对应国际市场、参谋与地区部协作语境，减少误解，确保行动明确。',
    audience: '岗位覆盖: 国际市场部 / 参谋部 / 地区部',
    level: 'B1-B2',
    duration: 12,
    lessons: ['L10', 'L11', 'L16'],
    icon: 'fa-earth-asia',
    universalRescue: "Thank you for raising that. Let me confirm with the local team and get back to you.",
    image: 'assets/scenes/cross-cultural-alignment.jpg',
    colors: ['#e5ddff', '#d9f5ff'],
    journeyIntro: '你在一次跨区域协同会上推进共同项目。目标是先对齐目标，再表达分歧，明确依赖与时间线，最后确认共识并完成会后闭环。',
    flowSteps: [
      {
        id: 'kickoff',
        title: '开场对齐目标',
        goal: '建立共同语境',
        coachTip: '先讲共同目标，再进入差异讨论，减少立场对立。',
        rescue: 'Let us align on shared goals first, then discuss local constraints.'
      },
      {
        id: 'concerns',
        title: '礼貌表达异议',
        goal: '提出分歧不对抗',
        coachTip: '先认可对方逻辑，再补充本地风险点。',
        rescue: 'I see the logic. My concern is the local compliance risk.'
      },
      {
        id: 'dependency',
        title: '讲清依赖关系',
        goal: '管理预期',
        coachTip: '依赖对象与最早完成时间必须一起说。',
        rescue: 'This milestone depends on legal review and earliest completion is next Tuesday.'
      },
      {
        id: 'timeline',
        title: '处理时间冲突',
        goal: '保质量推进',
        coachTip: '说明延后原因并给替代方案，不只报延期。',
        rescue: 'To protect quality, we suggest a short delay with a clear workaround.'
      },
      {
        id: 'alignment',
        title: '结束前复述共识',
        goal: '降低误解',
        coachTip: '结束前复述 decision + owner + next step。',
        rescue: 'Before we close, may I recap decisions and owners to confirm alignment?'
      },
      {
        id: 'followup',
        title: '会后书面闭环',
        goal: '确保执行',
        coachTip: '给出纪要发送时效和内容范围，提升执行确定性。',
        rescue: 'I will share a written recap within one hour, including milestones and owners.'
      }
    ],
    vocab: [
      { en: 'alignment', zh: '对齐共识', phonetic: '/əˈlaɪnmənt/', usage: 'Before launch, we need alignment on messaging.' },
      { en: 'key concern', zh: '核心担忧点', phonetic: '/kiː kənˈsɜːrn/', usage: 'Could you share your key concern from local markets?' },
      { en: 'dependency', zh: '依赖项', phonetic: '/dɪˈpendənsi/', usage: 'This task depends on legal approval.' },
      { en: 'workaround', zh: '临时替代方案', phonetic: '/ˈwɜːrkəraʊnd/', usage: 'As a workaround, we can use last quarter assets.' },
      { en: 'timeline', zh: '时间线', phonetic: '/ˈtaɪmlaɪn/', usage: 'Let us lock the timeline by Friday.' },
      { en: 'recap', zh: '会议总结', phonetic: '/ˈriːkæp/', usage: 'I will send a recap right after this meeting.' }
    ],
    quiz: [
      {
        id: 'Q1',
        stepId: 'kickoff',
        situation: '会议开场',
        promptEn: 'How do you set a collaborative tone at the start?',
        promptZh: '如何在开场就建立协作氛围？',
        options: [
          { label: 'A', en: 'HQ has proposed this framework; we can focus on execution details.', zh: '总部提出了框架，我们重点讨论执行细节。' },
          { label: 'B', en: 'Let us align on goals first, then discuss local constraints.', zh: '我们先对齐目标，再讨论各地限制条件。' },
          { label: 'C', en: 'Please share local concerns after this call.', zh: '本地顾虑会后再单独收集。' }
        ],
        answerIndex: 1,
        rationale: '先目标后约束，是跨文化会议的低冲突开场。',
        upgrade: 'I would value each market\'s perspective in this round.'
      },
      {
        id: 'Q2',
        stepId: 'concerns',
        situation: '表达异议',
        promptEn: 'You disagree with a plan. Which is better?',
        promptZh: '你有不同意见，哪句更合适？',
        options: [
          { label: 'A', en: 'I see a compliance risk in this step.', zh: '这一步我看到合规风险。' },
          { label: 'B', en: 'I see the logic. My concern is local compliance risk in this step.', zh: '我理解思路，但这一步在本地有合规风险。' },
          { label: 'C', en: 'Could we postpone this part until legal confirms?', zh: '这部分是否可以等法务确认后再推进？' }
        ],
        answerIndex: 1,
        rationale: '先认可再提出具体担忧，更容易被接纳。',
        upgrade: 'Could we explore one compliant alternative together?'
      },
      {
        id: 'Q3',
        stepId: 'dependency',
        situation: '任务依赖',
        promptEn: 'How do you communicate dependency clearly?',
        promptZh: '怎么把依赖项说清楚？',
        options: [
          { label: 'A', en: 'This item is blocked until we receive legal feedback.', zh: '这项任务需要等法务反馈后才能推进。' },
          { label: 'B', en: 'This milestone depends on legal review. Earliest completion is next Tuesday.', zh: '该里程碑依赖法务审核，最早下周二完成。' },
          { label: 'C', en: 'Timeline is uncertain because approval is still pending.', zh: '审批未完成，所以时间还有不确定性。' }
        ],
        answerIndex: 1,
        rationale: '依赖对象+最早时间点，是跨团队对齐关键。',
        upgrade: 'I will keep everyone posted if timing changes.'
      },
      {
        id: 'Q4',
        stepId: 'timeline',
        situation: '时间冲突',
        promptEn: 'The timeline slips. What should you say?',
        promptZh: '时间线可能延后，如何沟通？',
        options: [
          { label: 'A', en: 'To keep the original date, we may need to reduce scope.', zh: '若保持原时间，可能需要缩小范围。' },
          { label: 'B', en: 'To protect launch quality, we suggest moving by three days with a clear workaround.', zh: '为保证上线质量，建议顺延3天并提供临时替代方案。' },
          { label: 'C', en: 'If timeline moves, we should update market communication immediately.', zh: '如果延期，需要立刻同步市场沟通口径。' }
        ],
        answerIndex: 1,
        rationale: '说明原因+影响+替代方案，才算完整沟通。',
        upgrade: 'This keeps market communication on schedule.'
      },
      {
        id: 'Q5',
        stepId: 'alignment',
        situation: '确认共识',
        promptEn: 'How do you verify understanding before closing?',
        promptZh: '结束前怎么确认大家理解一致？',
        options: [
          { label: 'A', en: 'Any final comments before we close?', zh: '结束前还有补充意见吗？' },
          { label: 'B', en: 'Before we close, may I recap decisions and owners to confirm alignment?', zh: '结束前我复述决策和负责人，确认我们已对齐，好吗？' },
          { label: 'C', en: 'I will post a short summary in the group chat later.', zh: '我稍后在群里发个简版总结。' }
        ],
        answerIndex: 1,
        rationale: 'recap 是跨文化协作里最稳妥的降误解动作。',
        upgrade: 'Please interrupt me if anything sounds different locally.'
      },
      {
        id: 'Q6',
        stepId: 'followup',
        situation: '会后跟进',
        promptEn: 'What is a strong follow-up sentence?',
        promptZh: '会后跟进的强表达是哪句？',
        options: [
          { label: 'A', en: 'I will circulate draft notes later today.', zh: '我今天稍晚会发会议纪要草稿。' },
          { label: 'B', en: 'I will share a written recap within one hour, including milestones and owners.', zh: '我会在1小时内发书面纪要，包含里程碑和负责人。' },
          { label: 'C', en: 'Please check the tracker tomorrow for updates.', zh: '请大家明天到任务看板查看更新。' }
        ],
        answerIndex: 1,
        rationale: '时间承诺+内容范围，最能建立协作信任。',
        upgrade: 'Please add local constraints directly in the shared file.'
      }
    ]
  }
];

if (window.MiRoleConfig && typeof window.MiRoleConfig.annotateScenarios === 'function') {
  window.MiRoleConfig.annotateScenarios(SCENARIOS);
}

const app = {
  state: null,
  progress: {},
  mistakes: [],
  currentCategory: 'all',
  currentRoleId: null,
  currentSceneId: null,
  currentTab: 'interactive',
  session: null,
  startedSceneEvents: {}
};

function shuffleArray(items) {
  const arr = Array.isArray(items) ? [...items] : [];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestionOptions(question) {
  if (!question || !Array.isArray(question.options)) return question;
  const paired = question.options.map((opt, index) => ({ ...opt, _originIndex: index }));
  const shuffled = shuffleArray(paired);
  const answerIndex = shuffled.findIndex(item => item._originIndex === question.answerIndex);
  const relabeled = shuffled.map((item, idx) => {
    const { _originIndex, ...rest } = item;
    const letter = String.fromCharCode(65 + idx);
    return { ...rest, label: letter };
  });
  return {
    ...question,
    options: relabeled,
    answerIndex: answerIndex >= 0 ? answerIndex : question.answerIndex
  };
}

function safeHTML(text) {
  const value = text === null || text === undefined ? '' : String(text);
  if (typeof escapeHTML === 'function') return escapeHTML(value);
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    var json = JSON.stringify(value);
    localStorage.setItem(key, json);
    // Verify write succeeded
    var check = localStorage.getItem(key);
    if (check !== json) {
      console.error('[Mi English] writeJSON verify failed for key:', key);
      showToast('保存异常，数据可能未保存');
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Mi English] writeJSON failed:', key, e);
    showToast('存储空间不足，进度可能丢失');
    return false;
  }
}

function getSceneById(sceneId) {
  return SCENARIOS.find(scene => scene.id === sceneId) || null;
}

function getAllCategories() {
  const categories = ['all'];
  SCENARIOS.forEach(scene => {
    if (!categories.includes(scene.category)) categories.push(scene.category);
  });
  return categories;
}

function getScenePassLine(scene) {
  return Math.ceil(scene.quiz.length * SCENE_PASS_RATE);
}

function getSceneProgress(sceneId) {
  const current = app.progress[sceneId];
  if (current && typeof current === 'object') return current;
  return {
    started: false,
    attempts: 0,
    bestScore: 0,
    lastScore: 0,
    total: 0,
    passedOnce: false,
    updatedAt: null
  };
}

function saveSceneProgress(sceneId, patch) {
  const current = getSceneProgress(sceneId);
  app.progress[sceneId] = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  writeJSON(SCENARIO_PROGRESS_KEY, app.progress);
}

function getSceneStatus(scene) {
  const p = getSceneProgress(scene.id);
  if (!p.started && !p.attempts) return 'not_started';
  if (p.bestScore >= getScenePassLine(scene)) return 'completed';
  return 'in_progress';
}

function getStatusText(status) {
  if (status === 'completed') return '已完成';
  if (status === 'in_progress') return '进行中';
  return '未开始';
}

function getFilteredScenes() {
  var filtered = app.currentCategory === 'all'
    ? [...SCENARIOS]
    : SCENARIOS.filter(scene => scene.category === app.currentCategory);

  if (!app.currentRoleId) return filtered;

  return filtered.filter(scene => Array.isArray(scene.roles) && scene.roles.includes(app.currentRoleId));
}

function pickFeaturedScene(scenes) {
  if (!scenes.length) return null;
  const rank = { in_progress: 0, not_started: 1, completed: 2 };
  const sorted = [...scenes].sort((a, b) => {
    const statusDiff = rank[getSceneStatus(a)] - rank[getSceneStatus(b)];
    if (statusDiff !== 0) return statusDiff;
    return a.title.localeCompare(b.title, 'en');
  });
  return sorted[0];
}

function getGradient(colors) {
  if (!Array.isArray(colors) || colors.length < 2) {
    return 'linear-gradient(135deg, #ffe4d1, #d8ecff)';
  }
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}

function getVisualStyle(scene) {
  const gradient = getGradient(scene.colors);
  if (!scene.image) return `background:${gradient};`;
  return `background-image:linear-gradient(135deg, rgba(255,255,255,0.38), rgba(255,255,255,0.08)), url('${scene.image}'), ${gradient};background-size:cover, cover, auto;background-position:center, center, center;`;
}

function showToast(message) {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.className = 'toast show';
  setTimeout(() => {
    node.className = 'toast';
  }, 2200);
}

function speakEnglishText(text) {
  const phrase = String(text || '').trim();
  if (!phrase) return;

  const speech = window.MiSpeech || window.MiTTS;
  if (!speech || !speech.supported()) {
    showToast('当前浏览器不支持发音');
    return;
  }

  const result = speech.speak(phrase, { lang: 'en-US', rate: 0.92, preferAudio: true });
  if (!result.ok) {
    showToast('发音失败，请重试');
  }
}

function updateNavBadges() {
  const streak = document.getElementById('streakCount');
  const levelBadge = document.getElementById('levelBadge');
  if (!streak || !levelBadge || !app.state) return;
  streak.textContent = app.state.streak || 0;
  levelBadge.textContent = `Lv.${app.state.level} ${getLevelName(app.state.level)}`;
}

function renderMistakeBadge() {
  const count = Array.isArray(app.mistakes) ? app.mistakes.length : 0;
  const text = count > 0 ? `${count}题` : '0';
  const badge = document.getElementById('mistakeCountBadge');
  if (badge) badge.textContent = text;
  const stepsBadge = document.getElementById('stepsMistakeCount');
  if (stepsBadge) stepsBadge.textContent = text;
}

function renderMistakeList() {
  const list = document.getElementById('mistakeList');
  if (!list) return;

  const items = Array.isArray(app.mistakes) ? [...app.mistakes].reverse() : [];
  if (!items.length) {
    list.innerHTML = '<div class=\"scene-empty\" style=\"margin:4px 0;\">还没有错题，做错后可加入这里。</div>';
    return;
  }

  list.innerHTML = items.map(item => `
    <article class=\"mistake-item\">
      <div class=\"mistake-scene\">${safeHTML(item.sceneTitle || '场景题')}</div>
      <div class=\"mistake-q\">${safeHTML(item.promptEn || '')}</div>
      <div class=\"mistake-lines\">
        <div><strong>你的错误选项：</strong>${safeHTML(item.wrongOption || '-')}</div>
        <div><strong>推荐表达：</strong>${safeHTML(item.correctOption || '-')}</div>
      </div>
    </article>
  `).join('');
}

function openMistakeDrawer() {
  renderMistakeList();
  const drawer = document.getElementById('mistakeDrawer');
  const backdrop = document.getElementById('mistakeBackdrop');
  if (!drawer || !backdrop) return;
  drawer.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}

function closeMistakeDrawer() {
  const drawer = document.getElementById('mistakeDrawer');
  const backdrop = document.getElementById('mistakeBackdrop');
  if (!drawer || !backdrop) return;
  drawer.classList.add('hidden');
  backdrop.classList.add('hidden');
}

function clearMistakes() {
  if (!Array.isArray(app.mistakes) || app.mistakes.length === 0) {
    showToast('错题本已是空的');
    return;
  }

  if (!window.confirm('确认清空错题本吗？')) return;
  app.mistakes = [];
  writeJSON(SCENARIO_MISTAKES_KEY, app.mistakes);
  renderMistakeBadge();
  renderMistakeList();
  showToast('错题本已清空');
}

function renderCategoryChips() {
  const wrapper = document.getElementById('categoryChips');
  if (!wrapper) return;
  const chips = getAllCategories();
  wrapper.innerHTML = chips.map(category => {
    const active = category === app.currentCategory ? 'active' : '';
    const label = CATEGORY_LABELS[category] || category;
    return `<button class="scene-chip ${active}" data-action="switch-category" data-category="${safeHTML(category)}">${safeHTML(label)}</button>`;
  }).join('');
}

function renderFeaturedCard() {
  const root = document.getElementById('featureCard');
  if (!root) return;

  const scenes = getFilteredScenes();
  const featured = pickFeaturedScene(scenes);

  if (!featured) {
    root.innerHTML = '<div class="scene-empty">当前分类暂无场景</div>';
    return;
  }

  const status = getSceneStatus(featured);
  const progress = getSceneProgress(featured.id);
  const total = featured.quiz.length;
  const attempts = progress.attempts || 0;
  const startText = status === 'in_progress' ? '继续学习' : status === 'completed' ? '再练一轮' : '开始学习';

  root.innerHTML = `
    <div class="feature-row">
      <span class="status-pill status-${safeHTML(status)}">${safeHTML(getStatusText(status))}</span>
      <span class="level-pill">${safeHTML(featured.level)}</span>
    </div>
    <div class="scene-visual scene-cover" style="${safeHTML(getVisualStyle(featured))}"></div>
    <h2 class="feature-title">${safeHTML(featured.title)}</h2>
    <p class="feature-summary">${safeHTML(featured.summary)}</p>
    <div class="feature-footer">
      <span class="feature-meta">最佳 ${safeHTML(`${progress.bestScore || 0}/${total}`)} · 练习 ${safeHTML(String(attempts))} 次 · ${safeHTML(`${featured.duration} 分钟`)}</span>
      <button class="feature-start" data-action="open-scene" data-scene-id="${safeHTML(featured.id)}">${safeHTML(startText)}</button>
    </div>
  `;
}

function renderSceneGrid() {
  const grid = document.getElementById('sceneGrid');
  if (!grid) return;

  const scenes = getFilteredScenes();
  if (!scenes.length) {
    grid.innerHTML = '<div class="scene-empty">这个分类暂时没有内容</div>';
    return;
  }

  grid.innerHTML = scenes.map(scene => {
    const status = getSceneStatus(scene);
    const p = getSceneProgress(scene.id);
    const total = scene.quiz.length;
    const actionText = status === 'in_progress' ? '继续' : status === 'completed' ? '重练' : '开始';

    return `
      <article class="scene-card">
        <div class="scene-visual scene-cover scene-cover-sm" style="${safeHTML(getVisualStyle(scene))}"></div>
        <div class="scene-card-head">
          <h3>${safeHTML(scene.title)}</h3>
          <span class="status-pill status-${safeHTML(status)}">${safeHTML(getStatusText(status))}</span>
        </div>
        <div class="scene-card-meta">${safeHTML(scene.level)} · ${safeHTML(`${scene.duration} 分钟`)} · 最佳 ${safeHTML(`${p.bestScore || 0}/${total}`)}</div>
        <button class="scene-card-start" data-action="open-scene" data-scene-id="${safeHTML(scene.id)}">${safeHTML(actionText)} <i class="fas fa-arrow-right"></i></button>
      </article>
    `;
  }).join('');
}

function renderLobby() {
  renderCategoryChips();
  renderFeaturedCard();
  renderSceneGrid();
}

function buildNewSession(scene) {
  return {
    sceneId: scene.id,
    questions: scene.quiz.map(question => shuffleQuestionOptions(question)),
    questionIndex: 0,
    score: 0,
    answers: {},
    completed: false,
    passBonusGiven: false
  };
}

function switchView(view) {
  const lobby = document.getElementById('lobbyView');
  const steps = document.getElementById('stepsView');
  const detail = document.getElementById('detailView');
  if (lobby) lobby.classList.toggle('hidden', view !== 'lobby');
  if (steps) steps.classList.toggle('hidden', view !== 'steps');
  if (detail) detail.classList.toggle('hidden', view !== 'detail');
}

function openScene(sceneId) {
  const scene = getSceneById(sceneId);
  if (!scene) return;

  app.currentSceneId = scene.id;
  if (!app.session || app.session.sceneId !== scene.id) {
    app.session = buildNewSession(scene);
  }

  if (!app.startedSceneEvents[scene.id]) {
    app.startedSceneEvents[scene.id] = true;
    if (window.MiAnalytics && typeof window.MiAnalytics.trackEvent === 'function') {
      window.MiAnalytics.trackEvent('scenario_started', {
        sceneId: scene.id,
        roleId: app.currentRoleId || (app.state ? app.state.selectedRole : null)
      });
    }
  }

  renderStepsView(scene);
  switchView('steps');
}

function goBackToLobby() {
  switchView('lobby');
  renderLobby();
}

function getStepState(scene, stepIndex) {
  if (!app.session || app.session.sceneId !== scene.id) return 'pending';
  const steps = getSceneFlowSteps(scene);
  if (!steps.length || stepIndex >= steps.length) return 'pending';

  const step = steps[stepIndex];
  const qIndex = app.session.questions.findIndex(q => q.stepId === step.id);
  if (qIndex < 0) return 'pending';

  const answer = app.session.answers[qIndex];
  if (!answer) return 'pending';
  return answer.correct ? 'done' : 'review';
}

function getStepStateLabel(state) {
  if (state === 'done') return '已通过';
  if (state === 'review') return '待强化';
  return '未开始';
}

function renderStepsView(scene) {
  const title = document.getElementById('stepsTitle');
  const level = document.getElementById('stepsLevel');
  const audience = document.getElementById('stepsAudience');
  const banner = document.getElementById('stepsBanner');
  const grid = document.getElementById('stepsGrid');
  const summary = document.getElementById('stepsSummary');
  const vocabArea = document.getElementById('stepsVocabArea');
  const mistakeCount = document.getElementById('stepsMistakeCount');

  if (title) title.textContent = scene.title;
  if (level) level.textContent = scene.level;
  if (audience) audience.textContent = scene.audience;

  if (mistakeCount) {
    const count = Array.isArray(app.mistakes) ? app.mistakes.length : 0;
    mistakeCount.textContent = count > 0 ? `${count}题` : '0';
  }

  if (banner) {
    banner.style.cssText = getVisualStyle(scene);
    banner.innerHTML = `
      <span class="visual-icon"><i class="fas ${safeHTML(scene.icon)}"></i></span>
      <div class="visual-caption">
        <h3>${safeHTML(scene.subtitle)}</h3>
        <p>${safeHTML(scene.summary)}</p>
      </div>
    `;
  }

  const steps = getSceneFlowSteps(scene);
  if (grid) {
    grid.innerHTML = steps.map((step, index) => {
      const state = getStepState(scene, index);
      return `
        <article class="step-card step-${safeHTML(state)}" data-action="open-step" data-step-index="${index}">
          <div class="step-card-top">
            <span class="step-card-index">${safeHTML(String(index + 1))}</span>
            <span class="step-card-state ${safeHTML(state)}">${safeHTML(getStepStateLabel(state))}</span>
          </div>
          <div class="step-card-title">${safeHTML(step.title)}</div>
          <div class="step-card-goal">${safeHTML(step.goal)}</div>
        </article>
      `;
    }).join('');
  }

  // Check if all steps are answered
  const allAnswered = steps.length > 0 && steps.every((step, i) => {
    const state = getStepState(scene, i);
    return state === 'done' || state === 'review';
  });

  if (summary) {
    if (allAnswered && app.session) {
      const total = app.session.questions.length;
      const score = app.session.score;
      const accuracy = total ? Math.round((score / total) * 100) : 0;
      const passLine = getScenePassLine(scene);

      const rows = steps.map((step, index) => {
        const state = getStepState(scene, index);
        const stateLabel = state === 'done' ? '通过' : '待强化';
        return `
          <div class="journey-summary-item">
            <strong>${safeHTML(`${index + 1}. ${step.title}`)}</strong>
            <span class="journey-summary-state ${safeHTML(state)}">${safeHTML(stateLabel)}</span>
          </div>
        `;
      }).join('');

      summary.classList.remove('hidden');
      summary.innerHTML = `
        <h3>本轮成绩：${safeHTML(`${score}/${total}`)} (${safeHTML(String(accuracy))}%)</h3>
        <p>${accuracy >= Math.round(SCENE_PASS_RATE * 100)
          ? '本场景已达到通过线，建议切换到其他岗位场景继续练。'
          : `离通过线还差一点（通过线 ${passLine}/${total}），建议再来一轮。`}
        </p>
        <div class="journey-summary">${rows}</div>
        <button class="feature-start" data-action="retry-scene" data-scene-id="${safeHTML(scene.id)}">开始新一轮</button>
      `;
    } else {
      summary.classList.add('hidden');
      summary.innerHTML = '';
    }
  }

  // Hide vocab area by default when re-rendering
  if (vocabArea) {
    vocabArea.classList.add('hidden');
  }
}

function openStep(stepIndex) {
  const scene = getSceneById(app.currentSceneId);
  if (!scene || !app.session) return;

  const steps = getSceneFlowSteps(scene);
  if (stepIndex < 0 || stepIndex >= steps.length) return;

  const step = steps[stepIndex];
  const qIndex = app.session.questions.findIndex(q => q.stepId === step.id);
  if (qIndex < 0) return;

  app.session.questionIndex = qIndex;
  renderDetail();
  switchView('detail');
}

function goBackToSteps() {
  const scene = getSceneById(app.currentSceneId);
  if (!scene) {
    switchView('lobby');
    return;
  }
  renderStepsView(scene);
  switchView('steps');
}

function renderDetailHeader(scene) {
  const title = document.getElementById('detailTitle');
  const level = document.getElementById('detailLevel');
  const audience = document.getElementById('detailAudience');

  const question = getCurrentQuestion(scene);
  const currentStep = question ? getFlowStepForQuestion(scene, question, app.session ? app.session.questionIndex : 0) : null;

  if (title) title.textContent = currentStep ? `${scene.title} · ${currentStep.title}` : scene.title;
  if (level) level.textContent = scene.level;
  if (audience) audience.textContent = scene.audience;
}

function renderDetailTabs() {
  document.querySelectorAll('.detail-tab-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === app.currentTab);
  });

  const vocabPanel = document.getElementById('vocabPanel');
  const quizPanel = document.getElementById('quizPanel');
  if (vocabPanel) vocabPanel.classList.toggle('hidden', app.currentTab !== 'vocab');
  if (quizPanel) quizPanel.classList.toggle('hidden', app.currentTab !== 'interactive');
}

function renderVocabulary(scene, targetPanel) {
  const panel = targetPanel || document.getElementById('stepsVocabArea');
  if (!panel) return;

  panel.innerHTML = `
    <p class="vocab-intro">${safeHTML(scene.subtitle)}常用表达。建议先过一遍词汇，再进入互动问答。</p>
    <div class="vocab-grid">
      ${scene.vocab.map(item => `
        <article class="vocab-card">
          <div class="vocab-card-top">
            <div>
              <div class="vocab-en">${safeHTML(item.en)}</div>
              <div class="vocab-zh">${safeHTML(item.zh)}</div>
            </div>
            <div class="vocab-card-actions">
              <span class="level-pill">词条</span>
              <button class="speak-btn speak-btn--sm" type="button" data-action="speak-term" data-term="${safeHTML(item.en)}" aria-label="播放发音">
                <i class="fas fa-volume-high"></i>
              </button>
            </div>
          </div>
          <div class="vocab-phonetic">${safeHTML(item.phonetic)}</div>
          <div class="vocab-usage">${safeHTML(item.usage)}</div>
        </article>
      `).join('')}
    </div>
  `;
}

function getSceneFlowSteps(scene) {
  if (!scene || !Array.isArray(scene.flowSteps) || scene.flowSteps.length === 0) {
    return [];
  }

  return scene.flowSteps.map((step, index) => ({
    id: step && typeof step.id === 'string' ? step.id : `step-${index + 1}`,
    title: step && typeof step.title === 'string' ? step.title : `步骤 ${index + 1}`,
    goal: step && typeof step.goal === 'string' ? step.goal : '',
    coachTip: step && typeof step.coachTip === 'string' ? step.coachTip : '',
    rescue: step && typeof step.rescue === 'string' ? step.rescue : ''
  }));
}

function getQuestionStepIndex(scene, question, fallbackIndex) {
  const steps = getSceneFlowSteps(scene);
  if (!steps.length) {
    return Number.isInteger(fallbackIndex) && fallbackIndex >= 0 ? fallbackIndex : 0;
  }

  if (question && typeof question.stepId === 'string') {
    const byId = steps.findIndex(step => step.id === question.stepId);
    if (byId >= 0) return byId;
  }

  if (Number.isInteger(fallbackIndex) && fallbackIndex >= 0) {
    return Math.min(fallbackIndex, steps.length - 1);
  }

  return 0;
}

function getFlowStepForQuestion(scene, question, fallbackIndex) {
  const steps = getSceneFlowSteps(scene);
  if (!steps.length) return null;
  const stepIndex = getQuestionStepIndex(scene, question, fallbackIndex);
  return steps[stepIndex] || null;
}

function getFlowStepState(stepIndex) {
  if (!app.session) return 'locked';

  if (app.session.completed) {
    const ans = app.session.answers[stepIndex];
    if (ans && ans.correct) return 'done';
    return 'review';
  }

  if (stepIndex < app.session.questionIndex) {
    const previous = app.session.answers[stepIndex];
    if (!previous) return 'open';
    return previous.correct ? 'done' : 'review';
  }

  if (stepIndex === app.session.questionIndex) {
    const current = app.session.answers[stepIndex];
    if (!current) return 'active';
    return current.correct ? 'done' : 'review';
  }

  return 'locked';
}

function getFlowStateLabel(state) {
  if (state === 'done') return '已通过';
  if (state === 'review') return '待强化';
  if (state === 'active') return '进行中';
  if (state === 'open') return '可进入';
  return '未解锁';
}

function renderFlowJourney(scene) {
  const root = document.getElementById('flowJourney');
  if (!root) return;

  const steps = getSceneFlowSteps(scene);
  if (!steps.length) {
    root.classList.add('hidden');
    root.innerHTML = '';
    return;
  }

  const unlocked = steps.reduce((count, _, index) => {
    const state = getFlowStepState(index);
    return count + (state === 'locked' ? 0 : 1);
  }, 0);
  const journeyTitle = scene && typeof scene.flowTitle === 'string' && scene.flowTitle.trim()
    ? scene.flowTitle.trim()
    : `${scene.title}链路`;

  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="flow-journey-head">
      <div class="flow-journey-title">${safeHTML(journeyTitle)}</div>
      <div class="flow-journey-meta">已推进 ${safeHTML(`${unlocked}/${steps.length}`)} 步</div>
    </div>
    ${scene.journeyIntro ? `<div class="flow-journey-intro">${safeHTML(scene.journeyIntro)}</div>` : ''}
    <div class="flow-track">
      ${steps.map((step, index) => {
        const state = getFlowStepState(index);
        const noAccess = state === 'locked' ? 'no-access' : '';
        const goal = step.goal ? `<span>${safeHTML(step.goal)}</span>` : '';
        return `
          <div class="flow-step ${safeHTML(state)} ${safeHTML(noAccess)}">
            <span class="flow-step-index">${safeHTML(String(index + 1))}</span>
            <div class="flow-step-main">
              <strong>${safeHTML(step.title)}</strong>
              ${goal}
            </div>
            <span class="flow-step-state ${safeHTML(state)}">${safeHTML(getFlowStateLabel(state))}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderJourneySummary(scene) {
  const steps = getSceneFlowSteps(scene);
  if (!steps.length || !app.session) return '';

  const rows = steps.map((step, index) => {
    const answer = app.session.answers[index];
    const state = answer && answer.correct ? 'done' : 'review';
    const stateLabel = state === 'done' ? '通过' : '待强化';
    return `
      <div class="journey-summary-item">
        <strong>${safeHTML(`${index + 1}. ${step.title}`)}</strong>
        <span class="journey-summary-state ${safeHTML(state)}">${safeHTML(stateLabel)}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="journey-summary">
      ${rows}
    </div>
  `;
}

function getCurrentQuestion(scene) {
  if (!app.session || !Array.isArray(app.session.questions)) return null;
  return app.session.questions[app.session.questionIndex] || null;
}

function getAnswerForCurrentQuestion() {
  if (!app.session) return null;
  return app.session.answers[app.session.questionIndex] || null;
}

function renderQuestionProgress(scene) {
  const progress = document.getElementById('detailProgress');
  if (!progress || !app.session) return;

  if (app.session.completed) {
    progress.textContent = `${app.session.questions.length}/${app.session.questions.length}`;
    return;
  }

  progress.textContent = `${app.session.questionIndex + 1}/${app.session.questions.length}`;
}

function renderQuiz(scene) {
  const situation = document.getElementById('quizSituation');
  const optionsRoot = document.getElementById('quizOptions');
  const reviewRoot = document.getElementById('quizReview');
  const saveBtn = document.getElementById('saveMistakeBtn');
  const nextBtn = document.getElementById('nextQuestionBtn');

  if (!situation || !optionsRoot || !reviewRoot || !saveBtn || !nextBtn) return;

  renderQuestionProgress(scene);

  const question = getCurrentQuestion(scene);
  const answer = getAnswerForCurrentQuestion();
  const total = app.session.questions.length;
  const questionPos = app.session.questionIndex + 1;
  const progressPct = Math.round((questionPos / total) * 100);

  if (!question) return;

  const currentStep = getFlowStepForQuestion(scene, question, app.session.questionIndex);
  const coachTip = typeof question.coachTip === 'string' && question.coachTip.trim()
    ? question.coachTip.trim()
    : currentStep && currentStep.coachTip ? currentStep.coachTip : '';
  const rescueFromQuestion = typeof question.rescue === 'string' ? question.rescue.trim() : '';
  const rescueFromStep = currentStep && typeof currentStep.rescue === 'string' ? currentStep.rescue.trim() : '';
  const rescueFromScene = (typeof scene.universalRescue === 'string' && scene.universalRescue.trim())
    ? scene.universalRescue.trim()
    : '';
  const rescue = rescueFromQuestion || rescueFromStep || rescueFromScene || UNIVERSAL_RESCUE_SENTENCE;
  const goal = currentStep && currentStep.goal ? currentStep.goal : '';
  const kicker = currentStep ? `当前环节 · ${currentStep.title}` : '当前环节';

  situation.innerHTML = `
    <div class="quiz-situation-top">
      <span class="quiz-situation-pill">${safeHTML(question.situation)}</span>
      <div class="quiz-progress-ring" style="--quiz-progress:${safeHTML(String(progressPct))}%;"><span>${safeHTML(`${questionPos}/${total}`)}</span></div>
    </div>
    <div class="quiz-question-en-row">
      <div class="quiz-question-en">${safeHTML(question.promptEn)}</div>
      <button class="speak-btn speak-btn--sm" type="button" data-action="speak-term" data-term="${safeHTML(question.promptEn)}" aria-label="播放题干发音">
        <i class="fas fa-volume-high"></i>
      </button>
    </div>
    <div class="quiz-question-zh">${safeHTML(question.promptZh)}</div>
    ${(coachTip || goal)
      ? `<div class="quiz-step-tip">
          <div class="quiz-step-tip-head">
            <span class="quiz-step-kicker">${safeHTML(kicker)}</span>
            ${goal ? `<span class="quiz-step-goal">${safeHTML(goal)}</span>` : ''}
          </div>
          ${coachTip ? `<p>${safeHTML(coachTip)}</p>` : ''}
        </div>`
      : ''}
    ${rescue
      ? `<div class="quiz-rescue">
          <div class="quiz-rescue-top">
            <span class="quiz-rescue-title">不会说时可先用这句</span>
            <button class="speak-btn speak-btn--sm" type="button" data-action="speak-term" data-term="${safeHTML(rescue)}" aria-label="播放救场句发音">
              <i class="fas fa-volume-high"></i>
            </button>
          </div>
          <div class="quiz-rescue-text">${safeHTML(rescue)}</div>
        </div>`
      : ''}
  `;

  optionsRoot.innerHTML = question.options.map((option, index) => {
    const isSelected = answer && answer.selected === index;
    const isCorrect = answer && index === question.answerIndex;
    const isWrongChoice = answer && isSelected && !answer.correct;

    const classes = [
      'quiz-option',
      isSelected ? 'selected' : '',
      isCorrect ? 'correct' : '',
      isWrongChoice ? 'wrong' : ''
    ].filter(Boolean).join(' ');

    let feedbackBlock = '';
    if (isSelected && answer) {
      const title = answer.correct ? '选择很好' : '可进一步优化';
      const correctEn = question.options[question.answerIndex].en;
      const text = answer.correct
        ? `${question.rationale} 升级表达：${question.upgrade}`
        : question.rationale;
      const correctLine = `
        <div class="quiz-feedback-correct">
          <span>推荐表达：${safeHTML(correctEn)}</span>
          <button class="speak-btn speak-btn--sm" type="button" data-action="speak-term" data-term="${safeHTML(correctEn)}" aria-label="播放推荐表达发音">
            <i class="fas fa-volume-high"></i>
          </button>
        </div>
      `;

      feedbackBlock = `
        <div class="quiz-feedback ${answer.correct ? 'good' : 'bad'}">
          <strong>${safeHTML(title)}</strong><br>
          ${safeHTML(text)}
          ${correctLine}
        </div>
      `;
    }

    return `
      <article class="${classes}" data-action="choose-option" data-option-index="${safeHTML(String(index))}">
        <div class="option-top">
          <div class="option-en">${safeHTML(option.en)}</div>
          <button class="speak-btn speak-btn--sm option-speak" type="button" data-action="speak-term" data-term="${safeHTML(option.en)}" aria-label="播放选项发音">
            <i class="fas fa-volume-high"></i>
          </button>
          <div class="option-label">${safeHTML(option.label)}</div>
        </div>
        <div class="option-zh">${safeHTML(option.zh)}</div>
        ${feedbackBlock}
      </article>
    `;
  }).join('');

  const answered = Boolean(answer);
  if (answered) {
    renderOptionReview(question, answer, reviewRoot);
  } else {
    reviewRoot.classList.add('hidden');
    reviewRoot.innerHTML = '';
  }
  saveBtn.disabled = !answered || answer.correct;
  nextBtn.disabled = !answered;
  nextBtn.textContent = '返回步骤列表';
}

function inferOptionReview(question, option, index) {
  if (index === question.answerIndex) {
    return {
      tag: 'best',
      title: '最佳表达',
      note: '信息完整、语气专业，包含明确行动或下一步。'
    };
  }

  const text = `${option.en} ${option.zh}`.toLowerCase();
  const riskTokens = [
    'no ', 'not ', 'cannot', 'can not', 'never', 'later', 'wait',
    'skip', 'wrong', 'must', 'only', 'bye', 'problem', '不', '别', '先不'
  ];

  const hasRiskToken = riskTokens.some(token => text.includes(token));
  if (hasRiskToken) {
    return {
      tag: 'risk',
      title: '风险表达',
      note: '语气偏消极或缺少可执行动作，容易引发误解或抗拒。'
    };
  }

  return {
    tag: 'improve',
    title: '可改进',
    note: '表达方向可用，但还可以补充时间、动作或确认信息。'
  };
}

function renderOptionReview(question, answer, container) {
  if (!container) return;

  const rows = question.options.map((option, index) => {
    const review = inferOptionReview(question, option, index);
    const picked = answer.selected === index ? '（你的选择）' : '';
    return `
      <div class="quiz-review-item">
        <div class="review-top">
          <span class="review-label">${safeHTML(option.label)} ${safeHTML(option.en)} ${safeHTML(picked)}</span>
          <span class="review-tag ${safeHTML(review.tag)}">${safeHTML(review.title)}</span>
        </div>
        <div>${safeHTML(review.note)}</div>
      </div>
    `;
  }).join('');

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="quiz-review-title">选项解析</div>
    ${rows}
  `;
}

function addXPReward(amount) {
  if (!app.state || !Number.isFinite(amount) || amount <= 0) return;
  app.state = addXP(app.state, amount);
  saveState(app.state);
  updateNavBadges();
}

function chooseOption(optionIndex) {
  const scene = getSceneById(app.currentSceneId);
  if (!scene || !app.session || app.session.completed) return;

  const question = getCurrentQuestion(scene);
  if (!question) return;

  if (app.session.answers[app.session.questionIndex]) return;

  const selected = Number(optionIndex);
  if (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length) return;

  const correct = selected === question.answerIndex;
  app.session.answers[app.session.questionIndex] = {
    selected,
    correct
  };

  if (correct) {
    app.session.score += 1;
    addXPReward(SCENE_CORRECT_XP);
    showToast('+4 XP · 回答正确');
  } else {
    showToast('已记录本题反馈');
  }

  saveSceneProgress(scene.id, {
    started: true,
    total: app.session.questions.length
  });

  renderQuiz(scene);
}

function saveCurrentMistake() {
  const scene = getSceneById(app.currentSceneId);
  if (!scene || !app.session || app.session.completed) return;

  const question = getCurrentQuestion(scene);
  const answer = getAnswerForCurrentQuestion();

  if (!question || !answer) {
    showToast('请先选择答案');
    return;
  }

  if (answer.correct) {
    showToast('这题答对了，无需加入错题');
    return;
  }

  const key = `${scene.id}:${question.id}`;
  const entry = {
    key,
    sceneId: scene.id,
    sceneTitle: scene.title,
    questionId: question.id,
    promptEn: question.promptEn,
    promptZh: question.promptZh,
    wrongOption: question.options[answer.selected].en,
    correctOption: question.options[question.answerIndex].en,
    savedAt: new Date().toISOString()
  };

  const index = app.mistakes.findIndex(item => item && item.key === key);
  if (index >= 0) {
    app.mistakes[index] = entry;
  } else {
    app.mistakes.push(entry);
  }

  app.mistakes = app.mistakes.slice(-200);
  writeJSON(SCENARIO_MISTAKES_KEY, app.mistakes);
  renderMistakeBadge();
  showToast(`已加入错题本 (${app.mistakes.length})`);
}

function completeSceneRound(scene) {
  if (!app.session || app.session.completed) return;

  app.session.completed = true;

  const score = app.session.score;
  const total = app.session.questions.length;
  const passLine = getScenePassLine(scene);

  const current = getSceneProgress(scene.id);
  const nextAttempts = (current.attempts || 0) + 1;
  const passedNow = score >= passLine;

  const patch = {
    started: true,
    attempts: nextAttempts,
    lastScore: score,
    bestScore: Math.max(current.bestScore || 0, score),
    total,
    passedOnce: Boolean(current.passedOnce || passedNow)
  };
  saveSceneProgress(scene.id, patch);

  if (passedNow && !current.passedOnce) {
    addXPReward(SCENE_PASS_BONUS_XP);
    showToast('+10 XP · 场景首次通过');
  } else {
    showToast(`本轮完成: ${score}/${total}`);
  }

  if (window.MiAnalytics && typeof window.MiAnalytics.trackEvent === 'function') {
    window.MiAnalytics.trackEvent('scenario_completed', {
      sceneId: scene.id,
      score,
      total,
      passed: passedNow,
      roleId: app.currentRoleId || (app.state ? app.state.selectedRole : null)
    });
  }

  if (window.MiApi && typeof window.MiApi.saveScenarioAttempt === 'function') {
    window.MiApi.saveScenarioAttempt(scene.id, score, total, passedNow, {
      passLine,
      attempts: nextAttempts
    });
  }
}

function goNextQuestion() {
  const scene = getSceneById(app.currentSceneId);
  if (!scene || !app.session) return;

  const answer = getAnswerForCurrentQuestion();
  if (!answer) {
    showToast('请先选择一个选项');
    return;
  }

  // Check if all questions are now answered
  const allAnswered = app.session.questions.every((_, i) => app.session.answers[i]);
  if (allAnswered && !app.session.completed) {
    completeSceneRound(scene);
  }

  // Always go back to stepsView after answering
  goBackToSteps();
}

function retryScene(sceneId) {
  const scene = getSceneById(sceneId);
  if (!scene) return;
  app.session = buildNewSession(scene);
  renderStepsView(scene);
  showToast('已开始新一轮');
}

function renderDetail() {
  const scene = getSceneById(app.currentSceneId);
  if (!scene) return;

  renderDetailHeader(scene);
  renderQuiz(scene);
}

function switchDetailTab(tab) {
  if (tab !== 'vocab' && tab !== 'interactive') return;
  app.currentTab = tab;
  renderDetailTabs();
}

function bindEvents() {
  const categoryChips = document.getElementById('categoryChips');
  const sceneGrid = document.getElementById('sceneGrid');
  const featureCard = document.getElementById('featureCard');
  const stepsBackBtn = document.getElementById('stepsBackBtn');
  const stepsGrid = document.getElementById('stepsGrid');
  const stepsVocabBtn = document.getElementById('stepsVocabBtn');
  const stepsMistakesBtn = document.getElementById('stepsMistakesBtn');
  const stepsSummary = document.getElementById('stepsSummary');
  const stepsVocabArea = document.getElementById('stepsVocabArea');
  const detailBackBtn = document.getElementById('detailBackBtn');
  const quizSituation = document.getElementById('quizSituation');
  const quizOptions = document.getElementById('quizOptions');
  const saveMistakeBtn = document.getElementById('saveMistakeBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const closeMistakesBtn = document.getElementById('closeMistakesBtn');
  const closeMistakesBtnBottom = document.getElementById('closeMistakesBtnBottom');
  const clearMistakesBtn = document.getElementById('clearMistakesBtn');
  const mistakeBackdrop = document.getElementById('mistakeBackdrop');

  if (categoryChips) {
    categoryChips.addEventListener('click', event => {
      const target = event.target.closest('[data-action="switch-category"]');
      if (!target) return;
      const category = target.dataset.category || 'all';
      app.currentCategory = category;
      renderLobby();
    });
  }

  const handleOpenSceneClick = event => {
    const target = event.target.closest('[data-action="open-scene"]');
    if (!target) return;
    const sceneId = target.dataset.sceneId;
    if (sceneId) openScene(sceneId);
  };

  if (sceneGrid) {
    sceneGrid.addEventListener('click', handleOpenSceneClick);
  }

  if (featureCard) {
    featureCard.addEventListener('click', handleOpenSceneClick);
  }

  // stepsView events
  if (stepsBackBtn) {
    stepsBackBtn.addEventListener('click', goBackToLobby);
  }

  if (stepsGrid) {
    stepsGrid.addEventListener('click', event => {
      const card = event.target.closest('[data-action="open-step"]');
      if (!card) return;
      const stepIndex = parseInt(card.dataset.stepIndex, 10);
      if (!isNaN(stepIndex)) openStep(stepIndex);
    });
  }

  if (stepsVocabBtn) {
    stepsVocabBtn.addEventListener('click', () => {
      const scene = getSceneById(app.currentSceneId);
      if (!scene || !stepsVocabArea) return;
      if (stepsVocabArea.classList.contains('hidden')) {
        stepsVocabArea.classList.remove('hidden');
        renderVocabulary(scene, stepsVocabArea);
        stepsVocabBtn.innerHTML = '<i class="fas fa-book-open"></i> 收起词汇';
      } else {
        stepsVocabArea.classList.add('hidden');
        stepsVocabBtn.innerHTML = '<i class="fas fa-book-open"></i> 查看词汇';
      }
    });
  }

  if (stepsMistakesBtn) {
    stepsMistakesBtn.addEventListener('click', openMistakeDrawer);
  }

  if (stepsSummary) {
    stepsSummary.addEventListener('click', event => {
      const target = event.target.closest('[data-action="retry-scene"]');
      if (!target) return;
      const sceneId = target.dataset.sceneId;
      if (sceneId) retryScene(sceneId);
    });
  }

  if (stepsVocabArea) {
    stepsVocabArea.addEventListener('click', event => {
      const btn = event.target.closest('[data-action="speak-term"]');
      if (!btn) return;
      event.preventDefault();
      speakEnglishText(btn.dataset.term || '');
    });
  }

  // detailView events
  if (detailBackBtn) {
    detailBackBtn.addEventListener('click', goBackToSteps);
  }

  if (quizOptions) {
    quizOptions.addEventListener('click', event => {
      // 点喇叭按钮时只播放音频，不触发答题
      const speakBtn = event.target.closest('[data-action="speak-term"]');
      if (speakBtn) {
        event.preventDefault();
        event.stopPropagation();
        const term = speakBtn.dataset.term || '';
        speakEnglishText(term);
        return;
      }
      const option = event.target.closest('[data-action="choose-option"]');
      if (!option) return;
      chooseOption(option.dataset.optionIndex);
    });
  }

  if (quizSituation) {
    quizSituation.addEventListener('click', event => {
      const btn = event.target.closest('[data-action="speak-term"]');
      if (!btn) return;
      event.preventDefault();
      const term = btn.dataset.term || '';
      speakEnglishText(term);
    });
  }

  if (saveMistakeBtn) {
    saveMistakeBtn.addEventListener('click', saveCurrentMistake);
  }

  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', goNextQuestion);
  }

  if (closeMistakesBtn) {
    closeMistakesBtn.addEventListener('click', closeMistakeDrawer);
  }

  if (closeMistakesBtnBottom) {
    closeMistakesBtnBottom.addEventListener('click', closeMistakeDrawer);
  }

  if (clearMistakesBtn) {
    clearMistakesBtn.addEventListener('click', clearMistakes);
  }

  if (mistakeBackdrop) {
    mistakeBackdrop.addEventListener('click', closeMistakeDrawer);
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMistakeDrawer();
    }
  });
}

function initProfileState() {
  app.state = loadState();
  const result = initSession(app.state);
  app.state = result.state;
  app.state.lastTab = 'scenarios';
  saveState(app.state);
  app.currentRoleId = app.state.selectedRole || null;

  app.progress = readJSON(SCENARIO_PROGRESS_KEY, {});
  app.mistakes = readJSON(SCENARIO_MISTAKES_KEY, []);
}

function applyRoleAndQuery() {
  if (window.MiRoleConfig && typeof window.MiRoleConfig.annotateScenarios === 'function') {
    window.MiRoleConfig.annotateScenarios(SCENARIOS);
  }

  const params = new URLSearchParams(window.location.search || '');
  const roleId = params.get('role');
  const sceneId = params.get('scene');

  if (roleId) {
    app.currentRoleId = roleId;
    if (app.state) {
      app.state.selectedRole = roleId;
      saveState(app.state);
    }
  }

  if (sceneId) {
    const scene = getSceneById(sceneId);
    if (scene) {
      openScene(sceneId);
    }
  }
}

function initScenarioLearning() {
  initProfileState();
  applyRoleAndQuery();
  bindEvents();
  updateNavBadges();
  renderMistakeBadge();
  if (!app.currentSceneId) {
    renderLobby();
  }
}

document.addEventListener('DOMContentLoaded', initScenarioLearning);
