# 上游项目接入规划

目标：在 GitHub Pages 静态站点 `/resume/demos/` 中接入三个开源项目的核心产品流程，并保留可切换的真实后端连接能力。

## 上游项目

1. `keirosang/PrismPix` — GPL-3.0
   - 三阶段：产品分析 → 营销策略 / Prompt → 图片生成
   - 后端：Python + Flask + OpenAI 兼容 API
   - 接入方式：独立实现兼容前端，不复制 GPL 源码；通过相同 API 路径连接用户自行部署的 PrismPix 后端。

2. `w466747380/talk-to-fengge-live` — MIT
   - 角色库、人设、音色、Vidu Live、RTC / WebSocket 状态流
   - 后端：Python HTTP 服务 + WebSocket 代理 + Vidu API
   - 接入方式：静态适配控制台；支持演示模式，也可配置本地/远程后端调用 `/api/config`、`/api/characters`、`/api/personas`、`/api/voice/clone` 和 `/api/live`。

3. `pmh1314520/WebRPA` — AGPL-3.0 + 商业授权
   - 可视化拖拽工作流、模块配置、运行、日志和人工审批
   - 后端与执行器：FastAPI / Python / Windows 自动化环境
   - 接入方式：独立实现浏览器端兼容演示，不复制 AGPL 源码；提供后端地址配置和工作流 JSON 导入/导出。

## GitHub Pages 边界

GitHub Pages 只能托管静态文件，不能直接运行 Python、FastAPI、Flask、WebSocket 代理、Windows 自动化执行器或保存 API Key。因此：

- 未配置后端时，三个页面均运行演示模式，核心流程可以完整交互。
- 配置后端后，PrismPix 和 talk-to-fengge-live 使用真实 API。
- WebRPA 页面可导出与导入工作流 JSON；实际浏览器/桌面执行需要本地 WebRPA 服务。
- 不把任何 API Key 写入仓库或构建产物。

## 验收

- `/demos/ai-ecommerce/`：上传图片、分析、生成 14 条 Prompt、编辑 Prompt、生成/查看 H1-H5 与 D1-D9、连接后端。
- `/demos/digitalhuman/`：角色选择、新建/保存角色、人设编辑、音色选择/克隆、创建通话、连接进度、挂断、设备检测、连接后端。
- `/demos/rpa/`：拖拽/添加节点、连线顺序、节点参数编辑、运行/暂停/单步、人工审批、日志、JSON 导入导出、后端地址配置。
- 360/390/1440 视口无横向溢出。
- 所有脚本通过 `node --check`，主站通过 TypeScript 与 Vite 构建。
