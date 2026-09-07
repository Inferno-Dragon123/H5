const beat = (speaker, avatar, text, extra = {}) => ({ speaker, avatar, text, ...extra })

// Script beats follow the proposal: city detail, risk signal, independent verification, then quiz.
export const storyScripts = {
  juzizhou: {
    chapter: '序章 · 红色金融初心', setting: '橘子洲头 · 湘江风起', theme: 'investment',
    beats: [
      beat('镜界系统', 'mascot-alert.png', '检测到城市数字安全网络出现异常。部分探索者正在收到来源不明的“稳赚邀请”。'),
      beat('工小智', 'mascot-alert.png', '主理人，先别急着追那条链接。橘子洲的江风很稳，投资承诺却不该“每天固定赚 3%”。'),
      beat('风险扫描', 'mascot-think.png', '线索锁定：群聊截图、内部消息、陌生安装包正在拼出一条“欺诈暗流”。'),
      beat('工小智', 'mascot-happy.png', '守住本金，先核实机构和产品资质。准备好了吗？把第一段异常代码交给你的判断。', { clue: '投资风险 · 高收益承诺与陌生投资平台', cta: '进入橘子洲风险调查' }),
    ],
  },
  wuyi: {
    chapter: '第一幕 · 城市流动的陷阱', setting: '五一广场 · 人潮中央', theme: 'wuyi',
    beats: [
      beat('镜界系统', 'mascot-alert.png', '紧急任务：城市数字安全系统出现异常。请协助工小智寻找隐藏在商圈里的异常代码。'),
      beat('工小智', 'mascot-alert.png', '主理人，我们现在走的是长沙最繁华的核心商圈。欺诈暗流最喜欢在人潮汹涌的地方伪装。'),
      beat('工小智', 'mascot-think.png', '你刚才是不是收到“免费领取长沙文创礼品、扫码进群返现”的传单？小恩小惠，往往是它靠近你的第一步。'),
      beat('风险扫描', 'mascot-think.png', '扫描结果：要求垫付、连续做单、群聊晒收益。典型的刷单返利前兆。', { clue: '刷单与兼职 · 免费礼物、扫码进群、垫资返佣', cta: '拆解第一条风险线索' }),
      beat('工小智', 'mascot-happy.png', '沿着人流走进太平老街吧。边走边聊，看看这座城市的烟火里还藏着什么。', { cta: '开始第一关答题' }),
    ],
  },
  taiping: {
    chapter: '第一关 · 汉服男的信用契约', setting: '太平老街 · 青石板路', theme: 'taiping',
    beats: [
      beat('老街引路人', 'npc-hanfu.png', '（向你作揖）客官，可愿听听这老街的故事？每一块青砖下，都藏着民本与守信的分量。'),
      beat('工小智', 'mascot-happy.png', '两千年的历史沉淀很厚重。过去商人讲一诺千金，今天的消费合同也要逐字读明白。'),
      beat('老街引路人', 'npc-hanfu.png', '一份漂亮的契约，不能只看“每月最低”。总费用、利率、服务费和还款条件，才是它真正的内容。'),
      beat('风险扫描', 'mascot-think.png', '异常片段已标记：零利息宣传、空白合同、以贷养贷。信用不是把压力藏起来。', { clue: '消费与借贷 · 总费用、还款能力与合同条款', cta: '查看契约里的风险' }),
      beat('工小智', 'mascot-happy.png', '引路人已经消失在巷道深处。走，穿过解放西路，江风会让下一段判断更清醒。', { cta: '进入太平老街答题' }),
    ],
  },
  dufu: {
    chapter: '第二幕 · 江阁上的风控守护', setting: '杜甫江阁 · 黑金弹窗', theme: 'dufu',
    beats: [
      beat('工小智', 'mascot-alert.png', '江风正好，手机却突然响了。屏幕上写着：征信异常，支付修复费即可恢复。'),
      beat('黑金弹窗', 'villain.png', '“我是官方征信专员。请立即上传隐私证明照，并转账 299 元完成修复。”'),
      beat('工小智', 'mascot-think.png', '等等！真正的征信服务不会靠陌生来电制造恐慌，更不会要求你把密码和验证码交出去。'),
      beat('风险扫描', 'mascot-think.png', '危险等级上升：冒充官方、付费洗白、索要隐私证明。请从已知的官方渠道独立核验。', { clue: '征信保护 · 付费修复与冒充官方', cta: '反击黑金弹窗' }),
      beat('工小智', 'mascot-happy.png', '弹窗碎成金色 i 豆雨。江阁提醒我们：守护信用，要靠真实记录和正规渠道。', { cta: '进入杜甫江阁答题' }),
    ],
  },
  chaozong: {
    chapter: '第三幕 · 潮宗街的数字净化', setting: '潮宗街 · 咖啡香里的暗流', theme: 'chaozong',
    beats: [
      beat('青年主理人', 'npc-owner.png', '欢迎来到潮宗街！老街换上了新潮的外衣，但付款码旁边这张贴纸，好像不太对劲。'),
      beat('工小智', 'mascot-alert.png', '你的手机也收到了一条“i 豆即将清零”的短信。链接看起来很像银行页面，先别点。'),
      beat('青年主理人', 'npc-owner.png', '店里的核销可以直接打开官方工银 e 生活完成。真正的优惠，不会要求你把验证码发给陌生客服。'),
      beat('风险扫描', 'mascot-think.png', '异常代码已净化：伪基站积分短信、覆盖二维码、屏幕共享退款。每一笔支付都要确认收款方。', { clue: '支付与账户 · 官方入口、收款方与验证码', cta: '净化积分诈骗陷阱' }),
      beat('工小智', 'mascot-happy.png', '青绿限定咖啡已到账。可是反暗流的核心母体还在向北逃窜，终点是湖南博物院。', { cta: '进入潮宗街答题' }),
    ],
  },
  museum: {
    chapter: '终章 · 省博之巅的镜像破灭', setting: '湖南博物院 · 文脉与算法', theme: 'museum',
    beats: [
      beat('工小智', 'mascot-think.png', '主理人，最后一关到了。公共财政守护文化根基，数字金融也应该服务真实的人。'),
      beat('辅导员影像', 'npc-teacher.png', '我是你的辅导员。现在请立即向指定工行账户转入 5000 元文创押金，晚一分钟就会失去资格。'),
      beat('工小智', 'mascot-alert.png', '声音和脸都可以被 AI 合成。不要被紧急感推着走，先用你已知的联系方式独立联系本人。'),
      beat('风险扫描', 'mascot-think.png', '终极伪装：熟悉的声音、清晰的面容、陌生的账户。请完成多维核验，守住真实。', { clue: 'AI 与信息安全 · 换脸、拟声与身份核验', cta: '拆穿镜像骗局' }),
      beat('工小智', 'mascot-happy.png', '假象因无法实时渲染真实的微表情而撕裂。镜界恢复光明，你守护的不只是资金，还有这座城市的真实与美好。', { cta: '进入终极挑战' }),
    ],
  },
  pozi: {
    chapter: '收官 · 烟火气里的安全核销', setting: '坡子街 · 长沙限定兑换点', theme: 'pozi',
    beats: [
      beat('青年主理人', 'npc-owner.png', '恭喜抵达极速路线终点！这份长沙限定权益，先从官方入口核对兑换，再把快乐带回家。'),
      beat('工小智', 'mascot-think.png', '陌生链接、仿冒客服和“立即领取”的倒计时，都是兑换环节里常见的暗流。'),
      beat('风险扫描', 'mascot-happy.png', '终点线索已收集：自主打开官方应用，核对活动与收款方，确认后再完成云核销。', { clue: '支付与账户 · 官方兑换入口与云核销', cta: '完成收官调查' }),
      beat('工小智', 'mascot-happy.png', '安全抵达，探索印章也完成了最后一笔。把这份判断力带进下一次消费吧。', { cta: '进入坡子街答题' }),
    ],
  },
}

export function getStory(place) {
  return storyScripts[place?.id] || {
    chapter: '镜界调查', setting: place?.name || '长沙', theme: 'default',
    beats: [beat('工小智', 'mascot-happy.png', place?.line || '线索已经出现，准备好开始调查了吗？', { cta: '进入情境挑战' })],
  }
}
