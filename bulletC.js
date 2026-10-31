const BULLET_SPEED = 20;
const MAX_BOUNCES = 20;

class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene,texture) {
        super(scene, 0, 0, texture);
        this.setOrigin(0.5, 0.5);
        this.setOrigin(0.5, 0.5);
        scene.add.existing(this);
        this.initializeBullet();
    }

    initializeBullet() {
        this.setActive(false);
        this.setVisible(false);
    }

    fireBullet(xPos, yPos, rotation) {
            this.x = xPos;
            this.y = yPos;
            this.rotation = rotation;
            this.velX = Math.cos(rotation) * BULLET_SPEED;
            this.velY = Math.sin(rotation) * BULLET_SPEED;
            this.bounces = 0;
            this.setActive(true);
            this.setVisible(true);
    }

    updateBullet() {
        this.x += this.velX;
        this.y += this.velY;

        let hitTopBottom = (this.y < 0 || this.y > GAMEHEIGHT);
        let hitRight = (this.x > GAMEWIDTH);

        if (hitTopBottom || hitRight) {
            if (this.bounces < MAX_BOUNCES) {
                if (hitTopBottom) {
                this.velY = -this.velY;
                }
                if (hitRight) {
                this.velX = -this.velX;
            }
            this.x = Phaser.Math.Clamp(this.x, 0, GAMEWIDTH);
            this.y = Phaser.Math.Clamp(this.y, 0, GAMEHEIGHT);
            this.rotation = Math.atan2(this.velY, this.velX);
            this.bounces++;
            }
        else {
            this.killBullet();
        }
    }
    if (this.x < 0) {
        this.killBullet();
    }
}

    bounceOffTarget(lineX) {
        if (this.bounces < MAX_BOUNCES) {
            this.velX = -this.velX;
            this.x = lineX - (this.x - lineX);
            this.rotation = Math.atan2(this.velY, this.velX);
            this.bounces++;
        }
        else {
            this.killBullet();
        }
    }
    killBullet() {
        console.log("Bullet destroyed");
        this.setActive(false);
        this.setVisible(false);
    }
}