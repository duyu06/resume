# YOLA 动效密度与 Demo 界面清理计划

## 目标

1. 将 YOLA 从“视频滚动 + 单次横向移动”升级为连续的高端珠宝叙事体验。
2. 在所有可访问 Demo 页面中移除可见的“上游源码”跳转入口。
3. 保留许可证、来源与静态托管边界说明在仓库文档中，不删除合规记录。
4. 保留现有商品快速查看、尺寸选择、加入购物袋和演示模式自动化路径。
5. 桌面端与手机端分别使用适合设备的运动模型，并提供减少动态效果降级。

## 设计参考

采用 MotionSites 公开展示中的以下设计原则，不复制受限付费提示词原文或品牌素材：

- OYLA Ecommerce：编辑式高端电商、强产品摄影、克制的购买路径。
- Layered Depth：前景文字、材质信息和产品影像分层揭示。
- Prisma Creative Studio：电影化排版、章节式滚动节奏。
- Interactive Discovery：滚动过程持续给予可感知的探索反馈。

## YOLA 关键帧结构

首屏 14 个连续阶段：

1. Brand Origin
2. Measured Purity
3. Oxidized Silver
4. Hand Finished
5. Weight & Presence
6. Edge Study
7. Surface Shadow
8. Form Rotation
9. Artisan Mark
10. Collection Signal
11. Product Arrival
12. Material Index
13. Wear Statement
14. Enter Collection

商品区 8 个连续阶段：

1. Collection Intro
2. Rail Start
3. Obsidian Focus
4. Void Focus
5. Onyx Focus
6. Shadow Focus
7. Craft Reveal
8. Purchase Signal

## 技术策略

- 桌面端：GSAP ScrollTrigger 数值 scrub；只动画 transform、opacity、filter 和 CSS 变量。
- 手机端：保留首屏 sticky 叙事；商品区改用原生横向 scroll-snap，不执行重型 pin。
- 视频：视频成功解码时作为背景纹理；核心叙事不依赖视频 seek，远程视频失败时仍有完整动效。
- 测试标记：页面写入 `data-yola-keyframe`、`data-yola-section` 和阶段计数，供端到端测试验证。
- 无障碍：关键帧说明为装饰层；交互按钮保留原生语义；减少动态效果时直接显示最终稳定状态。

## 上游链接清理

- 删除 AI 电商、数字人、WebRPA 等页面中包含“上游源码”的可见锚点。
- 构建脚本对全部 Demo HTML 再执行一次统一清理和断言，防止未来页面重新引入。
- E2E 对七个 Demo 验证不存在文本包含“上游源码”的锚点。

## 验收标准

- YOLA 首屏至少可观测 10 个不同关键帧状态。
- YOLA 商品区至少可观测 6 个不同阶段。
- 商品快速查看与加入购物袋仍可运行。
- 七个 Demo 均无“上游源码”可见链接。
- 桌面 1440×900、手机 390×844 均无横向页面溢出。
- `prefers-reduced-motion` 下没有强制滚动动画。
- JavaScript 语法、TypeScript、Vite 构建和线上 E2E 全部通过后才合并。
