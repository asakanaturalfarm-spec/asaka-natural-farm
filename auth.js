/**
 * auth.js
 * 安積自然農園 ユーザー認証システム
 * - ユーザー登録・ログイン・認証・管理
 * - LocalStorageを利用した簡易認証
 *
 * 【編集・拡張方針】
 * - 認証仕様変更や外部認証連携時は本ファイルを編集
 * - 共通化できる処理は asaka-hub.js へ
 */

/**
 * Authentication System
 * ユーザー認証・管理を行うクラス
 */


class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    /**
     * 初期化処理
     */
    init = () => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    }


    /**
     * ユーザー登録
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @returns {object}
     */
    register = (email, password, name) => {
        const users = this.getUsers();
        if (users.some(u => u.email === email)) return { success: false, message: 'このメールアドレスは既に登録されています' };
        const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
            id: `user_${Date.now()}`,
            email,
            password, // 本番環境ではハッシュ化が必要
            name,
            verified: false,
            verificationToken,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        this.sendVerificationEmail(email, verificationToken, name);
        this.notifyAdmin('新規登録', `新しいユーザーが登録されました\nメール: ${email}\n名前: ${name}`);
        return { success: true, message: '登録が完了しました。確認メールをご確認ください。', verificationToken };
    }


    /**
     * メール認証を実行
     * @param {string} token
     * @returns {object}
     */
    verifyEmail = token => {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.verificationToken === token && !u.verified);
        if (userIndex === -1) return { success: false, message: '無効な認証リンクです' };
        users[userIndex].verified = true;
        users[userIndex].verificationToken = null;
        localStorage.setItem('users', JSON.stringify(users));
        this.notifyAdmin('メール認証完了', `ユーザーがメール認証を完了しました\nメール: ${users[userIndex].email}\n名前: ${users[userIndex].name}`);
        return { success: true, message: 'メール認証が完了しました。ログインできます。', user: users[userIndex] };
    }


    /**
     * 認証メール送信（開発用）
     * @param {string} email
     * @param {string} token
     * @param {string} name
     */
    sendVerificationEmail = (email, token, name) => {
        const verificationUrl = `${window.location.origin}/verify-email.html?token=${token}`;
        alert(`【開発モード】認証リンク:\n${verificationUrl}\n\n※本番環境ではメールで送信されます`);
    }


    /**
     * 管理者への通知
     * @param {string} subject
     * @param {string} message
     */
    notifyAdmin = (subject, message) => {
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const notification = {
            id: `notif_${Date.now()}`,
            subject,
            message,
            timestamp: new Date().toISOString(),
            read: false
        };
        adminNotifications.unshift(notification);
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    }


    /**
     * ログイン処理
     * @param {string} email
     * @param {string} password
     * @param {boolean} remember
     * @returns {object}
     */
    login = (email, password, remember = false) => {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
        if (!user.verified) return { success: false, message: 'メールアドレスが認証されていません。\n登録時に送信された認証メールをご確認ください。', needsVerification: true };
        this.currentUser = { id: user.id, email: user.email, name: user.name };
        remember
            ? localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
            : sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateUIForLoggedInUser();
        // ログイン成功時にshop/index.htmlへ遷移
        window.location.href = 'shop/index.html';
        return { success: true, message: 'ログインしました', user: this.currentUser };
    }


    /**
     * ログアウト処理
     * @returns {object}
     */
    logout = () => {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        this.updateUIForLoggedOutUser();
        return { success: true, message: 'ログアウトしました' };
    }


    /**
     * 現在のユーザーを取得
     * @returns {object|null}
     */
    getCurrentUser = () => {
        if (!this.currentUser) {
            const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            if (savedUser) this.currentUser = JSON.parse(savedUser);
        }
        return this.currentUser;
    }


    /**
     * ログイン状態の確認
     * @returns {boolean}
     */
    isLoggedIn = () => this.getCurrentUser() !== null;


    /**
     * ユーザー一覧を取得
     * @returns {Array}
     */
    getUsers = () => {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    /**
     * UIをログイン状態に更新
     */
    updateUIForLoggedInUser = () => {
        const user = this.getCurrentUser();
        if (!user) return;
        document.querySelectorAll('.btn-secondary[href="login.html"], a[href="login.html"]').forEach(btn => {
            if (btn.textContent.includes('ログイン')) btn.style.display = 'none';
        });
        const navActions = document.querySelector('.nav-actions');
        if (navActions && !document.getElementById('userMenu')) {
            const userMenu = document.createElement('div');
            userMenu.id = 'userMenu';
            userMenu.style.cssText = 'position: relative; display: inline-block;';
            userMenu.innerHTML = `
                <button class="btn-secondary" id="userMenuBtn" style="cursor: pointer;">
                    👤 ${user.name || user.email.split('@')[0]}
                </button>
                <div id="userDropdown" style="display: none; position: absolute; right: 0; top: 100%; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 200px; margin-top: 8px; z-index: 1000;">
                    <a href="account.html" style="display: block; padding: 12px 16px; text-decoration: none; color: #333; border-bottom: 1px solid #eee;">マイページ</a>
                    <a href="orders.html" style="display: block; padding: 12px 16px; text-decoration: none; color: #333; border-bottom: 1px solid #eee;">注文履歴</a>
                    <button id="logoutBtn" style="display: block; width: 100%; padding: 12px 16px; text-align: left; background: none; border: none; color: #d32f2f; cursor: pointer; font-size: 14px;">ログアウト</button>
                </div>
            `;
            navActions.insertBefore(userMenu, navActions.firstChild);
            const userMenuBtn = document.getElementById('userMenuBtn');
            const userDropdown = document.getElementById('userDropdown');
            userMenuBtn.addEventListener('click', e => {
                e.stopPropagation();
                userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
            });
            document.addEventListener('click', () => {
                userDropdown.style.display = 'none';
            });
            document.getElementById('logoutBtn').addEventListener('click', () => {
                if (confirm('ログアウトしますか？')) {
                    this.logout();
                    alert('ログアウトしました');
                    window.location.href = 'shop/index.html';
                }
            });
        }
    }

    /**
     * UIをログアウト状態に更新
     */
    updateUIForLoggedOutUser = () => {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.remove();
        document.querySelectorAll('.btn-secondary[href="login.html"], a[href="login.html"]').forEach(btn => {
            if (btn.textContent.includes('ログイン')) btn.style.display = 'inline-block';
        });
    }
}


// グローバルインスタンスを作成
window.Auth = new AuthSystem();

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.Auth.init();
});
