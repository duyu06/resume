import { useEffect, useRef } from 'react';

const productSteps = ['业务问题', '用户任务', 'MVP', '产品价值'];
const deliverySteps = ['PROMPT', 'API', 'QUEUE', 'WEBSOCKET', 'DELIVERY'];

export default function LayeredIntelligence() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    if (reducedMotion.matches) {
      root.style.setProperty('--spot-x', '68%');
      root.style.setProperty('--spot-y', '42%');
      return;
    }

    let targetX = 0.68;
    let targetY = 0.42;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;
    let visible = true;

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      targetY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    };

    const onPointerLeave = () => {
      targetX = 0.68;
      targetY = 0.42;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: '120px' },
    );

    observer.observe(root);

    if (finePointer.matches) {
      root.addEventListener('pointermove', onPointerMove, { passive: true });
      root.addEventListener('pointerleave', onPointerLeave, { passive: true });
    }

    const tick = (time: number) => {
      if (visible) {
        if (!finePointer.matches) {
          targetX = 0.55 + Math.sin(time / 2200) * 0.18;
          targetY = 0.46 + Math.cos(time / 2800) * 0.12;
        }

        currentX += (targetX - currentX) * 0.085;
        currentY += (targetY - currentY) * 0.085;
        root.style.setProperty('--spot-x', `${currentX * 100}%`);
        root.style.setProperty('--spot-y', `${currentY * 100}%`);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="layered-intelligence" aria-hidden="true">
      <div className="layered-intelligence__product">
        <div className="layered-intelligence__eyebrow">
          <span>PRODUCT LAYER</span>
          <span>01</span>
        </div>

        <div className="layered-intelligence__flow">
          {productSteps.map((step, index) => (
            <div key={step} className="layered-intelligence__flow-item">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>

        <div className="layered-intelligence__product-card layered-intelligence__product-card--left">
          <span className="layered-intelligence__micro-label">USER FLOW</span>
          <strong>从需求到可验证原型</strong>
          <p>用户场景 · 功能优先级 · 验收标准</p>
        </div>

        <div className="layered-intelligence__product-card layered-intelligence__product-card--right">
          <span className="layered-intelligence__micro-label">PRODUCT VALUE</span>
          <strong>可用、可评测、可交付</strong>
          <div className="layered-intelligence__bars">
            <i style={{ width: '82%' }} />
            <i style={{ width: '64%' }} />
            <i style={{ width: '74%' }} />
          </div>
        </div>
      </div>

      <div className="layered-intelligence__technology">
        <div className="layered-intelligence__tech-shell">
          <div className="layered-intelligence__eyebrow layered-intelligence__eyebrow--tech">
            <span>TECHNICAL LAYER</span>
            <span>02</span>
          </div>

          <div className="layered-intelligence__delivery-chain">
            {deliverySteps.map((step, index) => (
              <div key={step} className="layered-intelligence__delivery-node">
                <span>{step}</span>
                {index < deliverySteps.length - 1 && <i />}
              </div>
            ))}
          </div>

          <div className="layered-intelligence__tech-grid">
            <div>
              <span>MODEL ROUTING</span>
              <strong>质量 / 时延 / 成本</strong>
            </div>
            <div>
              <span>ASYNC TASK</span>
              <strong>状态 / 重试 / 留存</strong>
            </div>
            <div>
              <span>OBSERVABILITY</span>
              <strong>GPU / Token / Service</strong>
            </div>
          </div>

          <div className="layered-intelligence__terminal">
            <span>workflow.status</span>
            <strong>DELIVERABLE</strong>
            <em>WebSocket connected · retry policy ready</em>
          </div>
        </div>
      </div>

      <div className="layered-intelligence__spot-ring" />
    </div>
  );
}
