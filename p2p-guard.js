(function() {
    // 1. Gun.js の読み込み
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/gun/gun.js";
    document.head.appendChild(script);

    script.onload = () => {
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
        const appState = gun.get('gutti-app-portal-universal-lock');

        // 2. ロック用HTMLを注入（bodyの直後に配置）
        const injectLock = () => {
            if (document.getElementById('p2p-lock-overlay')) return;
            
            const lockHtml = `
                <div id="p2p-lock-overlay" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:white !important; z-index:2147483647 !important; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-family:sans-serif;">
                    <div id="maint-icon" style="font-size:70px; margin-bottom:10px;">🚧</div>
                    <h1 id="maint-title" style="font-size:22px; color:#333; margin:0 20px;"></h1>
                    <div id="maint-badge" style="display:inline-block; padding:4px 12px; border-radius:15px; font-size:12px; font-weight:bold; margin-top:10px; color:#fff;"></div>
                    <p id="maint-detail" style="color:#666; margin:20px 40px; line-height:1.6; font-size:14px; white-space:pre-wrap;"></p>
                    <div style="width:30px; height:1px; background:#eee; margin-top:20px;"></div>
                    <p style="font-size:10px; color:#ccc; margin-top:20px;">P2P Security Shield Active</p>
                </div>
            `;
            document.body.insertAdjacentHTML('afterbegin', lockHtml);
        };

        // DOMが未完成なら待機、完成していれば即注入
        if (document.body) { injectLock(); } else {
            window.addEventListener('DOMContentLoaded', injectLock);
        }

        // 3. P2P監視
        appState.on((data) => {
            const overlay = document.getElementById('p2p-lock-overlay');
            if (!overlay) return;

            if (data && data.active === true) {
                overlay.style.setProperty('display', 'flex', 'important');
                document.body.style.setProperty('overflow', 'hidden', 'important');
                
                document.getElementById('maint-title').innerText = data.title || "点検中";
                document.getElementById('maint-detail').innerText = data.detail || "";
                
                const icon = document.getElementById('maint-icon');
                const badge = document.getElementById('maint-badge');
                
                if(data.type === 'maintenance') {
                    icon.innerText = "🚧"; badge.innerText = "定期点検中"; badge.style.background = "#007aff";
                } else if(data.type === 'error') {
                    icon.innerText = "⚠️"; badge.innerText = "サーバー障害発生中"; badge.style.background = "#ff9500";
                } else {
                    icon.innerText = "🛑"; badge.innerText = "緊急停止中"; badge.style.background = "#ff3b30";
                }
            } else {
                overlay.style.setProperty('display', 'none', 'important');
                document.body.style.setProperty('overflow', '', '');
            }
        });
    };
})();
