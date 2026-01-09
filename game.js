// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 500;

// Game state
let game = {
    score: 0,
    health: 100,
    level: 1,
    isRunning: false,
    isPaused: false,
    enemies: [],
    bullets: [],
    particles: [],
    enemySpawnTimer: 0,
    enemySpawnRate: 60, // frames between enemy spawns
    maxEnemies: 10,
    gameOver: false
};

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    color: '#00ffea',
    shootCooldown: 0,
    shootDelay: 15
};

// Key states
const keys = {};

// Event Listeners
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Pause game with P key
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// Image loading (using placeholders - you can replace with your PNGs)
const images = {
    player: new Image(),
    enemy: new Image(),
    bullet: new Image(),
    background: new Image()
};

// Create placeholder images (you should replace these with your actual PNGs)
function createPlaceholderImages() {
    // Create player image
    const playerCanvas = document.createElement('canvas');
    playerCanvas.width = 50;
    playerCanvas.height = 50;
    const playerCtx = playerCanvas.getContext('2d');
    
    // Draw player ship
    playerCtx.fillStyle = '#00ffea';
    playerCtx.beginPath();
    playerCtx.moveTo(25, 0);
    playerCtx.lineTo(50, 50);
    playerCtx.lineTo(0, 50);
    playerCtx.closePath();
    playerCtx.fill();
    
    playerCtx.fillStyle = '#0088ff';
    playerCtx.beginPath();
    playerCtx.arc(25, 30, 15, 0, Math.PI * 2);
    playerCtx.fill();
    
    images.player.src = playerCanvas.toDataURL();
    
    // Create enemy image
    const enemyCanvas = document.createElement('canvas');
    enemyCanvas.width = 40;
    enemyCanvas.height = 40;
    const enemyCtx = enemyCanvas.getContext('2d');
    
    enemyCtx.fillStyle = '#ff0066';
    enemyCtx.beginPath();
    enemyCtx.arc(20, 20, 20, 0, Math.PI * 2);
    enemyCtx.fill();
    
    enemyCtx.fillStyle = '#000';
    enemyCtx.beginPath();
    enemyCtx.arc(20, 20, 8, 0, Math.PI * 2);
    enemyCtx.fill();
    
    images.enemy.src = enemyCanvas.toDataURL();
    
    // Create bullet image
    const bulletCanvas = document.createElement('canvas');
    bulletCanvas.width = 5;
    bulletCanvas.height = 15;
    const bulletCtx = bulletCanvas.getContext('2d');
    
    bulletCtx.fillStyle = '#ffff00';
    bulletCtx.fillRect(0, 0, 5, 15);
    
    bulletCtx.fillStyle = '#ff9900';
    bulletCtx.fillRect(0, 0, 5, 5);
    
    images.bullet.src = bulletCanvas.toDataURL();
    
    // Create background
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    const bgCtx = bgCanvas.getContext('2d');
    
    // Draw starfield background
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        const brightness = Math.random() * 100 + 155;
        
        bgCtx.fillStyle = `rgb(${brightness}, ${brightness}, 255)`;
        bgCtx.beginPath();
        bgCtx.arc(x, y, size, 0, Math.PI * 2);
        bgCtx.fill();
    }
    
    images.background.src = bgCanvas.toDataURL();
}

// Initialize game
function init() {
    createPlaceholderImages();
    gameLoop();
}

// Start game
function startGame() {
    if (!game.isRunning && !game.gameOver) {
        game.isRunning = true;
        game.isPaused = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> RESUME';
        startBtn.classList.remove('btn-primary');
        startBtn.classList.add('btn-success');
    }
}

// Toggle pause
function togglePause() {
    if (game.isRunning && !game.gameOver) {
        game.isPaused = !game.isPaused;
        pauseBtn.innerHTML = game.isPaused ? 
            '<i class="fas fa-play"></i> RESUME' : 
            '<i class="fas fa-pause"></i> PAUSE';
    }
}

// Restart game
function restartGame() {
    game = {
        score: 0,
        health: 100,
        level: 1,
        isRunning: true,
        isPaused: false,
        enemies: [],
        bullets: [],
        particles: [],
        enemySpawnTimer: 0,
        enemySpawnRate: 60,
        maxEnemies: 10,
        gameOver: false
    };
    
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 60;
    player.shootCooldown = 0;
    
    scoreElement.textContent = game.score;
    healthElement.textContent = game.health;
    levelElement.textContent = game.level;
    
    startBtn.innerHTML = '<i class="fas fa-play"></i> RESUME';
    startBtn.classList.remove('btn-primary');
    startBtn.classList.add('btn-success');
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
}

// Create enemy
function createEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 1 + game.level * 0.2,
        color: '#ff0066',
        health: 1
    };
    
    game.enemies.push(enemy);
}

