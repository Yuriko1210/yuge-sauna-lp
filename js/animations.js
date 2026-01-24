// ===============================================
// YUGE Sauna & Spa - JavaScript アニメーション
// ===============================================

(function() {
    'use strict';

    // ===============================================
    // 1. Lazy Loading（遅延読み込み）
    // ===============================================
    
    // Intersection Observer API をサポートしているか確認
    if ('IntersectionObserver' in window) {
        // 画像の遅延読み込み
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // data-src がある場合は src に設定
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    
                    // data-srcset がある場合は srcset に設定
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    
                    // 読み込み完了後にクラスを追加
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });
                    
                    // 監視を停止
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // 画面に入る50px前から読み込み開始
            threshold: 0.01
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
        
        // iframe の遅延読み込み
        const lazyIframes = document.querySelectorAll('iframe[loading="lazy"]');
        
        const iframeObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    
                    if (iframe.dataset.src) {
                        iframe.src = iframe.dataset.src;
                    }
                    
                    observer.unobserve(iframe);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
    }

    // ===============================================
    // 2. スムーススクロール
    // ===============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // # だけの場合は除外
            if (href === '#' || !href) return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===============================================
    // 3. スクロール時のヘッダー変化
    // ===============================================
    
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 50px以上スクロールしたらクラスを追加
        if (scrollTop > 50) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });

    // ===============================================
    // 4. フェードインアニメーション
    // ===============================================
    
    const fadeInElements = document.querySelectorAll('.feature-item, .about-row, .room-block, .detail-card, .plan-card');
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in', 'is-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeInElements.forEach(element => {
        element.classList.add('animate-fade-in');
        fadeInObserver.observe(element);
    });

    // ===============================================
    // 5. セクションタイトルのアニメーション
    // ===============================================
    
    const sectionTitles = document.querySelectorAll('.section-title-gold');
    
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.5
    });
    
    sectionTitles.forEach(title => titleObserver.observe(title));

    // ===============================================
    // 6. フォームバリデーション（強化版）
    // ===============================================
    
    const reservationForm = document.querySelector('.reservation-form');
    
    if (reservationForm) {
        // リアルタイムバリデーション（入力中のチェック）
        const inputs = reservationForm.querySelectorAll('.form-input, .form-select, .form-textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // エラーがある場合のみ再検証
                const formGroup = this.closest('.form-group');
                if (formGroup.querySelector('.form-error')) {
                    validateField(this);
                }
            });
        });
        
        // フォーム送信時のバリデーション
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 全フィールドをバリデーション
            clearErrors();
            
            let hasError = false;
            const fieldsToValidate = [
                '#name',
                '#phone',
                '#email',
                '#date',
                '#time',
                '#course'
            ];
            
            fieldsToValidate.forEach(selector => {
                const input = this.querySelector(selector);
                if (!validateField(input)) {
                    hasError = true;
                }
            });
            
            // プライバシーポリシーチェック
            const privacy = this.querySelector('input[name="privacy"]');
            if (!privacy.checked) {
                showError(privacy, 'プライバシーポリシーに同意してください');
                hasError = true;
            }
            
            // エラーがなければ送信
            if (!hasError) {
                submitToGoogleAppsScript(this);
            } else {
                // エラーがある場合は最初のエラーフィールドにスクロール
                const firstError = this.querySelector('.form-error');
                if (firstError) {
                    firstError.closest('.form-group').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        });
    }
    
    // 個別フィールドのバリデーション
    function validateField(input) {
        const id = input.id;
        const value = input.value.trim();
        
        // まず既存のエラーをクリア
        clearFieldError(input);
        
        // 必須チェック
        if (input.hasAttribute('required') && !value) {
            const label = input.closest('.form-group').querySelector('.form-label').textContent.replace('必須', '').trim();
            showError(input, `${label}を入力してください`);
            return false;
        }
        
        // 各フィールド固有のバリデーション
        switch(id) {
            case 'name':
                if (value && value.length < 2) {
                    showError(input, 'お名前は2文字以上で入力してください');
                    return false;
                }
                if (value && value.length > 50) {
                    showError(input, 'お名前は50文字以内で入力してください');
                    return false;
                }
                break;
                
            case 'phone':
                if (value) {
                    // ハイフンなしの数字のみも許可
                    const phoneRegex = /^[0-9\-]{10,13}$/;
                    if (!phoneRegex.test(value)) {
                        showError(input, '正しい電話番号を入力してください（例：090-1234-5678）');
                        return false;
                    }
                }
                break;
                
            case 'email':
                if (value) {
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(value)) {
                        showError(input, '正しいメールアドレスを入力してください');
                        return false;
                    }
                }
                break;
                
            case 'date':
                if (value) {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        showError(input, '本日以降の日付を選択してください');
                        return false;
                    }
                    
                    // 3ヶ月以降の予約は不可
                    const threeMonthsLater = new Date();
                    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
                    
                    if (selectedDate > threeMonthsLater) {
                        showError(input, '予約は3ヶ月先までとなります');
                        return false;
                    }
                }
                break;
                
            case 'coupon':
                if (value) {
                    // クーポンコードの形式チェック（大文字英数字のみ、4-20文字）
                    const couponRegex = /^[A-Z0-9]{4,20}$/;
                    if (!couponRegex.test(value.toUpperCase())) {
                        showError(input, 'クーポンコードは英数字4-20文字で入力してください');
                        return false;
                    }
                }
                break;
        }
        
        return true;
    }
    
    // エラー表示関数（改善版）
    function showError(input, message) {
        const formGroup = input.closest('.form-group') || input.closest('.form-checkbox-group');
        
        // 既存のエラーを削除
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // エラーメッセージ要素を作成
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.color = '#d32f2f';
        errorDiv.style.fontSize = '11px';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.fontWeight = '500';
        errorDiv.innerHTML = `<span style="margin-right: 4px;">⚠</span>${message}`;
        
        // 入力フィールドを赤くする
        if (input.classList.contains('form-input') || input.classList.contains('form-select') || input.classList.contains('form-textarea')) {
            input.style.borderColor = '#d32f2f';
            input.style.backgroundColor = '#fff5f5';
        }
        
        // エラーメッセージを追加
        formGroup.appendChild(errorDiv);
    }
    
    // 個別フィールドのエラークリア
    function clearFieldError(input) {
        const formGroup = input.closest('.form-group') || input.closest('.form-checkbox-group');
        const error = formGroup.querySelector('.form-error');
        if (error) {
            error.remove();
        }
        
        if (input.classList.contains('form-input') || input.classList.contains('form-select') || input.classList.contains('form-textarea')) {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        }
    }
    
    // エラークリア関数
    function clearErrors() {
        document.querySelectorAll('.form-error').forEach(error => error.remove());
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });
    }
    
    // Google Apps Script に送信する関数
    function submitToGoogleAppsScript(form) {
        const formData = new FormData(form);
        const data = {};
        
        // FormDataをオブジェクトに変換
        for (let [key, value] of formData.entries()) {
            // チェックボックスは除外
            if (key !== 'privacy') {
                data[key] = value;
            }
        }
        
        // タイムスタンプを追加
        data.timestamp = new Date().toISOString();
        
        // 送信ボタンを無効化
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span style="display: inline-block; margin-right: 8px;">⏳</span>送信中...';
        
        // ここにGoogle Apps ScriptのURLを設定
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxH-0q8VtASi2zNz4qyiIUDndTygYKMqi7BCoOuKAaQd9rxO2zS7QKiOIIbSxfhKdwv/exec';
        
        // 開発中はコンソールにデータを表示
        console.log('送信データ:', data);
        
        // SCRIPT_URLが設定されていない場合の警告
        if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            alert('⚠️ Google Apps ScriptのURLが設定されていません。\n\nGOOGLE_APPS_SCRIPT_SETUP.mdを参照して設定してください。');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(() => {
            // 成功メッセージ
            showSuccessMessage();
            form.reset();
            clearErrors();
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage();
        })
        .finally(() => {
            // ボタンを元に戻す
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }
    
    // 成功メッセージ表示
    function showSuccessMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            padding: 30px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            max-width: 90%;
            animation: slideIn 0.3s ease-out;
        `;
        message.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">ご予約を受け付けました</h3>
            <p style="font-size: 14px; line-height: 1.6;">
                ご登録いただいたメールアドレスに<br>
                確認メールをお送りしております。<br><br>
                折り返し担当者よりご連絡させていただきます。
            </p>
        `;
        
        document.body.appendChild(message);
        
        // 3秒後に自動的に閉じる
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
    
    // エラーメッセージ表示
    function showErrorMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
            padding: 30px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            max-width: 90%;
        `;
        message.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">✗</div>
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">送信に失敗しました</h3>
            <p style="font-size: 14px; line-height: 1.6;">
                大変申し訳ございません。<br>
                お手数ですが、お電話にてご予約ください。<br><br>
                <strong style="font-size: 18px;">TEL: 03-1234-5678</strong>
            </p>
        `;
        
        document.body.appendChild(message);
        
        // クリックで閉じる
        message.addEventListener('click', () => message.remove());
        
        // 5秒後に自動的に閉じる
        setTimeout(() => message.remove(), 5000);
    }

    // ===============================================
    // 7. パフォーマンス最適化
    // ===============================================
    
    // スクロールイベントのデバウンス
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

    // ===============================================
    // 8. 初期化完了
    // ===============================================
    
    console.log('YUGE Sauna & Spa - JavaScript initialized');

})();
