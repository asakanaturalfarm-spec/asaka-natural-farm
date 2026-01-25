/**
 * メール送信テストスクリプト
 * 
 * 使用方法:
 * 1. .envファイルを作成し、APIキーを設定
 * 2. node test-email.js を実行
 * 3. your-email@example.com を自分のメールアドレスに変更
 */

require('dotenv').config();
const { sendOrderConfirmation, sendShippingNotification, sendPaymentFailureNotification } = require('./notification-manager');

const testOrder = {
    orderId: 'TEST-' + Date.now(),
    customerName: 'テスト太郎',
    customerEmail: 'your-email@example.com',
    items: [
        { name: '有機トマト（1kg）', quantity: 2, price: 1600 },
        { name: '有機きゅうり（500g）', quantity: 1, price: 800 }
    ],
    subtotal: 2400,
    shipping: 500,
    tax: 232,
    total: 3132,
    paymentMethod: 'クレジットカード',
    deliveryDate: '2026年1月25日（月）午前中'
};

const testShipment = {
    orderId: 'TEST-' + Date.now(),
    customerName: 'テスト太郎',
    customerEmail: 'your-email@example.com',
    trackingNumber: '123456789012',
    carrier: 'ヤマト運輸クール便',
    estimatedDelivery: '2026年1月25日（月）午前中',
    items: [
        { name: '有機トマト（1kg）', quantity: 2 },
        { name: '有機きゅうり（500g）', quantity: 1 }
    ]
};

const testPayment = {
    orderId: 'TEST-' + Date.now(),
    customerName: 'テスト太郎',
    customerEmail: 'your-email@example.com',
    paymentMethod: 'クレジットカード',
    failureReason: 'カードの有効期限が切れています',
    retryUrl: 'https://asakanatural.jp/store/payment-retry?order=TEST001',
    amount: 3132
};

(async () => {
    if (!process.env.EMAIL_SERVICE) return;
    try { await sendOrderConfirmation(testOrder); } catch {}
    try { await sendShippingNotification(testShipment); } catch {}
    try { await sendPaymentFailureNotification(testPayment); } catch {}
})();
    if (!process.env.EMAIL_SERVICE) {
        console.error('❌ EMAIL_SERVICE が設定されていません');
        console.log('   .envファイルを作成し、必要な環境変数を設定してください');
        console.log('   例: cp .env.example .env');
        process.exit(1);
    }
    console.log(`✅ EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
    console.log(`✅ EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    console.log(`✅ DOMAIN: ${process.env.DOMAIN}\n`);
    
    // テスト1: 注文確定メール
    try {
        console.log('[2] 注文確定メールテスト');
        console.log(`   送信先: ${testOrder.customerEmail}`);
        const result1 = await sendOrderConfirmation(testOrder);
        console.log(`✅ 送信成功`);
        console.log(`   メッセージID: ${result1.messageId}`);
        console.log(`   プロバイダー: ${result1.provider}\n`);
    } catch (error) {
        console.error('❌ 送信失敗:', error.message, '\n');
    }
    
    // 待機（レート制限対策）
    await new Promise(resolve => setTimeout(resolve, 7000));
    
    // テスト2: 発送完了メール
    try {
        console.log('[3] 発送完了メールテスト');
        console.log(`   送信先: ${testShipment.customerEmail}`);
        const result2 = await sendShippingNotification(testShipment);
        console.log(`✅ 送信成功`);
        console.log(`   メッセージID: ${result2.messageId}`);
        console.log(`   プロバイダー: ${result2.provider}\n`);
    } catch (error) {
        console.error('❌ 送信失敗:', error.message, '\n');
    }
    
    // 待機
    await new Promise(resolve => setTimeout(resolve, 7000));
    
    // テスト3: 支払失敗メール
    try {
        console.log('[4] 支払失敗メールテスト');
        console.log(`   送信先: ${testPayment.customerEmail}`);
        const result3 = await sendPaymentFailureNotification(testPayment);
        console.log(`✅ 送信成功`);
        console.log(`   メッセージID: ${result3.messageId}`);
        console.log(`   プロバイダー: ${result3.provider}\n`);
    } catch (error) {
        console.error('❌ 送信失敗:', error.message, '\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  テスト完了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('メールボックスを確認してください。');
    console.log('届いていない場合:');
    console.log('  1. 迷惑メールフォルダを確認');
    console.log('  2. SendGrid/SESの送信ログを確認');
    console.log('  3. DNS設定（SPF/DKIM）を確認\n');
}

// 実行
runTests().catch(error => {
    console.error('\n致命的エラー:', error);
    process.exit(1);
});
