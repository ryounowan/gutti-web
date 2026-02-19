(function() {
    // 1. ページが読み込まれる前に、最優先で「画面を真っ白」にするCSSを注入
    const hideStyle = document.createElement('style');
    hideStyle.innerHTML = `
        html, body { display: none !important; }
        #p2p-lock-overlay { display: flex !important; }
    `;
    document.head.appendChild(hideStyle);

    // 2. Gun.js の読み込み
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/gun/gun.js";
    document.head.appendChild(script);

    script.onload = () => {
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
        const appState = gun.get('gutti-app-portal-universal-lock');

        // 3. ロック画面を生成（bodyができたらすぐ入れる）
        const injectLock = () => {
            if (document.getElementById('p2p-lock-overlay')) return;
            const lockHtml = `
                <div id="p2p-lock-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:white; z-index:2147483647; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-family:sans-serif; display:none;">
                    <div id="maint-icon" style="font-size:70px; margin-bottom:10px;">🚧</div>
                    <h1 id="maint-title" style="font-size:22px; color:#333;"></h1>
                    <div id="maint-badge" style="display:inline-block; padding:4px 12px; border-radius:15px; font-size:12px; font-weight:bold; color:#fff;"></div>
                    <p id="maint-detail" style="color:#666; margin:20px 40px; line-height:1.6; font-size:14px; white-space:pre-wrap;"></p>
                </div>
            `;
            document.body.insertAdjacentHTML('afterbegin', lockHtml);
        };

        if (document.body) { injectLock(); } else { window.addEventListener('DOMContentLoaded', injectLock); }

        // 4. P2Pで状態を確認
        appState.on((data) => {
            if (data && data.active === true) {
                // 【停止中】真っ白なまま、ロック画面だけ出す
                document.getElementById('p2p-lock-overlay').style.display = 'flex';
                document.getElementById('maint-title').innerText = data.title || "点検中";
                document.getElementById('maint-detail').innerText = data.detail || "";
                
                const badge = document.getElementById('maint-badge');
                if(data.type === 'maintenance') {
                    badge.innerText = "定期点検中"; badge.style.background = "#007aff";
                } else if(data.type === 'error') {
                    badge.innerText = "サーバー障害発生中"; badge.style.background = "#ff9500";
                } else {
                    badge.innerText = "緊急停止中"; badge.style.background = "#ff3b30";
                }
            } else {
                // 【通常時】真っ白を解除して、本体を表示
                hideStyle.remove();
            }
        });

        // 通信が遅い場合でも、3秒経ってデータが来なければとりあえず表示する（保険）
        setTimeout(() => { if(hideStyle.parentNode) hideStyle.remove(); }, 3000);
    };
})();
