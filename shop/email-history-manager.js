/**
 * メール送信履歴・管理機能
 * 発送通知の送信記録と再送信機能
 * Version 1.0.0
 */

(function(window) {
    'use strict';

    const EmailHistoryManager = {
        
        // ストレージキー
        STORAGE_KEY_HISTORY: 'shipping_notification_history',
        STORAGE_KEY_TEMPLATES: 'shipping_email_templates',

        /**
         * メール送信履歴を記録
         */
        recordEmailSent: function(data) {
            try {
                const history = this.getHistory();
                
                const record = {
                    id: 'email_' + Date.now(),
                    orderId: data.orderId,
                    customerEmail: data.customerEmail,
                    customerName: data.customerName,
                    carrier: data.carrier,
                    trackingNumber: data.trackingNumber,
                    sentAt: new Date().toISOString(),
                    sentBy: data.sentBy || '管理者',
                    status: 'success',
                    metadata: {
                        shippedDate: data.shippedDate,
                        estimatedDeliveryDate: data.estimatedDeliveryDate,
                        items: data.items || []
                    }
                };

                history.unshift(record); // 最新を先頭に

                // 最新500件まで保持
                if (history.length > 500) {
                    history.pop();
                }

                localStorage.setItem(this.STORAGE_KEY_HISTORY, JSON.stringify(history));
                
                return record;
            } catch (error) {
                console.error('履歴記録エラー:', error);
                return null;
            }
        },

        /**
         * エラー記録
         */
        recordEmailError: function(data, errorMessage) {
            try {
                const history = this.getHistory();
                
                const record = {
                    id: 'email_' + Date.now(),
                    orderId: data.orderId,
                    customerEmail: data.customerEmail,
                    customerName: data.customerName,
                    attemptedAt: new Date().toISOString(),
                    status: 'failed',
                    error: errorMessage,
                    metadata: {
                        carrier: data.carrier,
                        trackingNumber: data.trackingNumber
                    }
                };

                history.unshift(record);

                if (history.length > 500) {
                    history.pop();
                }

                localStorage.setItem(this.STORAGE_KEY_HISTORY, JSON.stringify(history));
                
                return record;
            } catch (error) {
                console.error('エラー記録エラー:', error);
                return null;
            }
        },

        /**
         * 履歴を取得
         */
        getHistory: function() {
            try {
                const history = localStorage.getItem(this.STORAGE_KEY_HISTORY);
                return history ? JSON.parse(history) : [];
            } catch (error) {
                console.error('履歴取得エラー:', error);
                return [];
            }
        },

        /**
         * 注文IDの履歴を取得
         */
        getOrderHistory: function(orderId) {
            const history = this.getHistory();
            return history.filter(record => record.orderId === orderId);
        },

        /**
         * 期間内の履歴を取得
         */
        getHistoryByDateRange: function(startDate, endDate) {
            const history = this.getHistory();
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();

            return history.filter(record => {
                const recordTime = new Date(record.sentAt || record.attemptedAt).getTime();
                return recordTime >= start && recordTime <= end;
            });
        },

        /**
         * 送信統計を取得
         */
        getEmailStats: function() {
            const history = this.getHistory();
            
            return {
                totalSent: history.filter(r => r.status === 'success').length,
                totalFailed: history.filter(r => r.status === 'failed').length,
                totalAttempts: history.length,
                successRate: history.length > 0 ? 
                    (history.filter(r => r.status === 'success').length / history.length * 100).toFixed(1) : 0
            };
        },

        /**
         * 履歴をエクスポート（CSV）
         */
        exportHistoryAsCSV: function() {
            const history = this.getHistory();
            
            const headers = ['送信日時', '注文ID', '顧客名', 'メール', '配送業者', '追跡番号', 'ステータス'];
            const rows = history.map(record => [
                new Date(record.sentAt || record.attemptedAt).toLocaleString('ja-JP'),
                record.orderId,
                record.customerName,
                record.customerEmail,
                record.metadata?.carrier || '-',
                record.metadata?.trackingNumber || '-',
                record.status === 'success' ? '送信済み' : '失敗'
            ]);

            // CSV生成
            let csv = headers.map(h => `"${h}"`).join(',') + '\n';
            csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

            return csv;
        },

        /**
         * 履歴をダウンロード
         */
        downloadHistory: function() {
            const csv = this.exportHistoryAsCSV();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `shipping-history-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        /**
         * 履歴をクリア
         */
        clearHistory: function() {
            if (confirm('すべての送信履歴を削除してもよろしいですか？')) {
                localStorage.removeItem(this.STORAGE_KEY_HISTORY);
                return true;
            }
            return false;
        },

        // ==========================================
        // メールテンプレート管理
        // ==========================================

        /**
         * テンプレートを取得
         */
        getTemplates: function() {
            try {
                const templates = localStorage.getItem(this.STORAGE_KEY_TEMPLATES);
                if (templates) {
                    return JSON.parse(templates);
                }
                return this.getDefaultTemplates();
            } catch (error) {
                console.error('テンプレート取得エラー:', error);
                return this.getDefaultTemplates();
            }
        },

        /**
         * デフォルトテンプレート
         */
        getDefaultTemplates: function() {
            return {
                standard: {
                    name: '標準テンプレート',
                    subject: '【発送完了】ご注文番号 {orderId}',
                    bodyKey: 'standard_shipping',
                    description: '標準的な発送完了通知メール'
                },
                urgent: {
                    name: '緊急配送',
                    subject: '【緊急発送】ご注文番号 {orderId}',
                    bodyKey: 'urgent_shipping',
                    description: '翌日配送対応の緊急通知'
                },
                cooled: {
                    name: 'クール便配送',
                    subject: '【クール便発送】ご注文番号 {orderId}',
                    bodyKey: 'cooled_shipping',
                    description: 'クール便での発送通知'
                }
            };
        },

        /**
         * テンプレートを変数で展開
         */
        expandTemplate: function(template, variables) {
            let result = template;
            
            for (const [key, value] of Object.entries(variables)) {
                const regex = new RegExp(`{${key}}`, 'g');
                result = result.replace(regex, value || '');
            }
            
            return result;
        },

        /**
         * テンプレートを保存
         */
        saveTemplate: function(key, template) {
            try {
                const templates = this.getTemplates();
                templates[key] = template;
                localStorage.setItem(this.STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
                return true;
            } catch (error) {
                console.error('テンプレート保存エラー:', error);
                return false;
            }
        }
    };

    // グローバル変数に暴露
    window.EmailHistoryManager = EmailHistoryManager;

})(window);
