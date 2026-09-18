import { motion, useReducedMotion } from 'framer-motion';

const evidence = [
  {
    index: '01',
    value: '1W+ → 7,328',
    label: '原始数据 → 有效训练数据',
    source: '数字人风格对话模型微调',
    detail: '完成清洗、去重、标注与 JSONL 训练集构建。',
  },
  {
    index: '02',
    value: '4h → 20min',
    label: '模型平台单次部署时间',
    source: 'Open WebUI / 本地模型平台',
    detail: '通过 Docker Compose 标准化依赖、配置与部署流程。',
  },
  {
    index: '03',
    value: '50+',
    label: 'token/s 典型本地推理吞吐',
    source: '本地推理与监控实践',
    detail: '结合 GPU、显存、服务状态与 Token 吞吐建立监控链路。',
  },
  {
    index: '04',
    value: '26',
    label: '标准测试 Prompt',
    source: '数字人模型评测体系',
    detail: '建立 25 分制五维评分卡，让模型版本具备可比较的评测基础。',
  },
];

export default function Evidence() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="evidence" className="border-y border-ink/8 bg-surface px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-5 md:grid-cols-[1fr_0.7fr] md:items-end md:gap-12">
          <div>
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-accent">
              EVIDENCE, NOT DECORATION
            </p>
            <h2 className="mt-3 font-display text-[clamp(3rem,8vw,7.6rem)] font-black uppercase leading-[0.86] tracking-[-0.055em] text-ink">
              NOT CLAIMS.
              <br />
              PROOF.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-ink-dim md:justify-self-end md:text-base">
            不用“懂 AI”“会落地”做抽象描述，优先展示可核验的数据、交付结果与工程指标。
          </p>
        </div>

        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {evidence.map((item, index) => (
            <motion.article
              key={item.index}
              data-motion-reveal
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5% 0px -10% 0px' }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-4 py-7 sm:py-9 md:grid-cols-[72px_minmax(240px,0.8fr)_1fr] md:items-center md:gap-8"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-ink/35">{item.index}</span>
              <div>
                <div className="font-display text-[clamp(2.2rem,5vw,5.6rem)] font-black leading-none tracking-[-0.05em] text-ink">
                  {item.value}
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{item.label}</p>
              </div>
              <div className="max-w-xl md:justify-self-end">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-accent/80">{item.source}</p>
                <p className="mt-2 text-sm leading-6 text-ink-dim">{item.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
