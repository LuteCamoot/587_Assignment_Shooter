//Window properties
const GAMEWIDTH = 960;
const GAMEHEIGHT = 540;

//Gun states
const READY_STATE = 0;
const COCKING_STATE = 1;
const COCKED_STATE = 2;
const FIRING_STATE = 3;

//Target states
const UP_STATE = 0;
const DOWN_STATE = 1;

//Inputs
let cursors;
let w_input;
let s_input;
let reset_input;

let NUM_BULLET_SPRITES = 8;
let ammo;

let player_spr;
let target_array = [];
let bullet_array = [];
let score = 0;
let score_text;
let ammo_text;

let laser_length = 2000;
let laser_fx;

let shotPoints = 0;
let scavengerUsed = false;

let followUpShot = 0;

class Menu extends Phaser.Scene {
    constructor() { super("Menu"); }
    create() {
        let play_text = this.add.text(GAMEWIDTH / 2, GAMEHEIGHT /2, "PLAY", {fontSize: "36px", color: "#000000"}).setOrigin(0.5,0.5);
        play_text.setInteractive();
        play_text.on("pointerdown", this.startGame, this);
    }
    startGame() { this.scene.start("Game"); }
}

class Game extends Phaser.Scene {
    constructor() { super("Game"); }
    preload() {
        this.load.spritesheet('gun_spr', 'assets/gunWIPSpritesheet.png', { frameWidth: 140, frameHeight: 60 });
        this.load.spritesheet('target_spr', 'assets/WIPTargetSpritesheet.png', { frameWidth: 110, frameHeight: 64 });
        this.load.image('bullet_img', 'assets/BulletSpriteWIP.png');
    }
    create() {
        this.anims.create({ key: "gunCock", frames: this.anims.generateFrameNumbers("gun_spr", {start: 0, end: 2}), frameRate: 10, repeat: 0})
        this.anims.create({ key: "gunFire", frames: this.anims.generateFrameNumbers("gun_spr", {start: 2, end: 7 }), frameRate: 20, repeat: 0})
        this.anims.create({ key: "targetDOWN", frames: this.anims.generateFrameNumbers("target_spr", {start:1, end: 4}), frameRate: 20, repeat: 0})
        this.anims.create({ key: "targetUP", frames: this.anims.generateFrameNumbers("target_spr", {frames: [4, 3, 2, 1] }), frameRate: 20, repeat: 0})

        player_spr = new Player(this, 0, GAMEHEIGHT * 0.5, "gun_spr");

        target_array[0] = new Target(this, Math.round(GAMEWIDTH * 0.79), Math.round(GAMEHEIGHT * 0.5), "target_spr");
        target_array[1] = new Target(this, Math.round(GAMEWIDTH * 0.9), Math.round(GAMEHEIGHT * 0.22), "target_spr");
        target_array[2] = new Target(this, Math.round(GAMEWIDTH * 0.9), Math.round(GAMEHEIGHT * 0.78), "target_spr");
        target_array[3] = new Target(this, Math.round(GAMEWIDTH * 0.79), Math.round(GAMEHEIGHT * 0.22), "target_spr");
        target_array[4] = new Target(this, Math.round(GAMEWIDTH * 0.79), Math.round(GAMEHEIGHT * 0.78), "target_spr");
        target_array[5] = new Target(this, Math.round(GAMEWIDTH * 0.9), Math.round(GAMEHEIGHT * 0.5), "target_spr");

        for (let id = 0; id < NUM_BULLET_SPRITES; id++) { bullet_array[id] = new Bullet(this, "bullet_img"); }
        ammo = getGunStats().ammo;

        laser_fx = this.add.graphics();
        
        cursors = this.input.keyboard.createCursorKeys();
        w_input = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        s_input = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        reset_input = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        score_text = this.add.text(GAMEWIDTH * 0.5, GAMEHEIGHT * 0.05, "SCORE: 0", {fontSize : "32px", color: "#000000"});
        score_text.setOrigin(0.5, 0);
        ammo_text = this.add.text(GAMEWIDTH * 0.5, GAMEHEIGHT * 0.20, "AMMO: " + ammo, {fontSize : "32px", color: "#000000"});
        ammo_text.setOrigin(0.5, 0);


        this.physics.world.setBoundsCollision(false, true, true, true);
        this.physics.world.on("worldbounds", (body, up, down, left, right) =>
             { let bullet_spr = body.gameObject;
                if (!(bullet_spr instanceof Bullet)) {return;}
                if (upgrades.polka && !bullet_spr.hasWarped) {
                    bullet_spr.warp(up,down,right); }
                    else { bullet_spr.useBounce(); bullet_spr.split(); }
                });
               
        this.physics.add.collider(bullet_array, target_array, bulletHitTarget, bulletPierce);
    }
    update() {
        player_spr.updateGun(cursors);
        if (cursors.space.isDown) {
            if (player_spr.state === READY_STATE && !shotInProgress()) { player_spr.cockGun(); }
            else if (player_spr.state === COCKED_STATE && ammo > 0) { 
                if (upgrades.shotgun) {
                    if (shootBullet()) { shotStarted(); } } 
                else
                    shotStarted(); 
            }
            }   
        if (upgrades.laser) { drawLaser(); }
        if (reset_input.isDown) {for(let t = 0; t < target_array.length; t++) { target_array[t].resetTarget(); }
            ammo = 6;
            ammo_text.setText("AMMO: " + ammo);}
        for (let id = 0; id < bullet_array.length; id++) { if (bullet_array[id].active) { bullet_array[id].updateBullet(); } }
    }
}
function bulletPierce(bullet_spr, target_spr) {
    let sniper = upgrades.sniper && target_spr.isBullseye(bullet_spr);
    if (!sniper) {
        if (bullet_spr.piercesLeft <= 0) {return true;}
        bullet_spr.piercesLeft--;
    }
        let fromBehind = bullet_spr.body.velocity.x < 0;
        scoreCalculate(bullet_spr, target_spr, fromBehind);
        bullet_spr.split();
        return false;
}

