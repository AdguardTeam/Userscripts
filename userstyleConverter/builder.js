var parser = require('postcss-safe-parser');

function Builder() {
    this.text = '';
}

Builder.prototype.emit = function(text) {
    this.text += text + '\n';
};

function findIndexByLineColNo(str, line, column) {
    var index = -1;
    while (--line) {
        index = str.indexOf('\n', index + 1);
    } 
    return index + column;
} 

Builder.prototype.emitNodeContent = function(node) {
    var startIndex = findIndexByLineColNo(this.raw, node.source.start.line, node.source.start.column);
    var endIndex = findIndexByLineColNo(this.raw, node.source.end.line, node.source.end.column);
    var content = this.raw.slice(startIndex, endIndex + 1);
    this.emit(`cssText += "${escapeDoubleQuote(content)}";`);
};

Builder.prototype.emitChildrenContent = function(node) {

}

Builder.prototype.consumeMozDocParam = function (params) {
    var match, l, name, arg;

    match = /^\s*[a-z\-]*\s*\(/.exec(params);
    if (!match) {
        throw "Invalid Css";
    }
    l = match[0].length;
    name = params.slice(0, l - 1).trim();
    params = params.slice(l);

    match = /^\s*["']/.exec(params);
    if (match) {
        l = match[0].length;
        var quote = params[l - 1];
        params = params.slice(l);
        l = params.indexOf(quote);
        arg = params.slice(0, l);
        arg = unescape(arg);        // unescape quoted arguments
        params = params.slice(l + 1);

        match = /^\s*\)/.exec(params);
        if (!match) { throw "Invalid Css" }
        params = params.slice(match[0].length);
        //quoted
    } else {
        l = params.indexOf(')');
        arg = params.slice(0, l);
        params = params.slice(l);
    }

    this.emitUrlCondition(name, arg); 

    match = /^\s*(,)?/.exec(params);
    if (match[1]) {
        this.emit('&&');
    }    
    params = params.slice(match[0].length);
    return params;
};

/**
 * See {@link https://github.com/stylish-userstyles/stylish/wiki/Valid-@-moz-document-rules}
 */
Builder.prototype.emitUrlCondition = function (name, arg) {
    switch (name) {
        case "domain":
            this.emit(`/(?:^|\\.)${escapeRegexSource(arg)}$/.test(domain)`);
            break;
        case "url":
            this.emit(`url === ${arg}`);
            break;
        case "url-prefix":
            this.emit(`url.indexOf("${escapeDoubleQuote(arg)}") === 0`);
            break;
        case "regexp":
            this.emit(`/${escapeRegexSource(arg)}/.test(url)`);
            break;
        default: 
            throw "Invalid userstyle";
    }
};

Builder.prototype.consumeMozDocBlock = function (mozDocNode) {
    var params = mozDocNode.params;
    this.emit("if (");
    while (params) {
        params = this.consumeMozDocParam(params);
    }
    this.emit(') {');
    for (var node of mozDocNode.nodes) {
        this.emitNodeContent(node);
    }
    this.emit('}');
};

Builder.prototype.consumeEverythingElse = function (anyNode) {
    this.emitNodeContent(anyNode);
};

Builder.prototype.consumeNS = function (nsNode) {
    this.emitNodeContent(nsNode);
};

Builder.prototype.consumeRaw = function (rawUserStyle) {
    this.ast = parser(rawUserStyle);
    this.raw = this.ast.source.input.css;
    // Iterates over top nodes
    for (let child of this.ast.nodes) {
        if (child.type === "atrule") {
            switch (child.name) {
                case "namespace":
                    this.consumeNS(child);
                    break;
                case "-moz-document":
                    this.consumeMozDocBlock(child);
                    break;
            }
        }
        this.consumeEverythingElse(child);
    }
};

Builder.prototype.makeUserscript = function(author, homepage) {
    return `
// ==UserScript==
// @name          
// @namespace     http://userstyles.org
// @author        ${author}
// @homepage      ${homepage}
// @run-at        document-start
// @grant		  GM_addStyle
// ==/UserScript==
(function(){
    var domain = window.location.hostname;
    var url = window.location.href;
    var cssText = '';
${this.text}
if (cssText.length > 0) {
    GM_addStyle()
}
})();
`
}

function unescape(str) {
    return str.replace(/\\(.)/g, '$1');
}

function escapeDoubleQuote(str) {

    return str.replace(/[\\"\n]/g, function (c) {
        return '\\' + c;
    });
}

/**
 * Escape backslashes in order to fit a regex source string
 * into `/.../`.
 */
function escapeRegexSource(str) {
    return str.replace(/((?:[^\\]|\\.)*)\//g, (_, c1) => {
        return c1 + "\\/";
    });
}

module.exports = Builder;