// Create bullet
function createBullet(x, y) {
    const bullet = {
        x: x,
        y: y,
        width: 5,
        height: 15,
        speed: 10,
        color: '#ffff00'
    };
    
    game.bullets.push(bullet);
}

// Create particle effect
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const particle = {
            x: x,
            y: y,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            color: color,
            life: 30
        };
        
        game.particles.push(particle);
    }
}

// Update game state
function update() {
    if (!game.isRunning || game.isPaused || game.gameOver) return;
    
    // Update player
    if (keys['arrowleft'] || keys['a']) player.x = Math.max(0, player.x - player.speed);
    if (keys['arrowright'] || keys['d']) player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    if (keys['arrowup'] || keys['w']) player.y = Math.max(0, player.y - player.speed);
    if (keys['arrowdown'] || keys['s']) player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    
    // Shooting
    if (player.shootCooldown > 0) player.shootCooldown--;
    
    if ((keys[' '] || keys['spacebar']) && player.shootCooldown === 0) {
        createBullet(player.x + player.width / 2 - 2.5, player.y);
        player.shootCooldown = player.shootDelay;
    }
    
    // Spawn enemies
    game.enemySpawnTimer++;
    if (game.enemySpawnTimer >= game.enemySpawnRate && game.enemies.length < game.maxEnemies) {
        createEnemy();
        game.enemySpawnTimer = 0;
        
        // Increase spawn rate every level
        game.enemySpawnRate = Math.max(20, 60 - game.level * 5);
    }
    
    // Update enemies
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        enemy.y += enemy.speed;
        
        // Check if enemy hits player
        if (enemy.y + enemy.height > player.y &&
            enemy.y < player.y + player.height &&
            enemy.x + enemy.width > player.x &&
            enemy.x < player.x + player.width) {
            
            game.health -= 10;
            healthElement.textContent = game.health;
            createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ff0000', 10);
            game.enemies.splice(i, 1);
            
            if (game.health <= 0) {
                gameOver();
            }
            continue;
        }
        
        // Remove enemy if off screen
        if (enemy.y > canvas.height) {
            game.enemies.splice(i, 1);
        }
    }
    
    // Update bullets
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        bullet.y -= bullet.speed;
        
        // Check bullet collision with enemies
        for (let j = game.enemies.length - 1; j >= 0; j--) {
            const enemy = game.enemies[j];
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // Hit!
                game.score += 10;
                scoreElement.textContent = game.score;
                createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ffff00', 15);
                
                game.enemies.splice(j, 1);
                game.bullets.splice(i, 1);
                
                // Level up every 100 points
                if (game.score >= game.level * 100) {
                    game.level++;
                    levelElement.textContent = game.level;
                    game.health = Math.min(100, game.health + 20);
                    healthElement.textContent = game.health;
                }
                break;
            }
        }
        
        // Remove bullet if off screen
        if (bullet.y < -bullet.height) {
            game.bullets.splice(i, 1);
        }
    }
    
    // Update particles
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const particle = game.particles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;
        
        if (particle.life <= 0) {
            game.particles.splice(i, 1);
        }
    }
}

// Draw game
function draw() {
    // Clear canvas with background
    ctx.drawImage(images.background, 0, 0);
    
    // Draw player
    ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
    
    // Draw enemies
    game.enemies.forEach(enemy => {
        ctx.drawImage(images.enemy, enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    // Draw bullets
    game.bullets.forEach(bullet => {
        ctx.drawImage(images.bullet, bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw particles
    game.particles.forEach(particle => {
        ctx.globalAlpha = particle.life / 30;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    // Draw player health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(10, 10, (game.health / 100) * 200, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 200, 20);
    
    // Draw score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`SCORE: ${game.score}`, canvas.width - 150, 30);
    ctx.fillText(`LEVEL: ${game.level}`, canvas.width - 150, 60);
    
    // Draw game over screen
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff0066';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.fillStyle = '#00ffea';
        ctx.font = '30px Arial';
        ctx.fillText(`FINAL SCORE: ${game.score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(`LEVEL REACHED: ${game.level}`, canvas.width / 2, canvas.height / 2 + 60);
        
        ctx.font = '20px Arial';
        ctx.fillText('Click RESTART to play again', canvas.width / 2, canvas.height / 2 + 120);
        ctx.textAlign = 'left';
    }
    
    // Draw pause screen
    if (game.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('Press P or click RESUME to continue', canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = 'left';
    }
}

// Game over
function gameOver() {
    game.isRunning = false;
    game.gameOver = true;
    startBtn.innerHTML = '<i class="fas fa-play"></i> START GAME';
    startBtn.classList.remove('btn-success');
    startBtn.classList.add('btn-primary');
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize the game when page loads
window.addEventListener('load', init);
