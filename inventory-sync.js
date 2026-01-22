// ============================================
// リアルタイム在庫管理システム
// 全アプリ間で在庫をリアルタイム同期
// ============================================

// LocalStorageキー
const INVENTORY_KEY = 'inventory_realtime';
const INVENTORY_LOG_KEY = 'inventory_log';

// ============================================
// 在庫初期化（全商品の初期在庫を設定）
// ============================================
function resetAllInventory(defaultStock = 10) {
    const products = getAllProducts();
    const inventory = {};
    
    products.forEach(product => {
        inventory[product.id] = {
            productId: product.id,
            productName: product.name,
            stock: defaultStock,
            unit: product.unit,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'system'
        };
    });
    
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    
    // ログに記録
    logInventoryChange({
        action: 'RESET_ALL',
        description: `全商品の在庫を${defaultStock}個に初期化`,
        timestamp: new Date().toISOString()
    });
    
    // イベント発行
    window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
        detail: { type: 'reset', inventory } 
    }));
    
    console.log(`[在庫管理] 全商品の在庫を${defaultStock}個に初期化しました`);
    return inventory;
}

// ============================================
// 全商品データを取得
// ============================================
function getAllProducts() {
    // script.jsのPRODUCTS配列を参照
    if (typeof PRODUCTS !== 'undefined') {
        return PRODUCTS;
    }
    
    // products.htmlのPRODUCTS配列を参照
    if (window.PRODUCTS) {
        return window.PRODUCTS;
    }
    
    // デフォルト（空配列）
    console.warn('[在庫管理] 商品データが見つかりません');
    return [];
}

// ============================================
// 在庫を取得
// ============================================
function getInventory(productId = null) {
    const inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
    
    if (productId) {
        return inventory[productId] || { stock: 0 };
    }
    
    return inventory;
}

// ============================================
// 在庫を更新
// ============================================
function updateInventory(productId, newStock, reason = '', updatedBy = 'manual') {
    const inventory = getInventory();
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error(`[在庫管理] 商品ID ${productId} が見つかりません`);
        return false;
    }
    
    const oldStock = inventory[productId]?.stock || 0;
    
    inventory[productId] = {
        productId: productId,
        productName: product.name,
        stock: Math.max(0, newStock),
        unit: product.unit,
        lastUpdated: new Date().toISOString(),
        updatedBy: updatedBy
    };
    
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    
    // ログに記録
    logInventoryChange({
        action: 'UPDATE',
        productId: productId,
        productName: product.name,
        oldStock: oldStock,
        newStock: inventory[productId].stock,
        change: inventory[productId].stock - oldStock,
        reason: reason,
        updatedBy: updatedBy,
        timestamp: new Date().toISOString()
    });
    
    // イベント発行
    window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
        detail: { 
            type: 'update', 
            productId, 
            oldStock, 
            newStock: inventory[productId].stock 
        } 
    }));
    
    console.log(`[在庫管理] ${product.name}: ${oldStock} → ${inventory[productId].stock}`);
    return true;
}

// ============================================
// 在庫を増やす
// ============================================
function addInventory(productId, quantity, reason = '入庫') {
    const current = getInventory(productId);
    const newStock = (current.stock || 0) + quantity;
    return updateInventory(productId, newStock, reason, 'add');
}

// ============================================
// 在庫を減らす
// ============================================
function reduceInventory(productId, quantity, reason = '出庫') {
    const current = getInventory(productId);
    const newStock = Math.max(0, (current.stock || 0) - quantity);
    return updateInventory(productId, newStock, reason, 'reduce');
}

// ============================================
// 注文時の在庫減算
// ============================================
function processOrderInventory(orderItems) {
    const results = [];
    
    orderItems.forEach(item => {
        const success = reduceInventory(
            item.id || item.productId, 
            item.quantity, 
            `注文処理 (注文ID: ${item.orderId || 'unknown'})`
        );
        results.push({ productId: item.id || item.productId, success });
    });
    
    return results;
}

