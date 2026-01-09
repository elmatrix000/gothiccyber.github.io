const W = 360;
const H = 640;

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: W,
  height: H,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: { create, update }
};

new Phaser.Game(config);

let player;
let bullets;
let enemies;
let boss = null;
let move = 0;
let canShoot = true;
let bossHP = 12;
let gameOver = false;

/* ================= CREATE ================= */

function create() {
  drawBackground(this);

  // PLAYER (RECTANGLE — SAFE)
  player = this.add.rectangle(W / 2, H - 80, 32, 32, 0x00ffcc);
  this.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);

  bullets = this.physics.add.group();
  enemies = this.physics.add.group();

  spawnEnemies(this);

  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  createControls(this);
}

/* ================= UPDATE ================= */

function update() {
  if (gameOver) return;

  player.body.setVelocityX(move * 220);

  enemies.children.iterate(e => {
    if (e) e.y += 0.8;
  });

  if (boss) boss.y += 0.3;
}

/* ================= BACKGROUND ================= */

function drawBackground(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0x071c18, 1);
  g.fillRect(0, 0, W, H);

  g.lineStyle(1, 0x003333, 0.4);
  for (let y = 0; y < H; y += 40) {
    g.lineBetween(0, y, W, y);
  }
}

/* ================= GAME LOGIC ================= */

function spawnEnemies(scene) {
  for (let i = 0; i < 6; i++) {
    const e = scene.add.rectangle(40 + i * 50, -50, 28, 28, 0xff0033);
    scene.physics.add.existing(e);
    enemies.add(e);
  }
}

function shoot(scene) {
  if (!canShoot || gameOver) return;

  const b = scene.add.rectangle(player.x, player.y - 20, 4, 16, 0x00ffff);
  scene.physics.add.existing(b);
  b.body.setVelocityY(-450);

  bullets.add(b);

  canShoot = false;
  scene.time.delayedCall(250, () => canShoot = true);
}

function hitEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();

  if (enemies.countActive(true) === 0 && !boss) {
    spawnBoss(this);
  }
}

function spawnBoss(scene) {
  boss = scene.add.rectangle(W / 2, -80, 120, 80, 0xff5500);
  scene.physics.add.existing(boss);

  scene.physics.add.overlap(bullets, boss, hitBoss, null, scene);
}

function hitBoss(bullet, bossSprite) {
  bullet.destroy();
  bossHP--;

  if (bossHP <= 0) {
    bossSprite.destroy();
    endGame(this);
  }
}

function endGame(scene) {
  gameOver = true;

  scene.add.rectangle(0, 0, W, H, 0x000000, 0.85).setOrigin(0);
  scene.add.text(
    W / 2,
    H / 2,
    "SYSTEM BREACHED\nGOTHALIENBOY IS FREE",
    {
      fontSize: "20px",
      color: "#00ffcc",
      align: "center"
    }
  ).setOrigin(0.5);
}

/* ================= CONTROLS ================= */

function createControls(scene) {
  const style = {
    fontSize: "24px",
    backgroundColor: "#111",
    color: "#00ffcc",
    padding: { x: 14, y: 6 }
  };

  const left = scene.add.text(20, H - 60, "◀", style).setInteractive();
  const right = scene.add.text(80, H - 60, "▶", style).setInteractive();
  const fire = scene.add.text(W - 70, H - 60, "🔥", style).setInteractive();

  left.on("pointerdown", () => move = -1);
  left.on("pointerup", () => move = 0);
  left.on("pointerout", () => move = 0);

  right.on("pointerdown", () => move = 1);
  right.on("pointerup", () => move = 0);
  right.on("pointerout", () => move = 0);

  fire.on("pointerdown", () => shoot(scene));
}
