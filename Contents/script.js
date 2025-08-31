class PosterDesignApp {
    constructor() {
        this.currentScreen = 'input';
        this.formData = {};
        this.generatedPosterUrl = null;
        this.errorLogs = [];
        
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
        
        // スタイル選択の自動保存
        document.querySelectorAll('input[name="poster-style"]').forEach(radio => {
            radio.addEventListener('change', () => {
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
        const selectedStyle = document.querySelector('input[name="poster-style"]:checked');
        
        this.formData = {
            mainContent: document.getElementById('main-content').value,
            title: document.getElementById('title').value,
            printSize: document.getElementById('print-size').value,
            style: selectedStyle ? selectedStyle.value : 'classic'
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
            
            // スタイル選択を復元
            const styleValue = this.formData.style || 'classic';
            const styleRadio = document.getElementById(`style-${styleValue}`);
            if (styleRadio) {
                styleRadio.checked = true;
            }
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
            this.logError('ポスター生成API呼び出し', error, this.formData);
            this.showError('ポスターの生成に失敗しました。もう一度お試しください。');
        } finally {
            this.showLoading(false);
        }
    }
    
    async generatePoster(formData) {
        const apiEndpoint = 'https://bnf5waw9th.execute-api.ap-northeast-1.amazonaws.com/poster';
        
        // 印刷サイズをピクセルに変換
        const sizeMapping = this.getSizeInPixels(formData.printSize);
        
        // スタイルをAPIパラメータに変換
        const styleMapping = {
            'classic': 'フォーマル',
            'art': 'アート',
            'child': 'ファミリー',
            'pop': 'ポップ'
        };
        
        const requestBody = {
            title: formData.title || '',
            subtitle: formData.mainContent || '',
            style: styleMapping[formData.style] || 'フォーマル',
            size: sizeMapping
        };
        
        console.log('API Request:', requestBody);
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.url) {
            return {
                success: true,
                imageUrl: result.url,
                message: 'ポスターが正常に生成されました。'
            };
        } else {
            throw new Error('APIからの応答が不正です。');
        }
    }
    
    getSizeInPixels(printSize) {
        // 300DPIでの印刷サイズをピクセルに変換
        const sizeMap = {
            'a5': { width: 1748, height: 2480 },   // 148×210mm
            'a4': { width: 2480, height: 3508 },   // 210×297mm  
            'a3': { width: 3508, height: 4961 },   // 297×420mm
            'b4': { width: 3031, height: 4299 },   // 257×364mm
            'b3': { width: 4299, height: 6071 }    // 364×515mm
        };
        
        return sizeMap[printSize] || sizeMap['a4'];
    }
    
    logError(operation, error, context = {}) {
        const timestamp = new Date().toISOString();
        const errorLog = {
            timestamp: timestamp,
            operation: operation,
            error: {
                name: error.name || 'Unknown Error',
                message: error.message || 'No error message',
                stack: error.stack || 'No stack trace'
            },
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // エラーログを配列に追加
        this.errorLogs.push(errorLog);
        
        // ローカルストレージに保存（永続化）
        try {
            const existingLogs = JSON.parse(localStorage.getItem('posterAppErrorLogs') || '[]');
            existingLogs.push(errorLog);
            
            // 最新100件のみ保持
            if (existingLogs.length > 100) {
                existingLogs.splice(0, existingLogs.length - 100);
            }
            
            localStorage.setItem('posterAppErrorLogs', JSON.stringify(existingLogs));
        } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
        }
        
        // コンソールにも詳細なエラー情報を出力
        console.group(`🚨 ${operation} - ${timestamp}`);
        console.error('Error Details:', error);
        console.log('Context:', context);
        console.log('Full Error Log:', errorLog);
        console.groupEnd();
        
        // エラーログファイルとしてダウンロード可能にする
        this.generateErrorLogFile();
    }
    
    generateErrorLogFile() {
        try {
            const allLogs = JSON.parse(localStorage.getItem('posterAppErrorLogs') || '[]');
            const logContent = allLogs.map(log => {
                return `[${log.timestamp}] ${log.operation}\n` +
                       `Error: ${log.error.name} - ${log.error.message}\n` +
                       `Context: ${JSON.stringify(log.context, null, 2)}\n` +
                       `User Agent: ${log.userAgent}\n` +
                       `URL: ${log.url}\n` +
                       `Stack Trace: ${log.error.stack}\n` +
                       '---\n';
            }).join('\n');
            
            // Blobを作成してダウンロード用URLを生成
            const blob = new Blob([logContent], { type: 'text/plain' });
            const logUrl = URL.createObjectURL(blob);
            
            // ダウンロードリンクを動的に作成（デバッグ用）
            if (window.downloadErrorLogs) {
                URL.revokeObjectURL(window.downloadErrorLogs);
            }
            window.downloadErrorLogs = logUrl;
            
            // コンソールにダウンロード可能であることを通知
            console.log('📄 Error log file generated. Access via: window.downloadErrorLogs');
            console.log('🔽 To download: const a = document.createElement("a"); a.href = window.downloadErrorLogs; a.download = "poster-app-errors.log"; a.click();');
            
        } catch (error) {
            console.error('Failed to generate error log file:', error);
        }
    }
    
    displayGeneratedPoster(result) {
        const previewElement = document.getElementById('poster-preview');
        
        if (result.success && result.imageUrl) {
            this.generatedPosterUrl = result.imageUrl;
            previewElement.innerHTML = `<img src="${result.imageUrl}" alt="生成されたポスター">`;
            
            // スタイルに応じたタイトルに変更
            this.updateResultTitle();
        } else {
            this.showError('ポスターの生成に失敗しました。');
        }
    }
    
    updateResultTitle() {
        const titleMapping = {
            'classic': '生成完了',
            'art': '作品が完成しました',
            'child': 'できあがり！',
            'pop': 'できたよ！'
        };
        
        const selectedStyle = this.formData.style || 'classic';
        const newTitle = titleMapping[selectedStyle] || '生成結果';
        
        const titleElement = document.querySelector('#output-screen header h1');
        if (titleElement) {
            titleElement.textContent = newTitle;
        }
    }
    
    showLoading(show) {
        const previewElement = document.getElementById('poster-preview');
        
        if (show) {
            previewElement.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    生成中...
                </div>
            `;
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
        
        // サイズに応じた具体的な寸法設定（mm単位）
        const paperDimensions = {
            a5: { width: 148, height: 210 },
            a4: { width: 210, height: 297 },
            a3: { width: 297, height: 420 },
            b4: { width: 257, height: 364 },
            b3: { width: 364, height: 515 }
        };
        
        const dimensions = paperDimensions[size] || paperDimensions.a4;
        const cssPageSize = `@page { size: ${dimensions.width}mm ${dimensions.height}mm; margin: 0; }`;
        
        // 動的にスタイルタグを追加
        const style = document.createElement('style');
        style.id = 'print-page-size';
        style.innerHTML = cssPageSize;
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