// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies
// @author         Icehawk78 / erbkaiser / MikuroXina
// @homepage       https://mikuroxina.github.io/FrozenCookies/
// @include        http://orteil.dashnet.org/cookieclicker/
// @include        https://orteil.dashnet.org/cookieclicker/
// @updateURL      https://mikuroxina.github.io/FrozenCookies/fc_userscript_loader.user.js
// @downloadURL    https://mikuroxina.github.io/FrozenCookies/fc_userscript_loader.user.js
// ==/UserScript==

// Source:    https://github.com/MikuroXina/FrozenCookies/main/
// Github.io: https://mikuroxina.github.io/FrozenCookies/
var loadInterval = setInterval(function () {
    const Game = unsafeWindow.Game;
    if (Game && Game.ready) {
        clearInterval(loadInterval);
        Game.LoadMod("https://mikuroxina.github.io/FrozenCookies/frozen_cookies.js");
    }
}, 1000);
