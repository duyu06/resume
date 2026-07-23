(() => {
  'use strict';

  const segments = location.pathname.split('/').filter(Boolean);
  const demosIndex = segments.indexOf('demos');
  const slug = demosIndex >= 0 ? segments[demosIndex + 1] : '';
  if (!slug || !window.__portfolioDemoMode) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const waitFor = async (predicate, timeout = 30000, interval = 80) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const value = predicate();
      if (value) return value;
      await sleep(interval);
    }
    throw new Error('等待演示状态超时');
  };

  const panel = $('.demo-mode-panel');
  const status = $('[data-demo-status]', panel);
  const percent = $('[data-demo-percent]', panel);
  const track = $('.demo-mode-track i', panel);
  const log = $('.demo-mode-log', panel);
  const toast = $('.demo-mode-toast');
  let toastTimer = 0;

  const fitPanelToVisualViewport = () => {
    if (!panel || !matchMedia('(max-width: 680px)').matches) {
      panel?.style.removeProperty('bottom');
      panel?.style.removeProperty('max-height');
      return;
    }

    const viewport = window.visualViewport;
    const visualHeight = Math.max(0, viewport?.height ?? window.innerHeight);
    const offsetTop = viewport?.offsetTop ?? 0;
    const layoutBottomInset = Math.max(0, window.innerHeight - (offsetTop + visualHeight));
    const reservedTopGap = Math.min(8, visualHeight);
    const availableHeight = Math.max(0, visualHeight - reservedTopGap);

    panel.style.bottom = `${layoutBottomInset}px`;
    panel.style.maxHeight = `${Math.min(760, availableHeight)}px`;
  };

  fitPanelToVisualViewport();
  window.addEventListener('resize', fitPanelToVisualViewport, { passive: true });
  window.visualViewport?.addEventListener('resize', fitPanelToVisualViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', fitPanelToVisualViewport, { passive: true });

  const setProgress = (value, label) => {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    track.style.width = `${safe}%`;
    percent.textContent = `${safe}%`;
    status.textContent = label;
  };

  const addLog = (message, tone = 'info') => {
    const item = document.createElement('li');
    item.className = tone;
    item.innerHTML = `<b>${tone.toUpperCase()}</b><span>${message}</span>`;
    log.append(item);
    item.scrollIntoView({ block: 'nearest' });
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
  };

  const setActionsDisabled = (disabled) => {
    $$('.demo-mode-actions button', panel).forEach((button) => {
      button.disabled = disabled;
    });
  };

  const resetKeys = {
    'ai-ecommerce': {
      local: ['prismpix_backend', 'prismpix_real'],
      session: [],
    },
    digitalhuman: {
      local: [
        'customer_agent_backend',
        'customer_agent_real',
        'customer_agent_customer_id',
        'customer_agent_conversation_id',
        'fengge_backend',
        'fengge_region',
        'fengge_real',
        'fengge_demo_characters',
        'fengge_demo_personas',
      ],
      session: ['customer_agent_token', 'fengge_api_key'],
    },
    rpa: {
      local: ['webrpa_backend', 'webrpa_real', 'webrpa_demo_workflow'],
      session: [],
    },
    guoyang: { local: [], session: [] },
    'cross-border': { local: [], session: [] },
    webui: { local: [], session: [] },
    soulcaller: { local: [], session: [] },
  };

  const resetButton = $('[data-demo-action="reset"]', panel);
  resetButton?.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const keys = resetKeys[slug] || { local: [], session: [] };
      keys.local.forEach((key) => localStorage.removeItem(key));
      keys.session.forEach((key) => sessionStorage.removeItem(key));
      showToast('演示模式、连接配置与示例数据已重置');
      window.setTimeout(() => location.reload(), 260);
    },
    true,
  );

  if (slug === 'digitalhuman') {
    $('#demo-mode-title', panel).textContent = 'AI 客服数字人 Agent';
    $('.demo-mode-copy', panel).textContent = '演示数字人客服接待、订单查询、库存核验、退款处理、情绪识别、工具调用和人工转接。';
    $('.demo-mode-boundary', panel).textContent = '默认使用本地演示 Agent，不调用真实订单、退款或模型服务。真实模式仅连接自行部署的客服 Agent API。';

    const runButton = $('[data-demo-action="run"]', panel);
    const errorButton = $('[data-demo-action="error"]', panel);

    const ensureLocalAgent = () => {
      const realMode = $('#real-mode');
      if (!realMode?.checked) return;
      realMode.checked = false;
      realMode.dispatchEvent(new Event('change', { bubbles: true }));
      addLog('已切换回本地演示 Agent');
    };

    const runCustomerAgentDemo = async () => {
      if (runButton.disabled) return;
      document.body.classList.remove('demo-mode-error');
      log.innerHTML = '';
      setActionsDisabled(true);
      ensureLocalAgent();
      addLog('开始运行 AI 客服数字人演示');

      try {
        setProgress(10, '建立客服会话');
        $('#new-conversation')?.click();
        await waitFor(() => $$('.message.agent').length >= 1, 5000);

        setProgress(26, '查询客户订单');
        $('[data-quick="order"]')?.click();
        await waitFor(() => $$('.message.agent').length >= 2 && $('#tool-log')?.textContent?.includes('lookup_order'), 12000);
        addLog('订单查询工具已返回物流状态', 'success');

        setProgress(50, '处理退款预申请');
        $('[data-quick="refund"]')?.click();
        await waitFor(() => $$('.message.agent').length >= 3 && $('#tool-log')?.textContent?.includes('process_refund'), 12000);
        addLog('退款资格已核验并生成预申请', 'success');

        setProgress(70, '确认并提交退款');
        await window.__customerServiceAgentDemo?.send('确认商品未拆封且配件完整，请正式提交退款');
        await waitFor(() => $('#tool-log')?.textContent?.includes('confirm_refund'), 12000);
        addLog('客户确认已记录，退款申请正式提交', 'success');

        setProgress(88, '汇总服务质量');
        $('#load-performance')?.click();
        await waitFor(() => $('#performance-report')?.textContent?.includes('工具调用'), 5000);

        setProgress(100, '演示完成');
        addLog('客服会话、订单查询、退款闭环、情绪分析与性能报告均已完成', 'success');
        showToast('AI 客服数字人演示完成');
      } catch (error) {
        document.body.classList.add('demo-mode-error');
        setProgress(Number(percent.textContent.replace('%', '')) || 0, '演示失败');
        addLog(error instanceof Error ? error.message : String(error), 'error');
        showToast('客服 Agent 演示未完成');
      } finally {
        setActionsDisabled(false);
      }
    };

    const runCustomerAgentError = async () => {
      if (errorButton.disabled) return;
      setActionsDisabled(true);
      document.body.classList.add('demo-mode-error');
      log.innerHTML = '';
      setProgress(24, '模拟订单工具异常');
      addLog('订单服务暂时不可用，Agent 保留会话上下文并启动降级策略');
      await sleep(420);
      setProgress(64, '转人工坐席');
      addLog('自动处理停止，客户 ID、会话 ID 和问题摘要已准备转交', 'error');
      await sleep(320);
      setProgress(100, '异常已捕获');
      showToast('客服 Agent 异常路径已完成');
      setActionsDisabled(false);
    };

    runButton?.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        runCustomerAgentDemo();
      },
      true,
    );

    errorButton?.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        runCustomerAgentError();
      },
      true,
    );

    window.__portfolioDemoMode.run = runCustomerAgentDemo;
    window.__portfolioDemoMode.error = runCustomerAgentError;
  }

  if (slug === 'rpa') {
    const errorButton = $('[data-demo-action="error"]', panel);
    errorButton?.addEventListener(
      'click',
      async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (errorButton.disabled) return;

        document.body.classList.add('demo-mode-error', 'demo-mode-busy');
        setActionsDisabled(true);
        setProgress(8, '启动异常流程');
        addLog('启动 WebRPA 异常演示');

        try {
          const runButton = $('#run');
          if (!runButton || runButton.disabled) throw new Error('工作流当前不可启动');
          runButton.click();
          await waitFor(() => !$('#approval-card')?.hidden, 26000);
          setProgress(58, '等待人工审批');
          addLog('工作流已到达人工审批节点');
          $('#reject')?.click();
          await waitFor(() => !$('#run')?.disabled, 16000);
          setProgress(100, '异常已捕获');
          addLog('人工驳回已生效，底层工作流停止并记录失败日志', 'error');
          showToast('RPA 异常路径已完成');
        } catch (error) {
          setProgress(100, '异常演示失败');
          addLog(error instanceof Error ? error.message : String(error), 'error');
          showToast('RPA 异常路径未完成');
        } finally {
          document.body.classList.remove('demo-mode-busy');
          setActionsDisabled(false);
        }
      },
      true,
    );
  }

  if (slug === 'webui' || slug === 'soulcaller') {
    const runButton = $('[data-demo-action="run"]', panel);
    if (runButton) {
      const internalSelector = slug === 'webui' ? '[data-webui-run]' : '[data-soul-run]';
      const expectedStatus = slug === 'webui' ? '模拟推理完成' : '本轮协作完成';

      const runSyntheticDemo = async () => {
        if (runButton.disabled) return;
        document.body.classList.remove('demo-mode-error');
        log.innerHTML = '';
        setActionsDisabled(true);
        addLog('开始运行本地演示流程');
        const internalButton = $(internalSelector);
        if (!internalButton) throw new Error('未找到项目内部演示入口');
        internalButton.click();
        await waitFor(
          () => Number(percent.textContent.replace('%', '')) === 100 && status.textContent === expectedStatus && !document.body.classList.contains('demo-mode-busy'),
          15000,
        );
        status.textContent = '演示完成';
        addLog('异步演示任务已真正结束', 'success');
        showToast('演示流程已完成');
        setActionsDisabled(false);
      };

      runButton.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          runSyntheticDemo().catch((error) => {
            document.body.classList.add('demo-mode-error');
            status.textContent = '演示失败';
            addLog(error instanceof Error ? error.message : String(error), 'error');
            showToast('演示流程未完成');
            setActionsDisabled(false);
          });
        },
        true,
      );

      window.__portfolioDemoMode.run = runSyntheticDemo;
    }
  }
})();
