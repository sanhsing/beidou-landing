#!/bin/bash
# 北斗教育前端部署腳本

echo "=========================================="
echo "北斗教育前端部署 v12.12"
echo "=========================================="

# 檢查 git
if ! command -v git &> /dev/null; then
    echo "錯誤：請先安裝 git"
    exit 1
fi

# 設定變數
REPO_URL="${1:-}"
if [ -z "$REPO_URL" ]; then
    echo "用法: ./deploy_frontend.sh <GITHUB_REPO_URL>"
    echo "範例: ./deploy_frontend.sh https://github.com/username/beidou-edu-frontend.git"
    exit 1
fi

# 初始化 git
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git 初始化完成"
fi

# 加入所有檔案
git add .
echo "✅ 檔案已加入"

# 提交
git commit -m "v12.12 - 北斗教育前端 (18 pages)"
echo "✅ 已提交"

# 設定遠端
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"
echo "✅ 遠端設定完成"

# 推送
git branch -M main
git push -u origin main --force
echo "✅ 推送完成"

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 前往 GitHub Repository → Settings → Pages"
echo "2. 選擇 Branch: main, Folder: / (root)"
echo "3. 點擊 Save"
echo "4. 等待幾分鐘後訪問您的網站"
echo ""
