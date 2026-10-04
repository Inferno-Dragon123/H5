# 视觉小说引擎与维护

## 选型

实际调查 Monogatari、WebGAL、RenJS、Narrat、Pixi.js 与 Phaser 后，选择 Monogatari 2.8.0。它具备经典视觉小说的剧本标签、人物/场景、选择、Promise 暂停、存档、回看和自动阅读。MIT 许可允许自托管，已保留原 LICENSE。

[仓库](https://github.com/Monogatari/Monogatari) · [固定发行包](https://github.com/Monogatari/Monogatari/releases/download/v2.8.0/monogatari-v2.8.0.zip) · [脚本函数文档](https://monogatari.io/v2/script-actions/javascript)

[WebGAL](https://github.com/OpenWebGAL/WebGAL) 的中文可视化制作生态值得后续考虑；其 React/Redux/Pixi 内核适宜独立构建再嵌入，当前 Vue 项目需要额外迁移。RenJS 的实际许可为 CC BY-SA 4.0；Narrat 更适合叙事 RPG；Pixi 与 Phaser 本身不提供完整的小说剧本和存读档流程。

Monogatari 2.8.0 的 npm 默认导出指向包中不存在的 module，因此采用官方浏览器发行版。原引擎未修改，扩展在 runtime/theme 中。

官方文件 SHA256：

- `monogatari.js`：`cae028d02a43589bd7252c1a5288d17db9997d669ece64ff5ce8457c50f18676`
- `monogatari.css`：`3309dcadb1e5a96721bfe54ee375f88e73b5e32e0572c82c90d9ca5838012235`

## Vue 与引擎

Vue 管理地图、题库、奖励、已完成地标及音频；iframe 管理阅读位置、原生选择、人物舞台和小说存档。协议为 `star-city-novel-v2`，双方核对同源、发送窗口和随机 session。

剧情分 beforeQuiz / afterPass / afterFail。每个 beat 的 cast 是完整人物快照；sceneId 变化才转场；whenModes 过滤路线限定台词。危险选择反馈后重选，安全选择继续，情境选择不发积分。

quiz/retry 返回 pending Promise，暂停 Monogatari。Vue 成绩页关闭后发送 quiz-result，resolve 后原生 Conditional 进入成功/失败分支。答题时不能销毁 iframe 或序列化 pending Promise。AutoSave=0，pending 期间锁定存读档、自动与相关快捷键。

声音由父页统一播放，每句对白不触发开场语音；切歌淡入淡出，同曲继续播放。

## 更新与存档

路径必须指向实际文件，不可只改扩展名。背景 PNG 按场景检查并按需加载。NPC 差分统一角色高度、脚底锚点及 contain。原 NPC 有灰色晕圈，runtime 的 neutral 使用新增透明 happy/calm 图。

vendor 来自固定官方包，无 service worker、debug 或 source map。普通体验不调用生成接口，不需要生成密钥。

小说存档按章节/路线区分；积分由 Vue 独立保存，读小说旧档不回滚或重复发积分。答题中、跨设备、清除浏览器数据后不作恢复保证。
