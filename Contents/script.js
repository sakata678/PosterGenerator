class PosterDesignApp {
    constructor() {
        this.currentScreen = 'input';
        this.formData = {};
        this.generatedPosterUrl = null;
        
        this.initializeEventListeners();
        this.loadSavedData();
    }
    
    initializeEventListeners() {
        // 生成ボタン
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.handleGenerate();
        });
        
        // 再生成ボタン
        document.getElementById('regenerate-btn').addEventListener('click', () => {
            this.showScreen('input');
        });
        
        // 印刷ボタン
        document.getElementById('print-btn').addEventListener('click', () => {
            this.handlePrint();
        });
        
        // フォーム入力の自動保存
        ['main-content', 'title', 'print-size'].forEach(id => {
            const element = document.getElementById(id);
            element.addEventListener('input', () => {
                this.saveFormData();
            });
        });
    }
    
    showScreen(screenName) {
        // すべての画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 指定された画面を表示
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;
    }
    
    saveFormData() {
        this.formData = {
            mainContent: document.getElementById('main-content').value,
            title: document.getElementById('title').value,
            printSize: document.getElementById('print-size').value
        };
        
        // セッションストレージに保存
        sessionStorage.setItem('posterFormData', JSON.stringify(this.formData));
    }
    
    loadSavedData() {
        const savedData = sessionStorage.getItem('posterFormData');
        if (savedData) {
            this.formData = JSON.parse(savedData);
            
            // フォームに復元
            document.getElementById('main-content').value = this.formData.mainContent || '';
            document.getElementById('title').value = this.formData.title || '';
            document.getElementById('print-size').value = this.formData.printSize || 'a4';
        }
    }
    
    validateForm() {
        const mainContent = document.getElementById('main-content').value.trim();
        const title = document.getElementById('title').value.trim();
        
        if (!mainContent) {
            alert('メインコンテンツを入力してください。');
            return false;
        }
        
        if (!title) {
            alert('タイトルを入力してください。');
            return false;
        }
        
        return true;
    }
    
    async handleGenerate() {
        if (!this.validateForm()) {
            return;
        }
        
        this.saveFormData();
        
        // 生成画面に遷移
        this.showScreen('output');
        this.showLoading(true);
        
        try {
            // AI APIを呼び出してポスター生成
            const result = await this.generatePoster(this.formData);
            this.displayGeneratedPoster(result);
        } catch (error) {
            console.error('ポスター生成エラー:', error);
            this.showError('ポスターの生成に失敗しました。もう一度お試しください。');
        } finally {
            this.showLoading(false);
        }
    }
    
    async generatePoster(formData) {
        // 実際のAWS Lambda呼び出し部分（プレースホルダー）
        const apiEndpoint = 'YOUR_AWS_LAMBDA_ENDPOINT';
        
        // モックデータ（実際のAPIが利用可能になるまで）
        return new Promise((resolve) => {
            setTimeout(() => {
                // サンプル画像URLを返す（実際はAIが生成した画像URL）
                resolve({
                    success: true,
                    imageUrl: this.generateMockPoster(formData),
                    message: 'ポスターが正常に生成されました。'
                });
            }, 2000);
        });
        
        // 実際のAPI呼び出し（コメントアウト）
        /*
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mainContent: formData.mainContent,
                title: formData.title,
                printSize: formData.printSize
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
        */
    }
    
    generateMockPoster(formData) {
        // SVGでモックポスターを生成
        const svg = `
            <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#4a9d94;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2c5b7a;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#bg)"/>
                
                <rect x="20" y="20" width="360" height="560" fill="white" opacity="0.95" rx="10"/>
                
                <text x="200" y="80" text-anchor="middle" fill="#2c5b7a" font-size="24" font-weight="bold" font-family="Arial">
                    ${formData.title || 'タイトル'}
                </text>
                
                <foreignObject x="40" y="120" width="320" height="400">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="padding: 20px; color: #333; font-size: 14px; line-height: 1.6; font-family: Arial;">
                        ${formData.mainContent || 'コンテンツが入ります'}
                    </div>
                </foreignObject>
                
                <text x="200" y="580" text-anchor="middle" fill="#5a7a8a" font-size="12" font-family="Arial">
                    Generated by AI Poster Design Service
                </text>
            </svg>
        `;
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
    }
    
    displayGeneratedPoster(result) {
        const previewElement = document.getElementById('poster-preview');
        
        if (result.success && result.imageUrl) {
            this.generatedPosterUrl = result.imageUrl;
            previewElement.innerHTML = `<img src="${result.imageUrl}" alt="生成されたポスター">`;
        } else {
            this.showError('ポスターの生成に失敗しました。');
        }
    }
    
    showLoading(show) {
        const previewElement = document.getElementById('poster-preview');
        
        if (show) {
            previewElement.innerHTML = '<div class="loading">生成中...</div>';
        }
    }
    
    showError(message) {
        const previewElement = document.getElementById('poster-preview');
        previewElement.innerHTML = `<div style="color: #e74c3c; text-align: center;">${message}</div>`;
    }
    
    handlePrint() {
        if (!this.generatedPosterUrl) {
            alert('印刷するポスターがありません。');
            return;
        }
        
        // 印刷用のページサイズを設定
        const printSize = this.formData.printSize || 'a4';
        this.setPrintPageSize(printSize);
        
        // ブラウザの印刷ダイアログを開く
        window.print();
    }
    
    setPrintPageSize(size) {
        // 既存のスタイルタグを削除
        const existingStyle = document.getElementById('print-page-size');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // サイズに応じたCSS設定
        const pageSizes = {
            a5: '@page { size: A5; margin: 0; }',
            a4: '@page { size: A4; margin: 0; }',
            a3: '@page { size: A3; margin: 0; }',
            b4: '@page { size: B4; margin: 0; }',
            b3: '@page { size: B3; margin: 0; }'
        };
        
        // 動的にスタイルタグを追加
        const style = document.createElement('style');
        style.id = 'print-page-size';
        style.innerHTML = pageSizes[size] || pageSizes.a4;
        document.head.appendChild(style);
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new PosterDesignApp();
});

// ページ離脱時の確認
window.addEventListener('beforeunload', (e) => {
    const formData = sessionStorage.getItem('posterFormData');
    if (formData && JSON.parse(formData).mainContent) {
        e.preventDefault();
        e.returnValue = '';
    }
});