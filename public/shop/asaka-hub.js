/**
 * 安積農園統合管理システム - コアHUB
 * すべてのアプリで共通利用する機能を統合
 * Version 1.0.0
 */

(function(window) {
    'use strict';

    // ==============================================
    // 1. 商品マスターデータ（全アプリ共通）
    // ==============================================
    const PRODUCTS_MASTER = [
        { id: 'v1', name: 'ほうれん草', category: '葉物野菜', price: 500, unit: '袋' },
        { id: 'v2', name: '小松菜', category: '葉物野菜', price: 450, unit: '袋' },
        { id: 'v3', name: '春菊', category: '葉物野菜', price: 480, unit: '袋' },
        { id: 'v4', name: '水菜', category: '葉物野菜', price: 420, unit: '袋' },
        { id: 'v5', name: 'ルッコラ', category: '葉物野菜', price: 550, unit: '袋' },
        { id: 'v6', name: 'チンゲン菜', category: '葉物野菜', price: 430, unit: '袋' },
        { id: 'v7', name: 'ベビーリーフ', category: '葉物野菜', price: 600, unit: '袋' },
        { id: 'v8', name: 'サニーレタス', category: 'レタス類', price: 520, unit: '玉' },
        { id: 'v9', name: 'ロメインレタス', category: 'レタス類', price: 580, unit: '玉' },
        { id: 'v10', name: 'リーフレタス', category: 'レタス類', price: 500, unit: '袋' },
        { id: 'v11', name: '大根', category: '根菜類', price: 300, unit: '本' },
        { id: 'v12', name: 'かぶ', category: '根菜類', price: 350, unit: '袋' },
        { id: 'v13', name: 'ブロッコリー', category: 'アブラナ科', price: 450, unit: '個' },
        { id: 'v14', name: 'カリフラワー', category: 'アブラナ科', price: 480, unit: '個' },
        { id: 'v15', name: 'キャベツ', category: 'アブラナ科', price: 350, unit: '玉' },
        { id: 'v16', name: '白菜', category: 'アブラナ科', price: 400, unit: '玉' },
        { id: 'v17', name: 'ケール', category: '葉物野菜', price: 600, unit: '袋' },
        { id: 'v18', name: '赤軸ほうれん草', category: '葉物野菜', price: 550, unit: '袋' },
        { id: 'v19', name: '紫水菜', category: '葉物野菜', price: 480, unit: '袋' },
        { id: 'v20', name: 'からし菜', category: '葉物野菜', price: 450, unit: '袋' },
        { id: 'v21', name: 'ミニトマト', category: '果菜類', price: 700, unit: 'パック' },
        { id: 'v22', name: 'ミニ白菜', category: 'アブラナ科', price: 350, unit: '個' },
        { id: 'v23', name: 'ラディッシュ', category: '根菜類', price: 380, unit: '袋' },
        { id: 'v24', name: 'わさび菜', category: '葉物野菜', price: 480, unit: '袋' },
        { id: 'v25', name: 'カボチャ', category: '果菜類', price: 600, unit: '個' },
        { id: 'v26', name: 'ネギ', category: '葉物野菜', price: 400, unit: '本' },
        { id: 'v27', name: 'なす', category: '果菜類', price: 450, unit: '袋' },
        { id: 'v28', name: 'レタス', category: 'レタス類', price: 500, unit: '玉' },
        { id: 'v29', name: 'じゃがいも', category: '根菜類', price: 500, unit: 'kg' },
        { id: 'v30', name: 'さつまいも', category: '根菜類', price: 600, unit: 'kg' },
        { id: 'v31', name: 'ピーマン', category: '果菜類', price: 400, unit: '袋' },
        { id: 'v32', name: 'たまねぎ', category: '根菜類', price: 350, unit: 'kg' },
        { id: 'v33', name: '里芋', category: '根菜類', price: 700, unit: 'kg' },
        { id: 'v34', name: 'にんじん', category: '根菜類', price: 400, unit: '袋' },
        { id: 'v35', name: 'にんにく', category: '香味野菜', price: 800, unit: '袋' },
        { id: 'v36', name: 'とうもろこし', category: '果菜類', price: 500, unit: '本' },
        { id: 'c1', name: '野菜セット', category: '加工品', price: 2500, unit: 'セット' }
    ];

    // ==============================================
    // 2. ストレージキー定義（全アプリ統一）
    // ==============================================
    const STORAGE_KEYS = {
        // 在庫管理
        INVENTORY: 'inventory_realtime',
        INVENTORY_LOG: 'inventory_log',
        
        // 注文管理
        ORDERS: 'unified_orders',
        ORDER_LOG: 'unified_orders_log',
        PROCESSED_IDS: 'processed_order_ids',
        
        // 収穫管理
        HARVESTS: 'harvestRecords',
        
        // 顧客管理
        CUSTOMERS: 'orderManagement_customers',
        
        // 帳簿管理
        TRANSACTIONS: 'transactions',
        ACCOUNTS: 'accounts',
        
        // その他
        CART: 'cartItems',
        FAVORITES: 'favorites',
        LAST_ORDER: 'lastOrder'
    };

    // ==============================================
    // 3. ユーティリティ関数
    // ==============================================
    const Utils = {
        // 日付フォーマット
        formatDate(date, format = 'YYYY-MM-DD') {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hour = String(d.getHours()).padStart(2, '0');
            const minute = String(d.getMinutes()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hour)
                .replace('mm', minute);
        },

        // 金額フォーマット
        formatCurrency(amount) {
            return '¥' + amount.toLocaleString('ja-JP');
        },

        // ユニークID生成
        generateId(prefix = 'ID') {
            return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        },

        // LocalStorage操作
        storage: {
            get(key, defaultValue = null) {
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : defaultValue;
                } catch (e) {
                    console.error(`Storage get error for ${key}:`, e);
                    return defaultValue;
                }
            },
            
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.error(`Storage set error for ${key}:`, e);
                    return false;
                }
            },
            
            remove(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.error(`Storage remove error for ${key}:`, e);
                    return false;
                }
            }
        },

        // 商品検索
        findProduct(productId) {
            return PRODUCTS_MASTER.find(p => p.id === productId);
        },

        // カテゴリ別商品取得
        getProductsByCategory(category) {
            return PRODUCTS_MASTER.filter(p => p.category === category);
        },

        // バリデーション
        validate: {
            email(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            phone(phone) {
                return /^[0-9-]+$/.test(phone);
            },
            required(value) {
                return value !== null && value !== undefined && value !== '';
            }
        }
    };

    // ==============================================
    // 4. イベントバス（アプリ間通信）
    // ==============================================
    class EventBus {
        constructor() {
            this.events = {};
        }

        on(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
        }

        emit(event, data) {
            if (this.events[event]) {
                this.events[event].forEach(callback => callback(data));
            }
        }

        off(event, callback) {
            if (this.events[event]) {
                this.events[event] = this.events[event].filter(cb => cb !== callback);
            }
        }
    }

    // ==============================================
    // 5. 通知システム
    // ==============================================
    class NotificationSystem {
        show(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            // アニメーション
            setTimeout(() => notification.classList.add('show'), 10);
            
            // 自動削除
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        getIcon(type) {
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            return icons[type] || icons.info;
        }

        success(message, duration) {
            this.show(message, 'success', duration);
        }

        error(message, duration) {
            this.show(message, 'error', duration);
        }

        warning(message, duration) {
            this.show(message, 'warning', duration);
        }

        info(message, duration) {
            this.show(message, 'info', duration);
        }
    }

    // ==============================================
    // 6. データ同期システム
    // ==============================================
    class DataSync {
        constructor() {
            this.syncInterval = null;
            this.lastSync = null;
        }

        // 定期同期開始
        startAutoSync(interval = 30000) {
            this.syncInterval = setInterval(() => {
                this.sync();
            }, interval);
        }

        // 定期同期停止
        stopAutoSync() {
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
            }
        }

        // データ同期実行
        sync() {
            this.lastSync = new Date();
            window.AsakaHub.events.emit('data:synced', {
                timestamp: this.lastSync
            });
        }

        // 最終同期時刻取得
        getLastSyncTime() {
            return this.lastSync;
        }
    }

    // ==============================================
    // 7. ログシステム
    // ==============================================
    class Logger {
        constructor() {
            this.logs = [];
            this.maxLogs = 1000;
        }

        log(level, message, data = null) {
            const logEntry = {
                level: level,
                message: message,
                data: data,
                timestamp: new Date().toISOString(),
                app: this.detectApp()
            };

            this.logs.unshift(logEntry);

            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(0, this.maxLogs);
            }

            // コンソール出力
            const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
            console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
        }

        info(message, data) {
            this.log('info', message, data);
        }

        warn(message, data) {
            this.log('warn', message, data);
        }

        error(message, data) {
            this.log('error', message, data);
        }

        debug(message, data) {
            this.log('debug', message, data);
        }

        getLogs(limit = 100) {
            return this.logs.slice(0, limit);
        }

        detectApp() {
            const path = window.location.pathname;
            if (path.includes('安積直売所')) return 'EC';
            if (path.includes('受注発注')) return 'ORDER';
            if (path.includes('収穫量')) return 'HARVEST';
            if (path.includes('帳簿')) return 'ACCOUNTING';
            if (path.includes('ダッシュボード')) return 'DASHBOARD';
            return 'UNKNOWN';
        }
    }

    // ==============================================
    // 8. メインHUBクラス
    // ==============================================
    class AsakaHub {
        constructor() {
            this.version = '1.0.0';
            this.products = PRODUCTS_MASTER;
            this.storageKeys = STORAGE_KEYS;
            this.utils = Utils;
            this.events = new EventBus();
            this.notification = new NotificationSystem();
            this.dataSync = new DataSync();
            this.logger = new Logger();
        }

        // 初期化
        init() {
            this.logger.info('AsakaHub initialized', { version: this.version });
            this.injectStyles();
            return this;
        }

        // 共通スタイル注入
        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    opacity: 0;
                    transform: translateX(400px);
                    transition: all 0.3s ease;
                    font-family: 'Noto Sans JP', sans-serif;
                }

                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }

                .notification-success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .notification-error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .notification-warning {
                    background: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }

                .notification-info {
                    background: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }

                .notification-icon {
                    font-size: 20px;
                }

                .notification-message {
                    font-size: 14px;
                }
            `;
            document.head.appendChild(style);
        }

        // 統計情報取得
        getSystemStats() {
            return {
                products: this.products.length,
                inventory: window.InventorySync ? window.InventorySync.report() : null,
                orders: window.OrderSync ? window.OrderSync.getStats() : null,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ==============================================
    // 9. グローバル公開
    // ==============================================
    window.AsakaHub = new AsakaHub().init();
    window.PRODUCTS = PRODUCTS_MASTER; // 後方互換性のため

    console.log(`
╔═══════════════════════════════════════════╗
║   安積農園統合管理システム - Core HUB    ║
║          Version ${window.AsakaHub.version}                  ║
╚═══════════════════════════════════════════╝
✅ 商品マスター: ${PRODUCTS_MASTER.length}件
✅ ユーティリティ: 有効
✅ イベントバス: 有効
✅ 通知システム: 有効
✅ ログシステム: 有効
    `);

})(window);
