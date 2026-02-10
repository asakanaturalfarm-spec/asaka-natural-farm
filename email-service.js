
/**
 * Email Sending Service
 * SendGrid/Amazon SES対応
 * セキュリティと到達率を最優先
 */

/**
 * 環境変数の検証
 */
const validateConfig = () => {
    const required = ['EMAIL_SERVICE', 'EMAIL_FROM', 'DOMAIN'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length) throw new Error(`必須環境変数が未設定: ${missing.join(', ')}`);
    const service = process.env.EMAIL_SERVICE;
    if (service === 'sendgrid' && !process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY が未設定');
    if (service === 'ses' && (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)) throw new Error('AWS認証情報が未設定');
};

/**
 * Send email via SendGrid
 * @param {string} to
 * @param {string} subject
 * @param {string} textContent
 * @param {string} htmlContent
 * @returns {Promise<object>}
 */
const sendViaSendGrid = async (to, subject, textContent, htmlContent) => {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to,
        from: { email: process.env.EMAIL_FROM, name: 'Asaka Online Store' },
        subject,
        text: textContent,
        html: htmlContent,
        trackingSettings: { clickTracking: { enable: false }, openTracking: { enable: false } },
        mailSettings: { sandboxMode: { enable: process.env.NODE_ENV === 'test' } }
    };
    try {
        const response = await sgMail.send(msg);
        return { success: true, messageId: response[0].headers['x-message-id'], provider: 'sendgrid' };
    } catch (error) {
        throw error;
};

/**
 * Send email via Amazon SES
 * @param {string} to
 * @param {string} subject
 * @param {string} textContent
 * @param {string} htmlContent
 * @returns {Promise<object>}
 */
const sendViaSES = async (to, subject, textContent, htmlContent) => {
    const AWS = require('aws-sdk');
    AWS.config.update({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    const params = {
        Source: `Asaka Online Store <${process.env.EMAIL_FROM}>`,
        Destination: { ToAddresses: [to] },
        Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
                Text: { Data: textContent, Charset: 'UTF-8' },
                Html: { Data: htmlContent, Charset: 'UTF-8' }
            }
        },
        Tags: [{ Name: 'EmailType', Value: 'transactional' }]
    };
    try {
        const response = await ses.sendEmail(params).promise();
        return { success: true, messageId: response.MessageId, provider: 'ses' };
    } catch (error) {
        throw error;
    }
};

/**
 * メールアドレス検証
 * @param {string} email
 * @returns {boolean}
 */
const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * メイン送信関数
 * @param {string} to
 * @param {string} subject
 * @param {string} textContent
 * @param {string} htmlContent
 * @returns {Promise<object>}
 */
const sendEmail = async (to, subject, textContent, htmlContent) => {
    if (!validateEmail(to)) throw new Error(`無効なメールアドレス: ${to}`);
    if (!subject?.trim()) throw new Error('件名が空です');
    if (!textContent?.trim()) throw new Error('本文が空です');
    validateConfig();
    const service = process.env.EMAIL_SERVICE;
    /**
    let result;
    if (service === 'sendgrid') result = await sendViaSendGrid(to, subject, textContent, htmlContent);
    else if (service === 'ses') result = await sendViaSES(to, subject, textContent, htmlContent);
    else throw new Error(`未対応のメールサービス: ${service}`);
    return result;
};

/**
 * レート制限チェック（簡易版）
 */
const rateLimiter = {
    requests: new Map(),
    maxPerMinute: 10,
    /**
     * 指定キーのレート制限をチェック
     * @param {string} key
     */
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


/**
 * 再送防止チェック
 * @class
 */
class DuplicateChecker {
    constructor() {
        this.sent = new Map(); // 本番環境ではRedisなど永続ストレージを使用
        this.ttl = 24 * 60 * 60 * 1000; // 24時間
    }
    /**
     * 重複送信チェック
     * @param {string} orderId
     * @param {string} emailType
     * @returns {boolean}
     */
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
    /**
     * チェックリセット
     * @param {string} orderId
     * @param {string} emailType
     */
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
