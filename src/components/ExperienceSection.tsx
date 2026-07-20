import FadeIn from './FadeIn';

const cards = [
  {
    dark: true,
    title: '教育背景',
    meta: '湖南大众传媒 · 计算机网络技术 · 2023.09—2026.06 · 前 5%',
    items: [
      '专业成绩前 5%；主修计算机网络、Linux、路由交换、Windows Server',
      '易班优秀委员（2024）、思政课研究性学习竞赛二等奖（第十、十一届）',
      '班级宣传委员、易班学生工作处班级联络人',
    ],
  },
  {
    dark: false,
    title: '专业技能',
    meta: '产品 × AI × 电商 × RPA × 工程',
    items: [
      '产品：需求分析、用户流程、MVP、验收标准、产品文档',
      'AI：大模型 API、RAG、Agent、多模态、微调、模型评测',
      '电商：SPU/SKU、购物车结算、转化漏斗、埋点、独立站',
      'RPA：隐刀 RPA、指纹浏览器、流程编排、数据驱动、异常处理',
      '工程：Go/Gin、Python/FastAPI、Vue3/Next.js、Docker/Nginx',
    ],
  },
  {
    dark: false,
    title: '智慧校园网络集成',
    meta: '网络方案设计 / 配置验证 · Huawei eNSP',
    items: [
      '3 km 东西校区三层网络；3,500 用户 / 500 AP / 2 Gbps 出口',
      'VRRP、MSTP、OSPF、NAT、DHCP Relay、ACL、Eth-Trunk 验证',
      '输出拓扑、设备配置、测试用例与故障排查记录',
    ],
  },
  {
    dark: true,
    title: 'OpenStack + VMware',
    meta: '项目参与人 · 2024.11—2025.03',
    items: [
      '多节点高可用私有云（vSphere / ESXi / Ceph / Ansible）',
      '计算/网络/存储联调、资源规划、验收测试与模板自动化',
    ],
  },
];

export default function ExperienceSection() {
  return (
    <section id="exp" className="bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-12 text-center font-display font-black uppercase leading-none tracking-tight sm:mb-16"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 120px)' }}
        >
          Experience
        </h2>
      </FadeIn>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {cards.map((c, i) => (
          <FadeIn key={c.title} delay={i * 0.08} y={24}>
            <article
              className={`flex h-full flex-col gap-3 rounded-[32px] px-7 py-8 md:rounded-[40px] md:px-9 ${
                c.dark
                  ? 'bg-[#111] text-ink shadow-[inset_0_2px_8px_rgba(255,255,255,0.06)]'
                  : 'bg-white text-ink-dark shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
              }`}
            >
              <h3 className="font-display text-xl font-semibold md:text-2xl">{c.title}</h3>
              <p className={`text-xs ${c.dark ? 'text-ink-dim' : 'text-black/55'}`}>{c.meta}</p>
              <ul className="mt-1 flex flex-col gap-2">
                {c.items.map((item) => (
                  <li
                    key={item}
                    className={`relative pl-4 text-sm leading-relaxed ${
                      c.dark ? 'text-ink/80' : 'text-black/65'
                    }`}
                  >
                    <span className="absolute left-0 top-[0.55em] h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.2} y={20}>
        <div className="glass mx-auto mt-10 max-w-5xl rounded-[28px] px-6 py-6 md:px-8 md:py-7">
          <h3 className="font-display text-lg font-semibold text-ink md:text-xl">个人特质</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-dim md:text-base">
            具备较强的自驱学习和动手验证能力，习惯先明确业务场景、目标用户、关键指标和验收标准，再推进原型、研发协同与部署验证。关注的不只是模型能否生成，还包括结果是否稳定、任务是否可追踪、成本是否可控、问题是否可评测以及方案是否能够真正交付。
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
