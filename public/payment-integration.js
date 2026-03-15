// ============================================
// 決済システム統合（外部サービス利用）
// 安全性優先 - 自作禁止
// ============================================

// 決済プロバイダー設定
const PAYMENT_PROVIDERS = {
    STRIPE: 'stripe',           // クレジットカード
    PAYPAY: 'paypay',          // PayPay
    LINEPAY: 'linepay',        // LINE Pay
    RAKUTEN: 'rakuten_pay',    // 楽天ペイ
    KONBINI: 'konbini',        // コンビニ決済
    BANK: 'bank_transfer'      // 銀行振込
};

// 決済ステータス
const PAYMENT_STATUS = {
    PENDING: 'pending',           // 処理中
    AUTHORIZED: 'authorized',     // 承認済み（未確定）
    CAPTURED: 'captured',         // 確定（売上計上）
    FAILED: 'failed',             // 失敗
    CANCELLED: 'cancelled',       // キャンセル
    REFUNDED: 'refunded'          // 返金済み
};

// ============================================
// Stripe決済統合
// ============================================
class StripePaymentGateway {
    constructor(publicKey) {
        this.publicKey = publicKey;
        this.stripe = null;
        this.initialized = false;
    }
    
    // Stripe.js初期化
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Stripe.jsをロード（CDN）
            if (typeof Stripe === 'undefined') {
                await this.loadStripeJS();
            }
            
