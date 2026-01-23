/**
 * 管理者通知管理システム
 * 発送完了通知の手動送信と管理者認証
 * Version 1.0.0
 */

(function(window) {
    'use strict';

    const AdminNotificationManager = {
        
        // 管理者設定
        ADMIN_EMAIL: 'tanabe@asakanatural.jp',
        ADMIN_NAME: '田辺',
        
        // 認証キー
        AUTH_KEY: 'admin_auth_token',
        AUTH_EXPIRY: 24 * 60 * 60 * 1000, // 24時間

        /**
         * 管理者認証チェック
         */
        isAdminAuthenticated: function() {
            const token = sessionStorage.getItem(this.AUTH_KEY);
            const expiry = sessionStorage.getItem(this.AUTH_KEY + '_expiry');
            
            if (!token || !expiry) {
                return false;
            }
            
            if (Date.now() > parseInt(expiry)) {
                sessionStorage.removeItem(this.AUTH_KEY);
                sessionStorage.removeItem(this.AUTH_KEY + '_expiry');
                return false;
            }
            
            return true;
        },

        /**
         * 管理者認証を設定
         */
        setAdminAuth: function(password) {
            // 簡単な認証（本番環境ではサーバーサイドで実装）
            // パスワードはハッシュ化されるべき
            const correctPassword = 'asakanatural2024'; // 本来はサーバーから取得
            
            if (password !== correctPassword) {
                return false;
            }
            
            const token = this.generateToken();
            const expiry = Date.now() + this.AUTH_EXPIRY;
            
            sessionStorage.setItem(this.AUTH_KEY, token);
            sessionStorage.setItem(this.AUTH_KEY + '_expiry', expiry.toString());
            
            return true;
        },

        /**
         * ランダムトークン生成
         */
        generateToken: function() {
            return 'admin_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * 管理者認証をリセット
         */
        clearAdminAuth: function() {
            sessionStorage.removeItem(this.AUTH_KEY);
            sessionStorage.removeItem(this.AUTH_KEY + '_expiry');
        },

        /**
         * 発送完了通知を管理者から送信
         * @param {Object} notificationData - 通知データ
         * @returns {Promise<Object>} 送信結果
         */
        sendShippingNotificationAsAdmin: async function(notificationData) {
            // 管理者認証チェック
            if (!this.isAdminAuthenticated()) {
                throw new Error('管理者認証が必要です');
            }

            try {
                // メール本体を生成
                const emailContent = this.generateShippingNotificationEmail(notificationData);

                // SendGridまたはメール送信サービスで送信
                const result = await this.sendEmail({
                    to: notificationData.customerEmail,
                    from: {
                        email: this.ADMIN_EMAIL,
                        name: `${this.ADMIN_NAME} (${notificationData.adminName || '安積自然農園'})`
                    },
                    subject: emailContent.subject,
                    html: emailContent.html,
                    text: emailContent.text,
                    replyTo: this.ADMIN_EMAIL
                });

                // 管理者にも確認メールを送信
                await this.sendAdminConfirmation({
                    orderId: notificationData.orderId,
                    customerEmail: notificationData.customerEmail,
                    customerName: notificationData.customerName,
                    trackingNumber: notificationData.trackingNumber,
                    carrier: notificationData.carrier,
                    timestamp: new Date().toLocaleString('ja-JP')
                });

                return {
                    status: 'sent',
                    id: result.id || `notif_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    customerEmail: notificationData.customerEmail
                };

            } catch (error) {
                console.error('管理者通知送信エラー:', error);
                throw new Error(`通知送信に失敗: ${error.message}`);
            }
        },

        /**
         * メール送信（実装例）
         */
        sendEmail: async function(mailData) {
            // 実装例: SendGridAPI または メールバックエンド API
            try {
                // プレースホルダー実装
                console.log('メール送信:', mailData);
                
                // 実際の実装ではAPI呼び出し
                // const response = await fetch('/api/send-email', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(mailData)
                // });
                
                return {
                    id: `sendgrid_${Date.now()}`
                };
                
            } catch (error) {
                throw new Error(`メール送信失敗: ${error.message}`);
            }
        },

        /**
         * 発送完了通知メールを生成
         */
        generateShippingNotificationEmail: function(data) {
            const itemsHtml = (data.items || [])
                .map(item => `<tr><td>${item.name || '商品'}</td><td style="text-align:right">×${item.quantity}</td></tr>`)
                .join('');

            const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', 'Noto Sans JP', sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #2c5f2d 0%, #3a7f3b 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background: #f9f9f9;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 0 0 8px 8px;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-left: 4px solid #2c5f2d;
            border-radius: 4px;
        }
        .section-title {
            font-weight: bold;
            color: #2c5f2d;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        th {
            background: #f0f0f0;
            font-weight: bold;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 10px 0;
        }
        .info-item {
            padding: 8px;
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 13px;
        }
        .info-label {
            color: #999;
            font-size: 11px;
            text-transform: uppercase;
        }
        .info-value {
            color: #333;
            font-weight: bold;
            margin-top: 4px;
        }
        .tracking-box {
            background: #e8f5e9;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #4caf50;
            margin: 15px 0;
            text-align: center;
        }
        .tracking-label {
            color: #666;
            font-size: 12px;
        }
        .tracking-number {
            font-size: 18px;
            font-weight: bold;
            color: #2c5f2d;
            font-family: monospace;
            margin: 8px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #999;
            font-size: 12px;
        }
        .note {
            background: #fff3cd;
            padding: 12px;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
            margin: 15px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 style="margin: 0;">📦 発送完了のお知らせ</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">安積自然農園オンラインストア</p>
        </div>
        
        <div class="content">
            <p>${data.customerName} 様</p>
            
            <p>いつもご利用いただきありがとうございます。</p>
            
            <p>ご注文いただきました商品が本日発送されましたのでお知らせいたします。</p>
            
            <div class="section">
                <div class="section-title">📋 ご注文内容</div>
                <table>
                    <thead>
                        <tr>
                            <th>商品名</th>
                            <th style="text-align:right">数量</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">🚚 配送情報</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">配送業者</div>
                        <div class="info-value">${data.carrier}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">発送日</div>
                        <div class="info-value">${data.shippedDate}</div>
                    </div>
                </div>
                
                <div class="tracking-box">
                    <div class="tracking-label">お問い合わせ番号（追跡番号）</div>
                    <div class="tracking-number">${data.trackingNumber}</div>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
                        こちらの番号で配送状況をご確認いただけます
                    </p>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">予定到着日</div>
                        <div class="info-value">${data.estimatedDeliveryDate}</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📮 ご注文番号</div>
                <p style="margin: 0; font-family: monospace; font-weight: bold;">${data.orderId}</p>
            </div>
            
            <div class="note">
                <strong>⚠️ お知らせ</strong><br>
                商品は冷蔵便でお送りしています。到着後、開梱後は速やかに冷蔵庫で保管してください。
            </div>
            
            <p style="margin-top: 20px;">
                ご不明な点やご質問がございましたら、お気軽にお問い合わせください。
            </p>
            
            <div class="footer">
                <p>
                    安積自然農園<br>
                    〒963-0201 福島県郡山市大槻町字前畑60<br>
                    Tel: ☎ | Email: ${this.ADMIN_EMAIL}<br>
                    <br>
                    このメールは自動送信されています
                </p>
            </div>
        </div>
    </div>
</body>
</html>
            `;

            const text = `
発送完了のお知らせ

${data.customerName} 様

いつもご利用いただきありがとうございます。

ご注文いただきました商品が本日発送されましたのでお知らせいたします。

【ご注文内容】
${(data.items || []).map(i => `${i.name || '商品'} ×${i.quantity}`).join('\n')}

【配送情報】
配送業者: ${data.carrier}
発送日: ${data.shippedDate}
お問い合わせ番号: ${data.trackingNumber}
予定到着日: ${data.estimatedDeliveryDate}

【ご注文番号】
${data.orderId}

ご不明な点やご質問がございましたら、お気軽にお問い合わせください。

安積自然農園
〒963-0201 福島県郡山市大槻町字前畑60
            `;

            return {
                subject: `【発送完了】ご注文番号 ${data.orderId}`,
                html,
                text
            };
        },

        /**
         * 管理者に確認メールを送信
         */
        sendAdminConfirmation: async function(data) {
            try {
                const html = `
<html>
<body style="font-family: 'Noto Sans JP', sans-serif;">
    <h2>📧 発送完了通知の送信確認</h2>
    <p>以下の通知を顧客に送信しました：</p>
    
    <div style="background: #f0f7f0; padding: 15px; border-left: 4px solid #2c5f2d; border-radius: 4px;">
        <p><strong>注文番号:</strong> ${data.orderId}</p>
        <p><strong>送信先:</strong> ${data.customerEmail}</p>
        <p><strong>顧客名:</strong> ${data.customerName}</p>
        <p><strong>配送業者:</strong> ${data.carrier}</p>
        <p><strong>追跡番号:</strong> ${data.trackingNumber}</p>
        <p><strong>送信時刻:</strong> ${data.timestamp}</p>
    </div>
</body>
</html>
                `;

                // 管理者へ確認メール送信
                await this.sendEmail({
                    to: this.ADMIN_EMAIL,
                    from: {
                        email: 'noreply@asakanatural.jp',
                        name: '安積自然農園 (自動通知)'
                    },
                    subject: `[確認] 発送通知送信 - ${data.orderId}`,
                    html: html
                });

            } catch (error) {
                console.error('管理者確認メール送信エラー:', error);
                // エラーをスローしない（通知は既に送信されているため）
            }
        }
    };

    // グローバル変数に暴露
    window.AdminNotificationManager = AdminNotificationManager;

})(window);