function drawLaser(){
    laser_fx.clear();
    let muzzle = player_spr.getMuzzle();
    let reach = new Phaser.Math.Vector2().setToPolar(player_spr.rotation, laser_length); //SET TO POLAR
    laser_fx.lineStyle(2, 0xff0000, 0.5);
    laser_fx.lineBetween(muzzle.x, muzzle.y, muzzle.x + reach.x, muzzle.y + reach.y);
}

function shootBullet() {
    let bullet_spr = Phaser.Actions.GetFirst(bullet_array, {active: false});
    if (!bullet_spr || ammo <= 0) {return false;}
    let muzzle = player_spr.getMuzzle();
    bullet_spr.fireBullet(muzzle.x, muzzle.y,player_spr.rotation);
    player_spr.recoil(getGunStats().recoil);
    ammo--
    ammo_text.setText("AMMO: " + ammo);
    return true;

}

function bulletHitTarget(bullet_spr, target_spr) {
    let fromBehind = bullet_spr.x > target_spr.x;
    scoreCalculate(bullet_spr,target_spr, fromBehind);
    bullet_spr.useBounce();
    bullet_spr.split();
}

function scoreCalculate(bullet_spr, target_spr, fromBehind) {
    let points = target_spr.getHitScore(bullet_spr);
        target_spr.targetHit(fromBehind);
        score += points;
        shotPoints += points;
        score_text.setText("SCORE: " + score);
}

function shotStarted() { 
    shotPoints = 0;
    shootAndAnimate();
    for (let i = 1; i < getGunStats().bulletsPerShot; i++) {
        followUpShot++;
        player_spr.scene.time.delayedCall(120 * i, () => {
            followUpShot--;
            shootAndAnimate();
            if (!shotInProgress()) {onShotEnded();}
        });
    }
}

function shootAndAnimate() {
    if (shootBullet()) {player_spr.fireGun();}
}

function onShotEnded() {
    if (upgrades.scavenger && !scavengerUsed && shotPoints <= 0) {
        scavengerUsed = true;
        ammo++
        ammo_text.setText("AMMO: " + ammo);
    }
}

function shotInProgress() {return followUpShot > 0 || Phaser.Actions.GetFirst(bullet_array, {active: true}) !== null; }

const config = {
    type: Phaser.AUTO,
    width: GAMEWIDTH,
    height: GAMEHEIGHT,
    backgroundColor: "#86dbfd",
    pixelArt: true,
    roundPixels: true,
    scale: { autoCenter: Phaser.Scale.CENTER_BOTH},
    physics: { default: "arcade", arcade: {gravity: { x: 0, y: 0}, fps: 120, debug: true}},
    scene: [Menu, Game],
};

const game = new Phaser.Game(config);