// ============================================
// 在庫チェック（注文可能か）
// ============================================
function checkStockAvailability(productId, requestedQuantity) {
    const inventory = getInventory(productId);
    const currentStock = inventory.stock || 0;
    
    return {
        available: currentStock >= requestedQuantity,
        currentStock: currentStock,
        requested: requestedQuantity,
        shortage: Math.max(0, requestedQuantity - currentStock)
    };
}

// ============================================
// カート内全商品の在庫チェック
// ============================================
function validateCartInventory(cartItems) {
    const unavailable = [];
    const warnings = [];
    
    cartItems.forEach(item => {
        const check = checkStockAvailability(item.id, item.quantity);
        
        if (!check.available) {
            if (check.currentStock === 0) {
                unavailable.push({
                    ...item,
                    reason: '在庫切れ',
                    currentStock: 0
                });
            } else {
                warnings.push({
                    ...item,
                    reason: '在庫不足',
                    currentStock: check.currentStock,
                    maxAvailable: check.currentStock
                });
            }
        }
    });
    
    return {
        valid: unavailable.length === 0 && warnings.length === 0,
        unavailable,
        warnings
    };
}

// ============================================
// 在庫変更ログを記録
// ============================================
function logInventoryChange(logEntry) {
    const logs = JSON.parse(localStorage.getItem(INVENTORY_LOG_KEY) || '[]');
    logs.unshift(logEntry);
    
    // 最新1000件のみ保持
    if (logs.length > 1000) {
        logs.splice(1000);
    }
    
    localStorage.setItem(INVENTORY_LOG_KEY, JSON.stringify(logs));
}

// ============================================
// 在庫ログを取得
// ============================================
function getInventoryLogs(limit = 50) {
    const logs = JSON.parse(localStorage.getItem(INVENTORY_LOG_KEY) || '[]');
    return logs.slice(0, limit);
}

// ============================================
// 在庫アラート（低在庫通知）
// ============================================
function checkLowStockAlerts(threshold = 3) {
    const inventory = getInventory();
    const lowStockItems = [];
    
    Object.values(inventory).forEach(item => {
        if (item.stock > 0 && item.stock <= threshold) {
            lowStockItems.push(item);
        }
    });
    
    return lowStockItems;
}

// ============================================
// 在庫レポート生成
// ============================================
function generateInventoryReport() {
    const inventory = getInventory();
    const items = Object.values(inventory);
    
    const totalItems = items.length;
    const inStock = items.filter(i => i.stock > 0).length;
    const outOfStock = items.filter(i => i.stock === 0).length;
    const lowStock = items.filter(i => i.stock > 0 && i.stock <= 3).length;
    const totalStockValue = items.reduce((sum, i) => {
        const product = getAllProducts().find(p => p.id === i.productId);
        return sum + (product ? product.price * i.stock : 0);
    }, 0);
    
    return {
        totalItems,
        inStock,
        outOfStock,
        lowStock,
        totalStockValue,
        items: items.sort((a, b) => a.stock - b.stock),
        generatedAt: new Date().toISOString()
    };
}

// ============================================
// 初期化：ページ読み込み時に実行
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // 在庫データが存在しない場合は初期化
    const inventory = localStorage.getItem(INVENTORY_KEY);
    if (!inventory) {
        console.log('[在庫管理] 在庫データを初期化します');
        resetAllInventory();
    }
    
    // 在庫更新イベントリスナー
    window.addEventListener('inventoryUpdated', function(e) {
        console.log('[在庫管理] 在庫が更新されました:', e.detail);
    });
    
    console.log('[在庫管理システム] 初期化完了');
});

// ============================================
// グローバル公開
// ============================================
window.InventorySync = {
    reset: resetAllInventory,
    get: getInventory,
    update: updateInventory,
    add: addInventory,
    reduce: reduceInventory,
    check: checkStockAvailability,
    validateCart: validateCartInventory,
    processOrder: processOrderInventory,
    getLogs: getInventoryLogs,
    checkLowStock: checkLowStockAlerts,
    generateReport: generateInventoryReport
};
