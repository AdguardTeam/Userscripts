// ==UserScript==
// @name         Disable Video AutoPlay by Adguard
// @namespace    https://adguard.com/
// @version      1.0.3
// @description  Ensures that HTML5 video elements do not autoplay
// @author       Adguard
// @include      http://*
// @include      https://*
// @run-at       document-start
// @downloadURL  https://github.com/AdguardTeam/Userscripts/raw/master/disableAutoplay/disable-autoplay.user.js
// @updateURL    https://github.com/AdguardTeam/Userscripts/raw/master/disableAutoplay/disable-autoplay.user.js
// @grant        GM_info
// @grant        GM_log
// @grant        window
// ==/UserScript==

(function() {

	/**
	 * Metacritic.com
	 * https://github.com/AdguardTeam/Userscripts/issues/9
	 */
	var metacritic = function() {
        if (!window.localStorage) {
        	// Do not handle old browsers
            return;
        }

        window.localStorage.setItem("mc_autoplay", "false");
	};
    
    /**
     * For some hosts it is not enough to use a generic rule.
     * So we have to use complicated rules instead.
     */
    var hostRules = {
    	"www.metacritic.com": metacritic
    };

    /**
     * Applies per-host rules
     */
    var applyHostRules = function(){
        var hostRule = hostRules[window.location.hostname];

        if (hostRule) {
            hostRule.apply(this);
        }
    };
    
    /**
     * Searches for all "video" elements and changes "autoplay" attribute to false
     * Based on  http://diveintohtml5.info/examples/disable_video_autoplay.user.js
     */
	var removeAutoplay = function() {
		var arVideos = document.getElementsByTagName('video');
		for (var i = arVideos.length - 1; i >= 0; i--) {
		    var elmVideo = arVideos[i];
            if (elmVideo.autoplay) {
                console.log('[Disable Video AutoPlay by Adguard] Removing autoplay attribute');
                elmVideo.autoplay = false;
            }
		}
	};

    /**
     * Called on any DOM change to handle "video" tags added dynamically
     */
	var handleDomChange = function(mutations) {
		if (mutations.length === 0) {
			removeAutoplay();
		}
	};

    /**
     * Initialize script
     */
	var init = function() {

        // Apply per-host rule
        applyHostRules();
       
        window.addEventListener("DOMContentLoaded", function() {
            // Check existing elements first
            removeAutoplay();

            // Set up a mutation observer to handle dynamically added video tags
            var observer = new MutationObserver(handleDomChange);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
	};

    init();
})();