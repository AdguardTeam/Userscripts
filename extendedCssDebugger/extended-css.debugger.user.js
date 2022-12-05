// ==UserScript==
// @name         Extended Css Debugger
// @namespace    https://adguard.com/
// @version      0.3
// @description  A very simple userscript that exposes ExtendedCss object. Use `ExtendedCss.query()` calls to debug selectors.
// @author       AdGuard
// @require      https://adguardteam.github.io/ExtendedCss/extended-css.js
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @downloadURL  https://github.com/AdguardTeam/Userscripts/raw/master/extendedCssDebugger/extended-css.debugger.user.js
// @updateURL    https://github.com/AdguardTeam/Userscripts/raw/master/extendedCssDebugger/extended-css.debugger.user.js
// ==/UserScript==

unsafeWindow.ExtendedCss = ExtendedCss;
