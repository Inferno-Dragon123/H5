export const places = [
 { id:'juzizhou', name:'橘子洲', short:'橘子洲', title:'江风里的神秘邀约', category:'投资风险', icon:'Compass', x:24,y:33, reward:20, npc:'mascot', intro:'湘江上的风带来一封“财富邀请函”。有人承诺，只要加入内部投资群，就能每天稳赚。工小智发现，邀请函里藏着第一段异常代码。', line:'主理人，江面可以风平浪静，收益承诺可要多留个心眼。一起找出这封信的破绽吧！', cultural:'在湘江的洲岛与江风之间，开启一场关于理性判断的探索。', unlock:'星城探索印章' },
 { id:'wuyi', name:'五一广场', short:'五一广场', title:'城市流动的陷阱', category:'刷单与兼职', icon:'Building2', x:77,y:34, reward:20, npc:'mascot', intro:'五一商圈人潮涌动，一张“扫码领文创，做任务返现金”的传单递到了你手里。镜界的监测仪突然闪起红光：欺诈暗流就在附近。', line:'免费礼物很心动？先别扫码。我们从这张传单开始，找到看似轻松赚钱背后的风险。', cultural:'以城市商圈为起点，观察热闹生活中的金融安全细节。', unlock:'启程探索印章' },
 { id:'taiping', name:'太平老街', short:'太平老街', title:'汉服男的信用契约', category:'消费与借贷', icon:'Landmark', x:72,y:50, reward:20, npc:'hanfu', intro:'踏上青石板路，一位汉服青年递来“老长沙契约”。古时商人重诺守信，而今天，一份看似优惠的消费合同正等待你辨明。', line:'客官，一诺千金。可再漂亮的契约，也需逐字读明白。你愿和我一起寻找其中的隐秘条款吗？', cultural:'沿老街感受市井烟火，也把守信与理性消费记在心里。', unlock:'太平老街限定装扮' },
 { id:'dufu', name:'杜甫江阁', short:'杜甫江阁', title:'江阁下的征信迷局', category:'征信保护', icon:'Landmark', x:24,y:57, reward:20, npc:'mascot', intro:'江风正好，手机却弹出“你的征信存在异常”的消息。对方自称专员，承诺付费便可消除所有记录。你能拆穿这场精心编织的骗局吗？', line:'信用需要珍惜，陌生人的“内部渠道”却不能轻信。先核实，再行动。', cultural:'在江阁的诗意景致中，学习保护自己的信用与身份。', unlock:'杜甫江阁限定装扮' },
 { id:'chaozong', name:'潮宗街', short:'潮宗街', title:'咖啡香里的数字暗流', category:'支付与账户', icon:'Coffee', x:75,y:72, reward:20, npc:'owner', intro:'潮宗街的咖啡店里，一条“i豆即将清零”的短信抢先到达。与此同时，柜台上的付款码似乎被贴上了一张新的贴纸。', line:'欢迎来到小店！这杯咖啡让我请你，付款码旁边的异常，就拜托你和工小智一起调查啦。', cultural:'走进青年主理人的街区，守护每一笔日常支付。', unlock:'潮宗街限定装扮' },
 { id:'museum', name:'湖南博物院', short:'湖南博物院', title:'真假之间，守护镜界', category:'AI与信息安全', icon:'ScanFace', x:53,y:91, reward:20, npc:'teacher', intro:'文博展厅中，一段“辅导员”的求助视频传来。声音和面容都很熟悉，但收款账户却很陌生。这是欺诈暗流最后的伪装。', line:'眼见未必为实。面对AI合成的声音与影像，独立联系本人核实，才是可靠的判断方法。', cultural:'以文博为终章，思考数字时代的真实、信任与责任。', unlock:'金融守护者限定装扮' },
 { id:'pozi', name:'坡子街', short:'坡子街', title:'烟火气里的安全收官', category:'支付与账户', icon:'Coffee', x:67,y:60, reward:20, npc:'owner', intro:'沿太平老街来到坡子街，一家文创小店邀你体验积分兑换。先辨别真假兑换入口，再带走这段旅程的记忆吧。', line:'恭喜抵达极速路线的终点！最后一起检查兑换入口，让这段轻快的探索安心收官。', cultural:'以街区文创为终点，体验线上学习与线下消费的连接。', unlock:'极速探索印章' }
]
export const modes = [
 {id:'quick',name:'极速打卡',full:'极速打卡版',en:'QUICK ESCAPE',time:'30–45 分钟',label:'轻装上阵，快乐出发',desc:'穿过老街烟火，解锁你的第一枚城市印章。',ids:['wuyi','taiping','pozi'],color:'orange',icon:'Zap',image:'route-quick.png',distance:'街区漫步',end:'坡子街'},
 {id:'city',name:'城市探索',full:'城市探索版',en:'CITY EXPLORER',time:'1.5–2 小时',label:'沿江漫游，发现不一样',desc:'从繁华街巷到湘江晚风，让每一步都有收获。',ids:['wuyi','taiping','dufu','chaozong'],color:'blue',icon:'Bike',image:'route-city.png',distance:'步行 + 骑行',end:'潮宗街'},
 {id:'deep',name:'深度体验',full:'深度体验版',en:'DEEP DISCOVERY',time:'2.5 小时以上',label:'读懂星城，成为守护者',desc:'走进六大城市地标，揭开镜界背后的全部秘密。',ids:['juzizhou','wuyi','taiping','dufu','chaozong','museum'],color:'purple',icon:'Sparkles',image:'route-deep.png',distance:'文博全景探索',end:'湖南博物院'}
]
export const sources = [
 {title:'国家反诈中心 · 常见骗局与防范',url:'https://gat.fj.gov.cn/ztzl/fjjffpzxrx/zhxx/202407/t20240729_6491081.htm'},
 {title:'金融监管总局 · 虚假网络投资理财风险提示',url:'https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1142025&generaltype=0&itemId=4100'},
 {title:'金融监管总局 · 青年理性消费提示',url:'https://www.nfra.gov.cn/branch/chongqing/view/pages/common/ItemDetail.html?docId=971184&itemId=1985'},
 {title:'征信中心 · 信用修复政策与风险提醒',url:'https://www.pbccrc.org.cn/xczl/xyxf/20260204/d8d3ac653093473c844c86faed70872e/218cc6c1bb67473f96c3061b5b72026b.pdf'},
 {title:'金融监管总局 · 新型电信网络诈骗风险提示',url:'https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1172651&itemId=4100'},
 {title:'南通公安 · 警惕追款二次诈骗',url:'https://gaj.nantong.gov.cn/ntsgaj/jfts/content/6508399c-4be5-4fee-92b4-e47072f42555.htm'}
]
