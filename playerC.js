const GUN_TURN_SPEED = 0.5;    
const GUN_MIN_ANGLE = -60;    
const GUN_MAX_ANGLE = 60;     
const MUZZLE_X = 97;
const MUZZLE_Y = -13;

class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0);   
        this.setOrigin(0, 0.5);           
        this.setScale(1.5);     
        scene.add.existing(this);
        this.state = READY_STATE;
    } 

    getMuzzle(){
        let offset = new Phaser.Math.Vector2(MUZZLE_X * this.scaleX, MUZZLE_Y * this.scaleY);
        offset.rotate(this.rotation);
        return {x: this.x + offset.x, y: this.y + offset.y};
    }

    updateGun(cursors) {
        if (cursors.up.isDown || w_input.isDown ) { this.angle -= GUN_TURN_SPEED; }
        if (cursors.down.isDown || s_input.isDown) { this.angle += GUN_TURN_SPEED; }
        this.angle = Phaser.Math.Clamp(this.angle, GUN_MIN_ANGLE, GUN_MAX_ANGLE);
    } 

    cockGun() {
        this.state = COCKING_STATE;
        this.anims.play("gunCock");
        this.once("animationcomplete", this.cockEnded, this);
    }

    cockEnded(){
        console.log("Gun Cocked");
        this.state = COCKED_STATE;
    }

    fireGun(){
        this.state = FIRING_STATE;
        this.anims.play("gunFire");
        console.log("Gun fired");
        this.once("animationcomplete", this.fireEnded, this);
    }

    fireEnded() {
        this.setFrame(0);
        this.state = READY_STATE;
    }

    recoil(recoil) {
        this.angle = Phaser.Math.Clamp(this.angle - recoil, GUN_MIN_ANGLE, GUN_MAX_ANGLE);
    }
}