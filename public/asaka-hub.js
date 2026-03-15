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
    /**
     * 商品マスターデータ（全アプリ共通）
     * @type {Array<{id: string, name: string, category: string, price: number, unit: string}>}
     */
    const productMaster = [
        { id: 'v1', name: 'Spinach', category: 'LeafyVegetable', price: 500, unit: 'bag' },
        { id: 'v2', name: 'Komatsuna', category: 'LeafyVegetable', price: 450, unit: 'bag' },
        { id: 'v3', name: 'Shungiku', category: 'LeafyVegetable', price: 480, unit: 'bag' },
        { id: 'v4', name: 'Mizuna', category: 'LeafyVegetable', price: 420, unit: 'bag' },
        { id: 'v5', name: 'Rucola', category: 'LeafyVegetable', price: 550, unit: 'bag' },
        { id: 'v6', name: 'Chingensai', category: 'LeafyVegetable', price: 430, unit: 'bag' },
        { id: 'v7', name: 'BabyLeaf', category: 'LeafyVegetable', price: 600, unit: 'bag' },
        { id: 'v8', name: 'SunnyLettuce', category: 'Lettuce', price: 520, unit: 'head' },
        { id: 'v9', name: 'RomaineLettuce', category: 'Lettuce', price: 580, unit: 'head' },
        { id: 'v10', name: 'LeafLettuce', category: 'Lettuce', price: 500, unit: 'bag' },
        { id: 'v11', name: 'Daikon', category: 'RootVegetable', price: 300, unit: 'piece' },
        { id: 'v12', name: 'Turnip', category: 'RootVegetable', price: 350, unit: 'bag' },
        { id: 'v13', name: 'Broccoli', category: 'Brassica', price: 450, unit: 'piece' },
        { id: 'v14', name: 'Cauliflower', category: 'Brassica', price: 480, unit: 'piece' },
        { id: 'v15', name: 'Cabbage', category: 'Brassica', price: 350, unit: 'head' },
        { id: 'v16', name: 'ChineseCabbage', category: 'Brassica', price: 400, unit: 'head' },
        { id: 'v17', name: 'Kale', category: 'LeafyVegetable', price: 600, unit: 'bag' },
        { id: 'v18', name: 'RedSpinach', category: 'LeafyVegetable', price: 550, unit: 'bag' },
        { id: 'v19', name: 'PurpleMizuna', category: 'LeafyVegetable', price: 480, unit: 'bag' },
        { id: 'v20', name: 'MustardGreen', category: 'LeafyVegetable', price: 450, unit: 'bag' },
        { id: 'v21', name: 'MiniTomato', category: 'FruitVegetable', price: 700, unit: 'pack' },
        { id: 'v22', name: 'MiniChineseCabbage', category: 'Brassica', price: 350, unit: 'piece' },
        { id: 'v23', name: 'Radish', category: 'RootVegetable', price: 380, unit: 'bag' },
        { id: 'v24', name: 'Wasabina', category: 'LeafyVegetable', price: 480, unit: 'bag' },
        { id: 'v25', name: 'Pumpkin', category: 'FruitVegetable', price: 600, unit: 'piece' },
        { id: 'v26', name: 'GreenOnion', category: 'LeafyVegetable', price: 400, unit: 'piece' },
        { id: 'v27', name: 'Eggplant', category: 'FruitVegetable', price: 450, unit: 'bag' },
        { id: 'v28', name: 'Lettuce', category: 'Lettuce', price: 500, unit: 'head' },
        { id: 'v29', name: 'Potato', category: 'RootVegetable', price: 500, unit: 'kg' },
        { id: 'v30', name: 'SweetPotato', category: 'RootVegetable', price: 600, unit: 'kg' },
        { id: 'v31', name: 'GreenPepper', category: 'FruitVegetable', price: 400, unit: 'bag' },
        { id: 'v32', name: 'Onion', category: 'RootVegetable', price: 350, unit: 'kg' },
        { id: 'v33', name: 'Taro', category: 'RootVegetable', price: 700, unit: 'kg' },
        { id: 'v34', name: 'Carrot', category: 'RootVegetable', price: 400, unit: 'bag' },
        { id: 'v35', name: 'Garlic', category: 'AromaticVegetable', price: 800, unit: 'bag' },
        { id: 'v36', name: 'Corn', category: 'FruitVegetable', price: 500, unit: 'piece' },
        { id: 'c1', name: 'VegetableSet', category: 'Processed', price: 2500, unit: 'set' }
    ];

    // ==============================================
    // 2. ストレージキー定義（全アプリ統一）
    // ==============================================
    /**
     * ストレージキー定義（全アプリ統一）
     * @type {Object}
     */
    const storageKeys = {
        // 在庫管理
        INVENTORY: 'inventory_realtime',

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
    /**
     * ユーティリティ関数群
     * @namespace
     */
    const utils = {
        /**
         * 日付を指定フォーマットで返す
         * @param {Date|string|number} date 日付
         * @param {string} format フォーマット例: 'YYYY-MM-DD'
         * @returns {string}
         */
        formatDate: (date, format = 'YYYY-MM-DD') => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hour = String(d.getHours()).padStart(2, '0');
            const minute = String(d.getMinutes()).padStart(2, '0');
            return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('HH', hour).replace('mm', minute);
        },
        /**
         * 金額を日本円表記で返す
         * @param {number} amount 金額
         * @returns {string}
         */
        formatCurrency: amount => '¥' + amount.toLocaleString('ja-JP'),
        /**
         * 一意なIDを生成
         * @param {string} prefix 接頭辞
         * @returns {string}
         */
        generateId: (prefix = 'ID') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        /**
         * ローカルストレージ操作
        /**
         */
        storage: {
            /**
             * ストレージから値を取得
             * @param {string} key
             * @param {*} defaultValue
             * @returns {*}
             */
            get: (key, defaultValue = null) => {
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
            },
            /**
             * ストレージに値を保存
             * @param {string} key
             * @param {*} value
             * @returns {boolean}
             */
            set: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    return false;
                }
            },
            /**
             * ストレージから値を削除
             * @param {string} key
             * @returns {boolean}
             */
            remove: key => {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        },
        /**
         * 商品IDから商品情報を取得
         * @param {string} productId
         * @returns {object|undefined}
         */
        findProduct: productId => productMaster.find(p => p.id === productId),
        /**
         * カテゴリで商品一覧を取得
         * @param {string} category
         * @returns {Array}
         */
        getProductsByCategory: category => productMaster.filter(p => p.category === category),
        /**
         * バリデーション関数群
         */
        validate: {
            /**
             * メールアドレス形式チェック
             * @param {string} email
             * @returns {boolean}
             */
            email: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            /**
             * 電話番号形式チェック
             * @param {string} phone
             * @returns {boolean}
             */
            phone: phone => /^[0-9-]+$/.test(phone),
            /**
             * 必須チェック
             * @param {*} value
             * @returns {boolean}
             */
            required: value => value !== null && value !== undefined && value !== ''
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
    /**
     * 安積農園統合管理HUBクラス
     * @class
     */
    class AsakaHub {
        constructor() {
            this.version = '1.0.0';
            this.products = productMaster;
            this.storageKeys = storageKeys;
            this.utils = utils;
            this.events = new EventBus();
            this.notification = new NotificationSystem();
            this.dataSync = new DataSync();
            this.logger = new Logger();
        }

        /**
         * HUB初期化処理
         * @returns {AsakaHub}
         */
        init() {
            this.logger.info('AsakaHub initialized', { version: this.version });
            this.injectStyles();
            // Supabase初期化
            const supabaseUrl = 'https://ecalmxymgkbkaxguhqrs.supabase.co';
            const supabaseKey = 'sb_publishable_fWeuDN6rPnmb_OuRUJWHCg_OSmFmJFi';
            if (window.supabase === undefined && typeof window.createClient === 'undefined') {
                // supabase-jsが読み込まれていない場合は警告
                this.logger.warn('Supabaseクライアントが読み込まれていません。admin.htmlでCDNを追加してください。');
            } else {
                // supabase-jsが読み込まれている場合のみ初期化
                window.supabase = window.createClient ? window.createClient(supabaseUrl, supabaseKey) : window.supabase;
                this.logger.info('Supabase initialized', { url: supabaseUrl });
            }
            return this;
        }

        /**
         * 共通スタイルをheadへ注入
         */
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

        /**
         * システム統計情報を取得
         * @returns {object}
         */
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
    window.PRODUCTS = productMaster; // 後方互換性のため

})(window);
