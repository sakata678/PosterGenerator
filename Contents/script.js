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
    
    async handlePrint() {
        if (!this.generatedPosterUrl) {
            alert('印刷するポスターがありません。');
            return;
        }
        
        const printSize = this.formData.printSize || 'a4';
        
        try {
            // PDFを生成
            const pdfUrl = await this.generatePDF(printSize);
            
            // PDFを新しいタブで開いて印刷
            this.printPDF(pdfUrl);
        } catch (error) {
            console.error('PDF生成エラー:', error);
            alert('PDFの生成に失敗しました。');
        }
    }
    
    async generatePDF(printSize) {
        const { jsPDF } = window.jspdf;
        
        // サイズに応じた寸法設定（mm単位）
        const paperDimensions = {
            a5: { width: 148, height: 210 },
            a4: { width: 210, height: 297 },
            a3: { width: 297, height: 420 },
            b4: { width: 257, height: 364 },
            b3: { width: 364, height: 515 }
        };
        
        const dimensions = paperDimensions[printSize] || paperDimensions.a4;
        const orientation = dimensions.width > dimensions.height ? 'landscape' : 'portrait';
        
        // PDFドキュメントを作成
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: [dimensions.width, dimensions.height]
        });
        
        // ポスター画像をPDFに追加
        const previewElement = document.getElementById('poster-preview');
        const posterImage = previewElement.querySelector('img');
        
        if (posterImage) {
            try {
                // SVG画像の場合は特別な処理が必要
                if (posterImage.src.startsWith('blob:') && this.generatedPosterUrl.includes('svg')) {
                    // SVGをキャンバスに変換してからPDFに追加
                    const canvas = await this.svgToCanvas(posterImage.src);
                    const imgData = canvas.toDataURL('image/png', 1.0);
                    
                    const imgWidth = dimensions.width;
                    const imgHeight = dimensions.height;
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                } else {
                    // 通常の画像処理
                    await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                            try {
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.drawImage(img, 0, 0);
                                
                                const imgData = canvas.toDataURL('image/png', 1.0);
                                const imgWidth = dimensions.width;
                                const imgHeight = dimensions.height;
                                
                                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        };
                        img.onerror = reject;
                        img.src = posterImage.src;
                    });
                }
            } catch (error) {
                console.error('画像処理エラー:', error);
                // エラーの場合はテキストでフォールバック
                this.addTextToPDF(pdf, dimensions);
            }
        } else {
            // 画像がない場合はテキストでフォールバック
            this.addTextToPDF(pdf, dimensions);
        }
        
        // PDFをBlobとして生成
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return pdfUrl;
    }
    
    async svgToCanvas(svgUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(svgUrl);
                const svgText = await response.text();
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                    canvas.width = img.width || 400;
                    canvas.height = img.height || 600;
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas);
                };
                
                img.onerror = reject;
                
                const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(svgBlob);
                img.src = url;
            } catch (error) {
                reject(error);
            }
        });
    }
    
    addTextToPDF(pdf, dimensions) {
        // フォールバック：テキストベースでポスター内容を追加
        pdf.setFontSize(20);
        pdf.text(this.formData.title || 'ポスタータイトル', 20, 30);
        
        pdf.setFontSize(12);
        const content = this.formData.mainContent || 'ポスターコンテンツ';
        const lines = pdf.splitTextToSize(content, dimensions.width - 40);
        pdf.text(lines, 20, 50);
    }
    
    printPDF(pdfUrl) {
        // 新しいウィンドウでPDFを開く
        const printWindow = window.open(pdfUrl, '_blank');
        
        // PDFが読み込まれたら印刷ダイアログを開く
        if (printWindow) {
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };
        } else {
            // ポップアップがブロックされた場合は直接ダウンロード
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `poster_${this.formData.printSize || 'a4'}.pdf`;
            link.click();
        }
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