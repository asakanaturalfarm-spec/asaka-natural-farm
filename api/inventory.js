// Vercel Serverless Function: inventory API

let inventory = {};
let reservations = {};
let logs = [];

function initializeInventory() {
  const products = [
    'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10',
    'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v18', 'v19', 'v20',
    'v21', 'v22', 'v23', 'v24', 'v25', 'v26', 'v27', 'v28', 'v29', 'v30',
    'v31', 'v32', 'v33', 'v34', 'v35', 'v36', 'c1'
  ];
  products.forEach(id => {
    inventory[id] = {
      productId: id,
      stock: Math.floor(Math.random() * 50) + 10,
      reserved: 0,
      available: 0,
      lastUpdated: new Date().toISOString()
    };
    inventory[id].available = inventory[id].stock - inventory[id].reserved;
  });
}

initializeInventory();

module.exports = async (req, res) => {
  const { method, url } = req;
  // GET /api/inventory
  if (method === 'GET' && url === '/api/inventory') {
    res.status(200).json(inventory);
    return;
  }
  // GET /api/inventory/:productId
  if (method === 'GET' && url.startsWith('/api/inventory/')) {
    const productId = url.split('/').pop();
    if (!inventory[productId]) {
      res.status(404).json({ error: '商品が見つかりません' });
      return;
    }
    res.status(200).json(inventory[productId]);
    return;
  }
  // PUT /api/inventory/:productId
  if (method === 'PUT' && url.startsWith('/api/inventory/')) {
    const productId = url.split('/').pop();
    let body = '';
    req.on('data', chunk => { body += chunk; });
    await new Promise(resolve => req.on('end', resolve));
    const { quantity, reason, metadata } = JSON.parse(body);
    if (!inventory[productId]) {
      res.status(404).json({ error: '商品が見つかりません' });
      return;
    }
    const oldStock = inventory[productId].stock;
    inventory[productId] = {
      ...inventory[productId],
      stock: Math.max(0, quantity),
      available: Math.max(0, quantity - inventory[productId].reserved),
      lastUpdated: new Date().toISOString(),
      metadata
    };
    logs.push({
      action: 'UPDATE',
      productId,
      oldStock,
      newStock: inventory[productId].stock,
      change: inventory[productId].stock - oldStock,
      reason,
      timestamp: new Date().toISOString()
    });
    res.status(200).json(inventory[productId]);
    return;
  }
  // POST /api/inventory/reserve
  if (method === 'POST' && url === '/api/inventory/reserve') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    await new Promise(resolve => req.on('end', resolve));
    const { orderId, items, expiresAt } = JSON.parse(body);
    for (const item of items) {
      const stock = inventory[item.productId];
      if (!stock || stock.available < item.quantity) {
        res.status(400).json({
          error: '在庫不足',
          productId: item.productId,
          available: stock?.available || 0,
          requested: item.quantity
        });
        return;
      }
    }
    const reservationId = `RSV${Date.now()}`;
    for (const item of items) {
      inventory[item.productId].reserved += item.quantity;
      inventory[item.productId].available -= item.quantity;
    }
    reservations[reservationId] = {
      orderId,
      items,
      status: 'reserved',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || new Date(Date.now() + 600000).toISOString()
    };
    logs.push({
      action: 'RESERVE',
      reservationId,
      orderId,
      items,
      timestamp: new Date().toISOString()
    });
    res.status(200).json({
      reservationId,
      status: 'reserved',
      expiresAt: reservations[reservationId].expiresAt
    });
    return;
  }
  // POST /api/inventory/reserve/:reservationId/confirm
  if (method === 'POST' && url.match(/^\/api\/inventory\/reserve\/RSV\d+\/confirm$/)) {
    const reservationId = url.split('/')[4];
    const reservation = reservations[reservationId];
    if (!reservation) {
      res.status(404).json({ error: '予約が見つかりません' });
      return;
    }
    if (reservation.status !== 'reserved') {
      res.status(400).json({ error: '予約が既に処理されています' });
      return;
    }
    for (const item of reservation.items) {
      inventory[item.productId].stock -= item.quantity;
      inventory[item.productId].reserved -= item.quantity;
    }
    reservation.status = 'confirmed';
    reservation.confirmedAt = new Date().toISOString();
    logs.push({
      action: 'CONFIRM',
      reservationId,
      orderId: reservation.orderId,
      timestamp: new Date().toISOString()
    });
    res.status(200).json({
      reservationId,
      status: 'confirmed',
      message: '在庫確定しました'
    });
    return;
  }
  // POST /api/inventory/reserve/:reservationId/release
  if (method === 'POST' && url.match(/^\/api\/inventory\/reserve\/RSV\d+\/release$/)) {
    const reservationId = url.split('/')[4];
    const reservation = reservations[reservationId];
    if (!reservation) {
      res.status(404).json({ error: '予約が見つかりません' });
      return;
    }
    if (reservation.status !== 'reserved') {
      res.status(400).json({ error: '予約が既に処理されています' });
      return;
    }
    for (const item of reservation.items) {
      inventory[item.productId].reserved -= item.quantity;
      inventory[item.productId].available += item.quantity;
    }
    reservation.status = 'released';
    reservation.releasedAt = new Date().toISOString();
    logs.push({
      action: 'RELEASE',
      reservationId,
      orderId: reservation.orderId,
      timestamp: new Date().toISOString()
    });
    res.status(200).json({
      reservationId,
      status: 'released',
      message: '予約を解放しました'
    });
    return;
  }
  // GET /api/inventory/logs
  if (method === 'GET' && url === '/api/inventory/logs') {
    res.status(200).json(logs);
    return;
  }
  // GET /api/inventory/alerts/low-stock
  if (method === 'GET' && url === '/api/inventory/alerts/low-stock') {
    const threshold = 10;
    const lowStock = Object.values(inventory).filter(item => item.stock < threshold);
    res.status(200).json(lowStock);
    return;
  }
  // Not found
  res.status(404).json({ error: 'Not found' });
};
