// Fixed internal resolution
const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: { create, update }
};

new Phaser.Game(config);

let player, bullets, enemies, boss;
let moveDirection = 0;
let canShoot = true;
let bossHP = 10;
let gameEnded = false;

/* CREATE */

function create() {
  // Dark cyber background
  this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x050f0c).setOrigin(0);

  // Player as rectangle
  player = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 70, 32, 32, 0x00ffcc);
  this.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);

  bullets = this.physics.add.group();
  enemies = this.physics.add.group();

  spawnEnemies(this);

  this.physics.add.overlap(bullets, enemies, destroyEnemy, null, this);

  createTouchUI(this);
}

/* UPDATE */

function update() {
  if (gameEnded) return;

  player.body.setVelocityX(moveDirection * 180);

  enemies.children.each(e => {
    e.y += 0.8;
  });

  if (boss) boss.y += 0.4;
}

/* LOGIC */

function spawnEnemies(scene) {
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 60;
    const e = scene.add.rectangle(x, -40, 28, 28, 0xff2233);
    scene.physics.add.existing(e);
    enemies.add(e);
  }
}

function shoot() {
  if (!canShoot || gameEnded) return;

  const b = this.add.rectangle(player.x, player.y - 20, 4, 14, 0x00ffff);
  this.physics.add.existing(b);
  b.body.setVelocityY(-360);
  bullets.add(b);

  canShoot = false;
  this.time.delayedCall(300, () => (canShoot = true));
}

function destroyEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();

  if (enemies.countActive(true) === 0 && !boss) {
    spawnBoss(this);
  }
}

function spawnBoss(scene) {
  boss = scene.add.rectangle(GAME_WIDTH/2, -80, 120, 80, 0xff5511);
  scene.physics.add.existing(boss);

  scene.physics.add.overlap(bullets, boss, hitBoss, null, scene);
}

function hitBoss(_, bossRectangle) {
  bossHP--;
  if (bossHP <= 0) {
    bossRectangle.destroy();
    showWinScreen(this);
  }
}

/* END */

function showWinScreen(scene) {
  gameEnded = true;
  scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85).setOrigin(0);
  scene.add.text(
    GAME_WIDTH/2,
    GAME_HEIGHT/2,
    "SYSTEM BREACHED\nGOTHALIENBOY IS FREE",
    { fontSize: '18px', color: '#00ffcc', align: 'center' }
  ).setOrigin(0.5);
}

/* TOUCH UI */

function createTouchUI(scene) {
  const style = {
    fontSize: '24px',
    backgroundColor: '#111',
    color: '#00ffcc',
    padding: { x: 14, y: 6 }
  };

  const leftBtn = scene.add.text(20, GAME_HEIGHT - 60, "◀", style).setInteractive();
  const rightBtn = scene.add.text(80, GAME_HEIGHT - 60, "▶", style).setInteractive();
  const fireBtn = scene.add.text(GAME_WIDTH - 70, GAME_HEIGHT - 60, "🔥", style).setInteractive();

  leftBtn.on('pointerdown', () => moveDirection = -1);
  leftBtn.on('pointerup', () => moveDirection = 0);
  leftBtn.on('pointerout', () => moveDirection = 0);

  rightBtn.on('pointerdown', () => moveDirection = 1);
  rightBtn.on('pointerup', () => moveDirection = 0);
  rightBtn.on('pointerout', () => moveDirection = 0);

  fireBtn.on('pointerdown', shoot, scene);
}
