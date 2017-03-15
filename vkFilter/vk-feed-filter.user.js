// ==UserScript==
// @name            Фильтр групп смерти ВК
// @description     Фильтрует и скрывает потенциально опасные посты в ленте ВК.
// @author          Adguard
// @version         1.0.0
// @include         *://vk.com/*
// @run-at          document-end
// @downloadURL     https://github.com/AdguardTeam/Userscripts/raw/master/vkFilter/vk-feed-filter.user.js
// @updateURL       https://github.com/AdguardTeam/Userscripts/raw/master/vkFilter/vk-feed-filter.user.js
// @grant           none
// ==/UserScript==

(function () {

    'use strict';

    // Ad words groups.
    // Each item describes a one rule with `and` boolean logic, so rule '[1,2,3]' will hide posts 
    // that contains '1', '2' and '3' irrespective of order.
    // Original text will be lowercased before search operation, so each rule should be in lowercase to work.
    var junkGroups = [
        ['син', 'кит']
    ];

    // Check post to contain one or more 'junkGroups'.
    function isJunk(post) {
        var result = false;
        var postTextDiv = post.querySelector('.wall_text');
        if (!postTextDiv) {
            console.log('no content: ' + post.innerHTML);
            return result;
        }
        
        post.setAttribute('contentinspected', 'true');
        var postText = postTextDiv.innerHTML.toLowerCase();

        result = junkGroups.some(function(junkGroup) {
            var isJunkDetected = junkGroup.every(function(junk) {
                return postText.indexOf(junk) >= 0;
            });
            return isJunkDetected;
        });

        console.log(post.id + ' check result: ' + result);
        return result;
    }

    function isHidden(post) {
        return post.style.display == 'none';
    }

    function hide(post) {
        post.style.display = 'none';
    }

    // Main function (called on any dom change)
    function inner() {
        var posts = document.querySelectorAll('.post:not([contentinspected])');
        for (var i = 0; i < posts.length && i < 10; i++) {
            var post = posts[posts.length - 1 - i];
            if (!isHidden(post) && isJunk(post)) {
                hide(post);
            }
        }
    }    

    /**
     * Helper class that uses either MutationObserver or DOMNode* events to keep an eye on DOM changes
     * <br/>
     * Two public methods:
     * <br/>
     * <pre>observe</pre> starts observing the DOM changes
     * <pre>dispose</pre> stops doing it
     */
    var DomObserver = (function () { // jshint ignore:line

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var eventListenerSupported = window.addEventListener;

        return function (callback) {

            var mutationObserver;

            var observeDom = function (callback) {
                if (!document.body) {
                    return;
                }

                if (MutationObserver) {
                    mutationObserver = new MutationObserver(function (mutations) {
                        if (mutations && mutations.length) {
                            callback();
                        }
                    });
                    mutationObserver.observe(document.body, { childList: true, subtree: true });
                } else if (eventListenerSupported) {
                    document.addEventListener('DOMNodeInserted', callback, false);
                    document.addEventListener('DOMNodeRemoved', callback, false);
                }
            };

            // EXPOSE
            this.observe = function () {
                if (!document.body) {
                    document.addEventListener('DOMContentLoaded', function () {
                        observeDom(callback);
                    });
                } else {
                    observeDom(callback);
                }
            };

            this.dispose = function () {
                if (mutationObserver) {
                    mutationObserver.disconnect();
                } else if (eventListenerSupported) {
                    document.removeEventListener('DOMNodeInserted', callback, false);
                    document.removeEventListener('DOMNodeRemoved', callback, false);
                }
            };
        };
    })();

    // First time execution
    inner();

    // Handle dynamically added elements
    var domObserver = new DomObserver(inner);
    domObserver.observe();
})();