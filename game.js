/*********************************************************
 GOTHALIENBOY: CYBERHEIST FROM KAGISO
 SEASON 1 — ALL EPISODES
 STATIC | GITHUB PAGES SAFE
*********************************************************/

const WIDTH = 960;
const HEIGHT = 540;

const GAME_STATE = {
  MENU: 0,
  STORY: 1,
  PLAY: 2,
  BOSS: 3,
  END: 4
};

let state = GAME_STATE.MENU;
let episode = 1;

let player, bullets, enemies, drones, dataNodes, powerUps, boss;
let cursors, fireKey;
let uiMain, uiHUD;

let score = 0;
let health = 100;
let shield = 0;
let bossHealth = 0;

const save = JSON.parse(localStorage.getItem("gab_save")) || {
  unlockedEpisode: 1,
  highScore: 0
};

const EPISODES = {
  1: {
    title: "KAGISO // SIGNALS",
    story: "They mined the township.\nYou found the code.",
    enemies: true,
    drones: false,
    boss: false,
    target: 200
  },
  2: {
    title: "BLACKOUT ECONOMY",
    story: "Power became currency.\nYou became dangerous.",
    enemies: true,
    drones: false,
    boss: false,
    target: 300
  },
  3: {
    title: "THE FIREWALL",
    story: "Surveillance everywhere.\nNo more hiding.",
    enemies: true,
    drones: true,
    boss: false,
    target: 400
  },
  4: {
    title: "THE CORE",
    story: "This system feeds on the poor.\nEnd it.",
    enemies: true,
    drones: true,
    boss: true,
    target: 0
  }
};

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 900 } }
  },
  scene: { preload, create, update }
};

new Phaser.Game(config);

/* ================= PRELOAD ================= */

function preload() {
  ["bg","player","enemy","drone","boss","bullet","data","power"]
    .forEach(a => this.load.image(a, `assets/${a}.png`));
}

/* ================= CREATE ================= */

function create() {
  this.add.image(WIDTH/2, HEIGHT/2, "bg").setAlpha(0.35);

  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey("Z");

  showMenu.call(this);

  this.input.keyboard.on("keydown-SPACE", () => {
    if (state === GAME_STATE.MENU) showStory.call(this);
    else if (state === GAME_STATE.STORY) startEpisode.call(this);
    else if (state === GAME_STATE.END) showMenu.call(this);
  });
}

/* ================= MENU ================= */

function showMenu() {
  clearScene.call(this);
  state = GAME_STATE.MENU;

  uiMain = this.add.text(WIDTH/2, HEIGHT/2,
`GOTHALIENBOY
CYBERHEIST FROM KAGISO

UNLOCKED EPISODES: ${save.unlockedEpisode}
HIGH SCORE: ${save.highScore}

PRESS SPACE`,
  { fill:"#00ffcc", fontSize:"22px", align:"center" }
  ).setOrigin(0.5);
}

/* ================= STORY ================= */

function showStory() {
  state = GAME_STATE.STORY;
  uiMain.setText(
`${EPISODES[episode].title}

${EPISODES[episode].story}

PRESS SPACE`
  );
}

/* ================= EPISODE ================= */

function startEpisode() {
  clearScene.call(this);
  state = GAME_STATE.PLAY;

  score = 0;
  health = 100;
  shield = 0;
  boss = null;

  player = this.physics.add.sprite(120, 420, "player");
  player.setCollideWorldBounds(true);

  bullets = this.physics.add.group();
  enemies = this.physics.add.group();
  drones = this.physics.add.group();
  dataNodes = this.physics.add.group();
  powerUps = this.physics.add.group();

  uiHUD = this.add.text(20, 20, "", { fill:"#00ffcc" });

  this.physics.add.overlap(bullets, enemies, destroyEnemy, null, this);
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);
  this.physics.add.overlap(player, dataNodes, collectData, null, this);
  this.physics.add.overlap(player, powerUps, collectPower, null, this);
  this.physics.add.collider(player, enemies, playerHit, null, this);
  this.physics.add.collider(player, drones, playerHit, null, this);

  this.time.addEvent({ delay:1200, callback:spawnEnemy, callbackScope:this, loop:true });
  this.time.addEvent({ delay:1000, callback:spawnData, callbackScope:this, loop:true });
  this.time.addEvent({ delay:4000, callback:spawnPower, callbackScope:this, loop:true });

  if (EPISODES[episode].drones) {
    this.time.addEvent({ delay:2000, callback:spawnDrone, callbackScope:this, loop:true });
  }
}

