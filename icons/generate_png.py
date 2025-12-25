#!/usr/bin/env python3
"""
PWA Icons PNG 生成器
北斗教育 × 織明
使用 Pillow 直接繪製
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUTPUT_DIR = '/home/claude/beidou_v12_8/frontend/icons'

def create_icon(size):
    """建立北斗教育圖示"""
    # 創建圖像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 背景漸層 (簡化為單色)
    radius = int(size * 0.15)
    draw.rounded_rectangle(
        [(0, 0), (size, size)],
        radius=radius,
        fill=(30, 27, 75)  # 深紫色
    )
    
    # 比例縮放
    scale = size / 512
    
    # 北斗七星座標
    stars_base = [
        (128, 150),  # 天樞
        (170, 180),  # 天璇
        (220, 200),  # 天璣
        (280, 180),  # 天權
        (340, 160),  # 玉衡
        (380, 200),  # 開陽
        (400, 260),  # 搖光
    ]
    
    # 繪製連接線
    line_color = (251, 191, 36, 150)  # 金色半透明
    line_width = max(1, int(2 * scale))
    
    for i in range(len(stars_base) - 1):
        x1, y1 = stars_base[i]
        x2, y2 = stars_base[i + 1]
        x1, y1 = int(x1 * scale), int(y1 * scale)
        x2, y2 = int(x2 * scale), int(y2 * scale)
        draw.line([(x1, y1), (x2, y2)], fill=line_color, width=line_width)
    
    # 繪製星星
    star_color = (251, 191, 36)  # 金色
    star_r = max(3, int(8 * scale))
    
    for i, (x, y) in enumerate(stars_base):
        sx = int(x * scale)
        sy = int(y * scale)
        r = star_r if i < 4 else int(star_r * 0.8)
        
        # 發光效果
        for gr in range(r + 4, r, -1):
            alpha = int(100 * (1 - (gr - r) / 4))
            draw.ellipse(
                [(sx - gr, sy - gr), (sx + gr, sy + gr)],
                fill=(251, 191, 36, alpha)
            )
        
        # 實心星星
        draw.ellipse(
            [(sx - r, sy - r), (sx + r, sy + r)],
            fill=star_color
        )
    
    # 中心光環
    cx, cy = size // 2, size // 2
    ring_r = int(size * 0.35)
    ring_w = max(2, int(4 * scale))
    
    for i in range(ring_w):
        draw.ellipse(
            [(cx - ring_r - i, cy - ring_r - i), 
             (cx + ring_r + i, cy + ring_r + i)],
            outline=(139, 92, 246, 100),  # 紫色
            width=1
        )
    
    # 文字「北斗」
    font_size = int(size * 0.18)
    try:
        # 嘗試載入系統字型
        font = ImageFont.truetype("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", font_size)
        except:
            # 使用預設字型
            font = ImageFont.load_default()
    
    text = "北斗"
    text_y = int(size * 0.68)
    
    # 取得文字大小
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_x = (size - text_width) // 2
    
    # 繪製文字陰影
    draw.text((text_x + 2, text_y + 2), text, fill=(0, 0, 0, 128), font=font)
    # 繪製文字
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    
    return img

def create_quiz_icon(size):
    """測驗快捷圖示"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    radius = size // 6
    draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=(139, 92, 246))
    
    font_size = size // 2
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "?"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_x = (size - (bbox[2] - bbox[0])) // 2
    text_y = (size - (bbox[3] - bbox[1])) // 2 - bbox[1]
    
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    
    return img

def create_dashboard_icon(size):
    """儀表板快捷圖示"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    radius = size // 6
    draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=(16, 185, 129))
    
    # 繪製方塊
    p = int(size * 0.15)
    s = int(size * 0.3)
    
    draw.rounded_rectangle([(p, p), (p + s, p + s)], radius=4, fill=(255, 255, 255, 230))
    draw.rounded_rectangle([(p + s + p, p), (p + s + p + s, p + s)], radius=4, fill=(255, 255, 255, 230))
    draw.rounded_rectangle([(p, p + s + p), (size - p, size - p)], radius=4, fill=(255, 255, 255, 230))
    
    return img

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("生成 PWA PNG Icons...")
    
    for size in SIZES:
        img = create_icon(size)
        path = os.path.join(OUTPUT_DIR, f'icon-{size}.png')
        img.save(path, 'PNG')
        print(f"  ✓ icon-{size}.png")
    
    # 快捷圖示
    quiz = create_quiz_icon(96)
    quiz.save(os.path.join(OUTPUT_DIR, 'quiz-icon.png'), 'PNG')
    print("  ✓ quiz-icon.png")
    
    dashboard = create_dashboard_icon(96)
    dashboard.save(os.path.join(OUTPUT_DIR, 'dashboard-icon.png'), 'PNG')
    print("  ✓ dashboard-icon.png")
    
    print(f"\n完成！共 {len(SIZES) + 2} 個 PNG 圖示")
    print(f"位置: {OUTPUT_DIR}")

if __name__ == '__main__':
    main()
