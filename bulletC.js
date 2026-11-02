const BULLET_SPEED = 900;
const MAX_BOUNCES = 20;
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
            this.rotation = rotation;
            this.scene.physics.velocityFromRotation(rotation, BULLET_SPEED, this.body.velocity);
            this.bouncesLeft = MAX_BOUNCES;
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
    }
}