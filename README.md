# Moodle Plus (むーどるぷらす)

## 紹介

Moodle Plus はオープンソースの教育支援システム「Moodle」にちょっとした機能を追加する拡張です!

ここがすごい！ :

- **今出てる課題がホームに**: 課題提出忘れを大幅に減らせます！
- **サイトニュースを畳む**: 長い文のサイトニュース、しまっちゃおう！
- **文字数表示**: テキスト入力の課題で文字数を表示するように！もう外部サイトを使う必要はありません！

## スクリーンショット

![](./screenshots/screenshot_01.png)

![](./screenshots/screenshot_02.png)

## インストール方法

- Chrome: [Chrome のウェブストア](https://chromewebstore.google.com/detail/moodle-plus/nncecmfhijadiddmmnajjaemlpnknplh)からインストール
- Edge: [Microsoft Edge アドオン](https://microsoftedge.microsoft.com/addons/detail/odiokdoddkknajccbiclcbfjpbjijlhc)からインストール
- Firefox: [Firefox のアドオンストア](https://addons.mozilla.org/ja/firefox/addon/moodle-plus/)からインストール

## 対応状況

- 大阪公立大学 (2023/12/09 確認)
- 九州大学 (2023/12/09 確認)
- 会津大学 (2024/06/10 確認)
- 滋賀大学 (2024/06/11 確認)
- 群馬大学 (2024/06/16 確認)
- 愛知工業大学 (2024/07/01 確認)
- 早稲田大学 (2024/12/12 確認)

### 試験対応中の学校

以下の学校では動作確認が不十分なため、一部の機能が使用できなかったり、Moodle の操作に支障をきたしたりする可能性があります。
使用中に問題が発生した場合は Moodle Plus を無効化してください。

- 三重大学 (2024/12/08 Moodle4.1版のみ)
- 九州工業大学

## 対応追加要望

貴学の Moodle のリンクを添えて Issues までどうぞ。
連絡可能なメールアドレスも書いてください。

## バグ報告

- どこの大学か
- パソコンと Chrome バージョン
- 再現手順
  を添えて Issues までどうぞ

## 動かし方 (開発者向け)

### 依存関係のインストール

パッケージマネージャにpnpmを使用しています。

```bash
pnpm i
```

### 開発

開発用サーバーを動かすには以下のようにします。

```bash
# Chrome系向け
pnpm dev

# Firefox系向け
pnpm dev:firefox
```

開発モード中はファイルを変更するたびにビルドが行われ、対応する環境では専用のサンドボックス化されたブラウザが起動します。

### ビルド

ビルド成果物を`/dist/<ビルドターゲットによって異なるディレクトリ名>/`に出力します。

Chrome/Edge の「パッケージ化されてない拡張機能を読み込む」を使って読み込んでください。

```bash
# Chrome系向け
pnpm build

# Firefox系向け
pnpm build:firefox
```

### パッケージング

ビルド成果物をzipファイルにして`/dist`に出力します。

```bash
# Chrome系向け
pnpm zip

# Firefox系向け
pnpm zip:firefox
```

## プロジェクトのメンバー

<2023 年度>

- @tomo0611 - 開発責任者

## ライセンス (The MIT License)

Copyright 2023 @tomo0611

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
