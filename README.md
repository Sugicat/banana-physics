# Banana Physics Web App

物理演算を使ったバナナ出現アプリです。ブラウザでクリック/タップするとバナナが降ってきます。

## スマホで動かす方法

### 方法1: GitHub Pages (おすすめ)
1. GitHubで新しいリポジトリを作成します（例: `banana-physics`）。
2. PCのターミナル（またはGit Bash）で以下のコマンドを実行して、作成したリポジトリにアップロードします：

```powershell
# Gitのパスが通っていない場合はフルパスで実行するか、Git Bashを使用してください
git remote add origin https://github.com/[あなたのユーザー名]/[リポジトリ名].git
git branch -M main
git push -u origin main
```
3. GitHubリポジトリの「Settings」->「Pages」を開きます。
4. Sourceを「Deploy from a branch」、Branchを「main」(/root)に設定してSaveします。
5. 数分後、発行されたURLにスマホからアクセスします。

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
