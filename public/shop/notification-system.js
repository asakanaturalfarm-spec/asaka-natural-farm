/**
 * ⑦ 通知システム（自動）
 * 
 * 「人力対応は必ず破綻する」
 * - 注文確定メール
 * - 発送完了通知
 * - 支払失敗通知
 * 
 * 【重要原則】
 * - メール送信は外部サービス（SendGrid/AWS SES/Mailgun）を使用
 * - 自作SMTP実装は禁止（セキュリティリスク）
 * - 送信失敗時の自動リトライ
 * - 通知履歴の記録
 * - 個人情報の最小化（必要な情報のみ送信）
 */

// 通知タイプの定義
const NOTIFICATION_TYPE = {
    ORDER_CONFIRMED: 'order_confirmed',      // 注文確定
    SHIPPING_COMPLETED: 'shipping_completed', // 発送完了
    PAYMENT_FAILED: 'payment_failed',        // 支払失敗
    PAYMENT_REMINDER: 'payment_reminder',    // 支払期限リマインダー
    STOCK_ALERT: 'stock_alert'               // 在庫切れアラート（管理者向け）
};

// 通知ステータス
const NOTIFICATION_STATUS = {
    PENDING: 'pending',       // 送信待ち
    SENT: 'sent',            // 送信完了
    FAILED: 'failed',        // 送信失敗
    RETRY: 'retry'           // リトライ中
};

// 通知履歴のストレージキー
const NOTIFICATION_HISTORY_KEY = 'notification_history';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000; // 5秒後にリトライ

/**
 * メール送信サービスの抽象クラス
 * 実際の実装はサーバーサイドで行う
 */
class EmailService {
    constructor(config) {
        this.config = config;
        this.provider = config.provider; // 'sendgrid' | 'ses' | 'mailgun'
        this.apiKey = config.apiKey;
        this.fromEmail = config.fromEmail || 'noreply@asakanatural.jp';
        this.fromName = config.fromName || '安積自然農園';
    }

    /**
     * メール送信（実際はサーバーサイドAPIを呼び出す）
     * @param {Object} params - 送信パラメータ
     * @returns {Promise<Object>} 送信結果
     */
    async send(params) {
        const { to, subject, htmlBody, textBody, templateId, templateData } = params;

        try {
            // 実際の実装：サーバーサイドAPIエンドポイントを呼び出す
            // フロントエンドから直接APIキーを使用するのは危険
            const response = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    provider: this.provider,
                    to,
                    subject,
                    htmlBody,
                    textBody,
                    templateId,
                    templateData,
                    from: {
                        email: this.fromEmail,
                        name: this.fromName
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Email send failed: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                messageId: result.messageId,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Email send error:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 認証トークンを取得（sessionStorageから）
     */
    getAuthToken() {
        const session = sessionStorage.getItem('checkout_session');
        if (session) {
            const sessionData = JSON.parse(session);
            return sessionData.token;
        }
        return null;
    }

    /**
     * テンプレートIDを取得
     */
    getTemplateId(notificationType) {
        const templates = {
            [NOTIFICATION_TYPE.ORDER_CONFIRMED]: 'order_confirmed_template',
            [NOTIFICATION_TYPE.SHIPPING_COMPLETED]: 'shipping_completed_template',
            [NOTIFICATION_TYPE.PAYMENT_FAILED]: 'payment_failed_template',
            [NOTIFICATION_TYPE.PAYMENT_REMINDER]: 'payment_reminder_template'
        };
        return templates[notificationType];
    }
}

/**
 * 通知マネージャー
 * 各種通知の送信、リトライ、履歴管理を行う
 */
class NotificationManager {
    constructor(emailService) {
        this.emailService = emailService;
        this.retryQueue = [];
    }

    /**
     * 注文確定メールを送信
     * @param {Object} orderData - 注文データ
     * @returns {Promise<Object>} 送信結果
     */
    async sendOrderConfirmation(orderData) {
        const {
            orderId,
            customerEmail,
            customerName,
            items,
            subtotal,
            shippingFee,
            tax,
            total,
            paymentMethod,
            shippingAddress,
            deliveryDate,
            deliveryTimeSlot
        } = orderData;

        // メールテンプレートデータ
        const templateData = {
            orderId,
            customerName,
            orderDate: new Date().toLocaleDateString('ja-JP'),
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.unitPrice * item.quantity
            })),
            subtotal: subtotal.toLocaleString('ja-JP'),
            shippingFee: shippingFee.toLocaleString('ja-JP'),
            tax: tax.toLocaleString('ja-JP'),
            total: total.toLocaleString('ja-JP'),
            paymentMethod: this.getPaymentMethodLabel(paymentMethod),
            shippingAddress: this.formatAddress(shippingAddress),
            deliveryDate: deliveryDate,
            deliveryTimeSlot: deliveryTimeSlot || '指定なし',
            shopUrl: 'https://asakanatural.jp/store',
            inquiryEmail: 'info@asakanatural.jp'
        };

        const subject = `【安積自然農園】ご注文確定のお知らせ（注文番号：${orderId}）`;
        
        const htmlBody = this.generateOrderConfirmationHTML(templateData);
        const textBody = this.generateOrderConfirmationText(templateData);

        return await this.sendNotification({
            type: NOTIFICATION_TYPE.ORDER_CONFIRMED,
            to: customerEmail,
            subject,
            htmlBody,
            textBody,
            metadata: {
                orderId,
                customerName,
                total
            }
        });
    }

