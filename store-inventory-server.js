/**
 * 在庫管理サーバー（Node.js + Express）
 * 収穫量出荷可能管理アプリとの連携
 */

const express = require('express');
const cors = require('cors');
const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ==============================================
// メモリ内データストア（本番環境ではDBを使用）
// ==============================================
let inventory = {};
let reservations = {};
let logs = [];

// ==============================================
// 初期データ（デモ用）
// ==============================================
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
    
    console.log('[在庫サーバー] 初期化完了:', Object.keys(inventory).length, '商品');
}

// ==============================================
// 在庫取得API
// ==============================================
app.get('/api/inventory', (req, res) => {
    console.log('[GET] /api/inventory');
    res.json(inventory);
});

app.get('/api/inventory/:productId', (req, res) => {
    const { productId } = req.params;
    console.log(`[GET] /api/inventory/${productId}`);
    
    if (!inventory[productId]) {
        return res.status(404).json({ error: '商品が見つかりません' });
    }
    
    res.json(inventory[productId]);
});

// ==============================================
// 在庫更新API
// ==============================================
app.put('/api/inventory/:productId', (req, res) => {
    const { productId } = req.params;
    const { quantity, reason, metadata } = req.body;
    
    console.log(`[PUT] /api/inventory/${productId}`, { quantity, reason });
    
    if (!inventory[productId]) {
        return res.status(404).json({ error: '商品が見つかりません' });
    }
    
    const oldStock = inventory[productId].stock;
    
    inventory[productId] = {
        ...inventory[productId],
        stock: Math.max(0, quantity),
        available: Math.max(0, quantity - inventory[productId].reserved),
        lastUpdated: new Date().toISOString(),
        metadata
    };
    
    // ログ記録
    logs.push({
        action: 'UPDATE',
        productId,
        oldStock,
        newStock: inventory[productId].stock,
        change: inventory[productId].stock - oldStock,
        reason,
        timestamp: new Date().toISOString()
    });
    
    res.json(inventory[productId]);
});

// ==============================================
// 在庫予約API（2段階トランザクション）
// ==============================================
app.post('/api/inventory/reserve', (req, res) => {
    const { orderId, items, expiresAt } = req.body;
    
    console.log('[POST] /api/inventory/reserve', { orderId, items: items.length });
    
    // 在庫確認
    for (const item of items) {
        const stock = inventory[item.productId];
        if (!stock || stock.available < item.quantity) {
            return res.status(400).json({
                error: '在庫不足',
                productId: item.productId,
                available: stock?.available || 0,
                requested: item.quantity
            });
        }
    }
    
    // 予約ID生成
    const reservationId = `RSV${Date.now()}`;
    
    // 在庫を予約
    for (const item of items) {
        inventory[item.productId].reserved += item.quantity;
        inventory[item.productId].available -= item.quantity;
    }
    
    // 予約記録
    reservations[reservationId] = {
        orderId,
        items,
        status: 'reserved',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt || new Date(Date.now() + 600000).toISOString()
    };
    
    // 自動解放タイマー（10分）
    setTimeout(() => {
        if (reservations[reservationId]?.status === 'reserved') {
            console.warn(`[予約タイムアウト] ${reservationId}`);
            releaseReservationInternal(reservationId);
        }
    }, 600000);
    
    logs.push({
        action: 'RESERVE',
        reservationId,
        orderId,
        items,
        timestamp: new Date().toISOString()
    });
    
    res.json({
        reservationId,
        status: 'reserved',
        expiresAt: reservations[reservationId].expiresAt
    });
});

// ==============================================
// 予約確定API
// ==============================================
app.post('/api/inventory/reserve/:reservationId/confirm', (req, res) => {
    const { reservationId } = req.params;
    
    console.log('[POST] /api/inventory/reserve/:id/confirm', reservationId);
    
    const reservation = reservations[reservationId];
    
    if (!reservation) {
        return res.status(404).json({ error: '予約が見つかりません' });
    }
    
    if (reservation.status !== 'reserved') {
        return res.status(400).json({ error: '予約が既に処理されています' });
    }
    
    // 在庫を確定減算
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
    
    res.json({
        reservationId,
        status: 'confirmed',
        message: '在庫確定しました'
    });
});

