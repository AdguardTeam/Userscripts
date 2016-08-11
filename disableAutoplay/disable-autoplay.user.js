// ==UserScript==
// @name         Disable Video AutoPlay by Adguard
// @namespace    https://adguard.com/
// @version      1.0
// @description  Ensures that HTML5 video elements do not autoplay
// @author       Adguard
// @include      http://*
// @include      https://*
// @run-at       document-end
// @grant        GM_info
// ==/UserScript==

(function() {
    
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
       
        // Check existing elements first
        removeAutoplay();

        // Set up a mutation observer to handle dynamically added video tags
        var observer = new MutationObserver(handleDomChange);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
	};

    init();
})();
