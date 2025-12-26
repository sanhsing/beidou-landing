# 北斗教育 v63 - 靜態前端

## 部署到 GitHub Pages

### 1. 建立 Repository
```bash
# 在 GitHub 建立新 repo: beidou-education
# 或使用現有 repo
```

### 2. 上傳檔案
```bash
git init
git add .
git commit -m "北斗教育 v63 - 靜態前端"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/beidou-education.git
git push -u origin main
```

### 3. 啟用 GitHub Pages
1. 進入 repo 的 Settings
2. 找到 Pages 區塊
3. Source 選擇 `main` branch
4. 點擊 Save

### 4. 訪問網站
```
https://YOUR_USERNAME.github.io/beidou-education/
```

## 檔案結構

```
frontend/
├── index.html          # 首頁
├── quiz.html           # 練習模式
├── battle.html         # RPG 戰鬥
├── pvp.html            # PvP 對戰
├── achievements.html   # 成就系統
├── data/               # JSON 資料
│   ├── index.json      # 資料索引
│   ├── qbank_*.json    # 各科題庫
│   ├── monsters.json   # 怪物資料
│   ├── dialogues.json  # 怪物對話
│   ├── pvp_ranks.json  # PvP 段位
│   ├── achievements.json # 成就
│   └── ...
└── README.md           # 說明文件
```

## 資料來源

- 基於 education.db v63
- 題庫: 40,833 題
- 怪物: 560 隻
- 對話: 560 組
- 成就: 50 個

## 版本

- v63 (2025-12-26)
- 靜態 HTML + JSON
- 無需後端，直接運行

© 北斗七星文創數位有限公司 2025