// ==============================================
// 予約解放API
// ==============================================
app.post('/api/inventory/reserve/:reservationId/release', (req, res) => {
    const { reservationId } = req.params;
    
    console.log('[POST] /api/inventory/reserve/:id/release', reservationId);
    
    const result = releaseReservationInternal(reservationId);
    
    if (!result.success) {
        return res.status(404).json({ error: result.error });
    }
    
    res.json({
        reservationId,
        status: 'released',
        message: '予約を解放しました'
    });
});

function releaseReservationInternal(reservationId) {
    const reservation = reservations[reservationId];
    
    if (!reservation) {
        return { success: false, error: '予約が見つかりません' };
    }
    
    if (reservation.status !== 'reserved') {
        return { success: false, error: '予約が既に処理されています' };
    }
    
    // 予約在庫を戻す
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
    
    return { success: true };
}

// ==============================================
// 収穫量アプリからの在庫同期API
// ==============================================
app.post('/api/inventory/sync-harvest', (req, res) => {
    const { items } = req.body;
    
    console.log('[POST] /api/inventory/sync-harvest', { items: items.length });
    
    const updated = [];
    
    for (const item of items) {
        if (!inventory[item.productId]) continue;
        
        const oldStock = inventory[item.productId].stock;
        
        inventory[item.productId].stock = item.availableQuantity;
        inventory[item.productId].available = 
            item.availableQuantity - inventory[item.productId].reserved;
        inventory[item.productId].lastUpdated = new Date().toISOString();
        inventory[item.productId].harvestDate = item.harvestDate;
        inventory[item.productId].source = 'harvest';
        
        updated.push({
            productId: item.productId,
            oldStock,
            newStock: inventory[item.productId].stock
        });
        
        logs.push({
            action: 'SYNC_HARVEST',
            productId: item.productId,
            oldStock,
            newStock: inventory[item.productId].stock,
            harvestDate: item.harvestDate,
            timestamp: new Date().toISOString()
        });
    }
    
    res.json({
        success: true,
        updated: updated.length,
        items: updated
    });
});

// ==============================================
// 在庫ログ取得API
// ==============================================
app.get('/api/inventory/logs', (req, res) => {
    const { limit = 100, action } = req.query;
    
    console.log('[GET] /api/inventory/logs', { limit, action });
    
    let filteredLogs = logs;
    
    if (action) {
        filteredLogs = logs.filter(log => log.action === action);
    }
    
    res.json(filteredLogs.slice(-parseInt(limit)));
});

// ==============================================
// 低在庫アラートAPI
// ==============================================
app.get('/api/inventory/alerts/low-stock', (req, res) => {
    const { threshold = 10 } = req.query;
    
    console.log('[GET] /api/inventory/alerts/low-stock', { threshold });
    
    const lowStock = Object.entries(inventory)
        .filter(([_, item]) => item.available < threshold)
        .map(([productId, item]) => ({
            productId,
            stock: item.stock,
            reserved: item.reserved,
            available: item.available
        }));
    
    res.json(lowStock);
});

// ==============================================
// ヘルスチェックAPI
// ==============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        inventory: {
            totalProducts: Object.keys(inventory).length,
            totalStock: Object.values(inventory).reduce((sum, item) => sum + item.stock, 0),
            totalReserved: Object.values(inventory).reduce((sum, item) => sum + item.reserved, 0)
        },
        reservations: {
            total: Object.keys(reservations).length,
            active: Object.values(reservations).filter(r => r.status === 'reserved').length
        }
    });
});

// ==============================================
// サーバー起動
// ==============================================
const PORT = process.env.PORT || 3000;

initializeInventory();

app.listen(PORT, () => {
    console.log('==============================================');
    console.log('  在庫管理APIサーバー起動');
    console.log('==============================================');
    console.log(`  ポート: ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log('  エンドポイント:');
    console.log('    GET  /api/inventory');
    console.log('    GET  /api/inventory/:productId');
    console.log('    PUT  /api/inventory/:productId');
    console.log('    POST /api/inventory/reserve');
    console.log('    POST /api/inventory/reserve/:id/confirm');
    console.log('    POST /api/inventory/reserve/:id/release');
    console.log('    POST /api/inventory/sync-harvest');
    console.log('    GET  /api/inventory/logs');
    console.log('    GET  /api/inventory/alerts/low-stock');
    console.log('    GET  /api/health');
    console.log('==============================================\n');
});

module.exports = app;
