const GAMEWIDTH = 960;
const GAMEHEIGHT = 540;
const NUM_BULLETS = 5;

const READY_STATE = 0;
const COCKING_STATE = 1;
const COCKED_STATE = 2;
const FIRING_STATE = 3;

const UP_STATE = 0;
const DOWN_STATE = 1;

const HIT_DIST = 80;
const TARGET_POINTS = 100;

let cursors;
let space_key;
let player_spr;
let target_array = [];
let bullet_array = [];
let score = 0;
let score_text;

class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    create() {
        let play_text = this.add.text(GAMEWIDTH / 2, GAMEHEIGHT /2, "PLAY",
             {fontSize: "36px", color: "#000000"}).setOrigin(0.5,0.5);
        play_text.setInteractive();
        play_text.on("pointerdown", this.startGame, this);
    }

    startGame() {
        this.scene.start("Game");
    }
}

class Game extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    preload() {
        this.load.spritesheet('gun_spr', 'assets/gunWIPSpritesheet.png', { frameWidth: 140, frameHeight: 60 });
        this.load.spritesheet('target_spr', 'assets/WIPTargetSpritesheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('bullet_img', 'assets/bulletSpriteWIP.png');
    }
    
    create() {

        this.anims.create({
            key: "gunCock",
            frames: this.anims.generateFrameNumbers("gun_spr", {start: 0, end: 2}),
            frameRate: 10,
            repeat: 0
        })

        this.anims.create({
            key: "gunFire",
            frames: this.anims.generateFrameNumbers("gun_spr", {start: 2, end: 7 }),
            frameRate: 20,
            repeat: 0
        })

        this.anims.create({
            key: "targetDOWN",
            frames: this.anims.generateFrameNumbers("target_spr", {start:0, end: 4}),
            frameRate: 20,
            repeat: 0
        })

        this.anims.create({
            key: "targetUP",
            frames: this.anims.generateFrameNumbers("target_spr", {frames: [4, 3, 2, 1, 0] }),
            frameRate: 20,
            repeat: 0
        })
        space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        player_spr = new Player(this, 20, GAMEHEIGHT/2, "gun_spr");
        target_array[0] = new Target(this, GAMEWIDTH - 200, GAMEHEIGHT/2, "target_spr");
        target_array[1] = new Target(this, GAMEWIDTH - 100, GAMEHEIGHT/2 - 150, "target_spr");
        target_array[2] = new Target(this, GAMEWIDTH - 100, GAMEHEIGHT/2 + 150, "target_spr");
        cursors = this.input.keyboard.createCursorKeys();
        bullet_array = [];
        for (let id = 0; id < NUM_BULLETS; id++) {
            bullet_array[id] = new Bullet(this, "bullet_img");
        }

        score = 0;
        score_text = this.add.text(GAMEWIDTH/2, 20, "SCORE: 0", {fontSize : "32px", color: "#000000"});
        score_text.setOrigin(0.5, 0);
    }
    update() {

        player_spr.updateGun(cursors);

        if (Phaser.Input.Keyboard.JustDown(space_key)) {
            if (player_spr.state === READY_STATE) {
                player_spr.cockGun();
                for(let t = 0; t < target_array.length; t++) {
                target_array[t].resetTarget();
                }
            }
            else if (player_spr.state === COCKED_STATE) {
                let bullet_spr = Phaser.Actions.GetFirst(bullet_array, {active: false});
                if (bullet_spr) {
                    let muzzle = player_spr.getMuzzle();
                    bullet_spr.fireBullet(muzzle.x, muzzle.y, player_spr.rotation);
                    player_spr.fireGun();
                }
                
                
            }
        }

        for (let id = 0; id < bullet_array.length; id++) {
            if (bullet_array[id].active) {
                bullet_array[id].updateBullet();
            }
        }

        checkCollisionTarget();
    }
}
function collided(a_spr, b_spr, hitDist) {
    let bang_bool = false;
    let xDiff, yDiff;
    if (a_spr !== undefined && b_spr !== undefined) {
        xDiff = Math.abs(a_spr.x - b_spr.x);
        yDiff = Math.abs(a_spr.y - b_spr.y);
        bang_bool = (xDiff + yDiff) < hitDist;
    }
    return (bang_bool);
}

function checkCollisionTarget() {
    for (let id = 0; id < bullet_array.length; id++) {
        let bullet_spr = bullet_array[id];
        if (bullet_spr.active) {
            for (let t = 0; t < target_array.length; t++) {
                let target_spr = target_array[t];
                if (target_spr.state === UP_STATE) {
                    let points = target_spr.getHitScore(bullet_spr);
                    if (points > 0) {
                        target_spr.targetHit(); 
                        score += points;
                        score_text.setText("SCORE: " + score);
                        bullet_spr.bounceOffTarget(target_spr.getLineX());
                        break;
                    }
                }
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: GAMEWIDTH,
    height: GAMEHEIGHT,
    backgroundColor: "#86dbfd",
    pixelArt: true,
    scene: [Menu, Game]
};

const game = new Phaser.Game(config);