document.addEventListener("DOMContentLoaded", function() {
    
  /* =========================================
       1. Hero Section 手風琴 (最終優化版)
       ========================================= */
    const panels = document.querySelectorAll('.panel');
    const heroScrollContainer = document.querySelector('.hero-slider-section .container');
    let autoPlayInterval; 
    let isUserInteracting = false; // 標記使用者是否正在操作

    function removeActiveClasses() {
        panels.forEach(panel => {
            panel.classList.remove('active');
        });
    }

    function activatePanel(panel) {
        if (panel.classList.contains('active')) return;
        removeActiveClasses();
        panel.classList.add('active');
    }

    // --- 核心功能：點擊時，除了展開，還要滑動置中 ---
    function focusPanel(panel) {
        stopAutoPlay(); // 停止自動輪播
        activatePanel(panel); // 展開圖片

        // 手機版：計算滾動位置，將圖片推到正中間
        if (window.innerWidth <= 900 && heroScrollContainer) {
            // 取得圖片相對於容器的偏移量
            // 我們需要簡單計算：(圖片的左邊位置 + 圖片寬度的一半) - (容器寬度的一半)
            const panelRect = panel.getBoundingClientRect();
            const containerRect = heroScrollContainer.getBoundingClientRect();
            
            // 計算目前的捲動值 (scrollLeft) + 相對位置修正
            // 這裡使用 offsetLeft 會比較準確
            const scrollLeft = panel.offsetLeft - (containerRect.width / 2) + (panel.offsetWidth / 2);

            heroScrollContainer.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }

    // --- 事件綁定 ---
    panels.forEach(panel => {
        // 電腦版 hover
        panel.addEventListener('mouseenter', () => {
            stopAutoPlay();
            activatePanel(panel);
        });
        
        // 手機/電腦版 Click
        panel.addEventListener('click', (e) => {
            // 點擊時執行聚焦邏輯
            focusPanel(panel);
        });
    });

    // --- 手機滑動偵測 (Scroll Spy) ---
    if (heroScrollContainer) {
        let scrollTimeout;
        heroScrollContainer.addEventListener('scroll', () => {
            stopAutoPlay();
            isUserInteracting = true;

            // 使用 Debounce 防抖，滑動停止後才判斷誰在中間，效能較好
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const containerRect = heroScrollContainer.getBoundingClientRect();
                const containerCenter = containerRect.left + (containerRect.width / 2);

                panels.forEach(panel => {
                    const panelRect = panel.getBoundingClientRect();
                    // 寬鬆判定：只要圖片中心點接近螢幕中心
                    const panelCenter = panelRect.left + (panelRect.width / 2);
                    if (Math.abs(panelCenter - containerCenter) < 50) { 
                        activatePanel(panel);
                    }
                });
                isUserInteracting = false;
            }, 100); // 100ms 後執行
        });
    }

    // --- 自動輪播 ---
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            // 如果使用者正在滑動，就暫停一次
            if (isUserInteracting) return;

            let activeIndex = 0;
            panels.forEach((p, index) => {
                if (p.classList.contains('active')) activeIndex = index;
            });
            let nextIndex = (activeIndex + 1) % panels.length;
            
            // 自動輪播時，只切換 class，不強制滾動 (避免干擾閱讀)
            // 但如果是在手機上，還是要滾動才看得到
            if (window.innerWidth <= 900) {
                 focusPanel(panels[nextIndex]);
            } else {
                 activatePanel(panels[nextIndex]);
            }
            
        }, 3000); 
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    startAutoPlay();

    /* =========================================
       2. 滾動淡入效果 (Scroll Reveal)
       ========================================= */
    const observerOptions = {
        root: null, 
        threshold: 0.15, 
        rootMargin: "0px 0px -50px 0px" 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach(el => {
        observer.observe(el);
    });


    /* =========================================
       3. 3D 輪播邏輯 (Carousel Logic)
       ========================================= */
    const cItems = document.querySelectorAll('.c-item');
    const prevBtn = document.querySelector('.c-btn.prev');
    const nextBtn = document.querySelector('.c-btn.next');
    let currentIndex = 1; // 預設從中間那張開始 (索引 1)
    const totalItems = cItems.length;

    // 更新輪播狀態 (分配 active, left, right)
    function updateCarousel() {
        cItems.forEach((item, index) => {
            item.classList.remove('active', 'left', 'right');
            
            if (index === currentIndex) {
                item.classList.add('active');
            } else if (index === (currentIndex - 1 + totalItems) % totalItems) {
                item.classList.add('left');
            } else if (index === (currentIndex + 1) % totalItems) {
                item.classList.add('right');
            }
        });
    }

    function goNext() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }

    function goPrev() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }

    if(nextBtn) nextBtn.addEventListener('click', goNext);
    if(prevBtn) prevBtn.addEventListener('click', goPrev);

    // 點擊兩側項目時，自動轉過來
    cItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index !== currentIndex) {
                currentIndex = index;
                updateCarousel();
            }
        });
    });

    // 初始化輪播
    updateCarousel();

    // --- 手機觸控滑動偵測 (Swipe) ---
    let touchStartX = 0;
    let touchEndX = 0;
    const carouselWrapper = document.querySelector('.carousel-3d-wrapper');

    if (carouselWrapper) {
        carouselWrapper.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        carouselWrapper.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            // 滑動超過 50px 才觸發
            if (touchEndX < touchStartX - 50) goNext(); // 向左滑 -> 下一張
            if (touchEndX > touchStartX + 50) goPrev(); // 向右滑 -> 上一張
        }, {passive: true});
    }


    /* =========================================
       4. 圖片/影片點擊放大 (Lightbox) - 整合版
       ========================================= */
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');

    // 選取所有可點擊放大的項目：專業團隊照片 + 輪播項目
    const allClickable = document.querySelectorAll('.team-photo, .c-item');

    allClickable.forEach(item => {
        item.addEventListener('click', function(e) {
            
            // --- 輪播特別邏輯 ---
            // 如果點擊的是輪播項目(.c-item)，但不是中間那張(.active)
            // 則不執行放大，直接 return，讓上面的輪播點擊邏輯去處理旋轉
            if (this.classList.contains('c-item') && !this.classList.contains('active')) {
                return; 
            }
            
            e.stopPropagation(); // 阻止事件冒泡

            // 檢查內容是否有影片
            const video = this.querySelector('video');
            
            if (video) {
                // --- 播放影片 ---
                const source = video.querySelector('source').src;
                
                // 切換顯示元素
                modalImg.style.display = 'none';
                modalVideo.style.display = 'block';
                
                modalVideo.src = source;
                modalVideo.play(); // 自動播放
            } else {
                // --- 顯示圖片 ---
                const style = window.getComputedStyle(this);
                const bgImage = style.backgroundImage;

                if (bgImage && bgImage !== 'none') {
                    // 解析 url(...) 取得網址
                    const urlMatch = bgImage.match(/url\(["']?([^"']*)["']?\)/);
                    if (urlMatch && urlMatch[1]) {
                        
                        modalVideo.pause(); // 確保影片暫停
                        modalVideo.style.display = 'none';
                        modalImg.style.display = 'block';
                        
                        modalImg.src = urlMatch[1];
                    }
                }
            }
            // 顯示彈窗
            modal.classList.add('active');
        });
    });

    // 關閉視窗 (點擊遮罩或內容)
    modal.addEventListener('click', function(e) {
        // 確保點到的是 modal 本身或圖片/影片標籤 (避免誤觸)
        if (e.target === modal || e.target === modalImg || e.target === modalVideo) {
            
            modalVideo.pause();       // 暫停影片
            modalVideo.currentTime = 0; // 重置時間
            
            modal.classList.remove('active'); // 移除顯示 class

            // 延遲清空來源，避免關閉動畫時閃爍
            setTimeout(() => { 
                modalImg.src = ""; 
                modalVideo.src = ""; 
            }, 300);
        }
    });
});