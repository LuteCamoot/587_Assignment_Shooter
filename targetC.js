const TARGET_LINE_X = -20;
const RED_SIZE = 6;
const MIDDLE_SIZE = 14;
const OUTER_SIZE = 22;


class Target extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0);
        this.setOrigin(0.5, 0.5);
        this.setScale(2);     
        scene.add.existing(this);
        this.state = UP_STATE;
    }

    targetHit(){
        this.state = DOWN_STATE;
        this.anims.play("targetDOWN");
    }

    resetTarget(){
        if (this.state === DOWN_STATE) {
            this.state = UP_STATE;
            this.anims.play("targetUP");
        }
    }

    getLineX() {
        return this.x + TARGET_LINE_X * this.scaleX;
    }

    getHitScore(bullet_spr) {
        let lineX = this.getLineX();

        let lastX = bullet_spr.x - bullet_spr.velX;
        let leftX = Math.min(lastX, bullet_spr.x);
        let rightX = Math.max(lastX, bullet_spr.x);

        if (lineX < leftX || lineX > rightX) { return 0; }

        let yDiff = Math.abs(bullet_spr.y - this.y);
        if (yDiff <= RED_SIZE * this.scaleY) {
            return 300;
        }
        else if (yDiff <= MIDDLE_SIZE * this.scaleY) {
            return 200;
        }
        else if (yDiff <= OUTER_SIZE * this.scaleY) {
            return 100;
        }
        return 0;
    }
}