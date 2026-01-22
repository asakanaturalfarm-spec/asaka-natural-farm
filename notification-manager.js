/**
 * 通知マネージャー
 * 注文確定・発送完了・支払失敗の3種類の通知を管理
 */

const { sendEmail, rateLimiter, duplicateChecker } = require('./email-service');

// メールテンプレート生成
class EmailTemplates {
    static getBaseURL() {
        return process.env.DOMAIN || 'https://asakanatural.jp/store';
    }
    
    // 注文確定メール
    static orderConfirmation(order) {
        const { orderId, customerName, customerEmail, items, subtotal, shipping, tax, total, paymentMethod, deliveryDate } = order;
        
        // プレーンテキスト
        const text = `
${customerName} 様

ご注文ありがとうございます。
ご注文を受け付けいたしました。

【注文番号】
${orderId}

【ご注文内容】
${items.map(item => `- ${item.name} × ${item.quantity}個 ￥${item.price.toLocaleString()}`).join('\n')}

【金額】
商品小計: ￥${subtotal.toLocaleString()}
送料: ￥${shipping.toLocaleString()}
消費税: ￥${tax.toLocaleString()}
-------------------------------
合計: ￥${total.toLocaleString()}

【お支払い方法】
${paymentMethod}

【配送予定日】
${deliveryDate}

【配送について】
ヤマト運輸クール便でお届けします。
発送完了後、追跡番号をお知らせいたします。

【キャンセルについて】
発送前までキャンセル可能です。
お問い合わせフォームよりご連絡ください。

━━━━━━━━━━━━━━━━━━━━━━━━
安積直売所オンライン
${this.getBaseURL()}

お問い合わせ: ${this.getBaseURL()}/contact.html
特定商取引法表記: ${this.getBaseURL()}/tokushoho.html
━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

        // HTML（最小構成）
        const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border-bottom: 3px solid #2c5f2d; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; color: #2c5f2d;">ご注文ありがとうございます</h1>
    </div>
    
    <p>${customerName} 様</p>
    <p>ご注文を受け付けいたしました。</p>
    
    <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0 0 5px 0;"><strong>注文番号</strong></p>
        <p style="margin: 0; font-size: 18px; color: #2c5f2d;"><strong>${orderId}</strong></p>
    </div>
    
    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">ご注文内容</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        ${items.map(item => `
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity}個</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">￥${item.price.toLocaleString()}</td>
        </tr>
        `).join('')}
        <tr>
            <td style="padding: 8px 0;">商品小計</td>
            <td style="padding: 8px 0; text-align: right;">￥${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0;">送料</td>
            <td style="padding: 8px 0; text-align: right;">￥${shipping.toLocaleString()}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0;">消費税</td>
            <td style="padding: 8px 0; text-align: right;">￥${tax.toLocaleString()}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 16px; border-top: 2px solid #2c5f2d;">
            <td style="padding: 10px 0;">合計</td>
            <td style="padding: 10px 0; text-align: right; color: #2c5f2d;">￥${total.toLocaleString()}</td>
        </tr>
    </table>
    
    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">お支払い方法</h2>
    <p>${paymentMethod}</p>
    
    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">配送予定日</h2>
    <p>${deliveryDate}</p>
    
    <div style="background: #e8f5e9; border-left: 4px solid #2c5f2d; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>配送について</strong></p>
        <p style="margin: 5px 0 0 0;">ヤマト運輸クール便でお届けします。発送完了後、追跡番号をお知らせいたします。</p>
    </div>
    
    <div style="background: #fff3e0; border-left: 4px solid #f57c00; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>キャンセルについて</strong></p>
        <p style="margin: 5px 0 0 0;">発送前までキャンセル可能です。<a href="${this.getBaseURL()}/contact.html" style="color: #2c5f2d;">お問い合わせフォーム</a>よりご連絡ください。</p>
    </div>
    
    <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666;">
        <p style="margin: 0;"><strong>安積直売所オンライン</strong></p>
        <p style="margin: 5px 0;"><a href="${this.getBaseURL()}" style="color: #2c5f2d;">トップページ</a> | <a href="${this.getBaseURL()}/contact.html" style="color: #2c5f2d;">お問い合わせ</a> | <a href="${this.getBaseURL()}/tokushoho.html" style="color: #2c5f2d;">特定商取引法表記</a></p>
    </div>
</body>
</html>
`.trim();

