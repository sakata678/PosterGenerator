# ポスターデザイン作成サービス

AIを活用してユーザーが入力した情報を基にポスターを自動生成し、編集・印刷まで行えるWebアプリケーション

## 機能

- **入力フォーム**: メインコンテンツとタイトルの入力、印刷サイズの選択
- **AI生成**: 入力内容に基づいたポスターの自動生成
- **プレビュー**: 生成結果の確認と編集
- **印刷機能**: 指定サイズでの高品質印刷

## ファイル構成

```
poster-design-portfolio/
├── index.html          # メインHTML
├── styles.css          # スタイルシート
├── script.js           # JavaScript機能
└── README.md          # このファイル
```

## 使用方法

1. ブラウザで `index.html` を開く
2. メインコンテンツとタイトルを入力
3. 印刷サイズを選択
4. 「出力する」ボタンでポスター生成
5. 結果を確認後、印刷または再編集

## AWS Lambda連携設定

現在はモックデータで動作しています。実際のAI生成を有効にするには以下の設定が必要です：

### 1. AWS Lambda関数の設定

```javascript
// Lambda関数例（Node.js）
exports.handler = async (event) => {
    const { mainContent, title, printSize } = JSON.parse(event.body);
    
    // AI画像生成サービス（例：OpenAI DALL-E、Midjourney API等）を呼び出し
    const generatedImageUrl = await generatePosterWithAI({
        content: mainContent,
        title: title,
        size: printSize
    });
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: true,
            imageUrl: generatedImageUrl
        })
    };
};
```

### 2. フロントエンド設定

`script.js` の以下の部分を更新：

```javascript
// 53行目付近の設定を変更
const apiEndpoint = 'YOUR_AWS_LAMBDA_ENDPOINT'; // 実際のエンドポイントに変更

// 62-71行目のモック部分をコメントアウトし、74-88行目の実際のAPI呼び出しを有効化
```

### 3. CORS設定

Lambda関数またはAPI Gatewayで適切なCORS設定を行ってください。

## 技術仕様

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **スタイル**: レスポンシブデザイン、淡い青緑色テーマ
- **状態管理**: SessionStorage使用
- **印刷**: CSS @mediaクエリとブラウザ印刷API

## ブラウザ対応

- Chrome (推奨)
- Firefox
- Safari
- Edge

## カスタマイズ

### テーマ色の変更
`styles.css` の以下の変数を変更：
- メインカラー: `#4a9d94`
- サブカラー: `#2c5b7a`
- 背景色: `#e6f7f5`

### 印刷サイズの追加
1. `index.html` の `<select id="print-size">` に新しいオプションを追加
2. `script.js` の `pageSizes` オブジェクトに対応するCSS設定を追加

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。