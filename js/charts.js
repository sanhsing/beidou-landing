/**
 * charts.js - 北斗教育圖表組件
 * 使用 Chart.js CDN
 */

const BeidouCharts = (function() {
  
  // 配色方案
  const COLORS = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    subjects: {
      '數學': '#6366f1',
      '物理': '#8b5cf6',
      '化學': '#22c55e',
      '生物': '#f59e0b',
      '國文': '#ef4444',
      '英文': '#3b82f6',
      '歷史': '#ec4899',
      '地理': '#14b8a6',
      '公民': '#f97316',
      '地科': '#06b6d4'
    },
    gradient: (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    }
  };

  // 通用選項
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  /**
   * 環形進度圖
   */
  function progressRing(canvasId, percentage, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const color = percentage >= 80 ? COLORS.success : 
                  percentage >= 60 ? COLORS.warning : COLORS.danger;

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [percentage, 100 - percentage],
          backgroundColor: [color, '#e5e7eb'],
          borderWidth: 0,
          cutout: '75%'
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          tooltip: { enabled: false }
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: (chart) => {
          const { ctx, width, height } = chart;
          ctx.save();
          ctx.font = `bold ${options.fontSize || 24}px system-ui`;
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${percentage}%`, width / 2, height / 2);
          ctx.restore();
        }
      }]
    });
  }

  /**
   * 科目進度條
   */
  function subjectBars(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const labels = data.map(d => d.subject || d.subject_id);
    const values = data.map(d => d.mastery || d.avg_mastery || 0);
    const colors = labels.map(l => COLORS.subjects[l] || COLORS.primary);

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        ...defaultOptions,
        indexAxis: 'y',
        scales: {
          x: {
            max: 100,
            grid: { display: false },
            ticks: { callback: v => v + '%' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * 趨勢折線圖
   */
  function trendLine(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const labels = data.map(d => d.date || d.label);
    const values = data.map(d => d.value || d.accuracy || d.count);

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: options.color || COLORS.primary,
          backgroundColor: COLORS.gradient(ctx.getContext('2d'), 
            (options.color || COLORS.primary) + '40', 
            (options.color || COLORS.primary) + '05'),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        ...defaultOptions,
        scales: {
          x: { grid: { display: false } },
          y: { 
            beginAtZero: true,
            grid: { color: '#f3f4f6' }
          }
        }
      }
    });
  }

  /**
   * 雷達圖 (科目能力)
   */
  function radarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const labels = data.map(d => d.subject || d.label);
    const values = data.map(d => d.mastery || d.value || 0);

    return new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: COLORS.primary + '30',
          borderColor: COLORS.primary,
          borderWidth: 2,
          pointBackgroundColor: COLORS.primary,
          pointRadius: 4
        }]
      },
      options: {
        ...defaultOptions,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 }
          }
        }
      }
    });
  }

  /**
   * 圓餅圖 (分佈)
   */
  function pieChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);
    const colors = [COLORS.success, COLORS.info, COLORS.warning, COLORS.danger];

    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });
  }

  /**
   * 迷你統計數字
   */
  function statNumber(elementId, value, options = {}) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const target = parseInt(value) || 0;
    const duration = options.duration || 1000;
    const start = performance.now();

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.floor(progress * target);
      el.textContent = options.format ? options.format(current) : current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = options.format ? options.format(target) : target;
      }
    }

    requestAnimationFrame(animate);
  }

  return {
    COLORS,
    progressRing,
    subjectBars,
    trendLine,
    radarChart,
    pieChart,
    statNumber
  };
})();

window.BeidouCharts = BeidouCharts;
