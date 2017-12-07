// ==UserScript==
// @name         AdGuard Debugger
// @namespace    https://adguard.com/
// @version      0.1
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
 * @param CSSStyleSheet styleSheet
 * @param HTMLElement htmlNode
 */
function getCssRules(styleSheet, htmlNode) {
    if (!styleSheet) {
        return null;
    }

    var cssRules = new Array();
    if (styleSheet.cssRules) {
        var currentCssRules = styleSheet.cssRules;
        // Import statement are always at the top of the css file.
        for (var i = 0; i < currentCssRules.length; i++) {
            // cssRules all contains the import statements.
            // check if the rule is an import rule.
            if (isImportRule(currentCssRules[i])) {
                // import the rules from the imported css file.
                var importCssRules = getCssRules(currentCssRules[i].styleSheet, htmlNode);
                if (importCssRules != null) {
                    // Add the rules from the import css file to the list of css rules.
                    cssRules = addToArray(cssRules, importCssRules, htmlNode);
                }
                // Remove the import css rule from the css rules.
                styleSheet.deleteRule(i);
            }
            else {
                // We found a rule that is not an CSSImportRule
                break;
            }
        }
        // After adding the import rules (lower priority than those in the current stylesheet),
        // add the rules in the current stylesheet.
        cssRules = addToArray(cssRules, currentCssRules, htmlNode);
    }
    else if (styleSheet.rules) {
        // IE6-8
        // rules do not contain the import statements.
        var currentCssRules = styleSheet.rules;

        // Handle the imports in a styleSheet file.
        if (styleSheet.imports) {
            // IE6-8 use a seperate array which contains the imported css files.
            var imports = styleSheet.imports;
            for (var i = 0; i < imports.length; i++) {
                var importCssRules = getCssRules(imports[i], htmlNode);
                if (importCssRules != null) {
                    // Add the rules from the import css file to the list of css rules.
                    cssRules = addToArray(cssRules, importCssRules, htmlNode);
                }
            }
        }
        // After adding the import rules (lower priority than those in the current stylesheet),
        // add the rules in the current stylesheet.
        cssRules = addToArray(cssRules, currentCssRules, htmlNode);
    }

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
        if (htmlNode != undefined && htmlNode != null && isMatchCssRule(htmlNode, newRules[i]))
            cssRules.push(newRules[i]);
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
 * Verifies if the cssRule implements the interface of type CSSImportRule.
 * @param CSSRule cssRule
 */
function isImportRule(cssRule) {
    return cssRule.constructor.toString().search("CSSImportRule") != -1;
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


unsafeWindow.AdGuardDebugger = {

    /**
     * 
     */
    printHidden: function() {
        document.querySelectorAll('*').forEach(function(el) {
            var style = window.getComputedStyle(el);
            if (style.getPropertyValue("display") === "none" && hasImportant(el, "display")) {
                // display: none!important
                // most likely it's hidden by AG
                console.log(el);
            }
        });
    }
};