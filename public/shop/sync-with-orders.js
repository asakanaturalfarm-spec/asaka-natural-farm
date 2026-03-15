/**
 * 受注発注管理アプリとの連携モジュール
 * 顧客情報と注文情報を同期して取得
 * Version 1.0.0
 */

(function(window) {
    'use strict';

    // ==============================================
    // 受注発注管理アプリとの連携マネージャー
    // ==============================================
    const OrderSyncManager = {
        
        // ストレージキー
        STORAGE_KEYS: {
            CUSTOMERS: 'orderManagement_customers',
            ORDERS: 'unified_orders',
            PRODUCTS: 'orderManagement_products',
            SYNC_CACHE: 'order_sync_cache',
            SYNC_TIMESTAMP: 'order_sync_timestamp'
        },

        // キャッシュの有効期限（ミリ秒）
        CACHE_DURATION: 5 * 60 * 1000, // 5分

        /**
         * 受注発注管理アプリからデータを同期
         */
        syncFromOrdersApp: function() {
            try {
                const cache = localStorage.getItem(this.STORAGE_KEYS.SYNC_CACHE);
                const timestamp = localStorage.getItem(this.STORAGE_KEYS.SYNC_TIMESTAMP);
                const now = Date.now();

                // キャッシュがあり、有効期限内の場合はそれを返す
                if (cache && timestamp && (now - parseInt(timestamp)) < this.CACHE_DURATION) {
                    return JSON.parse(cache);
                }

                // 受注発注管理アプリのデータを取得
                const customers = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CUSTOMERS) || '[]');
                const orders = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS) || '[]');
                const products = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PRODUCTS) || '[]');

                const syncedData = {
                    customers,
                    orders,
                    products,
                    lastSync: new Date().toISOString()
                };

                // キャッシュに保存
                localStorage.setItem(this.STORAGE_KEYS.SYNC_CACHE, JSON.stringify(syncedData));
                localStorage.setItem(this.STORAGE_KEYS.SYNC_TIMESTAMP, now.toString());

                return syncedData;
            } catch (error) {
                console.error('データ同期エラー:', error);
                return {
                    customers: [],
                    orders: [],
                    products: [],
                    lastSync: null
                };
            }
        },

        /**
         * 注文IDから注文データを取得
         */
        getOrderById: function(orderId) {
            const data = this.syncFromOrdersApp();
            return data.orders.find(order => order.id === orderId);
        },

        /**
         * 顧客IDから顧客情報を取得
         */
        getCustomerById: function(customerId) {
            const data = this.syncFromOrdersApp();
            return data.customers.find(customer => customer.id === customerId);
        },

        /**
         * 顧客の注文履歴を取得
         */
        getCustomerOrders: function(customerId) {
            const data = this.syncFromOrdersApp();
            return data.orders.filter(order => order.customerId === customerId);
        },

        /**
         * 注文に関連する顧客情報を取得
         */
        getOrderWithCustomer: function(orderId) {
            const data = this.syncFromOrdersApp();
            const order = data.orders.find(o => o.id === orderId);
            
            if (!order) return null;

            const customer = data.customers.find(c => c.id === order.customerId);
            
            return {
                ...order,
                customerInfo: customer || null
            };
        },

        /**
         * 複数の注文に顧客情報を付加
         */
        enrichOrdersWithCustomerInfo: function(orders) {
            const data = this.syncFromOrdersApp();
            
            return orders.map(order => {
                const customer = data.customers.find(c => c.id === order.customerId);
                return {
                    ...order,
                    customerInfo: customer || null
                };
            });
        },

        /**
         * ステータスでフィルタリングした注文を取得
         */
        getOrdersByStatus: function(status) {
            const data = this.syncFromOrdersApp();
            return data.orders.filter(order => order.status === status);
        },

        /**
         * 発送待ちの注文を取得（管理画面用）
         */
        getPendingShippingOrders: function() {
            const data = this.syncFromOrdersApp();
            // statusがpendingまたはconfirmedの注文を返す
            return data.orders.filter(order => 
                order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing'
            );
        },

        /**
         * 注文データを整形（管理画面用）
         */
        formatOrderForAdmin: function(order) {
            const customer = this.getCustomerById(order.customerId);
            
            return {
                id: order.id,
                orderDate: order.orderDate,
                customerName: customer?.name || '不明',
                customerEmail: customer?.email || '',
                customerPhone: customer?.phone || '',
                status: order.status || 'pending',
                total: order.totalAmount || 0,
                items: order.items || [],
                shippingAddress: customer?.address || '',
                paymentMethod: order.paymentMethod || '',
                notes: order.notes || '',
                trackingNumber: order.trackingNumber || null,
                shippedDate: order.shippedDate || null
            };
        },

        /**
         * 最新の同期タイムスタンプを取得
         */
        getLastSyncTime: function() {
            const timestamp = localStorage.getItem(this.STORAGE_KEYS.SYNC_TIMESTAMP);
            if (!timestamp) return null;
            return new Date(parseInt(timestamp)).toLocaleString('ja-JP');
        },

        /**
         * キャッシュをクリア（強制同期時）
         */
        clearCache: function() {
            localStorage.removeItem(this.STORAGE_KEYS.SYNC_CACHE);
            localStorage.removeItem(this.STORAGE_KEYS.SYNC_TIMESTAMP);
        },

        /**
         * 注文情報の統計を取得
         */
        getOrderStats: function() {
            const data = this.syncFromOrdersApp();
            const orders = data.orders;

            return {
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
                shippedOrders: orders.filter(o => o.status === 'shipped').length,
                totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length : 0
            };
        },

        /**
         * 注文に商品詳細を付加
         */
        enrichOrderWithProductDetails: function(order, products = null) {
            const data = this.syncFromOrdersApp();
            const productList = products || data.products;

            const enrichedItems = (order.items || []).map(item => {
                const product = productList.find(p => p.id === item.productId);
                return {
                    ...item,
                    productName: product?.name || item.name || '不明な商品',
                    productCategory: product?.category || '',
                    unitPrice: product?.price || item.unitPrice || 0
                };
            });

            return {
                ...order,
                items: enrichedItems
            };
        }
    };

    // グローバル変数に暴露
    window.OrderSyncManager = OrderSyncManager;

})(window);
