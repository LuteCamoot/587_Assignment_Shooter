const BASE_AMMO = 6;
const BASE_BOUNCES = 2;
const RECOIL = 10;

let upgrades = {
    //SCOPES
    laser: false,
    reddot: false,
    sniper: false,

    //GRIPS
    comfort: false,
    iron: false,
    quickDraw: false,
    polka: false,

    //BULLETS
    rubber: false,
    ap: false,
    splitshot: false,

    //MAGAZINE
    extended: false,
    scavenger: false,
    charged: false,
};

function getGunStats() {
    let stats = {
        ammo: BASE_AMMO,
        bounces: BASE_BOUNCES,
        recoil: RECOIL,
        bullseyeBonus: 0
    };

    if (upgrades.rubber) {stats.bounces += 1;}
    if (upgrades.extended) {stats.ammo += 1;}
    if (upgrades.charged) {stats.bounces += 1; stats.ammo -= 1;}
    if (upgrades.iron) {stats.recoil = 0;}
    if (upgrades.reddot) {stats.bullseyeBonus += 200}


    return stats;
}