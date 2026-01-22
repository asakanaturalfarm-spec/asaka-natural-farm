// 注文データ統合管理システム - order-sync.js
// すべてのアプリ間で注文データをリアルタイム連携し、重複処理を防ぐ

(function() {
    'use strict';

    // 統合注文データのストレージキー
    const STORAGE_KEY = 'unified_orders';
    const LOG_KEY = 'unified_orders_log';
    const PROCESSED_KEY = 'processed_order_ids'; // 処理済み注文IDを記録

    // 注文ステータス定義
    const ORDER_STATUS = {
        PENDING: '新規',
        CONFIRMED: '確認済み',
        PROCESSING: '処理中',
        SHIPPED: '発送済',
        DELIVERED: '配達完了',
        CANCELLED: 'キャンセル'
    };

    // 注文ソース（どのアプリから発生したか）
    const ORDER_SOURCE = {
        EC_SITE: 'ec_site',           // ECサイトからの注文
        ORDER_MANAGEMENT: 'order_mgmt', // 受注管理アプリからの直接入力
        PHONE: 'phone',               // 電話注文
        OTHER: 'other'                // その他
    };

    // OrderSyncクラス
    class OrderSync {
        constructor() {
            this.orders = this.loadOrders();
            this.processedIds = this.loadProcessedIds();
        }

        // 注文データを読み込む
        loadOrders() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('注文データの読み込みに失敗:', e);
                return [];
            }
        }

        // 処理済みID一覧を読み込む
        loadProcessedIds() {
            try {
                const data = localStorage.getItem(PROCESSED_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('処理済みIDの読み込みに失敗:', e);
                return [];
            }
        }

        // 注文データを保存
        saveOrders() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
            } catch (e) {
                console.error('注文データの保存に失敗:', e);
            }
        }

        // 処理済みIDを保存
        saveProcessedIds() {
            try {
                localStorage.setItem(PROCESSED_KEY, JSON.stringify(this.processedIds));
            } catch (e) {
                console.error('処理済みIDの保存に失敗:', e);
            }
        }

        // ユニークな注文IDを生成
        generateOrderId() {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 10000);
            return `ORD-${timestamp}-${random}`;
        }

        // 注文番号を生成（表示用）
        generateOrderNumber() {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const count = String(this.orders.length + 1).padStart(4, '0');
            return `${year}${month}${day}-${count}`;
        }

        // 注文が既に処理済みかチェック
        isProcessed(orderId) {
            return this.processedIds.includes(orderId);
        }

        // 注文を処理済みとしてマーク
        markAsProcessed(orderId) {
            if (!this.isProcessed(orderId)) {
                this.processedIds.push(orderId);
                this.saveProcessedIds();
                this.logAction('mark_processed', orderId, null, '注文を処理済みとしてマーク');
            }
        }

        // 新規注文を追加（重複チェック付き）
        addOrder(orderData, source = ORDER_SOURCE.EC_SITE) {
            try {
                // 必須フィールドのチェック
                if (!orderData.items || orderData.items.length === 0) {
                    throw new Error('注文商品が指定されていません');
                }

                // 注文IDが既に存在する場合は重複エラー
                if (orderData.id && this.isProcessed(orderData.id)) {
                    console.warn(`注文ID ${orderData.id} は既に処理済みです`);
                    return { success: false, error: 'duplicate', orderId: orderData.id };
                }

                // 新しい注文オブジェクトを作成
                const orderId = orderData.id || this.generateOrderId();
                const orderNumber = orderData.orderNumber || this.generateOrderNumber();

                const newOrder = {
                    id: orderId,
                    orderNumber: orderNumber,
                    source: source,
                    status: orderData.status || ORDER_STATUS.PENDING,
                    customerInfo: orderData.customerInfo || {},
                    items: orderData.items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice || 0,
                        totalPrice: (item.quantity * (item.unitPrice || 0))
                    })),
                    totalAmount: orderData.totalAmount || this.calculateTotal(orderData.items),
                    shippingInfo: orderData.shippingInfo || {},
                    paymentMethod: orderData.paymentMethod || '未設定',
                    notes: orderData.notes || '',
                    createdAt: orderData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    processedBy: null,
                    inventoryProcessed: false // 在庫処理済みフラグ
                };

                // 注文を追加
                this.orders.push(newOrder);
                this.saveOrders();

                // 処理済みとしてマーク
                this.markAsProcessed(orderId);

                // ログ記録
                this.logAction('add', orderId, newOrder, `新規注文追加 (${source})`);

                return { success: true, order: newOrder, orderId: orderId };

            } catch (error) {
                console.error('注文追加エラー:', error);
                return { success: false, error: error.message };
            }
        }

        // 注文の合計金額を計算
        calculateTotal(items) {
            return items.reduce((total, item) => {
                return total + (item.quantity * (item.unitPrice || 0));
            }, 0);
        }

        // 在庫処理を実行（重複防止）
        processInventory(orderId) {
            const order = this.orders.find(o => o.id === orderId);
            
            if (!order) {
                console.error(`注文ID ${orderId} が見つかりません`);
                return { success: false, error: 'order_not_found' };
            }

            // 既に在庫処理済みの場合はスキップ
            if (order.inventoryProcessed) {
                console.warn(`注文ID ${orderId} の在庫は既に処理済みです`);
                return { success: false, error: 'already_processed' };
            }

            // InventorySyncが利用可能かチェック
            if (typeof window.InventorySync === 'undefined') {
                console.error('InventorySyncが読み込まれていません');
                return { success: false, error: 'inventory_sync_unavailable' };
            }

            try {
                // 各商品の在庫を確認
                for (const item of order.items) {
                    const available = window.InventorySync.get(item.productId);
                    if (available < item.quantity) {
                        return { 
                            success: false, 
                            error: 'insufficient_stock',
                            productId: item.productId,
                            productName: item.productName,
                            available: available,
                            requested: item.quantity
                        };
                    }
                }

                // 在庫を減らす
                for (const item of order.items) {
                    window.InventorySync.reduce(
                        item.productId, 
                        item.quantity, 
                        `注文処理 (${order.orderNumber})`
                    );
                }

                // 在庫処理済みフラグを立てる
                order.inventoryProcessed = true;
                order.updatedAt = new Date().toISOString();
                this.saveOrders();

                this.logAction('inventory_processed', orderId, order, '在庫処理完了');

                return { success: true, order: order };

            } catch (error) {
                console.error('在庫処理エラー:', error);
                return { success: false, error: error.message };
            }
        }

        // 注文ステータスを更新
        updateStatus(orderId, newStatus, updatedBy = null) {
            const order = this.orders.find(o => o.id === orderId);
            
            if (!order) {
                console.error(`注文ID ${orderId} が見つかりません`);
                return { success: false, error: 'order_not_found' };
            }

            const oldStatus = order.status;
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            
            if (updatedBy) {
                order.processedBy = updatedBy;
            }

            this.saveOrders();
            this.logAction('status_update', orderId, { oldStatus, newStatus }, `ステータス更新: ${oldStatus} → ${newStatus}`);

            return { success: true, order: order };
        }

        // 注文を取得
        getOrder(orderId) {
            return this.orders.find(o => o.id === orderId);
        }

        // すべての注文を取得
        getAllOrders(filters = {}) {
            let filtered = [...this.orders];

            // ステータスフィルター
            if (filters.status) {
                filtered = filtered.filter(o => o.status === filters.status);
            }

            // ソースフィルター
            if (filters.source) {
                filtered = filtered.filter(o => o.source === filters.source);
            }

            // 日付範囲フィルター
            if (filters.dateFrom) {
                filtered = filtered.filter(o => o.createdAt >= filters.dateFrom);
            }
            if (filters.dateTo) {
                filtered = filtered.filter(o => o.createdAt <= filters.dateTo);
            }

            // 在庫処理済みフィルター
            if (filters.inventoryProcessed !== undefined) {
                filtered = filtered.filter(o => o.inventoryProcessed === filters.inventoryProcessed);
            }

            // 日付の新しい順にソート
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return filtered;
        }

        // 統計情報を取得
        getStats() {
            const today = new Date().toISOString().split('T')[0];
            const todayOrders = this.orders.filter(o => o.createdAt.startsWith(today));
            
            const stats = {
                totalOrders: this.orders.length,
                todayOrders: todayOrders.length,
                pendingOrders: this.orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
                processingOrders: this.orders.filter(o => o.status === ORDER_STATUS.PROCESSING).length,
                shippedOrders: this.orders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
                deliveredOrders: this.orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
                cancelledOrders: this.orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
                inventoryNotProcessed: this.orders.filter(o => !o.inventoryProcessed && o.status !== ORDER_STATUS.CANCELLED).length,
                totalRevenue: this.orders
                    .filter(o => o.status !== ORDER_STATUS.CANCELLED)
                    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
            };

            return stats;
        }

        // ログを記録
        logAction(action, orderId, data, description) {
            try {
                const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
                const logEntry = {
                    action: action,
                    orderId: orderId,
                    data: data,
                    description: description,
                    timestamp: new Date().toISOString()
                };
                
                logs.unshift(logEntry);
                
                // 最新1000件のみ保持
                if (logs.length > 1000) {
                    logs.splice(1000);
                }
                
                localStorage.setItem(LOG_KEY, JSON.stringify(logs));
            } catch (e) {
                console.error('ログ記録エラー:', e);
            }
        }

        // ログを取得
        getLogs(limit = 100) {
            try {
                const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
                return logs.slice(0, limit);
            } catch (e) {
                console.error('ログ取得エラー:', e);
                return [];
            }
        }

        // データをリセット（テスト用）
        reset() {
            this.orders = [];
            this.processedIds = [];
            this.saveOrders();
            this.saveProcessedIds();
            localStorage.removeItem(LOG_KEY);
            this.logAction('reset', null, null, 'すべての注文データをリセット');
        }

        // レポート生成
        generateReport() {
            const stats = this.getStats();
            const recentOrders = this.getAllOrders({}).slice(0, 10);
            
            return {
                stats: stats,
                recentOrders: recentOrders,
                generatedAt: new Date().toISOString()
            };
        }
    }

    // グローバルに公開
    window.OrderSync = new OrderSync();
    window.ORDER_STATUS = ORDER_STATUS;
    window.ORDER_SOURCE = ORDER_SOURCE;

    console.log('✅ OrderSync: 注文統合管理システムが読み込まれました');
})();
