const TARGET_X = -20;

const INNER_SIZE = 6;
const MIDDLE_SIZE = 14;
const OUTER_SIZE = 22;

const TARGET_WIDTH = 8;

class Target extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0);
        this.setOrigin(0.5, 0.5);
        this.setScale(1);    

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setImmovable(true);

        this.body.setSize(TARGET_WIDTH, OUTER_SIZE * 2, false);
        this.body.setOffset((this.width * 0.5) + TARGET_X - (TARGET_WIDTH * 0.5), (this.height * 0.5) - OUTER_SIZE);
        this.state = UP_STATE;
    }

    targetHit(){
        this.state = DOWN_STATE;
        this.anims.play("targetDOWN");
        this.disableBody(false, false);
    }

    resetTarget(){
        if (this.state === DOWN_STATE) {
            this.state = UP_STATE;
            this.anims.play("targetUP");
            this.enableBody();
        }
    }

    getHitScore(bullet_spr) {
        let yDiff = Math.abs(bullet_spr.y - this.y);
        if (yDiff <= INNER_SIZE * this.scaleY) { return 300; }
        else if (yDiff <= MIDDLE_SIZE * this.scaleY) { return 200;}
        else { return 100; }
    }
}