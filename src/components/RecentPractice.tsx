const updates = [{"title": "eBay 自动刊登工作台", "status": "基于 Vibe Seller 二次开发 · 单品生产验证", "summary": "串联 CSV/XLSX 商品导入、草稿编辑、人工审核、队列执行与刊登回读。使用 Python / FastAPI / SQLAlchemy / SQLite 和 React / TypeScript，集成 eBay MCP/Trading 通道，并以账号、环境和 SKU 锁及持久操作记录防止重复刊登。", "boundary": "2026-11-03 已完成一款授权单 SKU 固定价商品的生产发布、完整回读及后续下架验证。多店批量、全品类、无人值守及当前在线可用性未验收；不将项目实践计作正式雇佣经历。"}, {"title": "YAOKE · 汽配 AI 电商素材", "status": "持续迭代", "summary": "围绕真实商品图，组织产品分析、提示词生成与图像生产；区分商品主图区和详情图，强调结构真实性、素材版本与失败恢复。", "boundary": "已开展多模型网关和素材工作流实践；不将全部平台适配或商用运营描述为已完成。"}, {"title": "EchoSoul · AI 陪伴 Agent", "status": "个人项目 · 开发中", "summary": "围绕长期记忆、回复时机、人格表达和消息队列迭代，关注 Windows 微信发送的可靠性与异常恢复。", "boundary": "已开展本地实现和离线验证；实时语音、原生微信能力与长期拟真效果仍需持续实机验证。"}, {"title": "表弟租车 · 双端微信小程序", "status": "本地验证 · 未上线", "summary": "客户与门店两个小程序共享后端设计，覆盖车辆档期、订单、提还车、押金、续租记录与只读账单。", "boundary": "本地测试与微信开发者工具验证已推进；真实云、支付、正式签署与经营规则边界尚未完成上线联调。"}];

export default function RecentPractice() {
 return <section id="recent-practice" aria-labelledby="recent-practice-title" className="bg-surface px-5 py-16 sm:px-8 md:px-10 md:py-24">
  <div className="mx-auto max-w-7xl">
   <p className="font-mono text-xs tracking-widest text-accent">PRACTICE NOTES / 2026.11</p>
   <h2 id="recent-practice-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">最近在做什么</h2>
   <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-dim">现居广州。以下是近期项目实践更新，不作为正式全职雇佣经历；本地验证、上线联调与商业运营分别说明。</p>
   <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
    {updates.map(item => <article key={item.title} className="grid gap-5 py-7 md:grid-cols-[0.65fr_1fr] md:gap-12">
     <div><span className="text-xs font-medium text-accent">{item.status}</span><h3 className="mt-2 text-xl font-bold sm:text-2xl">{item.title}</h3></div>
     <div><p className="text-sm leading-7 text-ink">{item.summary}</p><p className="mt-3 text-sm leading-7 text-ink-dim">{item.boundary}</p></div>
    </article>)}
   </div>
   <p className="mt-5 text-xs text-ink-dim">内容更新：2026 年 11 月 9 日。原 PDF 为历史版本，最新状态以本页与在线简历为准。</p>
  </div>
 </section>;
}
