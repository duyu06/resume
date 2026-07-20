import FadeIn from './FadeIn';

const items = [
  {
    n: '01',
    name: 'AI 产品经理',
    desc: '业务场景分析、用户任务流、需求拆解、功能优先级、MVP 定义、版本规划、验收标准与迭代复盘。从 0 到 1 推进果漾多模态内容生产、AI 电商主图与独立站闭环。',
  },
  {
    n: '02',
    name: '技术产品经理',
    desc: '大模型 API、RAG、Agent、多模态工作流、异步任务与 WebSocket 状态回传。可使用 Go / Python、Vue / React 完成原型与部分功能开发。',
  },
  {
    n: '03',
    name: 'AI 解决方案',
    desc: '从模型能力边界、生成质量、响应速度、稳定性与调用成本做产品决策。具备 vLLM / Ollama / Open WebUI 私有化部署与 GPU 监控经验。',
  },
  {
    n: '04',
    name: '电商产品与增长',
    desc: '商品信息架构、SPU/SKU、购物车结算、转化漏斗与行为埋点。将 AI 素材生成嵌入上架流程，串联内容生产与交易转化。',
  },
  {
    n: '05',
    name: 'RPA 与流程自动化',
    desc: '业务流程拆解、任务节点编排、数据驱动执行、多账号环境管理、异常分支、失败重试、日志回传与人工审核节点设计。',
  },
  {
    n: '06',
    name: '部署与商业化',
    desc: '测试用例、部署手册、参数手册与故障排查文档。关注模型成本、失败率、套餐分层与可计费能力，为商业化预留扩展空间。',
  },
];

export default function CareerSection() {
  return (
    <section
      id="career"
      className="rounded-t-[40px] bg-white px-5 py-20 text-ink-dark sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn y={40}>
        <h2
          className="mb-16 text-center font-display font-black uppercase leading-none tracking-tight text-ink-dark sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Career
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {items.map((it, i) => (
          <FadeIn key={it.n} delay={i * 0.08} y={24}>
            <div className="flex flex-col gap-3 border-b border-black/15 py-8 sm:flex-row sm:items-start sm:gap-8 sm:py-10 md:gap-12 md:py-12">
              <div
                className="shrink-0 font-display font-black leading-none text-ink-dark"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {it.n}
              </div>
              <div className="flex flex-col gap-2 pt-1 sm:pt-4">
                <h3
                  className="font-display font-medium uppercase tracking-wide"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {it.name}
                </h3>
                <p
                  className="max-w-2xl font-light leading-relaxed opacity-60"
                  style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
                >
                  {it.desc}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
