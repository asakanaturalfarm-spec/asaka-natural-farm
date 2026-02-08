// ========================================
// 認証システム
// ========================================

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // ページ読み込み時にログイン状態をチェック
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    }

    // ユーザー登録
    register(email, password, name) {
        // 既存のユーザーを取得
        const users = this.getUsers();
        
        // メールアドレスの重複チェック
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'このメールアドレスは既に登録されています' };
        }

        // 認証トークンを生成
        const verificationToken = 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // 新しいユーザーを作成（未認証状態）
        const newUser = {
            id: 'user_' + Date.now(),
            email: email,
            password: password, // 本番環境ではハッシュ化が必要
            name: name,
            verified: false, // メール未認証
            verificationToken: verificationToken,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // 認証メールのシミュレーション
        this.sendVerificationEmail(email, verificationToken, name);

        // 管理者への通知
        this.notifyAdmin('新規登録', `新しいユーザーが登録されました\nメール: ${email}\n名前: ${name}`);

        return { 
            success: true, 
            message: '登録が完了しました。確認メールをご確認ください。',
            verificationToken: verificationToken // 開発用
        };
    }

    // メール認証を実行
    verifyEmail(token) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.verificationToken === token && !u.verified);

        if (userIndex === -1) {
            return { success: false, message: '無効な認証リンクです' };
        }

        // ユーザーを認証済みに更新
        users[userIndex].verified = true;
        users[userIndex].verificationToken = null; // トークンを削除
        localStorage.setItem('users', JSON.stringify(users));

        // 管理者への通知
        this.notifyAdmin('メール認証完了', `ユーザーがメール認証を完了しました\nメール: ${users[userIndex].email}\n名前: ${users[userIndex].name}`);

        return { 
            success: true, 
            message: 'メール認証が完了しました。ログインできます。',
            user: users[userIndex]
        };
    }

    // 認証メールのシミュレーション
    sendVerificationEmail(email, token, name) {
        const verificationUrl = `${window.location.origin}/verify-email.html?token=${token}`;
        
        // 実際の環境ではバックエンドAPIでメール送信
        console.log('=== 認証メール送信 ===');
        console.log(`宛先: ${email}`);
        console.log(`件名: 【安積直売所】メールアドレスの認証`);
        console.log(`本文:`);
        console.log(`${name}様\n\n安積直売所にご登録いただきありがとうございます。\n\n以下のリンクをクリックして、メールアドレスの認証を完了してください：\n${verificationUrl}\n\nこのリンクは24時間有効です。\n\n※このメールに心当たりがない場合は、このメールを無視してください。\n\n安積直売所`);
        console.log('====================');

        // 開発用：認証リンクをアラートで表示
        alert(`【開発モード】認証リンク:\n${verificationUrl}\n\n※本番環境ではメールで送信されます`);
    }

    // 管理者への通知
    notifyAdmin(subject, message) {
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        
        const notification = {
            id: 'notif_' + Date.now(),
            subject: subject,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        };

        adminNotifications.unshift(notification);
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));

        console.log('=== 管理者通知 ===');
        console.log(`件名: ${subject}`);
        console.log(`内容: ${message}`);
        console.log('==================');
    }

    // ログイン
    login(email, password, remember = false) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
        }

        // メール認証チェック
        if (!user.verified) {
            return { 
                success: false, 
                message: 'メールアドレスが認証されていません。\n登録時に送信された認証メールをご確認ください。',
                needsVerification: true
            };
        }

        // ログイン成功
        this.currentUser = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        // ログイン状態を保存
        if (remember) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

            this.updateUIForLoggedInUser();
            // ログイン成功時にshop/index.htmlへ遷移
            window.location.href = 'shop/index.html';

        return { success: true, message: 'ログインしました', user: this.currentUser };
    }

    // ログアウト
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        
        // UIを更新
        this.updateUIForLoggedOutUser();
        
        return { success: true, message: 'ログアウトしました' };
    }

    // 現在のユーザーを取得
    getCurrentUser() {
        if (!this.currentUser) {
            const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }
        }
        return this.currentUser;
    }

    // ログイン状態の確認
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // ユーザー一覧を取得
    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    // UIをログイン状態に更新
    updateUIForLoggedInUser() {
        const user = this.getCurrentUser();
        if (!user) return;

        // ログインボタンを非表示、ユーザー名を表示
        const loginButtons = document.querySelectorAll('.btn-secondary[href="login.html"], a[href="login.html"]');
        loginButtons.forEach(btn => {
            if (btn.textContent.includes('ログイン')) {
                btn.style.display = 'none';
            }
        });

        // ユーザーメニューを追加
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

            // ドロップダウンメニューの制御
            const userMenuBtn = document.getElementById('userMenuBtn');
            const userDropdown = document.getElementById('userDropdown');
            
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
            });

            document.addEventListener('click', () => {
                userDropdown.style.display = 'none';
            });

            // ログアウトボタン
            document.getElementById('logoutBtn').addEventListener('click', () => {
                if (confirm('ログアウトしますか？')) {
                    this.logout();
                    alert('ログアウトしました');
                        window.location.href = 'shop/index.html';
                }
            });
        }
    }

    // UIをログアウト状態に更新
    updateUIForLoggedOutUser() {
        // ユーザーメニューを削除
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.remove();
        }

        // ログインボタンを表示
        const loginButtons = document.querySelectorAll('.btn-secondary[href="login.html"], a[href="login.html"]');
        loginButtons.forEach(btn => {
            if (btn.textContent.includes('ログイン')) {
                btn.style.display = 'inline-block';
            }
        });
    }
}

// グローバルインスタンスを作成
window.Auth = new AuthSystem();

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.Auth.init();
});
