/**
 * Swaps the god of `godId` into the target slot. If it was set, then does nothing and returns false.
 *
 * @param {number} godId - Identifier of god to set.
 * @param {number} targetSlot - Destination slot to be set.
 */
export function swapIn(godId, targetSlot) {
    if (TEMPLE_GAME.slot[targetSlot] == godId) {
        return;
    }

    // mostly code copied from minigamePantheon.js, tweaked to avoid references to "dragging"
    if (TEMPLE_GAME.swaps == 0) {
        return;
    }
    TEMPLE_GAME.useSwap(1);
    TEMPLE_GAME.lastSwapT = 0;
    let prev = TEMPLE_GAME.slot[targetSlot]; // id of God currently in slot
    if (prev != -1) {
        // when something's in there already
        prev = TEMPLE_GAME.godsById[prev]; // prev becomes god object
        const prevDiv = l("templeGod" + prev.id);
        if (TEMPLE_GAME.godsById[godId].slot != -1) {
            l("templeSlot" + TEMPLE_GAME.godsById[godId].slot).appendChild(prevDiv);
        } else {
            const other = l("templeGodPlaceholder" + prev.id);
            other.parentNode.insertBefore(prevDiv, other);
        }
    }
    l("templeSlot" + targetSlot).appendChild(l("templeGod" + godId));
    TEMPLE_GAME.slotGod(TEMPLE_GAME.godsById[godId], targetSlot);

    PlaySound("snd/tick.mp3");
    PlaySound("snd/spirit.mp3");

    const rect = l("templeGod" + godId).getBoundingClientRect();
    Game.SparkleAt((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2 - 24);
}
