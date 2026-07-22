import { useEffect, useRef } from 'react';
import './LayeredIntelligence.css';
import './LayeredIntelligenceReadability.css';

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
      root.style.setProperty('--spot-x', '78%');
      root.style.setProperty('--spot-y', '36%');
      return;
    }

    let targetX = 0.78;
    let targetY = 0.36;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;
    let visible = true;
    let touchControlUntil = 0;

    const setPointerTarget = (clientX: number, clientY: number, isTouch = false) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;

      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (!inside) return false;

      const pointerX = (clientX - rect.left) / rect.width;
      const pointerY = (clientY - rect.top) / rect.height;

      if (isTouch) {
        // Mobile keeps the reveal in the decorative right half while still
        // responding clearly to horizontal and vertical finger movement.
        targetX = Math.min(0.92, Math.max(0.56, pointerX));
        targetY = Math.min(0.76, Math.max(0.16, pointerY));
        touchControlUntil = performance.now() + 1800;
      } else {
        targetX = Math.min(0.94, Math.max(0.7, pointerX));
        targetY = Math.min(0.72, Math.max(0.18, pointerY));
      }

      return true;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!setPointerTarget(event.clientX, event.clientY)) {
        targetX = 0.82;
        targetY = 0.34;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      setPointerTarget(touch.clientX, touch.clientY, true);
    };

    const onTouchEnd = () => {
      touchControlUntil = performance.now() + 900;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: '120px' },
    );

    observer.observe(root);

    if (finePointer.matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    } else {
      window.addEventListener('touchstart', onTouchMove, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }

    const tick = (time: number) => {
      if (visible) {
        if (!finePointer.matches && time > touchControlUntil) {
          // Roughly one horizontal scan every 7 seconds. The secondary
          // vertical movement prevents the effect from feeling mechanical.
          targetX = 0.73 + Math.sin(time / 1150) * 0.16;
          targetY = 0.38 + Math.cos(time / 1800) * 0.11;
        }

        currentX += (targetX - currentX) * 0.065;
        currentY += (targetY - currentY) * 0.065;
        root.style.setProperty('--spot-x', `${currentX * 100}%`);
        root.style.setProperty('--spot-y', `${currentY * 100}%`);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
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
