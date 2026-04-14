const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Добавь любой символ после вопросительного знака
const jumpSound = new Audio('Jump.mp3?v=1');
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- НАСТРОЙКИ ФИЗИКИ ---
const GRAVITY = 0.2;
const JUMP_STRENGTH = -5.2;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 95; 

let frames = 0;
let score = 0;
let gameState = "START"; 

const banana = {
    x: 80,
    y: canvas.height / 2,
    w: 50,
    h: 30,
    velocity: 0,
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);
        ctx.rotate(Math.min(Math.PI/4, Math.max(-Math.PI/4, this.velocity * 0.08)));
        const p = 4;
        const drawPixel = (x, y, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * p, y * p, p, p);
        };
        const yellow = "#FFE135";
        const darkYellow = "#FFB900";
        const brown = "#4B301A";
        drawPixel(4, -2, brown);
        drawPixel(3, -1, brown);
        [0,1,2].forEach(x => drawPixel(x, 0, yellow));
        [-1, -2].forEach(x => drawPixel(x, 1, yellow));
        [-3, -2, -1, 0, 1, 2].forEach(x => drawPixel(x, 1, yellow));
        [-4, -3, -2, -1, 0, 1].forEach(x => drawPixel(x, 2, yellow));
        [-3, -2, -1, 0].forEach(x => drawPixel(x, 3, yellow));
        drawPixel(-2, 3, darkYellow);
        drawPixel(-1, 3, darkYellow);
        drawPixel(0, 2, darkYellow);
        drawPixel(1, 1, darkYellow);
        drawPixel(-5, 2, brown);
        ctx.restore();
    },
    update() {
        if (gameState === "PLAY") {
            this.velocity += GRAVITY;
            this.y += this.velocity;
            if (this.y + this.h > canvas.height || this.y < 0) gameState = "OVER";
        }
    },
    jump() { 
        this.velocity = JUMP_STRENGTH;
        // Воспроизведение звука при прыжке
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {}); 
    }
};

const pipes = {
    list: [],
    gap: 170,
    width: 70,
    draw() {
        this.list.forEach(p => {
            ctx.fillStyle = "#6d4c41"; 
            ctx.fillRect(p.x, 0, this.width, p.y);
            ctx.fillRect(p.x, p.y + this.gap, this.width, canvas.height);
            ctx.fillStyle = "#4e342e";
            for(let i = 20; i < canvas.height; i += 50) {
                if (i < p.y - 10 || i > p.y + this.gap + 10) {
                    ctx.fillRect(p.x + 5, i, this.width - 10, 8);
                }
            }
            ctx.fillStyle = "#2e7d32";
            ctx.fillRect(p.x - 10, p.y - 25, this.width + 20, 25);
            ctx.fillRect(p.x - 10, p.y + this.gap, this.width + 20, 25);
        });
    },
    update() {
        if (gameState !== "PLAY") return;
        if (frames % PIPE_SPAWN_RATE === 0) {
            let minY = 100;
            let maxY = canvas.height - this.gap - 100;
            this.list.push({ x: canvas.width, y: Math.floor(Math.random() * (maxY - minY)) + minY });
        }
        this.list.forEach((p, i) => {
            p.x -= PIPE_SPEED;
            if (banana.x + 10 < p.x + this.width && banana.x + banana.w - 10 > p.x &&
                (banana.y + 5 < p.y || banana.y + banana.h - 5 > p.y + this.gap)) {
                gameState = "OVER";
            }
            if (p.x + this.width < 0) { this.list.splice(i, 1); score++; }
        });
    }
};

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#80d0ff");
    g.addColorStop(1, "#388e3c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pipes.update(); pipes.draw();
    banana.update(); banana.draw();
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 40px 'Courier New'";
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.fillText(score, canvas.width / 2, 80);
    ctx.shadowBlur = 0;
    if (gameState === "START") ctx.fillText("КЛИКНИ, ЧТОБЫ ЛЕТЕТЬ", canvas.width/2, canvas.height/2);
    if (gameState === "OVER") {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFF";
        ctx.fillText("ИГРА ОКОНЧЕНА", canvas.width/2, canvas.height/2);
        ctx.font = "20px 'Courier New'";
        ctx.fillText("Счёт: " + score + " | Клик для рестарта", canvas.width/2, canvas.height/2 + 50);
    }
    frames++;
    requestAnimationFrame(loop);
}

const input = () => {
    if (gameState === "START") gameState = "PLAY";
    else if (gameState === "PLAY") banana.jump();
    else { gameState = "START"; score = 0; banana.y = canvas.height/2; banana.velocity = 0; pipes.list = []; }
};

window.addEventListener("mousedown", (e) => {
    if(e.button === 0) input(); // Только ЛКМ
});
window.addEventListener("touchstart", (e) => { e.preventDefault(); input(); }, {passive: false});

loop();
