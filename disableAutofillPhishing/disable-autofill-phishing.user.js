// ==UserScript==
// @name         Autofill Phishing Blocker by Adguard
// @namespace    https://adguard.com/
// @version      1.0.0
// @description  Disables autofill of the input fields, which are not on the screen. Learn more about autofill phishing here: https://github.com/anttiviljami/browser-autofill-phishing/
// @author       Adguard
// @include      http://*
// @include      https://*
// @run-at       document-end
// @grant        none
// @downloadURL  https://github.com/AdguardTeam/Userscripts/raw/master/disableAutofillPhishing/disable-autofill-phishing.user.js
// @updateURL    https://github.com/AdguardTeam/Userscripts/raw/master/disableAutofillPhishing/disable-autofill-phishing.user.js
// ==/UserScript==

(function () {
    'use strict';

    /**
     * Checks if specified element is visible
     */
    var isVisible = function (element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length) &&
            (element.offsetLeft >= 0);
    };

    /**
     * Checks if specified element is visible on the screen
     */
    var isScrolledIntoView = function (element) {
        var elementTop = element.getBoundingClientRect().top;
        var elementBottom = element.getBoundingClientRect().bottom;
        var isVisible = (elementTop >= 0) && (elementBottom <= window.innerHeight);
        return isVisible;
    };

    /**
     * Disables autocomplete
     */
    var disableAutofillPhishing = function () {
        var elements = document.querySelectorAll('input[name]:not([autocomplete="off"])');
        var iElements = elements.length;
        while (iElements--) {
            var element = elements[iElements];
            if (!isVisible(element) || !isScrolledIntoView(element)) {
                element.setAttribute("autocomplete", "off");
            }
        }
    };

    /**
     * Called on any DOM change to handle "video" tags added dynamically
     */
    var handleDomChange = function (mutations) {
        if (mutations.length === 0) {
            disableAutofillPhishing();
        }
    };

    /**
     * Initialize script
     */
    var init = function () {
        // Check existing elements first
        disableAutofillPhishing();

        // Set up a mutation observer to handle dynamically added video tags
        var observer = new MutationObserver(handleDomChange);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    init();
})();