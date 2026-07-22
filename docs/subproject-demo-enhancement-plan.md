# 子项目 Demo 增量升级规划

目标仓库：`duyu06/resume`

实施原则：保留现有 Demo 内容、编译产物、YOLA 品牌、项目 URL 和 `/resume/` GitHub Pages 路径，只增加可回退的共享案例增强层与必要的项目级交互。

## 一、现有结构

### 已编译独立前端包

- `public/demos/ai-ecommerce/`
- `public/demos/rpa/`
- `public/demos/webui/`
- `public/demos/soulcaller/`

这些页面通过现有 `incremental-enrich.css` 和 `incremental-enrich.js` 做共享增强。不得修改压缩后的业务 Bundle，也不得重新生成一套重复应用。

### 可直接编辑独立页面

- `public/demos/digitalhuman/index.html`
- `public/demos/cross-border/index.html`

数字人页面继续保留黑色电影感、视频滚动和评测卡片；跨境电商继续保持 YOLA 珠宝品牌和现有产品素材。

## 二、统一案例层

六个 Demo 统一增加：

1. 页面滚动进度条
2. 当前系统状态胶囊
3. 根据滚动进度变化的项目流程轨道
4. “查看产品逻辑”入口
5. 可访问的案例抽屉：业务问题、核心流程、项目证据、边界说明
6. 原型状态演示：正常、加载、空状态、异常
7. Esc 关闭、焦点管理、移动端安全区与 reduced-motion 降级

所有状态必须明确标注为“原型状态演示”，不得伪装成真实线上数据。

## 三、项目级规划

### 1. AI 电商主图生成器

定位：商品素材生产工作台。

流程：

`上传原图 → 主体识别 → 风格配置 → 批量生成 → 审核导出`

增强重点：

- 珊瑚橙强调色
- 生成队列与主体锁定状态表达
- 展示平台适配、版本比较、失败重试和人工审核
- 状态演示文案围绕图片生成任务

MotionSites 机制：Interactive Discovery 的分层揭示、Prisma 的模块化卡片和受控入场。

### 2. 数字人风格对话模型微调

定位：数据、训练、评测和 API 交付闭环。

流程：

`数据治理 → Prompt 协议 → 模型训练 → 标准评测 → API 交付`

增强重点：

- 薄荷绿强调色
- 保留现有电影感视频滚动
- 案例抽屉突出 1W+ 原始数据、7,328 条有效数据、26 条测试 Prompt 和 25 分评分卡
- 边界强调授权、脱敏、过拟合和格式异常

MotionSites 机制：Bold Studio 的大字号叙事、Prisma 的滚动文本与证据卡片。

### 3. 多账号运营 RPA 自动化系统

定位：带人工确认节点的自动化编排系统。

流程：

`环境隔离 → 任务读取 → 页面执行 → 人工确认 → 结果回写`

增强重点：

- 黄色强调色
- 明确人工确认是提交前的必要节点
- 状态演示覆盖登录失效、元素变化、网络异常和任务暂停
- 案例抽屉展示账号、环境、批次和执行记录映射

MotionSites 机制：Layered Intelligence 的系统层表达与受控状态反馈。

### 4. YOLA 跨境精品独立站

定位：高端手工珠宝品牌体验与交易链路原型。

流程：

`品牌进入 → 浏览系列 → 查看商品 → 加入购物袋 → 订阅与复访`

增强重点：

- 保留 YOLA、黑色手工戒指、现有视频和编辑式排版
- 增加商品快速查看与购物袋数量反馈，仅作为交互原型，不接真实支付
- 案例抽屉说明 SPU/SKU、库存、支付回调、订单履约和行为埋点属于产品设计范围
- 使用黑白与暖金属灰，不套用其他 Demo 的彩色科技风

MotionSites 机制：Prisma 的电影感编辑排版、3D Jack Portfolio 的项目视觉证据和轻量堆叠。

### 5. Open WebUI 多模型本地化平台

定位：本地模型接入、部署、监控与故障排查控制台。

流程：

`模型接入 → 服务部署 → 参数配置 → 运行监控 → 故障恢复`

增强重点：

- 蓝紫强调色
- 状态胶囊体现 Ollama、vLLM、Prometheus、Grafana
- 案例抽屉突出 4 小时到 20 分钟、50+ token/s 和显存利用率 85% 以下
- 状态演示覆盖模型离线、显存不足、健康检查失败和恢复

MotionSites 机制：Interactive Discovery 的技术揭示、技术仪表盘式信息层级。

### 6. 叫魂者多 Agent 叙事对话系统

定位：多角色、世界状态和分支剧情协作原型。

流程：

`角色 Agent → 记忆 Agent → 世界状态 → 导演 Agent → 安全边界`

增强重点：

- 紫色强调色
- 案例抽屉展示角色信息隔离、状态字段、关键事实注入和模拟/真实 API 模式
- 状态演示覆盖记忆不同步、角色越界、上下文丢失和边界恢复
- 动效保持实验性，但不得影响对话和剧情阅读

MotionSites 机制：Dreamcore Landing 的沉浸式场景感与克制视差。

## 四、实现文件

主要修改：

- `public/demos/incremental-enrich.css`
- `public/demos/incremental-enrich.js`
- `public/demos/cross-border/index.html`

必要时只对其他 Demo 的 `index.html` 增加 meta 或共享资源引用，不修改其压缩 Bundle。

## 五、验收标准

- [ ] 六个 Demo 都可识别正确项目配置
- [ ] 流程轨道随滚动进度变化
- [ ] 产品逻辑抽屉支持键盘和 Esc
- [ ] 状态演示明确标注为原型
- [ ] YOLA 商品快速查看和购物袋反馈可用
- [ ] 原有 Demo 内容和交互未删除
- [ ] 原有项目 URL 不变
- [ ] 移动端不横向溢出
- [ ] reduced-motion 下无强制动画
- [ ] `npm run build` 成功
- [ ] GitHub Pages `/resume/` 路径正常
