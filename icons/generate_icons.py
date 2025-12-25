#!/usr/bin/env python3
"""
PWA Icons 生成器
北斗教育 × 織明

生成全套 PWA 圖示 (72-512px)
"""

import os
import math

# 圖示尺寸
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# 北斗教育 Logo SVG (北斗七星 + 教育主題)
LOGO_SVG = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1b4b"/>
      <stop offset="100%" style="stop-color:#312e81"/>
    </linearGradient>
    <linearGradient id="star" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="{glow}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="{size}" height="{size}" rx="{radius}" fill="url(#bg)"/>
  
  <!-- 北斗七星 -->
  <g filter="url(#glow)">
    {stars}
  </g>
  
  <!-- 中心光環 -->
  <circle cx="{cx}" cy="{cy}" r="{ring_r}" fill="none" 
          stroke="#8b5cf6" stroke-width="{ring_w}" opacity="0.6"/>
  
  <!-- 北斗文字 -->
  <text x="{cx}" y="{text_y}" text-anchor="middle" 
        fill="#ffffff" font-family="Arial, sans-serif" 
        font-size="{font_size}" font-weight="bold">北斗</text>
</svg>'''

def generate_star_positions(size):
    """計算北斗七星位置"""
    # 標準化到 512 基準
    scale = size / 512
    
    # 北斗七星座標 (基於 512px)
    stars_base = [
        (128, 150),  # 天樞
        (170, 180),  # 天璇
        (220, 200),  # 天璣
        (280, 180),  # 天權
        (340, 160),  # 玉衡
        (380, 200),  # 開陽
        (400, 260),  # 搖光
    ]
    
    stars = []
    star_r = max(4, int(8 * scale))
    
    for i, (x, y) in enumerate(stars_base):
        sx = int(x * scale)
        sy = int(y * scale)
        # 主星較大
        r = star_r if i < 4 else int(star_r * 0.8)
        stars.append(f'<circle cx="{sx}" cy="{sy}" r="{r}" fill="url(#star)"/>')
    
    # 連接線
    for i in range(len(stars_base) - 1):
        x1, y1 = stars_base[i]
        x2, y2 = stars_base[i + 1]
        x1, y1 = int(x1 * scale), int(y1 * scale)
        x2, y2 = int(x2 * scale), int(y2 * scale)
        stroke_w = max(1, int(2 * scale))
        stars.insert(0, f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#fbbf24" stroke-width="{stroke_w}" opacity="0.6"/>')
    
    return '\n    '.join(stars)

def generate_svg(size):
    """生成指定尺寸的 SVG"""
    scale = size / 512
    
    return LOGO_SVG.format(
        size=size,
        radius=int(size * 0.15),
        glow=max(2, int(4 * scale)),
        cx=int(size / 2),
        cy=int(size / 2),
        ring_r=int(size * 0.35),
        ring_w=max(2, int(4 * scale)),
        text_y=int(size * 0.72),
        font_size=int(size * 0.18),
        stars=generate_star_positions(size)
    )

def main():
    output_dir = '/home/claude/beidou_v12_8/frontend/icons'
    os.makedirs(output_dir, exist_ok=True)
    
    print("生成 PWA Icons...")
    
    for size in SIZES:
        svg_content = generate_svg(size)
        
        # 輸出 SVG (可用於轉換)
        svg_path = os.path.join(output_dir, f'icon-{size}.svg')
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        print(f"  ✓ icon-{size}.svg")
    
    # 生成快捷圖示
    quiz_svg = generate_quiz_icon(96)
    with open(os.path.join(output_dir, 'quiz-icon.svg'), 'w') as f:
        f.write(quiz_svg)
    print("  ✓ quiz-icon.svg")
    
    dashboard_svg = generate_dashboard_icon(96)
    with open(os.path.join(output_dir, 'dashboard-icon.svg'), 'w') as f:
        f.write(dashboard_svg)
    print("  ✓ dashboard-icon.svg")
    
    print(f"\n完成！共 {len(SIZES) + 2} 個圖示")
    print(f"位置: {output_dir}")
    print("\n注意: SVG 圖示需要轉換為 PNG")
    print("可使用: https://svgtopng.com/ 或 ImageMagick")

def generate_quiz_icon(size):
    """測驗圖示"""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" rx="{size//6}" fill="#8b5cf6"/>
  <text x="{size//2}" y="{size*0.65}" text-anchor="middle" 
        fill="white" font-size="{size//2}" font-family="Arial">?</text>
</svg>'''

def generate_dashboard_icon(size):
    """儀表板圖示"""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" rx="{size//6}" fill="#10b981"/>
  <rect x="{size*0.15}" y="{size*0.15}" width="{size*0.3}" height="{size*0.3}" rx="4" fill="white" opacity="0.9"/>
  <rect x="{size*0.55}" y="{size*0.15}" width="{size*0.3}" height="{size*0.3}" rx="4" fill="white" opacity="0.9"/>
  <rect x="{size*0.15}" y="{size*0.55}" width="{size*0.7}" height="{size*0.3}" rx="4" fill="white" opacity="0.9"/>
</svg>'''

if __name__ == '__main__':
    main()