        return { text, html };
    }
    
    // 発送完了メール
    static shippingNotification(shipment) {
        const { orderId, customerName, trackingNumber, carrier, estimatedDelivery, items } = shipment;
        
        const text = `
${customerName} 様

ご注文商品を発送いたしました。

【注文番号】
${orderId}

【配送業者】
${carrier}

【追跡番号】
${trackingNumber}

【配送予定日】
${estimatedDelivery}

【発送商品】
${items.map(item => `- ${item.name} × ${item.quantity}個`).join('\n')}

【追跡URL】
https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number=${trackingNumber}

商品到着後、万一品質に問題がございましたら、
到着後24時間以内にお問い合わせください。

━━━━━━━━━━━━━━━━━━━━━━━━
安積直売所オンライン
${this.getBaseURL()}

お問い合わせ: ${this.getBaseURL()}/contact.html
返品ポリシー: ${this.getBaseURL()}/returns.html
━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

        const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border-bottom: 3px solid #2c5f2d; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; color: #2c5f2d;">商品を発送いたしました</h1>
    </div>
    
    <p>${customerName} 様</p>
    <p>ご注文商品を発送いたしました。</p>
    
    <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0 0 10px 0;"><strong>注文番号</strong>: ${orderId}</p>
        <p style="margin: 0 0 10px 0;"><strong>配送業者</strong>: ${carrier}</p>
        <p style="margin: 0 0 10px 0;"><strong>追跡番号</strong>: <span style="font-size: 16px; color: #2c5f2d; font-weight: bold;">${trackingNumber}</span></p>
        <p style="margin: 0;"><strong>配送予定日</strong>: ${estimatedDelivery}</p>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
        <a href="https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number=${trackingNumber}" style="display: inline-block; background: #2c5f2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">配送状況を確認</a>
    </div>
    
    <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">発送商品</h2>
    <ul style="padding-left: 20px;">
        ${items.map(item => `<li>${item.name} × ${item.quantity}個</li>`).join('')}
    </ul>
    
    <div style="background: #fff3e0; border-left: 4px solid #f57c00; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>品質保証について</strong></p>
        <p style="margin: 5px 0 0 0;">商品到着後、万一品質に問題がございましたら、到着後24時間以内に<a href="${this.getBaseURL()}/contact.html" style="color: #2c5f2d;">お問い合わせフォーム</a>よりご連絡ください。</p>
    </div>
    
    <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666;">
        <p style="margin: 0;"><strong>安積直売所オンライン</strong></p>
        <p style="margin: 5px 0;"><a href="${this.getBaseURL()}" style="color: #2c5f2d;">トップページ</a> | <a href="${this.getBaseURL()}/contact.html" style="color: #2c5f2d;">お問い合わせ</a> | <a href="${this.getBaseURL()}/returns.html" style="color: #2c5f2d;">返品ポリシー</a></p>
    </div>
</body>
</html>
`.trim();

        return { text, html };
    }
    
    // 支払失敗メール
    static paymentFailure(payment) {
        const { orderId, customerName, paymentMethod, failureReason, retryUrl, amount } = payment;
        
        const text = `
${customerName} 様

お支払いの処理に失敗いたしました。

【注文番号】
${orderId}

【お支払い方法】
${paymentMethod}

【金額】
￥${amount.toLocaleString()}

【失敗理由】
${failureReason}

【対応方法】
以下のURLより、お支払い情報を再入力してください。
${retryUrl}

ご不明な点がございましたら、お問い合わせください。

━━━━━━━━━━━━━━━━━━━━━━━━
安積直売所オンライン
${this.getBaseURL()}

お問い合わせ: ${this.getBaseURL()}/contact.html
━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

        const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border-bottom: 3px solid #d32f2f; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; color: #d32f2f;">お支払いの処理に失敗しました</h1>
    </div>
    
    <p>${customerName} 様</p>
    <p>お支払いの処理に失敗いたしました。お手数ですが、お支払い情報を再入力してください。</p>
    
    <div style="background: #ffebee; border: 1px solid #ef5350; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0 0 10px 0;"><strong>注文番号</strong>: ${orderId}</p>
        <p style="margin: 0 0 10px 0;"><strong>お支払い方法</strong>: ${paymentMethod}</p>
        <p style="margin: 0 0 10px 0;"><strong>金額</strong>: ￥${amount.toLocaleString()}</p>
        <p style="margin: 0;"><strong>失敗理由</strong>: ${failureReason}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${retryUrl}" style="display: inline-block; background: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">お支払い情報を再入力</a>
    </div>
    
    <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>ご不明な点がございましたら</strong></p>
        <p style="margin: 5px 0 0 0;"><a href="${this.getBaseURL()}/contact.html" style="color: #1976d2;">お問い合わせフォーム</a>よりご連絡ください。</p>
    </div>
    
    <div style="border-top: 2px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666;">
        <p style="margin: 0;"><strong>安積直売所オンライン</strong></p>
        <p style="margin: 5px 0;"><a href="${this.getBaseURL()}" style="color: #2c5f2d;">トップページ</a> | <a href="${this.getBaseURL()}/contact.html" style="color: #2c5f2d;">お問い合わせ</a></p>
    </div>
</body>
</html>
`.trim();

        return { text, html };
    }
}