/* ================= UPDATE ================= */

function update() {
  if (state !== GAME_STATE.PLAY && state !== GAME_STATE.BOSS) return;

  uiHUD.setText(
`${EPISODES[episode].title}
DATA: ${score}
HP: ${health}
SHIELD: ${shield}`
  );

  if (cursors.left.isDown) player.setVelocityX(-300);
  else if (cursors.right.isDown) player.setVelocityX(300);
  else player.setVelocityX(0);

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-550);
  }

  if (Phaser.Input.Keyboard.JustDown(fireKey)) {
    bullets.create(player.x+20, player.y, "bullet").setVelocityX(700);
  }

  if (EPISODES[episode].boss && score >= 400 && !boss) spawnBoss.call(this);
  if (!EPISODES[episode].boss && score >= EPISODES[episode].target) endEpisode.call(this, true);
}

/* ================= SPAWN ================= */

function spawnEnemy() {
  enemies.create(WIDTH+40, 420, "enemy").setVelocityX(-260);
}

function spawnDrone() {
  drones.create(WIDTH+40, Phaser.Math.Between(120,280), "drone").setVelocityX(-320);
}

function spawnData() {
  dataNodes.create(WIDTH+40, Phaser.Math.Between(200,420), "data").setVelocityX(-220);
}

function spawnPower() {
  powerUps.create(WIDTH+40, Phaser.Math.Between(200,420), "power").setVelocityX(-200);
}

function spawnBoss() {
  state = GAME_STATE.BOSS;
  bossHealth = 500;
  boss = this.physics.add.sprite(WIDTH-180, 360, "boss");
  boss.body.allowGravity = false;
}

/* ================= COLLISIONS ================= */

function destroyEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();
  score += 20;
}

function collectData(player, data) {
  data.destroy();
  score += 10;
}

function collectPower(player, power) {
  power.destroy();
  shield = Math.min(100, shield + 40);
}

function playerHit() {
  if (shield > 0) shield -= 25;
  else health -= 25;

  if (health <= 0) endEpisode.call(this, false);
}

function hitBoss(bullet) {
  bullet.destroy();
  bossHealth -= 10;
  if (bossHealth <= 0) endEpisode.call(this, true);
}

/* ================= END ================= */

function endEpisode(win) {
  state = GAME_STATE.END;
  clearScene.call(this);

  if (win && episode === save.unlockedEpisode && episode < 4) {
    save.unlockedEpisode++;
  }

  save.highScore = Math.max(save.highScore, score);
  localStorage.setItem("gab_save", JSON.stringify(save));

  uiMain = this.add.text(WIDTH/2, HEIGHT/2,
win
? `EPISODE CLEARED

YOU DIDN'T ESCAPE THE GHETTO.
YOU REWROTE IT.

PRESS SPACE`
: `SYSTEM FAILURE

PRESS SPACE`,
  { fill: win ? "#00ffcc" : "#ff0044", fontSize:"22px", align:"center" }
  ).setOrigin(0.5);

  if (win && episode < 4) episode++;
}

/* ================= UTILITY ================= */

function clearScene() {
  this.physics.world.colliders.destroy();
  this.children.removeAll();
  this.add.image(WIDTH/2, HEIGHT/2, "bg").setAlpha(0.35);
}
