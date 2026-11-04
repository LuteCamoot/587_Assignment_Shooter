const BASE_AMMO = 6;
const BASE_BOUNCES = 2;
const RECOIL = 10;
const BASE_PIERCE = 0;
const SPLITSHOT_ANGLE = Phaser.Math.DegToRad(30);

let upgrades = {
    //SCOPES
    laser: false,
    reddot: false,
    sniper: false,

    //GRIPS
    comfort: false,
    iron: true,
    quickDraw: true,
    polka: false,

    //BULLETS
    rubber: false,
    ap: false, 
    splitshot: false,

    //MAGAZINE
    extended: false, 
    scavenger: false, 
    charged: false,
    shotgun: false,
    drum: false,
};

function getGunStats() {
    let stats = {
        ammo: BASE_AMMO,
        bounces: BASE_BOUNCES,
        recoil: RECOIL,
        bullseyeBonus: 0,
        pierces: BASE_PIERCE,
        bulletsPerShot: 1,
    };

    if (upgrades.rubber) {stats.bounces += 1;}
    if (upgrades.extended) {stats.ammo += 1;}
    if (upgrades.charged) {stats.bounces += 1; stats.ammo -= 1;}
    if (upgrades.iron) {stats.recoil = 0;}
    if (upgrades.reddot) {stats.bullseyeBonus += 200;}
    if (upgrades.ap) {stats.pierces += 1;}
    if (upgrades.quickDraw) {stats.bulletsPerShot = 2;}
    if (upgrades.shotgun) {stats.ammo -= 2;}
    if (upgrades.drum) {stats.ammo += 2; stats.bounces -= 1;}

    return stats;
}