/**
 * YUGE Sauna & Spa - アニメーションスクリプト
 * スクロール連動のフェードイン・スライドインアニメーション
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===============================================
    // 1. スクロールアニメーション（Intersection Observer使用）
    // ===============================================
    
    const observerOptions = {
        threshold: 0.1,        // 10%見えたら発火
        rootMargin: '0px 0px -50px 0px'  // 下から50px手前で発火
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // 一度表示したら監視を解除（パフォーマンス向上）
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // アニメーション対象の要素を取得
    const animateElements = document.querySelectorAll('.feature-item, .about-row, .room-block, .detail-card, .plan-card, .info-item');
    
    animateElements.forEach(el => {
        el.classList.add('animate-fade-in');
        observer.observe(el);
    });
    
    
    // ===============================================
    // 2. ヘッダーのスクロール時スタイル変更
    // ===============================================
    
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 100px以上スクロールしたらヘッダーに影を追加
        if (scrollTop > 100) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    
    // ===============================================
    // 3. スムーススクロール
    // ===============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // #のみの場合は処理しない
            if (href === '#' || href === '#!') {
                return;
            }
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    
    // ===============================================
    // 4. 画像の遅延読み込み（Lazy Loading）
    // ===============================================
    
    const reservationForm = document.querySelector('.reservation-form');
    
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 簡易的なバリデーション
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const privacy = document.querySelector('input[name="privacy"]').checked;
            
            if (!name || !phone || !email) {
                alert('必須項目をすべて入力してください。');
                return false;
            }
            
            if (!privacy) {
                alert('プライバシーポリシーに同意してください。');
                return false;
            }
            
            // メールアドレスの簡易チェック
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('正しいメールアドレスを入力してください。');
                return false;
            }
            
            // 実際の送信処理はここに実装
            // 例：fetch APIでサーバーに送信
            alert('ご予約を受け付けました。確認メールをお送りしますので、しばらくお待ちください。');
            
            // フォームをリセット
            reservationForm.reset();
        });
    }
    
    
    // ===============================================
    // 6. 画像の遅延読み込み（Lazy Loading）
    // ===============================================
    
    if ('loading' in HTMLImageElement.prototype) {
        // ブラウザがネイティブでサポートしている場合
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // ポリフィル（古いブラウザ対応）
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
    
});


// ===============================================
// 7. パフォーマンス最適化：リサイズイベントのデバウンス
// ===============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ウィンドウリサイズ時の処理（必要に応じて）
window.addEventListener('resize', debounce(function() {
    // リサイズ時の処理をここに記述
    console.log('Window resized');
}, 250));
