// Trade Desk Lite: a small, fake order-ticket app to practice test automation against.
// In-memory store seeded from data/seed.json. Restarting the server (or POST /api/test/reset) resets orders.
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, 'public');
const SESSION_COOKIE = 'tdl_session';
const SIDES = ['Buy', 'Sell'];
const MAX_QUANTITY = 1_000_000;

const loadSeed = () => JSON.parse(fs.readFileSync(path.join(here, 'data', 'seed.json'), 'utf8'));

const parseCookies = header =>
  Object.fromEntries(
    (header || '')
      .split(';')
      .map(part => part.trim().split('='))
      .filter(([name, value]) => name && value !== undefined)
      .map(([name, value]) => [name, decodeURIComponent(value)]),
  );

const validateOrder = (body, symbols) => {
  const errors = {};
  const { symbol, side, quantity, limitPrice, clientOrderId } = body || {};

  if (!symbols.includes(symbol)) errors.symbol = 'Choose a valid symbol.';
  if (!SIDES.includes(side)) errors.side = 'Side must be Buy or Sell.';
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    errors.quantity = `Quantity must be a whole number from 1 to ${MAX_QUANTITY}.`;
  }
  const cents = typeof limitPrice === 'number' ? limitPrice * 100 : NaN;
  if (!(limitPrice > 0) || Math.abs(Math.round(cents) - cents) > 1e-6) {
    errors.limitPrice = 'Limit price must be greater than 0 with at most 2 decimals.';
  }
  if (clientOrderId !== undefined && clientOrderId !== null && (typeof clientOrderId !== 'string' || clientOrderId.length > 64)) {
    errors.clientOrderId = 'clientOrderId must be a string of up to 64 characters.';
  }
  return errors;
};

export function createApp({ seed = loadSeed() } = {}) {
  const app = express();
  const sessions = new Map(); // token -> username
  let state;

  const reset = () => {
    state = structuredClone({ orders: seed.orders, nextOrderNumber: seed.nextOrderNumber });
  };
  reset();

  const findUser = username => seed.users.find(user => user.username === username);
  const publicUser = user => ({ username: user.username, role: user.role, displayName: user.displayName });

  const currentUser = req => {
    const bearer = req.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = bearer || parseCookies(req.get('cookie'))[SESSION_COOKIE];
    const username = token && sessions.get(token);
    return username ? findUser(username) : undefined;
  };

  app.use(express.json());
  app.use('/static', express.static(path.join(publicDir, 'static')));

  // --- API: open routes ---

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const user = findUser(username);
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, user.username);
    res.cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
    res.json({ token, user: publicUser(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = parseCookies(req.get('cookie'))[SESSION_COOKIE];
    if (token) sessions.delete(token);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.status(204).end();
  });

  // Test helper: restore seed orders. Sessions survive, so saved storageState files keep working.
  app.post('/api/test/reset', (_req, res) => {
    reset();
    res.json({ ok: true, orders: state.orders.length });
  });

  // --- API: authenticated routes (Bearer token or session cookie) ---

  app.use('/api', (req, res, next) => {
    const user = currentUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    req.user = user;
    next();
  });

  const requireRole = role => (req, res, next) => {
    if (req.user.role !== role) {
      res.status(403).json({ error: `Only a ${role} can do this.` });
      return;
    }
    next();
  };

  app.get('/api/me', (req, res) => res.json(publicUser(req.user)));

  app.get('/api/symbols', (_req, res) => res.json(seed.symbols));

  app.get('/api/orders', (req, res) => {
    const { status } = req.query;
    res.json(status ? state.orders.filter(order => order.status === status) : state.orders);
  });

  app.post('/api/orders', requireRole('trader'), (req, res) => {
    const errors = validateOrder(req.body, seed.symbols);
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: 'Validation failed.', details: errors });
      return;
    }
    const { symbol, side, quantity, limitPrice, clientOrderId = null } = req.body;
    if (clientOrderId && state.orders.some(order => order.clientOrderId === clientOrderId)) {
      res.status(409).json({ error: `clientOrderId ${clientOrderId} already exists.` });
      return;
    }
    const order = {
      id: `ORD-${state.nextOrderNumber++}`,
      clientOrderId,
      symbol,
      side,
      quantity,
      limitPrice,
      status: 'Pending Approval',
      createdBy: req.user.username,
      createdAt: new Date().toISOString(),
      decidedBy: null,
      decidedAt: null,
    };
    state.orders.push(order);
    res.status(201).json(order);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = state.orders.find(o => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: `Order ${req.params.id} not found.` });
      return;
    }
    res.json(order);
  });

  const decide = status => (req, res) => {
    const order = state.orders.find(o => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: `Order ${req.params.id} not found.` });
      return;
    }
    if (order.status !== 'Pending Approval') {
      res.status(409).json({ error: `Order ${order.id} is already ${order.status}.` });
      return;
    }
    order.status = status;
    order.decidedBy = req.user.username;
    order.decidedAt = new Date().toISOString();
    res.json(order);
  };

  app.post('/api/orders/:id/approve', requireRole('approver'), decide('Approved'));
  app.post('/api/orders/:id/reject', requireRole('approver'), decide('Rejected'));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  // --- Pages ---

  const page = name => (_req, res) => res.sendFile(path.join(publicDir, `${name}.html`));

  const requirePageUser = role => (req, res, next) => {
    const user = currentUser(req);
    if (!user) {
      res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
      return;
    }
    if (role && user.role !== role) {
      res.status(403).sendFile(path.join(publicDir, 'forbidden.html'));
      return;
    }
    next();
  };

  app.get('/', (req, res) => res.redirect(currentUser(req) ? '/orders' : '/login'));
  app.get('/login', page('login'));
  app.get('/orders', requirePageUser(), page('orders'));
  app.get('/orders/new', requirePageUser('trader'), page('order-new'));
  app.get('/orders/:id', requirePageUser(), page('order-details'));
  app.get('/approvals', requirePageUser('approver'), page('approvals'));

  return app;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const port = Number(process.env.PORT) || 3100;
  createApp().listen(port, () => {
    console.log(`Trade Desk Lite running on http://localhost:${port}`);
  });
}
