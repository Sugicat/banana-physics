# Banana Physics Web App

物理演算を使ったバナナ出現アプリです。ブラウザでクリック/タップするとバナナが降ってきます。

## スマホで動かす方法

### 方法1: GitHub Pages (おすすめ)
1. このフォルダをGitHubのリポジトリにプッシュします。
2. GitHubリポジトリの「Settings」->「Pages」を開きます。
3. Sourceを「Deploy from a branch」、Branchを「main」(/root)に設定してSaveします。
4. 数分後、発行されたURLにスマホからアクセスします。

### 方法2: ローカルネットワーク (PCと同じWi-Fi)
1. PCでVS Codeの拡張機能「Live Server」などを使ってサーバーを立ち上げます（または `python -m http.server 8000` など）。
2. PCのIPアドレスを確認します（Windowsならターミナルで `ipconfig`）。
3. スマホのブラウザで `http://[PCのIPアドレス]:8000` にアクセスします。
   - 例: `http://192.168.1.15:8000`

## 構成
- `index.html`: 本体
- `main.js`: 物理演算ロジック (Matter.js using poly-decomp for shapes)
- `style.css`: スタイル
- `assets/`: 画像素材
