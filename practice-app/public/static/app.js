// Trade Desk Lite front end. Each page sets <body data-page="..."> and gets one init function.
// Everything is rendered with textContent (never innerHTML), so order data cannot inject markup.

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  return { status: response.status, ok: response.ok, body };
};

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of children) node.append(child);
  return node;
};

const formatPrice = value => Number(value).toFixed(2);
const formatQuantity = value => Number(value).toLocaleString('en-US');
const statusClass = status => `badge badge-${status.toLowerCase().replace(/\s+/g, '-')}`;

const showMessage = (id, text) => {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = text;
  node.hidden = !text;
};

const initHeader = async () => {
  const { ok, body: user } = await api('/api/me');
  if (!ok) return null;
  document.getElementById('current-user').textContent = `${user.displayName} (${user.role})`;
  document.querySelectorAll('[data-role]').forEach(node => {
    node.hidden = node.dataset.role !== user.role;
  });
  document.getElementById('sign-out').addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  });
  return user;
};

const initLogin = () => {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    showMessage('login-error', '');
    const { ok, body } = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: form.username.value.trim(), password: form.password.value }),
    });
    if (!ok) {
      showMessage('login-error', body?.error || 'Sign in failed.');
      return;
    }
    const next = new URLSearchParams(window.location.search).get('next');
    window.location.assign(next && next.startsWith('/') && !next.startsWith('//') ? next : '/orders');
  });
};

const initOrders = async () => {
  await initHeader();
  const { ok, body: orders } = await api('/api/orders');
  if (!ok) return;
  const tbody = document.getElementById('orders-body');
  const newestFirst = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const order of newestFirst) {
    const badge = el('span', { className: statusClass(order.status), textContent: order.status });
    badge.setAttribute('data-testid', 'order-status');
    tbody.append(
      el('tr', {}, [
        el('td', { textContent: order.id }),
        el('td', { textContent: order.symbol }),
        el('td', { textContent: order.side }),
        el('td', { textContent: formatQuantity(order.quantity) }),
        el('td', { textContent: formatPrice(order.limitPrice) }),
        el('td', {}, [badge]),
        // Every row has the same "View" link name on purpose: practice scoping a locator to one row.
        el('td', {}, [el('a', { href: `/orders/${encodeURIComponent(order.id)}`, textContent: 'View' })]),
      ]),
    );
  }
  document.getElementById('orders-empty').hidden = orders.length > 0;
};

const initOrderNew = async () => {
  await initHeader();
  const form = document.getElementById('order-form');
  const submit = document.getElementById('submit-order');
  const { body: symbols } = await api('/api/symbols');
  for (const symbol of symbols || []) form.symbol.append(el('option', { value: symbol, textContent: symbol }));

  const readTicket = () => ({
    symbol: form.symbol.value,
    side: form.querySelector('input[name="side"]:checked')?.value,
    quantity: Number(form.quantity.value),
    limitPrice: Number(form.limitPrice.value),
  });

  const isValid = ticket =>
    !!ticket.symbol &&
    !!ticket.side &&
    Number.isInteger(ticket.quantity) && ticket.quantity >= 1 && ticket.quantity <= 1_000_000 &&
    ticket.limitPrice > 0 && /^\d+(\.\d{1,2})?$/.test(form.limitPrice.value.trim());

  // Submit stays disabled until the ticket is valid.
  form.addEventListener('input', () => {
    submit.disabled = !isValid(readTicket());
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const ticket = readTicket();
    if (!isValid(ticket)) return;
    submit.disabled = true;
    showMessage('order-error', '');
    const { ok, body } = await api('/api/orders', { method: 'POST', body: JSON.stringify(ticket) });
    if (!ok) {
      const details = body?.details ? Object.values(body.details).join(' ') : '';
      showMessage('order-error', `${body?.error || 'Order failed.'} ${details}`.trim());
      submit.disabled = false;
      return;
    }
    window.location.assign(`/orders/${encodeURIComponent(body.id)}?created=1`);
  });
};

const initOrderDetails = async () => {
  await initHeader();
  const id = decodeURIComponent(window.location.pathname.split('/').pop());
  const { ok, body: order } = await api(`/api/orders/${encodeURIComponent(id)}`);
  if (!ok) {
    showMessage('order-error', order?.error || 'Order not found.');
    return;
  }
  document.getElementById('order-heading').textContent = `Order ${order.id}`;
  if (new URLSearchParams(window.location.search).get('created') === '1') {
    showMessage('flash', `Order ${order.id} submitted for approval.`);
  }
  const values = {
    symbol: order.symbol,
    side: order.side,
    quantity: formatQuantity(order.quantity),
    limitPrice: formatPrice(order.limitPrice),
    status: order.status,
    createdBy: order.createdBy,
    decidedBy: order.decidedBy || '—',
  };
  document.querySelectorAll('[data-field]').forEach(node => {
    node.textContent = values[node.dataset.field];
  });
  document.querySelector('[data-testid="order-status"]').className = statusClass(order.status);
};

const initApprovals = async () => {
  await initHeader();
  const tbody = document.getElementById('approvals-body');

  const render = async () => {
    const { ok, body: orders } = await api('/api/orders?status=Pending%20Approval');
    if (!ok) return;
    tbody.replaceChildren();
    for (const order of orders) {
      const decide = action => async () => {
        const result = await api(`/api/orders/${encodeURIComponent(order.id)}/${action}`, { method: 'POST' });
        showMessage('flash', result.ok ? `Order ${order.id} ${action === 'approve' ? 'approved' : 'rejected'}.` : result.body?.error || 'Action failed.');
        await render();
      };
      // Every row repeats the same Approve/Reject button names on purpose: practice filtering by row.
      tbody.append(
        el('tr', {}, [
          el('td', { textContent: order.id }),
          el('td', { textContent: order.symbol }),
          el('td', { textContent: order.side }),
          el('td', { textContent: formatQuantity(order.quantity) }),
          el('td', { textContent: formatPrice(order.limitPrice) }),
          el('td', { textContent: order.createdBy }),
          el('td', { className: 'row-actions' }, [
            el('button', { type: 'button', textContent: 'Approve', onclick: decide('approve') }),
            el('button', { type: 'button', className: 'secondary', textContent: 'Reject', onclick: decide('reject') }),
          ]),
        ]),
      );
    }
    document.getElementById('approvals-empty').hidden = orders.length > 0;
  };

  await render();
};

const PAGES = {
  login: initLogin,
  orders: initOrders,
  'order-new': initOrderNew,
  'order-details': initOrderDetails,
  approvals: initApprovals,
  forbidden: initHeader,
};

PAGES[document.body.dataset.page]?.();
