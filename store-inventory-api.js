/**
 * 在庫管理API - 実用版
 * サーバーサイドとの連携対応
 * 収穫量出荷可能管理アプリとのリアルタイム同期
 */

(function(window) {
    'use strict';

    // ==============================================
    // 設定
    // ==============================================
    const CONFIG = {
        // API設定（本番環境では環境変数から取得）
        apiBaseUrl: window.ENV?.INVENTORY_API_URL || 'http://localhost:3000/api',
        harvestAppUrl: window.ENV?.HARVEST_APP_URL || 'http://localhost:3001/api',
        
        // キャッシュ設定
        cacheEnabled: true,
        cacheTTL: 30000, // 30秒
        
        // リトライ設定
        maxRetries: 3,
        retryDelay: 1000,
        
        // LocalStorageキー
        cacheKey: 'inventory_cache',
        pendingKey: 'inventory_pending',
        logKey: 'inventory_log'
    };

    // ==============================================
    // 在庫管理クラス
    // ==============================================
    class InventoryAPI {
        constructor() {
            this.cache = this.loadCache();
            this.pending = this.loadPending();
            this.syncInProgress = false;
            
            // オフライン検知
            window.addEventListener('online', () => this.syncPendingChanges());
            window.addEventListener('offline', () => console.warn('[在庫API] オフラインモード'));
            
            // 定期同期（5分ごと）
            setInterval(() => this.syncFromServer(), 300000);
        }

        // ==============================================
        // キャッシュ管理
        // ==============================================
        loadCache() {
            try {
                const cached = localStorage.getItem(CONFIG.cacheKey);
                if (!cached) return { data: {}, timestamp: 0 };
                
                const cache = JSON.parse(cached);
                const age = Date.now() - cache.timestamp;
                
                // キャッシュ期限切れチェック
                if (age > CONFIG.cacheTTL) {
                    console.log('[在庫API] キャッシュ期限切れ');
                    return { data: {}, timestamp: 0 };
                }
                
                return cache;
            } catch (error) {
                console.error('[在庫API] キャッシュ読込失敗:', error);
                return { data: {}, timestamp: 0 };
            }
        }

        saveCache(data) {
            try {
                localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
                this.cache = { data, timestamp: Date.now() };
            } catch (error) {
                console.error('[在庫API] キャッシュ保存失敗:', error);
            }
        }

        clearCache() {
            localStorage.removeItem(CONFIG.cacheKey);
            this.cache = { data: {}, timestamp: 0 };
        }

        // ==============================================
        // 未送信変更管理
        // ==============================================
        loadPending() {
            try {
                const pending = localStorage.getItem(CONFIG.pendingKey);
                return pending ? JSON.parse(pending) : [];
            } catch (error) {
                console.error('[在庫API] 未送信データ読込失敗:', error);
                return [];
            }
        }

        savePending() {
            try {
                localStorage.setItem(CONFIG.pendingKey, JSON.stringify(this.pending));
            } catch (error) {
                console.error('[在庫API] 未送信データ保存失敗:', error);
            }
        }

        addPending(action, data) {
            this.pending.push({
                id: Date.now() + Math.random(),
                action,
                data,
                timestamp: new Date().toISOString(),
                retries: 0
            });
            this.savePending();
        }

        // ==============================================
        // HTTPリクエスト（リトライ機能付き）
        // ==============================================
        async request(endpoint, options = {}, retries = 0) {
            const url = `${CONFIG.apiBaseUrl}${endpoint}`;
            
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Client-Version': '1.0.0',
                        ...options.headers
                    },
                    timeout: 10000
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`[在庫API] リクエスト失敗 (${retries + 1}/${CONFIG.maxRetries}):`, error);

                // リトライ
                if (retries < CONFIG.maxRetries) {
                    await new Promise(resolve => 
                        setTimeout(resolve, CONFIG.retryDelay * Math.pow(2, retries))
                    );
                    return this.request(endpoint, options, retries + 1);
                }

                throw error;
            }
        }

        // ==============================================
        // 在庫取得（キャッシュ優先）
        // ==============================================
        async getInventory(productId = null, forceRefresh = false) {
            // キャッシュチェック
            if (CONFIG.cacheEnabled && !forceRefresh && this.cache.data) {
                const age = Date.now() - this.cache.timestamp;
                if (age < CONFIG.cacheTTL) {
                    console.log('[在庫API] キャッシュから取得');
                    return productId ? this.cache.data[productId] : this.cache.data;
                }
            }

            // サーバーから取得
            try {
                const endpoint = productId ? `/inventory/${productId}` : '/inventory';
                const data = await this.request(endpoint);
                
                // キャッシュ更新
                if (!productId) {
                    this.saveCache(data);
                }
                
                console.log('[在庫API] サーバーから取得成功');
                return data;
            } catch (error) {
                console.error('[在庫API] 取得失敗:', error);
                
                // フォールバック: キャッシュを返す
                if (this.cache.data && Object.keys(this.cache.data).length > 0) {
                    console.warn('[在庫API] キャッシュをフォールバック使用');
                    return productId ? this.cache.data[productId] : this.cache.data;
                }
                
                throw error;
            }
        }

        // ==============================================
        // 在庫更新（楽観的更新）
        // ==============================================
        async updateInventory(productId, quantity, reason = '', metadata = {}) {
            const change = {
                productId,
                quantity,
                reason,
                metadata,
                timestamp: new Date().toISOString()
            };

            // 1. ローカルキャッシュを即座に更新（楽観的更新）
            if (this.cache.data[productId]) {
                this.cache.data[productId].stock = quantity;
                this.cache.data[productId].lastUpdated = change.timestamp;
                this.saveCache(this.cache.data);
                
                // UI即座に更新
                window.dispatchEvent(new CustomEvent('inventoryUpdated', {
                    detail: { productId, quantity, source: 'optimistic' }
                }));
            }

            // 2. サーバーに送信
            try {
                const result = await this.request(`/inventory/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(change)
                });

                console.log('[在庫API] 更新成功:', result);
                
                // サーバーの値でキャッシュ更新
                if (this.cache.data[productId]) {
                    this.cache.data[productId] = result;
                    this.saveCache(this.cache.data);
                }

                // 確定通知
                window.dispatchEvent(new CustomEvent('inventoryUpdated', {
                    detail: { productId, quantity, source: 'server', confirmed: true }
                }));

                return result;
            } catch (error) {
                console.error('[在庫API] 更新失敗:', error);
                
                // 3. 失敗時は未送信キューに追加
                this.addPending('update', change);
                
                // ロールバック通知
                window.dispatchEvent(new CustomEvent('inventoryUpdateFailed', {
                    detail: { productId, error: error.message }
                }));

                throw error;
            }
        }

        // ==============================================
        // 在庫予約（2段階トランザクション）
        // ==============================================
        async reserveInventory(items, orderId) {
            const reservation = {
                orderId,
                items: items.map(item => ({
                    productId: item.id || item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price
                })),
                timestamp: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 600000).toISOString() // 10分後
            };

            try {
                const result = await this.request('/inventory/reserve', {
                    method: 'POST',
                    body: JSON.stringify(reservation)
                });

                console.log('[在庫API] 予約成功:', result);
                return result;
            } catch (error) {
                console.error('[在庫API] 予約失敗:', error);
                
                // オフライン時は楽観的予約
                if (!navigator.onLine) {
                    console.warn('[在庫API] オフライン予約（要確認）');
                    this.addPending('reserve', reservation);
                    return { reservationId: `offline_${Date.now()}`, status: 'pending' };
                }
                
                throw error;
            }
        }

        // ==============================================
        // 在庫予約確定
        // ==============================================
        async confirmReservation(reservationId) {
            try {
                const result = await this.request(`/inventory/reserve/${reservationId}/confirm`, {
                    method: 'POST'
                });

                console.log('[在庫API] 予約確定成功:', result);
                
                // キャッシュ更新
                await this.getInventory(null, true);
                
                return result;
            } catch (error) {
                console.error('[在庫API] 予約確定失敗:', error);
                throw error;
            }
        }

        // ==============================================
        // 在庫予約解放（キャンセル時）
        // ==============================================
        async releaseReservation(reservationId) {
            try {
                const result = await this.request(`/inventory/reserve/${reservationId}/release`, {
                    method: 'POST'
                });

                console.log('[在庫API] 予約解放成功:', result);
                
                // キャッシュ更新
                await this.getInventory(null, true);
                
                return result;
            } catch (error) {
                console.error('[在庫API] 予約解放失敗:', error);
                throw error;
            }
        }

        // ==============================================
        // 収穫量アプリとの同期
        // ==============================================
        async syncFromHarvestApp() {
            try {
                console.log('[在庫API] 収穫量アプリから同期開始');
                
                const harvestData = await fetch(`${CONFIG.harvestAppUrl}/harvest/available`, {
                    headers: {
                        'X-Client': 'asaka-shop',
                        'X-Client-Version': '1.0.0'
                    }
                }).then(r => r.json());

                // 収穫量データを在庫データに変換
                const inventoryUpdates = harvestData.map(item => ({
                    productId: item.productId,
                    stock: item.availableQuantity,
                    source: 'harvest',
                    harvestDate: item.harvestDate,
                    expiryDate: item.expiryDate
                }));

                // 一括更新
                for (const update of inventoryUpdates) {
                    await this.updateInventory(
                        update.productId,
                        update.stock,
                        '収穫量アプリから同期',
                        { source: 'harvest', harvestDate: update.harvestDate }
                    );
                }

                console.log('[在庫API] 収穫量アプリ同期完了:', inventoryUpdates.length);
                return inventoryUpdates;
            } catch (error) {
                console.error('[在庫API] 収穫量アプリ同期失敗:', error);
                throw error;
            }
        }

        // ==============================================
        // サーバーから強制同期
        // ==============================================
        async syncFromServer() {
            if (this.syncInProgress) {
                console.log('[在庫API] 同期中のためスキップ');
                return;
            }

            try {
                this.syncInProgress = true;
                console.log('[在庫API] サーバー同期開始');
                
                const data = await this.getInventory(null, true);
                
                console.log('[在庫API] サーバー同期完了');
                
                // 全体同期通知
                window.dispatchEvent(new CustomEvent('inventorySynced', {
                    detail: { data, timestamp: Date.now() }
                }));
                
                return data;
            } catch (error) {
                console.error('[在庫API] サーバー同期失敗:', error);
            } finally {
                this.syncInProgress = false;
            }
        }

        // ==============================================
        // 未送信変更を同期
        // ==============================================
        async syncPendingChanges() {
            if (this.pending.length === 0) return;
            if (!navigator.onLine) {
                console.warn('[在庫API] オフラインのため未送信データ同期不可');
                return;
            }

            console.log(`[在庫API] 未送信データ同期開始: ${this.pending.length}件`);
            
            const results = [];
            
            for (let i = this.pending.length - 1; i >= 0; i--) {
                const item = this.pending[i];
                
                try {
                    let result;
                    
                    switch (item.action) {
                        case 'update':
                            result = await this.updateInventory(
                                item.data.productId,
                                item.data.quantity,
                                item.data.reason + ' (再送)',
                                item.data.metadata
                            );
                            break;
                        
                        case 'reserve':
                            result = await this.reserveInventory(
                                item.data.items,
                                item.data.orderId
                            );
                            break;
                        
                        default:
                            console.warn('[在庫API] 不明なアクション:', item.action);
                            continue;
                    }
                    
                    // 成功したら未送信キューから削除
                    this.pending.splice(i, 1);
                    results.push({ success: true, item, result });
                    
                } catch (error) {
                    console.error('[在庫API] 未送信データ同期失敗:', item, error);
                    
                    // リトライ回数更新
                    item.retries++;
                    
                    // 最大リトライ回数超過は削除
                    if (item.retries >= CONFIG.maxRetries) {
                        console.error('[在庫API] 最大リトライ回数超過、破棄:', item);
                        this.pending.splice(i, 1);
                    }
                    
                    results.push({ success: false, item, error: error.message });
                }
            }
            
            this.savePending();
            
            console.log(`[在庫API] 未送信データ同期完了: 成功${results.filter(r => r.success).length}件 / 失敗${results.filter(r => !r.success).length}件`);
            
            return results;
        }

        // ==============================================
        // 在庫アラート確認
        // ==============================================
        async checkLowStock(threshold = 10) {
            try {
                const inventory = await this.getInventory();
                const lowStockItems = [];
                
                for (const [productId, item] of Object.entries(inventory)) {
                    if (item.stock < threshold) {
                        lowStockItems.push({
                            productId,
                            productName: item.productName,
                            stock: item.stock,
                            unit: item.unit
                        });
                    }
                }
                
                if (lowStockItems.length > 0) {
                    console.warn('[在庫API] 在庫不足アラート:', lowStockItems);
                    
                    window.dispatchEvent(new CustomEvent('lowStockAlert', {
                        detail: { items: lowStockItems }
                    }));
                }
                
                return lowStockItems;
            } catch (error) {
                console.error('[在庫API] 在庫チェック失敗:', error);
                return [];
            }
        }

        // ==============================================
        // ログ記録
        // ==============================================
        logChange(action, data) {
            try {
                const logs = JSON.parse(localStorage.getItem(CONFIG.logKey) || '[]');
                
                logs.push({
                    action,
                    data,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                });
                
                // 最新1000件のみ保持
                if (logs.length > 1000) {
                    logs.splice(0, logs.length - 1000);
                }
                
                localStorage.setItem(CONFIG.logKey, JSON.stringify(logs));
            } catch (error) {
                console.error('[在庫API] ログ記録失敗:', error);
            }
        }
    }

    // ==============================================
    // グローバル公開
    // ==============================================
    const inventoryAPI = new InventoryAPI();
    
    window.InventoryAPI = inventoryAPI;
    
    // 後方互換性のための従来関数
    window.getInventory = (productId) => inventoryAPI.getInventory(productId);
    window.updateInventory = (productId, quantity, reason) => 
        inventoryAPI.updateInventory(productId, quantity, reason);
    window.reserveInventory = (items, orderId) => 
        inventoryAPI.reserveInventory(items, orderId);
    
    console.log('[在庫API] 実用版初期化完了');

})(window);
