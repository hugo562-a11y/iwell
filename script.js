document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 全域變數：控制動畫鎖
    // =========================================
    let isAutoScrolling = false; 

    // 1. 滾動視差偵測 (Intersection Observer)
    const revealObserver = new IntersectionObserver((entries) => {
        // 如果正在自動跑波浪舞，偵測器暫時休息，避免打架
        if (isAutoScrolling) return;

        entries.forEach(entry => {
            // 只要有一點點進入畫面 (isIntersecting) 就顯示
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0, // 改成 0：只要碰到邊緣就觸發，不要等露出 10%
        rootMargin: "0px 0px -20px 0px" // 稍微寬容一點
    });

    // 2. 啟動監測 & ★ 強制初始檢查 (修復打開空白的問題)
    const revealElements = document.querySelectorAll('.reveal-up');
    
    function initialCheck() {
        revealElements.forEach(el => {
            revealObserver.observe(el); // 加入監控
            
            // ★ 強力補丁：直接檢查位置
            // 如果元素頂部 (top) 小於 視窗高度 (innerHeight)，代表它在畫面上
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active'); // 不用廢話，直接顯示
            }
        });
    }
    // 執行強制檢查
    initialCheck();


    // =========================================
    // 3. 通用波浪舞功能 (修正三角形點擊空白問題)
    // =========================================
    const waveTriggers = [
        {
            btnSelector: 'a[href="#關於艾薇爾"]',
            targetElements: '.feature-card',
            scrollTo: '#關於艾薇爾'
        },
        {
            btnSelector: 'a[href="#願景使命"]',
            targetElements: '.mission-box',
            scrollTo: '#願景使命'
        },
        {
            btnSelector: '.white-triangle',
            targetElements: '.feature-card, .mission-box', 
            scrollTo: 'bottom'
        }
    ];

    waveTriggers.forEach(config => {
        const btn = document.querySelector(config.btnSelector);
        
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // A. 上鎖
                isAutoScrolling = true;

                // B. 選取目標
                const waveTargets = document.querySelectorAll(config.targetElements);

                // C. 重置狀態 (全部隱藏)
                waveTargets.forEach(el => {
                    el.classList.remove('active');
                });

                // D. 執行滑動
                if (config.scrollTo === 'bottom') {
                    const totalHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                    window.scrollTo({ top: totalHeight, behavior: 'smooth' });
                } else {
                    const section = document.querySelector(config.scrollTo);
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }

                // E. 執行波浪舞 (延遲顯示)
                waveTargets.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('active');
                        
                        // 動畫跑完後解鎖
                        if (index === waveTargets.length - 1) {
                            setTimeout(() => {
                                isAutoScrolling = false;
                                // ★ 雙重保險：萬一有漏網之魚，再次強制檢查一次
                                initialCheck(); 
                            }, 1000);
                        }
                    }, index * 150 + 300); // 這裡的時間差 (150ms) 控制波浪速度
                });
            });
        }
    });

    // 4. 手機版圓點同步 (維持原樣)
    const cards = document.querySelectorAll('.feature-card');
    const dots = document.querySelectorAll('.dot');
    if(cards.length > 0 && dots.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = entry.target.getAttribute('data-index');
                    if (index !== null) {
                        dots.forEach(d => d.classList.remove('active'));
                        dots[index].classList.add('active');
                    }
                }
            });
        }, {
            root: document.querySelector('.features-scroller'),
            threshold: 0.6
        });
        cards.forEach(card => scrollObserver.observe(card));
    }

    // 5. 按鈕互動 (維持原樣)
    const loginBtn = document.querySelector('.circle-login-btn');
    if (loginBtn && window.innerWidth > 768) { 
        loginBtn.addEventListener('mousemove', (e) => {
            const x = e.offsetX - loginBtn.offsetWidth / 2;
            const y = e.offsetY - loginBtn.offsetHeight / 2;
            loginBtn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        loginBtn.addEventListener('mouseleave', () => {
            loginBtn.style.transform = `translate(0, 0)`;
        });
    }
});