            this.stripe = Stripe(this.publicKey);
            this.initialized = true;
            console.log('[Stripe] 初期化完了');
            
        } catch (error) {
            console.error('[Stripe] 初期化失敗:', error);
            throw new Error('決済システムの初期化に失敗しました');
        }
    }
    
    // Stripe.jsをロード
    loadStripeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // 決済Intent作成（サーバー側APIコール）
    async createPaymentIntent(amount, currency = 'jpy', metadata = {}) {
        try {
            // 実際の実装では、バックエンドAPIにリクエスト
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    metadata: metadata
                })
            });
            
            if (!response.ok) {
                throw new Error('Payment Intent作成失敗');
            }
            
            const data = await response.json();
            return data.clientSecret;
            
        } catch (error) {
            console.error('[Stripe] Payment Intent作成エラー:', error);
            throw error;
        }
    }
    
    // カード決済実行
    async processCardPayment(clientSecret, cardElement) {
        try {
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement
                }
            });
            
            if (result.error) {
                return {
                    success: false,
                    error: result.error.message
                };
            }
            
            if (result.paymentIntent.status === 'succeeded') {
                return {
                    success: true,
                    paymentId: result.paymentIntent.id,
                    status: PAYMENT_STATUS.CAPTURED
                };
            }
            
            return {
                success: false,
                error: '決済が完了しませんでした'
            };
            
        } catch (error) {
            console.error('[Stripe] カード決済エラー:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ============================================
// コンビニ決済統合（日本特有）
// ============================================
class KonbiniPaymentGateway {
    constructor() {
        this.supportedStores = [
            { id: 'seven', name: 'セブンイレブン' },
            { id: 'family', name: 'ファミリーマート' },
            { id: 'lawson', name: 'ローソン' },
            { id: 'ministop', name: 'ミニストップ' },
            { id: 'seicomart', name: 'セイコーマート' }
        ];
    }
    
    // コンビニ決済番号発行
    async generatePaymentCode(orderId, amount, customerInfo) {
        try {
            // 実際の実装では、決済代行サービスのAPIを使用
            // 例：GMO-PG、Paidy、KOMOJU等
            const response = await fetch('/api/konbini/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId: orderId,
                    amount: amount,
                    customerInfo: customerInfo,
                    expiresIn: 7 * 24 * 60 * 60 // 7日間有効
                })
            });
            
            if (!response.ok) {
                throw new Error('決済番号の発行に失敗しました');
            }
            
            const data = await response.json();
            
            return {
                success: true,
                paymentCode: data.paymentCode,
                receiptNumber: data.receiptNumber,
                confirmationNumber: data.confirmationNumber,
                expiresAt: data.expiresAt,
                instructions: this.getPaymentInstructions(data.storeType)
            };
            
        } catch (error) {
            console.error('[コンビニ決済] 番号発行エラー:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // コンビニ別の支払い手順
    getPaymentInstructions(storeType) {
        const instructions = {
            seven: [
                '1. セブンイレブン店舗のレジにお越しください',
                '2. 「インターネット支払い」とお申し付けください',
                '3. 払込票番号を店員にお伝えください',
                '4. 現金でお支払いください'
            ],
            family: [
                '1. ファミリーマート店舗のFamiポートにアクセス',
                '2. 「代金支払い」を選択',
                '3. お客様番号と確認番号を入力',
                '4. レジで30分以内にお支払いください'
            ],
            lawson: [
                '1. ローソン店舗のLoppiにアクセス',
                '2. 「各種番号をお持ちの方」を選択',
                '3. お客様番号と確認番号を入力',
                '4. レジで30分以内にお支払いください'
            ]
        };
        
        return instructions[storeType] || instructions.seven;
    }
}

// ============================================
// Pay系決済統合（PayPay、LINE Pay等）
// ============================================
class MobilePaymentGateway {
    constructor(provider) {
        this.provider = provider;
    }
    
    // QRコード決済開始
    async initiatePayment(orderId, amount, returnUrl) {
        try {
            const response = await fetch('/api/mobile-pay/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: this.provider,
                    orderId: orderId,
                    amount: amount,
                    returnUrl: returnUrl
                })
            });
            
            if (!response.ok) {
                throw new Error('決済開始に失敗しました');
            }
            
            const data = await response.json();
            
            // ユーザーを決済アプリにリダイレクト
            return {
                success: true,
                redirectUrl: data.redirectUrl,
                transactionId: data.transactionId
            };
            
        } catch (error) {
            console.error(`[${this.provider}] 決済開始エラー:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 決済結果確認
    async verifyPayment(transactionId) {
        try {
            const response = await fetch(`/api/mobile-pay/verify/${transactionId}`);
            
            if (!response.ok) {
                throw new Error('決済確認に失敗しました');
            }
            
            const data = await response.json();
            
            return {
                success: true,
                status: data.status,
                paymentId: data.paymentId
            };
            
        } catch (error) {
            console.error(`[${this.provider}] 決済確認エラー:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ============================================
// 決済トランザクション管理（ロールバック対応）
class PaymentTransaction {
    constructor(orderId) {
        this.orderId = orderId;
        this.transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.status = PAYMENT_STATUS.PENDING;
        this.steps = [];
        this.createdAt = new Date().toISOString();
    }
    
    // ステップを記録
    addStep(step, data) {
        this.steps.push({
            step: step,
            data: data,
            timestamp: new Date().toISOString(),
            status: 'completed'
        });
        console.log(`[トランザクション] ${step} 完了`);
    }
    
    // トランザクション失敗時のロールバック
    async rollback(reason) {
        console.warn(`[トランザクション] ロールバック開始: ${reason}`);
        
        const rollbackSteps = [];
        
        try {
            // 実行した処理を逆順でロールバック
            for (let i = this.steps.length - 1; i >= 0; i--) {
                const step = this.steps[i];
                
                switch (step.step) {
                    case 'inventory_reserved':
                        // 在庫を元に戻す
                        await this.releaseInventory(step.data.items);
                        rollbackSteps.push('在庫解放');
                        break;
                        
                    case 'payment_authorized':
                        // 決済を取り消す
                        await this.cancelPayment(step.data.paymentId);
                        rollbackSteps.push('決済キャンセル');
                        break;
                        
                    case 'order_created':
                        // 注文をキャンセル状態に
                        await this.cancelOrder(this.orderId);
                        rollbackSteps.push('注文キャンセル');
                        break;
                }
            }
            
            this.status = PAYMENT_STATUS.CANCELLED;
            
            console.log('[トランザクション] ロールバック完了:', rollbackSteps);
            
            return {
                success: true,
                rolledBack: rollbackSteps,
/**
                reason: reason
            };
            
        } catch (error) {
            console.error('[トランザクション] ロールバック失敗:', error);
            
            // ロールバック失敗は致命的なので管理者に通知
            await this.notifyAdminRollbackFailed(error, reason);
            
            return {
                success: false,
                error: error.message,
                criticalFailure: true
            };
        }
    }
    
    // 在庫解放
    async releaseInventory(items) {
        if (window.InventorySync) {
            for (const item of items) {
                window.InventorySync.add(item.productId, item.quantity, 'ロールバック');
            }
        }
    }
    
    // 決済キャンセル
    async cancelPayment(paymentId) {
        // 実際の実装では決済プロバイダーのキャンセルAPIを呼び出し
        const response = await fetch(`/api/payment/cancel/${paymentId}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('決済キャンセルに失敗しました');
        }
    }
    
    // 注文キャンセル
    async cancelOrder(orderId) {
        if (window.OrderSync) {
            // 注文ステータスを「キャンセル」に更新
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const order = orders.find(o => o.orderId === orderId);
            if (order) {
                order.status = 'cancelled';
                order.cancelledAt = new Date().toISOString();
                localStorage.setItem('orders', JSON.stringify(orders));
            }
        }
    }
    
    // 管理者に通知（ロールバック失敗時）
    async notifyAdminRollbackFailed(error, reason) {
        console.error('【重要】ロールバック失敗 - 管理者対応必要');
        console.error({
            transactionId: this.transactionId,
            orderId: this.orderId,
            error: error.message,
            reason: reason,
            steps: this.steps
        });
        
        // 実際の実装では管理者にメール通知やSlack通知を送る
        // await sendAdminAlert(...)
    }
}

// ============================================
// 決済マネージャー（統合制御）
// ============================================
class PaymentManager {
    constructor() {
        this.stripe = null;
        this.konbini = new KonbiniPaymentGateway();
        this.currentTransaction = null;
    }
    
    // Stripe初期化
    async initializeStripe(publicKey) {
        this.stripe = new StripePaymentGateway(publicKey);
        await this.stripe.initialize();
    }
    
    // 決済処理開始
    async processPayment(orderData, paymentMethod) {
        const transaction = new PaymentTransaction(orderData.orderId);
        this.currentTransaction = transaction;
        
        try {
            // 1. 在庫を仮予約
            transaction.addStep('inventory_reserved', {
                items: orderData.items
            });
            
            if (window.InventorySync) {
                for (const item of orderData.items) {
                    window.InventorySync.reduce(item.id, item.quantity, '注文処理中');
                }
            }
            
            // 2. 決済実行
            let paymentResult;
            
            switch (paymentMethod.type) {
                case PAYMENT_PROVIDERS.STRIPE:
                    paymentResult = await this.stripe.processCardPayment(
                        paymentMethod.clientSecret,
                        paymentMethod.cardElement
                    );
                    break;
                    
                case PAYMENT_PROVIDERS.KONBINI:
                    paymentResult = await this.konbini.generatePaymentCode(
                        orderData.orderId,
                        orderData.amounts.total,
                        orderData.customerInfo
                    );
                    break;
                    
                case PAYMENT_PROVIDERS.PAYPAY:
                case PAYMENT_PROVIDERS.LINEPAY:
                    const mobilePay = new MobilePaymentGateway(paymentMethod.type);
                    paymentResult = await mobilePay.initiatePayment(
                        orderData.orderId,
                        orderData.amounts.total,
                        paymentMethod.returnUrl
                    );
                    break;
                    
                default:
                    throw new Error('サポートされていない決済方法です');
            }
            
            // 3. 決済失敗時はロールバック
            if (!paymentResult.success) {
                await transaction.rollback(`決済失敗: ${paymentResult.error}`);
                
                // 支払失敗通知を送信
                if (window.NotificationSystem && orderData.customerInfo.email) {
                    const notificationManager = window.NotificationSystem.initialize({
                        provider: 'sendgrid',
                        fromEmail: 'noreply@asakanatural.jp',
                        fromName: '安積自然農園'
                    });
                    
                    await notificationManager.sendPaymentFailureNotification({
                        orderId: orderData.orderId,
                        customerEmail: orderData.customerInfo.email,
                        customerName: orderData.customerInfo.name,
                        paymentMethod: paymentMethod.type,
                        failureReason: paymentResult.error || 'general_error',
                        amount: orderData.amounts.total,
                        retryUrl: `https://asakanatural.jp/store/payment-retry.html?orderId=${orderData.orderId}`
                    }).catch(err => console.error('[通知送信エラー]', err));
                }
                
                return {
                    success: false,
                    error: paymentResult.error,
                    rolledBack: true
                };
            }
            
            transaction.addStep('payment_authorized', {
                paymentId: paymentResult.paymentId || paymentResult.transactionId
            });
            
            // 4. 注文確定
            transaction.addStep('order_created', {
                orderId: orderData.orderId
            });
            
            transaction.status = PAYMENT_STATUS.CAPTURED;
            
            // 5. 注文確定メールを送信
            if (window.NotificationSystem && orderData.customerInfo.email) {
                const notificationManager = window.NotificationSystem.initialize({
                    provider: 'sendgrid',
                    fromEmail: 'noreply@asakanatural.jp',
                    fromName: '安積自然農園'
                });
                
                await notificationManager.sendOrderConfirmation({
                    orderId: orderData.orderId,
                    customerEmail: orderData.customerInfo.email,
                    customerName: orderData.customerInfo.name,
                    items: orderData.items,
                    subtotal: orderData.amounts.subtotal,
                    shippingFee: orderData.amounts.shipping,
                    tax: orderData.amounts.tax,
                    total: orderData.amounts.total,
                    paymentMethod: paymentMethod.type,
                    shippingAddress: orderData.customerInfo.address,
                    deliveryDate: orderData.customerInfo.deliveryDate || '調整中',
                    deliveryTimeSlot: orderData.customerInfo.deliveryTimeSlot
                }).catch(err => console.error('[通知送信エラー]', err));
            }
            
            return {
                success: true,
                transaction: transaction,
                paymentResult: paymentResult
            };
            
        } catch (error) {
            console.error('[決済処理エラー]', error);
            
            // エラー時は必ずロールバック
            await transaction.rollback(`処理エラー: ${error.message}`);
            
            return {
                success: false,
                error: error.message,
                rolledBack: true
            };
        }
    }
}

// ============================================
// グローバル公開
// ============================================
window.PaymentManager = PaymentManager;
window.PAYMENT_PROVIDERS = PAYMENT_PROVIDERS;
window.PAYMENT_STATUS = PAYMENT_STATUS;

console.log('[決済システム] 初期化完了');