    /**
     * 発送完了通知を送信
     * @param {Object} shippingData - 発送データ
     * @returns {Promise<Object>} 送信結果
     */
    async sendShippingNotification(shippingData) {
        const {
            orderId,
            customerEmail,
            customerName,
            trackingNumber,
            carrier,
            shippedDate,
            estimatedDeliveryDate,
            items
        } = shippingData;

        const templateData = {
            orderId,
            customerName,
            trackingNumber,
            carrier: carrier || 'ヤマト運輸クール便（冷蔵）',
            shippedDate: new Date(shippedDate).toLocaleDateString('ja-JP'),
            estimatedDeliveryDate: estimatedDeliveryDate,
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity
            })),
            trackingUrl: this.generateTrackingUrl(carrier, trackingNumber),
            shopUrl: 'https://asakanatural.jp/store',
            inquiryEmail: 'info@asakanatural.jp'
        };

        const subject = `【安積自然農園】商品を発送しました（注文番号：${orderId}）`;
        
        const htmlBody = this.generateShippingNotificationHTML(templateData);
        const textBody = this.generateShippingNotificationText(templateData);

        return await this.sendNotification({
            type: NOTIFICATION_TYPE.SHIPPING_COMPLETED,
            to: customerEmail,
            subject,
            htmlBody,
            textBody,
            metadata: {
                orderId,
                trackingNumber,
                carrier
            }
        });
    }

    /**
     * 支払失敗通知を送信
     * @param {Object} paymentFailureData - 支払失敗データ
     * @returns {Promise<Object>} 送信結果
     */
    async sendPaymentFailureNotification(paymentFailureData) {
        const {
            orderId,
            customerEmail,
            customerName,
            paymentMethod,
            failureReason,
            amount,
            retryUrl
        } = paymentFailureData;

        const templateData = {
            orderId,
            customerName,
            paymentMethod: this.getPaymentMethodLabel(paymentMethod),
            failureReason: this.getFailureReasonLabel(failureReason),
            amount: amount.toLocaleString('ja-JP'),
            retryUrl: retryUrl || `https://asakanatural.jp/store/payment-retry.html?orderId=${orderId}`,
            supportSteps: this.getSupportSteps(paymentMethod, failureReason),
            inquiryEmail: 'info@asakanatural.jp',
            inquiryPhone: '024-XXX-XXXX'
        };

        const subject = `【安積自然農園】お支払いが完了していません（注文番号：${orderId}）`;
        
        const htmlBody = this.generatePaymentFailureHTML(templateData);
        const textBody = this.generatePaymentFailureText(templateData);

        return await this.sendNotification({
            type: NOTIFICATION_TYPE.PAYMENT_FAILED,
            to: customerEmail,
            subject,
            htmlBody,
            textBody,
            metadata: {
                orderId,
                paymentMethod,
                failureReason
            }
        });
    }

    /**
     * 通知を送信（共通処理）
     * @param {Object} notification - 通知データ
     * @returns {Promise<Object>} 送信結果
     */
    async sendNotification(notification) {
        const notificationRecord = {
            id: this.generateNotificationId(),
            type: notification.type,
            to: notification.to,
            subject: notification.subject,
            status: NOTIFICATION_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            attempts: 0,
            metadata: notification.metadata || {}
        };

        try {
            const result = await this.emailService.send({
                to: notification.to,
                subject: notification.subject,
                htmlBody: notification.htmlBody,
                textBody: notification.textBody
            });

            if (result.success) {
                notificationRecord.status = NOTIFICATION_STATUS.SENT;
                notificationRecord.sentAt = result.timestamp;
                notificationRecord.messageId = result.messageId;
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Notification send error:', error);
            notificationRecord.status = NOTIFICATION_STATUS.FAILED;
            notificationRecord.error = error.message;
            notificationRecord.attempts = 1;

            // リトライキューに追加
            this.addToRetryQueue(notification, notificationRecord);
        }

        // 履歴に保存
        this.saveNotificationHistory(notificationRecord);

        return notificationRecord;
    }

    /**
     * リトライキューに追加
     */
    addToRetryQueue(notification, record) {
        if (record.attempts < MAX_RETRY_ATTEMPTS) {
            this.retryQueue.push({
                notification,
                record,
                retryAt: Date.now() + RETRY_DELAY_MS * Math.pow(2, record.attempts) // 指数バックオフ
            });

            // 次回リトライをスケジュール
            setTimeout(() => this.processRetryQueue(), RETRY_DELAY_MS);
        }
    }

    /**
     * リトライキューを処理
     */
    async processRetryQueue() {
        const now = Date.now();
        const readyToRetry = this.retryQueue.filter(item => item.retryAt <= now);

        for (const item of readyToRetry) {
            try {
                const result = await this.emailService.send({
                    to: item.notification.to,
                    subject: item.notification.subject,
                    htmlBody: item.notification.htmlBody,
                    textBody: item.notification.textBody
                });

                if (result.success) {
                    item.record.status = NOTIFICATION_STATUS.SENT;
                    item.record.sentAt = result.timestamp;
                    item.record.messageId = result.messageId;
                    
                    // キューから削除
                    this.retryQueue = this.retryQueue.filter(q => q.record.id !== item.record.id);
                } else {
                    item.record.attempts++;
                    if (item.record.attempts >= MAX_RETRY_ATTEMPTS) {
                        item.record.status = NOTIFICATION_STATUS.FAILED;
                        this.retryQueue = this.retryQueue.filter(q => q.record.id !== item.record.id);
                    }
                }

                // 履歴を更新
                this.saveNotificationHistory(item.record);

            } catch (error) {
                console.error('Retry failed:', error);
                item.record.attempts++;
                item.record.error = error.message;
            }
        }
    }

    /**
     * 通知履歴を保存
     */
    saveNotificationHistory(record) {
        try {
            const history = this.getNotificationHistory();
            
            // 既存のレコードを更新または新規追加
            const existingIndex = history.findIndex(h => h.id === record.id);
            if (existingIndex >= 0) {
                history[existingIndex] = record;
            } else {
                history.push(record);
            }

            // 最新100件のみ保持
            const recentHistory = history.slice(-100);
            localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(recentHistory));

        } catch (error) {
            console.error('Failed to save notification history:', error);
        }
    }

    /**
     * 通知履歴を取得
     */
    getNotificationHistory() {
        try {
            const history = localStorage.getItem(NOTIFICATION_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load notification history:', error);
            return [];
        }
    }

    /**
     * 通知IDを生成
     */
    generateNotificationId() {
        return `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 注文確定メールのHTMLを生成
     */
    generateOrderConfirmationHTML(data) {
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c5f2d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-summary { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total-row { font-weight: bold; font-size: 1.2em; color: #2c5f2d; padding-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ご注文ありがとうございます</h1>
        </div>
        <div class="content">
            <p>${data.customerName} 様</p>
            <p>この度は安積自然農園をご利用いただき、誠にありがとうございます。<br>
            以下の内容でご注文を承りました。</p>
            
            <div class="order-summary">
                <h3>注文内容</h3>
                <p><strong>注文番号:</strong> ${data.orderId}<br>
                <strong>注文日:</strong> ${data.orderDate}</p>
                
                ${data.items.map(item => `
                <div class="item">
                    <div>${item.name}</div>
                    <div>数量: ${item.quantity} × ¥${item.unitPrice.toLocaleString('ja-JP')} = ¥${item.subtotal.toLocaleString('ja-JP')}</div>
                </div>
                `).join('')}
                
                <div style="margin-top: 15px;">
                    <div>小計: ¥${data.subtotal}</div>
                    <div>送料: ¥${data.shippingFee}</div>
                    <div>消費税: ¥${data.tax}</div>
                    <div class="total-row">合計: ¥${data.total}</div>
                </div>
            </div>
            
            <div class="order-summary">
                <h3>お支払い方法</h3>
                <p>${data.paymentMethod}</p>
            </div>
            
            <div class="order-summary">
                <h3>お届け先</h3>
                <p>${data.shippingAddress}<br>
                配達希望日: ${data.deliveryDate}<br>
                配達時間帯: ${data.deliveryTimeSlot}</p>
            </div>
            
            <p style="margin-top: 20px;">商品の準備が整い次第、発送完了のお知らせをお送りいたします。</p>
        </div>
        <div class="footer">
            <p>ご不明な点がございましたら、お気軽にお問い合わせください。<br>
            Email: ${data.inquiryEmail}<br>
            <a href="${data.shopUrl}">安積自然農園オンラインストア</a></p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * 注文確定メールのテキストを生成
     */
    generateOrderConfirmationText(data) {
        return `
【安積自然農園】ご注文確定のお知らせ

${data.customerName} 様

この度は安積自然農園をご利用いただき、誠にありがとうございます。
以下の内容でご注文を承りました。

━━━━━━━━━━━━━━━━━━━━━━
■ 注文内容
━━━━━━━━━━━━━━━━━━━━━━
注文番号: ${data.orderId}
注文日: ${data.orderDate}

${data.items.map(item => 
`${item.name}
数量: ${item.quantity} × ¥${item.unitPrice.toLocaleString('ja-JP')} = ¥${item.subtotal.toLocaleString('ja-JP')}`
).join('\n\n')}

小計: ¥${data.subtotal}
送料: ¥${data.shippingFee}
消費税: ¥${data.tax}
━━━━━━━━━━━━━━━━━━━━━━
合計: ¥${data.total}
━━━━━━━━━━━━━━━━━━━━━━

■ お支払い方法
${data.paymentMethod}

■ お届け先
${data.shippingAddress}
配達希望日: ${data.deliveryDate}
配達時間帯: ${data.deliveryTimeSlot}

商品の準備が整い次第、発送完了のお知らせをお送りいたします。

━━━━━━━━━━━━━━━━━━━━━━
ご不明な点がございましたら、お気軽にお問い合わせください。
Email: ${data.inquiryEmail}
━━━━━━━━━━━━━━━━━━━━━━

安積自然農園オンラインストア
${data.shopUrl}
        `.trim();
    }

    /**
     * 発送完了通知のHTMLを生成
     */
    generateShippingNotificationHTML(data) {
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c5f2d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .tracking-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .tracking-number { font-size: 1.5em; font-weight: bold; color: #2c5f2d; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2c5f2d; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>商品を発送しました</h1>
        </div>
        <div class="content">
            <p>${data.customerName} 様</p>
            <p>ご注文いただいた商品を発送いたしました。</p>
            
            <div class="tracking-box">
                <h3>配送情報</h3>
                <p><strong>注文番号:</strong> ${data.orderId}<br>
                <strong>発送日:</strong> ${data.shippedDate}<br>
                <strong>配送業者:</strong> ${data.carrier}</p>
                
                <p><strong>お問い合わせ番号</strong></p>
                <div class="tracking-number">${data.trackingNumber}</div>
                
                <a href="${data.trackingUrl}" class="button">配送状況を確認</a>
                
                <p style="margin-top: 20px; font-size: 0.9em;">
                到着予定日: ${data.estimatedDeliveryDate}
                </p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px;">
                <h3>発送商品</h3>
                ${data.items.map(item => `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                    ${item.name} × ${item.quantity}
                </div>
                `).join('')}
            </div>
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
            ※ クール便（冷蔵）でお届けします。<br>
            ※ 配達時にご不在の場合は、不在票が投函されます。
            </p>
        </div>
        <div class="footer">
            <p>ご不明な点がございましたら、お気軽にお問い合わせください。<br>
            Email: ${data.inquiryEmail}<br>
            <a href="${data.shopUrl}">安積自然農園オンラインストア</a></p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * 発送完了通知のテキストを生成
     */
    generateShippingNotificationText(data) {
        return `
【安積自然農園】商品を発送しました

${data.customerName} 様

ご注文いただいた商品を発送いたしました。

━━━━━━━━━━━━━━━━━━━━━━
■ 配送情報
━━━━━━━━━━━━━━━━━━━━━━
注文番号: ${data.orderId}
発送日: ${data.shippedDate}
配送業者: ${data.carrier}

お問い合わせ番号: ${data.trackingNumber}

配送状況の確認:
${data.trackingUrl}

到着予定日: ${data.estimatedDeliveryDate}

■ 発送商品
${data.items.map(item => `${item.name} × ${item.quantity}`).join('\n')}

※ クール便（冷蔵）でお届けします。
※ 配達時にご不在の場合は、不在票が投函されます。

━━━━━━━━━━━━━━━━━━━━━━
ご不明な点がございましたら、お気軽にお問い合わせください。
Email: ${data.inquiryEmail}
━━━━━━━━━━━━━━━━━━━━━━

安積自然農園オンラインストア
${data.shopUrl}
        `.trim();
    }

    /**
     * 支払失敗通知のHTMLを生成
     */
    generatePaymentFailureHTML(data) {
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .info-box { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>お支払いが完了していません</h1>
        </div>
        <div class="content">
            <p>${data.customerName} 様</p>
            
            <div class="alert-box">
                <strong>⚠️ ご注意</strong><br>
                ご注文のお支払い処理が完了しておりません。
            </div>
            
            <div class="info-box">
                <h3>注文情報</h3>
                <p><strong>注文番号:</strong> ${data.orderId}<br>
                <strong>お支払い方法:</strong> ${data.paymentMethod}<br>
                <strong>お支払い金額:</strong> ¥${data.amount}</p>
            </div>
            
            <div class="info-box">
                <h3>エラー内容</h3>
                <p>${data.failureReason}</p>
            </div>
            
            <div class="info-box">
                <h3>対応方法</h3>
                ${data.supportSteps}
            </div>
            
            <div style="text-align: center;">
                <a href="${data.retryUrl}" class="button">お支払いを再試行する</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
            ※ 解決しない場合は、下記までお問い合わせください。<br>
            Email: ${data.inquiryEmail}<br>
            電話: ${data.inquiryPhone}
            </p>
        </div>
        <div class="footer">
            <p>安積自然農園オンラインストア</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * 支払失敗通知のテキストを生成
     */
    generatePaymentFailureText(data) {
        return `
【安積自然農園】お支払いが完了していません

${data.customerName} 様

ご注文のお支払い処理が完了しておりません。

━━━━━━━━━━━━━━━━━━━━━━
■ 注文情報
━━━━━━━━━━━━━━━━━━━━━━
注文番号: ${data.orderId}
お支払い方法: ${data.paymentMethod}
お支払い金額: ¥${data.amount}

■ エラー内容
${data.failureReason}

■ 対応方法
${data.supportSteps.replace(/<[^>]*>/g, '')}

お支払いを再試行する:
${data.retryUrl}

━━━━━━━━━━━━━━━━━━━━━━
解決しない場合は、下記までお問い合わせください。
Email: ${data.inquiryEmail}
電話: ${data.inquiryPhone}
━━━━━━━━━━━━━━━━━━━━━━

安積自然農園オンラインストア
        `.trim();
    }

    /**
     * 決済方法のラベルを取得
     */
    getPaymentMethodLabel(method) {
        const labels = {
            'credit_card': 'クレジットカード',
            'konbini': 'コンビニ決済',
            'paypay': 'PayPay',
            'linepay': 'LINE Pay',
            'bank_transfer': '銀行振込',
            'cod': '代金引換'
        };
        return labels[method] || method;
    }

    /**
     * 失敗理由のラベルを取得
     */
    getFailureReasonLabel(reason) {
        const labels = {
            'insufficient_funds': 'ご利用可能額を超えています',
            'card_declined': 'カードが拒否されました',
            'expired_card': 'カードの有効期限が切れています',
            'invalid_card': 'カード番号が正しくありません',
            'network_error': '通信エラーが発生しました',
            'timeout': 'タイムアウトしました',
            'payment_timeout': 'お支払い期限が過ぎています',
            'general_error': 'エラーが発生しました'
        };
        return labels[reason] || reason;
    }

    /**
     * サポート手順を取得
     */
    getSupportSteps(paymentMethod, failureReason) {
        if (paymentMethod === 'credit_card') {
            return `
                <ol>
                    <li>カード情報（番号・有効期限・セキュリティコード）を確認してください</li>
                    <li>ご利用可能額を確認してください</li>
                    <li>別のクレジットカードをお試しください</li>
                    <li>カード会社にお問い合わせください</li>
                </ol>
            `;
        } else if (paymentMethod === 'konbini') {
            return `
                <ol>
                    <li>お支払い期限内にコンビニでお支払いください</li>
                    <li>お支払い番号を確認してください</li>
                    <li>別のコンビニでお試しください</li>
                </ol>
            `;
        } else {
            return `<p>お支払い方法を確認して、再度お試しください。</p>`;
        }
    }

    /**
     * トラッキングURLを生成
     */
    generateTrackingUrl(carrier, trackingNumber) {
        if (carrier.includes('ヤマト')) {
            return `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number=${trackingNumber}`;
        } else if (carrier.includes('佐川')) {
            return `https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp?okurijoNo=${trackingNumber}`;
        } else if (carrier.includes('日本郵便')) {
            return `https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackingNumber}`;
        }
        return '#';
    }

    /**
     * 住所を整形
     */
    formatAddress(address) {
        if (typeof address === 'string') {
            return address;
        }
        return `〒${address.postalCode} ${address.prefecture}${address.city}${address.addressLine1}${address.addressLine2 || ''}<br>${address.name} 様`;
    }
}

// グローバルに公開
window.NotificationSystem = {
    NOTIFICATION_TYPE,
    NOTIFICATION_STATUS,
    EmailService,
    NotificationManager,
    
    /**
     * 初期化ヘルパー
     */
    initialize(config) {
        const emailService = new EmailService(config);
        return new NotificationManager(emailService);
    }
};
