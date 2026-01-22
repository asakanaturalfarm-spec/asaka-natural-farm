/**
 * メール送信サービス
 * SendGrid/Amazon SES対応
 * セキュリティと到達率を最優先
 */

// 環境変数の検証
function validateConfig() {
    const required = ['EMAIL_SERVICE', 'EMAIL_FROM', 'DOMAIN'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`必須環境変数が未設定: ${missing.join(', ')}`);
    }
    
    const service = process.env.EMAIL_SERVICE;
    if (service === 'sendgrid' && !process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY が未設定');
    }
    if (service === 'ses' && (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)) {
        throw new Error('AWS認証情報が未設定');
    }
}

// SendGrid送信
async function sendViaSendGrid(to, subject, textContent, htmlContent) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
        to,
        from: {
            email: process.env.EMAIL_FROM,
            name: '安積直売所オンライン'
        },
        subject,
        text: textContent,
        html: htmlContent,
        // トランザクションメール設定
        trackingSettings: {
            clickTracking: { enable: false },
            openTracking: { enable: false }
        },
        // メール検証強化
        mailSettings: {
            sandboxMode: { enable: process.env.NODE_ENV === 'test' }
        }
    };
    
    try {
        const response = await sgMail.send(msg);
        return {
            success: true,
            messageId: response[0].headers['x-message-id'],
            provider: 'sendgrid'
        };
    } catch (error) {
        // SendGridエラーの詳細ログ
        if (error.response) {
            console.error('[SendGrid Error]', {
                status: error.response.statusCode,
                body: error.response.body
            });
        }
        throw error;
    }
}

// Amazon SES送信
async function sendViaSES(to, subject, textContent, htmlContent) {
    const AWS = require('aws-sdk');
    
    // SES設定
    AWS.config.update({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    
    const params = {
        Source: `安積直売所オンライン <${process.env.EMAIL_FROM}>`,
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: textContent,
                    Charset: 'UTF-8'
                },
                Html: {
                    Data: htmlContent,
                    Charset: 'UTF-8'
                }
            }
        },
        // トランザクションメールタグ
        Tags: [
            {
                Name: 'EmailType',
                Value: 'transactional'
            }
        ]
    };
    
    try {
        const response = await ses.sendEmail(params).promise();
        return {
            success: true,
            messageId: response.MessageId,
            provider: 'ses'
        };
    } catch (error) {
        console.error('[SES Error]', {
            code: error.code,
            message: error.message
        });
        throw error;
    }
}

// メールアドレス検証
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// メイン送信関数
async function sendEmail(to, subject, textContent, htmlContent) {
    // 入力検証
    if (!validateEmail(to)) {
        throw new Error(`無効なメールアドレス: ${to}`);
    }
    
    if (!subject || subject.trim().length === 0) {
        throw new Error('件名が空です');
    }
    
    if (!textContent || textContent.trim().length === 0) {
        throw new Error('本文が空です');
    }
    
    // 設定検証
    validateConfig();
    
    const service = process.env.EMAIL_SERVICE;
    let result;
    
    try {
        if (service === 'sendgrid') {
            result = await sendViaSendGrid(to, subject, textContent, htmlContent);
        } else if (service === 'ses') {
            result = await sendViaSES(to, subject, textContent, htmlContent);
        } else {
            throw new Error(`未対応のメールサービス: ${service}`);
        }
        
        // 送信ログ（本番環境では外部ログサービスへ）
        console.log('[Email Sent]', {
            to,
            subject,
            messageId: result.messageId,
            provider: result.provider,
            timestamp: new Date().toISOString()
        });
        
        return result;
        
    } catch (error) {
        // エラーログ
        console.error('[Email Send Failed]', {
            to,
            subject,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

// レート制限チェック（簡易版）
const rateLimiter = {
    requests: new Map(),
    maxPerMinute: 10,
    
    check(key) {
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        const limitKey = `${key}_${minute}`;
        
        const count = this.requests.get(limitKey) || 0;
        if (count >= this.maxPerMinute) {
            throw new Error('レート制限超過。1分後に再試行してください。');
        }
        
        this.requests.set(limitKey, count + 1);
        
        // 古いキーを削除（メモリリーク防止）
        for (const [k] of this.requests) {
            if (!k.endsWith(`_${minute}`)) {
                this.requests.delete(k);
            }
        }
    }
};

// 再送防止チェック
class DuplicateChecker {
    constructor() {
        this.sent = new Map(); // 本番環境ではRedisなど永続ストレージを使用
        this.ttl = 24 * 60 * 60 * 1000; // 24時間
    }
    
    isDuplicate(orderId, emailType) {
        const key = `${orderId}_${emailType}`;
        const existing = this.sent.get(key);
        
        if (existing && (Date.now() - existing) < this.ttl) {
            return true;
        }
        
        this.sent.set(key, Date.now());
        
        // 古いエントリを削除
        for (const [k, timestamp] of this.sent) {
            if (Date.now() - timestamp > this.ttl) {
                this.sent.delete(k);
            }
        }
        
        return false;
    }
    
    reset(orderId, emailType) {
        const key = `${orderId}_${emailType}`;
        this.sent.delete(key);
    }
}

const duplicateChecker = new DuplicateChecker();

module.exports = {
    sendEmail,
    validateEmail,
    rateLimiter,
    duplicateChecker
};
