import { getNumber } from "../fc_store.js";
import { hasClickBuff } from "../fc_time.js";

export function start() {
    if (FrozenCookies.petDragon) {
        FrozenCookies.petDragonBot = setInterval(
            petDragonAction,
            getNumber("frequency") * 2,
        );
    }
}

export function stop() {
    if (FrozenCookies.petDragonBot) {
        clearInterval(FrozenCookies.petDragonBot);
        FrozenCookies.petDragonBot = 0;
    }
}

function petDragonAction() {
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 4 ||
        !Game.Has("Pet the dragon") ||
        hasClickBuff()
    ) {
        return;
    }

    // Calculate current pet drop and if we have it
    Math.seedrandom(Game.seed + "/dragonTime");
    let drops = ["Dragon scale", "Dragon claw", "Dragon fang", "Dragon teddy bear"];
    drops = shuffle(drops);
    Math.seedrandom();
    let currentDrop = drops[Math.floor((new Date().getMinutes() / 60) * drops.length)];

    // Pet the dragon
    if (!Game.Has(currentDrop) && !Game.HasUnlocked(currentDrop)) {
        Game.specialTab = "dragon";
        Game.ToggleSpecialMenu(1);
        Game.ClickSpecialPic();
        Game.ToggleSpecialMenu(0);
        // logEvent("autoDragon", "Who's a good dragon? You are!");
    }
}
