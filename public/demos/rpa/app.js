(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = $('#toast');
  const runningKpi = $('#running-kpi');
  const approvalKpi = $('#approval-kpi');
  const logList = $('#log-list');
  const approvalList = $('.approval-list');
  let toastTimer = 0;
  let running = true;
  let approvals = 7;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function addLog(message, level = 'INFO') {
    const row = document.createElement('div');
    row.className = `log${level === 'WARN' ? ' warn' : ''}`;
    row.innerHTML = `<time>${new Date().toLocaleTimeString('zh-CN', { hour12: false })}</time><span>${message}</span><em>${level}</em>`;
    logList.prepend(row);
  }

  $$('.nav button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.nav button').forEach((item) => item.classList.toggle('active', item === button));
      notify(`已切换到 ${button.textContent.trim()}`);
    });
  });

  $$('.tab').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.tab').forEach((item) => item.classList.toggle('active', item === button));
      const filter = button.dataset.filter;
      $$('.task').forEach((task) => {
        task.hidden = filter !== 'all' && task.dataset.priority !== filter;
      });
    });
  });

  $$('.env').forEach((environment) => {
    environment.addEventListener('click', () => {
      $$('.env').forEach((item) => item.classList.toggle('active', item === environment));
      notify(`已选择 ${environment.dataset.env}，账号隔离策略保持启用`);
    });
  });

  $('#toggle-run')?.addEventListener('click', (event) => {
    running = !running;
    event.currentTarget.textContent = running ? '暂停执行' : '恢复执行';
    runningKpi.textContent = running ? '32' : '0';
    $$('.browser .status').forEach((status) => {
      status.textContent = running ? '执行中' : '已暂停';
      status.style.background = running ? '#e8f8ef' : '#fff2d9';
      status.style.color = running ? '#16874f' : '#a76700';
    });
    addLog(running ? '人工恢复自动化任务' : '人工暂停全部执行任务', 'WARN');
    notify(running ? '任务已恢复，继续从安全检查点执行' : '任务已暂停，提交动作不会继续');
  });

  $('#retry')?.addEventListener('click', () => {
    addLog('任务 #1027 已从失败检查点重新排队');
    notify('重试已进入队列，保留原失败原因与审计记录');
  });

  const approvalRecords = () => $$('.approval', approvalList);

  approvalRecords().forEach((item) => {
    item.addEventListener('click', () => {
      approvalRecords().forEach((row) => row.classList.toggle('selected', row === item));
      $('#approval-title').textContent = item.dataset.title;
      $('#approval-meta').textContent = `${item.dataset.task} · ${item.dataset.account} · ${item.dataset.env}`;
    });
  });

  function resolveApproval(result) {
    const selected = $('.approval.selected', approvalList);
    if (!selected) return;
    const title = selected.dataset.title;
    selected.remove();
    approvals = Math.max(0, approvals - 1);
    approvalKpi.textContent = String(approvals);
    const next = $('.approval', approvalList);
    if (next) {
      next.classList.add('selected');
      $('#approval-title').textContent = next.dataset.title;
      $('#approval-meta').textContent = `${next.dataset.task} · ${next.dataset.account} · ${next.dataset.env}`;
    } else {
      $('#approval-title').textContent = '暂无待审批事项';
      $('#approval-meta').textContent = '关键提交动作仍需人工确认';
    }
    addLog(`${title}${result === 'approve' ? '已通过并提交' : '已驳回并返回重处理'}`, result === 'approve' ? 'INFO' : 'WARN');
    notify(result === 'approve' ? '审批通过，任务进入提交与回写阶段' : '审批驳回，任务已回到数据处理节点');
  }

  $('#approve')?.addEventListener('click', () => resolveApproval('approve'));
  $('#reject')?.addEventListener('click', () => resolveApproval('reject'));

  $('#simulate-error')?.addEventListener('click', () => {
    const card = $$('.browser')[3];
    const status = $('.status', card);
    status.textContent = '登录失效';
    status.style.background = '#ffe8ea';
    status.style.color = '#b83f4b';
    addLog('任务 #1027 登录状态失效，流程已安全中止', 'WARN');
    notify('异常已捕获：等待人工重新认证，不会继续提交');
  });
})();
