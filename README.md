# Kin's Domain Planner | 一族の土地プランナー

A simple, aesthetic, and intuitive 1-hectare (100m x 100m) garden design planner based on the concepts from the "Ringing Cedars of Russia" series (Anastasia).
ロシアの「響きわたる杉」シリーズ（アナスタシア）の概念に基づいた、1ヘクタール（100m x 100m）の土地設計をシミュレーションするためのシンプルで美しいプランナーです。

## Features | 特徴

- **1 Hectare Canvas:** A visual representation of a 100m x 100m plot with 10m grid lines.
  - **1ヘクタールキャンバス:** 10m間隔のグリッドを備えた100m x 100mの設計エリア。
- **Essential Items:** Place elements like Living Hedges, Orchards, Vegetable Gardens, Forests, Ponds, and Houses.
  - **必須アイテム:** 生きた垣根、果樹園、菜園、森、池、家などの要素を配置可能。
- **Statistics Panel:** Real-time calculation of item counts and estimated area usage.
  - **統計パネル:** 配置アイテムの個数や推定面積割合をリアルタイムで算出。
- **Anastasia Guide:** Rule-based feedback system to help you align with the core principles of Kin's Domains.
  - **アナスタシア・ガイド:** 土地設計の基本原則に沿っているかを判定し、フィードバックを表示。
- **Data Persistence:** Automatic saving via LocalStorage and manual Export/Import of JSON design files.
  - **データ永続化:** LocalStorageによる自動保存と、JSONファイルによるエクスポート/インポート機能。

## Tech Stack | 技術スタック

- **React** (TypeScript)
- **Tailwind CSS**
- **Lucide-react** (Icons)

## How to use | 使い方

1.  Select an item from the sidebar.
    サイドバーから配置したいアイテムを選択します。
2.  Click on the canvas to place it.
    キャンバス上をクリックして配置します。
3.  Right-click or use the Eraser tool to remove items.
    右クリックまたは消しゴムツールでアイテムを削除できます。
4.  Check the **Guide** for advice on your design.
    「ガイド」を開いて、設計のアドバイスを確認しましょう。

---

## Deployment | デプロイについて

This project can be easily hosted on GitHub Pages, Vercel, or Netlify.
このプロジェクトは GitHub Pages, Vercel, Netlify などで簡単に公開できます。

### Build Command | ビルド設定
- **Build Command:** `npm run build` or `vite build`
- **Output Directory:** `dist`

### GitHub Pages Tips
If you use GitHub Pages with a project subdirectory (e.g., `username.github.io/kins-domain-planner/`), make sure to set the `base` in your `vite.config.ts`:
```ts
// vite.config.ts
export default defineConfig({
  base: '/kins-domain-planner/', // Set this to your repository name
  plugins: [react()],
})
```

## License | ライセンス

MIT License. Feel free to use and contribute to creating a greener world!
MITライセンス。地球をより緑豊かにするために、自由にお使いください！
