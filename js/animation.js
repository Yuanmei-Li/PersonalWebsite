class LorenzSystem {
    constructor(x, y, z, sigma = 10, rho = 28, beta = 2.667) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.sigma = sigma;
        this.rho = rho;
        this.beta = beta;
        this.history = [];
    }

    update(dt, coupling = 0) {
        const dx = this.sigma * (this.y - this.x) + coupling;
        const dy = this.x * (this.rho - this.z) - this.y;
        const dz = this.x * this.y - this.beta * this.z;

        this.x += dx * dt;
        this.y += dy * dt;
        this.z += dz * dt;

        this.history.push({ x: this.x, y: this.y, z: this.z });
    }
}

class ChaosAnimation {
    constructor(canvasId) {
        try {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas with id ${canvasId} not found.`);
            }
            this.ctx = this.canvas.getContext('2d');
            this.width = this.canvas.width = 800;
            this.height = this.canvas.height = 500;
            this.trailLength = 200;
            this.particleSize = 2;

            this.system1 = new LorenzSystem(0.1, 0, 0);
            this.system2 = new LorenzSystem(5, 5, 5);

            this.scale = 8;
            this.offset = { x: this.width / 2, y: this.height / 2 };

            this.time = 0;
            
            // 监听主题变化
            this.theme = document.body.classList.contains('day-mode') ? 'day' : 'night';
            this.observer = new MutationObserver(() => {
                this.theme = document.body.classList.contains('day-mode') ? 'day' : 'night';
            });
            this.observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        } catch (error) {
            console.error('Error initializing ChaosAnimation:', error);
        }
    }

    projectPoint(x, y, z) {
        return {
            x: x * this.scale + this.offset.x,
            y: y * this.scale + this.offset.y
        };
    }

    draw() {
        try {
            // 根据主题设置背景
            this.ctx.fillStyle = this.theme === 'day' ? 'rgba(255, 255, 255, 1)' : 'rgba(10, 10, 20, 1)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            const dt = 0.01;
            this.time += dt;
            const couplingStrength = 0.5 * (1 + Math.sin(this.time * 0.5));
            this.system1.update(dt, couplingStrength * Math.sin(this.time * 0.3));
            this.system2.update(dt, couplingStrength * Math.cos(this.time * 0.3));

            this.drawSystem(this.system1, this.theme === 'day' ? 220 : 200);
            this.drawSystem(this.system2, this.theme === 'day' ? 40 : 350);

            requestAnimationFrame(() => this.draw());
        } catch (error) {
            console.error('Error in draw method:', error);
        }
    }

    drawSystem(sys, baseHue) {
        const points = sys.history.slice(-this.trailLength);
        
        // 绘制粒子点
        points.forEach((p, i) => {
            const pos = this.projectPoint(p.x, p.y, p.z);
            const alpha = i / points.length;
            const size = this.particleSize;

            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            
            // 根据主题设置粒子颜色
            if (this.theme === 'day') {
                this.ctx.fillStyle = `hsla(${baseHue}, 70%, 30%, ${0.2 + alpha * 0.6})`;
            } else {
                this.ctx.fillStyle = `hsla(${baseHue}, 90%, 60%, ${0.2 + alpha * 0.6})`;
            }
            
            this.ctx.fill();
        });
    }

    setTrailLength(length) {
        this.trailLength = length;
    }
}

const anim = new ChaosAnimation('chaosSyncCanvas');
anim.draw();

const resetAnimation = () => {
    anim.system1 = new LorenzSystem(0.1, 0, 0);
    anim.system2 = new LorenzSystem(5, 5, 5);
};

const updateTrailLength = (val) => {
    anim.setTrailLength(parseInt(val));
    document.getElementById('trailValue').textContent = val;
};