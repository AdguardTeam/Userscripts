// ==UserScript==
// @name         AdGuard Debugger
// @namespace    https://adguard.com/
// @version      0.2
// @description  Call AdGuardDebugger.printHidden() from the browser console to print the elements that are most likely hidden by AG element hiding rules.
// @author       AdGuard
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-2.2.4.js
// @downloadURL  https://github.com/AdguardTeam/Userscripts/raw/master/adguardDebugger/adguard.debugger.user.js
// @updateURL    https://github.com/AdguardTeam/Userscripts/raw/master/adguardDebugger/adguard.debugger.user.js
// ==/UserScript==

/**
 * Get the css rules of a stylesheet which apply to the htmlNode. Meaning its class
 * its id and its tag.
 * 
 * @param {CSSStyleSheet} styleSheet style sheet
 * @param {HTMLElement} htmlNode node which styles are we loading
 */
function getCssRules(styleSheet, htmlNode) {
    if (!styleSheet) {
        return null;
    }

    var currentCssRules;
    try {
        currentCssRules = styleSheet.cssRules;
    } catch (ex) {
        return null;
    }

    var cssRules = new Array();
    cssRules = addToArray(cssRules, currentCssRules, htmlNode);
    return cssRules;
}

/**
 * Since a list of rules is returned, we cannot use concat. 
 * Just use old good push....
 * @param CSSRuleList cssRules
 * @param CSSRuleList cssRules
 * @param HTMLElement htmlNode
 */
function addToArray(cssRules, newRules, htmlNode) {
    for (var i = 0; i < newRules.length; i++) {
        if (htmlNode != undefined && htmlNode != null && isMatchCssRule(htmlNode, newRules[i])) {
            cssRules.push(newRules[i]);
        }
    }
    return cssRules;
}

/**
 * Matches a htmlNode to a cssRule. If it matches, return true.
 * @param HTMLElement htmlNode
 * @param CSSRule cssRule
 */
function isMatchCssRule(htmlNode, cssRule) {
    // Simply use jQuery here to see if there cssRule matches the htmlNode...
    return $(htmlNode).is(cssRule.selectorText);
}

/**
 * Webkit browsers contain this function, but other browsers do not (yet).
 * Implement it ourselves...
 *
 * Finds all matching CSS rules for the htmlNode.
 * @param HTMLElement htmlNode
 */
function getMatchedCSSRules(htmlNode) {
    var cssRules = new Array();

    // Opera 8- don't support styleSheets[] array.
    if (!document.styleSheets)
        return null;

    // Loop through the stylesheets in the html document.
    for (var i = 0; i < document.styleSheets.length; i++) {
        var currentCssRules = getCssRules(document.styleSheets[i], htmlNode)
        if (currentCssRules != null)
            cssRules.push.apply(cssRules, currentCssRules);
    }

    return cssRules;
}

/**
 * Checks if the CSSStyleRule has the property with 'important' attribute.
 * @param CSSStyleRule node
 * @param String property
 */
function isImportant(node, property) {
    if (node.style.getPropertyPriority && node.style.getPropertyPriority(property) == 'important')
        return true;
    else if (node.style.cssText && getPropertyPriority(node.style.cssText, property) == 'important') {
        // IE6-8
        // IE thinks that cssText is part of rule.style
        return true;
    }
}

/**
 * getPropertyPriority function for IE6-8
 * @param String cssText
 * @param String property
 */
function getPropertyPriority(cssText, property) {
    var props = cssText.split(";");
    for (var i = 0; i < props.length; i++) {
        if (props[i].toLowerCase().indexOf(property.toLowerCase()) != -1) {
            // Found the correct property
            if (props[i].toLowerCase().indexOf("!important") != -1 || props[i].toLowerCase().indexOf("! important") != -1) {
                // IE automaticaly adds a space between ! and important...
                return 'important'; // We found the important property for the property, return 'important'.
            }
        }
    }
    return ''; // We did not found the css property with important attribute.
}

/**
 * The main functionality required, to check whether a certain property of 
 * some html element has the important attribute.
 * 
 * @param HTMLElement htmlNode
 * @param String property
 */
function hasImportant(htmlNode, property) {

    // First check inline style for important.
    if (isImportant(htmlNode, property)) {
        // For debugging purposes.
        return true;
    }

    var rules = getMatchedCSSRules(htmlNode);

    if (rules == null) {
        return false;
    }

    /**
     * Iterate through the rules backwards, since rules are
     * ordered by priority where the highest priority is last.
     */
    for (var i = rules.length; i-- > 0;) {
        var rule = rules[i];

        if (isImportant(rule, property)) {
            // For debugging purposes.
            return true;
        }

    }
    return false;
}

function removeQuotes(value) {
    if (typeof value === "string" && value.length > 1 &&
        (value[0] === '"' && value[value.length - 1] === '"' || value[0] === '\'' && value[value.length - 1] === '\'')) {
        // Remove double-quotes or single-quotes
        value = value.substring(1, value.length - 1);
    }
    return value;
}

unsafeWindow.AdGuardDebugger = {

    /**
     * Prints elements hidden by an "important" rule
     */
    printHidden: function () {

        console.log(`This userscript prints a list of the elements supposedly hidden by AdGuard.
It will print only those hidden by basic element hiding rules and not the complicated ones.
Also please note, that the outcome is different and depends on the version of AdGuard you're using.

1. It will print all elements hidden with a "display: none!important" style (AG for Win/Mac/Android use it).
2. In the case of the browser extensions, it will work ONLY if you have "send ad filters usage stats" option enabled. 
In this case, it will be able to print not only the elements, but also the rules text.
IMPORTANT: does not work with the user filter rules`);

        var hiddenElements = {
            displayNoneImportant: [],
            elemHide: []
        };

        var CONTENT_ATTR_PREFIX = "adguard";

        document.querySelectorAll('*').forEach(function (el) {
            var style = window.getComputedStyle(el);
            if (style.getPropertyValue("display") === "none" && hasImportant(el, "display")) {
                // display: none!important
                // most likely it's hidden by AG
                hiddenElements.displayNoneImportant.push(el);
            } else if (style.getPropertyValue("display") === "none" && style.getPropertyValue("content")) {
                var content = removeQuotes(decodeURIComponent(style.getPropertyValue('content')));
                if (content.indexOf(CONTENT_ATTR_PREFIX) !== 0) {
                    return;
                }

                var filterIdAndRuleText = content.substring(CONTENT_ATTR_PREFIX.length);
                // Attribute 'content' in css looks like: {content: 'adguard{filterId};{ruleText}'}
                var index = filterIdAndRuleText.indexOf(';');
                if (index < 0) {
                    return;
                }
                var filterId = filterIdAndRuleText.substring(0, index);
                var ruleText = filterIdAndRuleText.substring(index + 1);
                hiddenElements.elemHide.push({
                    filterId: filterId,
                    ruleText: ruleText,
                    element: el
                });
            }
        });

        console.log(hiddenElements);
    }
};