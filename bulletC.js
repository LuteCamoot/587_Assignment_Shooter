const BULLET_SPEED = 900;
const BULLET_BODY_SIZE = 5;

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,texture) {
        super(scene, 0, 0, texture);
        this.setOrigin(0.5, 0.5);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(BULLET_BODY_SIZE, BULLET_BODY_SIZE);
        this.initializeBullet();
        this.setBounce(1);
        this.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;
    }

    initializeBullet() {
        this.disableBody(true, true);
    }

    fireBullet(xPos, yPos, rotation) {
        this.enableBody(true, xPos, yPos, true, true);
        this.hasWarped = false;
        this.hasSplit = false;
        this.rotation = rotation;
        this.scene.physics.velocityFromRotation(rotation, BULLET_SPEED, this.body.velocity);
        this.bouncesLeft = getGunStats().bounces;
        this.piercesLeft = getGunStats().pierces;
    }

    warp(up,down,right) {
        this.hasWarped = true;
        let vel = this.body.velocity.clone();
        let x = this.x;
        let y = this.y;
        let edge = BULLET_BODY_SIZE;
        if (up) { vel.y = -vel.y; y = GAMEHEIGHT - edge; }
        if (down) { vel.y = -vel.y; y = edge; }
        if (right) { vel.x = -vel.x; x = edge;}
        this.body.reset(x, y);
        this.body.velocity.copy(vel);
    }

    split() {
        if (!upgrades.splitshot || this.hasSplit || !this.active) { return; }
        this.hasSplit = true;
        let half = Phaser.Actions.GetFirst(bullet_array, {active: false});
        if (!half) { return; }
        let angle = this.body.velocity.angle();
        half.fireBullet(this.x, this.y, angle - SPLITSHOT_ANGLE);
        half.bouncesLeft = this.bouncesLeft;
        half.piercesLeft = this.piercesLeft;
        half.hasWarped = this.hasWarped;
        half.hasSplit = true;
        this.scene.physics.velocityFromRotation(angle + SPLITSHOT_ANGLE, BULLET_SPEED, this.body.velocity);
    }

    updateBullet() {
        this.rotation = this.body.velocity.angle();
        if (this.x < 0) { this.killBullet(); }
    }


    useBounce() {
        this.bouncesLeft--;
        if (this.bouncesLeft < 0) {
            this.killBullet();
        }
    }

    killBullet() {
        console.log("Bullet destroyed");
        this.disableBody(true, true);
        if (!shotInProgress()) {onShotEnded();}
    }
}