// 通知送信関数
async function sendOrderConfirmation(order) {
    const emailType = 'order_confirmation';
    
    // 重複チェック
    if (duplicateChecker.isDuplicate(order.orderId, emailType)) {
        console.warn(`[Duplicate] ${emailType} already sent for order ${order.orderId}`);
        return { success: false, reason: 'duplicate' };
    }
    
    // レート制限チェック
    rateLimiter.check(order.customerEmail);
    
    const { text, html } = EmailTemplates.orderConfirmation(order);
    const subject = `【安積直売所】ご注文ありがとうございます（注文番号: ${order.orderId}）`;
    
    try {
        const result = await sendEmail(order.customerEmail, subject, text, html);
        return { success: true, ...result };
    } catch (error) {
        // 失敗時は重複チェックをリセット（再送可能にする）
        duplicateChecker.reset(order.orderId, emailType);
        throw error;
    }
}

async function sendShippingNotification(shipment) {
    const emailType = 'shipping_notification';
    
    if (duplicateChecker.isDuplicate(shipment.orderId, emailType)) {
        console.warn(`[Duplicate] ${emailType} already sent for order ${shipment.orderId}`);
        return { success: false, reason: 'duplicate' };
    }
    
    rateLimiter.check(shipment.customerEmail);
    
    const { text, html } = EmailTemplates.shippingNotification(shipment);
    const subject = `【安積直売所】商品を発送いたしました（注文番号: ${shipment.orderId}）`;
    
    try {
        const result = await sendEmail(shipment.customerEmail, subject, text, html);
        return { success: true, ...result };
    } catch (error) {
        duplicateChecker.reset(shipment.orderId, emailType);
        throw error;
    }
}

async function sendPaymentFailureNotification(payment) {
    const emailType = 'payment_failure';
    
    if (duplicateChecker.isDuplicate(payment.orderId, emailType)) {
        console.warn(`[Duplicate] ${emailType} already sent for order ${payment.orderId}`);
        return { success: false, reason: 'duplicate' };
    }
    
    rateLimiter.check(payment.customerEmail);
    
    const { text, html } = EmailTemplates.paymentFailure(payment);
    const subject = `【安積直売所】お支払いの処理に失敗しました（注文番号: ${payment.orderId}）`;
    
    try {
        const result = await sendEmail(payment.customerEmail, subject, text, html);
        return { success: true, ...result };
    } catch (error) {
        duplicateChecker.reset(payment.orderId, emailType);
        throw error;
    }
}

module.exports = {
    sendOrderConfirmation,
    sendShippingNotification,
    sendPaymentFailureNotification,
    EmailTemplates
};
