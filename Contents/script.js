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
            this.showError('ポスターの生成に失敗しました。もう一度お試しください。');
        } finally {
            this.showLoading(false);
        }
    }
    
    async generatePoster(formData) {
        const apiEndpoint = 'https://bnf5waw9th.execute-api.ap-northeast-1.amazonaws.com/poster';
        
        // 印刷サイズをピクセルに変換
        const sizeMapping = this.getSizeInPixels(formData.printSize);
        
        // スタイルをトーンに変換
        const toneMapping = {
            'classic': 'フォーマル',
            'art': 'アート',
            'child': 'ファミリー',
            'pop': 'ポップ'
        };
        
        const requestBody = {
            title: formData.title || '',
            subtitle: formData.mainContent || '',
            tone: toneMapping[formData.style] || 'フォーマル',
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