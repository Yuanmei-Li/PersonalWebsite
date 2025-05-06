// /js/particles.js
function initWaveCanvas() {
    const canvas = document.getElementById('wave-canvas');
    if (!canvas) {
        // 如果canvas不存在，延迟重试（应对动态加载场景）
        setTimeout(initWaveCanvas, 100);
        return;
    }

    const ctx = canvas.getContext('2d');
    const body = document.body;
    
    // 设置初始尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 颜色配置
    const colorSchemes = {
        'night-mode': {
            waveColor: 'rgba(7, 64, 236, 0.53)'
        },
        'day-mode': {
            waveColor: 'rgba(255, 255, 255, 0.28)'
        }
    };

    function getCurrentColors() {
        return body.classList.contains('day-mode') ? 
            colorSchemes['day-mode'] : colorSchemes['night-mode'];
    }

    // 波浪动画
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const colors = getCurrentColors();
        ctx.fillStyle = colors.waveColor;
        ctx.beginPath();

        const now = Date.now();
        const waveHeight = canvas.height * 0.7;
        const amplitude = 100 * Math.sin(now * 0.001);

        ctx.moveTo(0, canvas.height);

        for (let x = 0; x < canvas.width; x++) {
            const y = waveHeight +
                Math.sin(x * 0.005 + now * 0.001) * amplitude +
                Math.cos(x * 0.01 + now * 0.0007) * 20;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        requestAnimationFrame(animate);
    }

    // 响应式调整
    function handleResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // 事件监听
    window.addEventListener('resize', handleResize);
    
    // 主题变化观察
    const observer = new MutationObserver(() => {
        // 颜色变化会自动在下一次动画帧更新
    });
    observer.observe(body, {
        attributes: true,
        attributeFilter: ['class']
    });

    animate();
}

// 启动波浪动画
document.addEventListener('DOMContentLoaded', initWaveCanvas);