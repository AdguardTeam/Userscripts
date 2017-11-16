var parser = require('postcss-safe-parser');

/**
 * A class to assist obtaining raw text
 * from information available in postcss ast.
 * @class
 */
function MultilineString(str) {
    this.str = str;
    this.currentIndex = -1;
    this.currentLine = 0;
}

/**
 * Finds an index in a string corresponding to a given line number and a column number.
 * 
 * @param {number} line a zero-based index of line
 * @param {number} column a zero-based index within a given line.
 * @returns a zero-based index.
 */
MultilineString.prototype.getIndexByLineColNum = function (line, column) {
    if (this.currentLine > line) { throw new Error("Forbidden operation"); }
    while (line > this.currentLine) {
        this.currentIndex = this.str.indexOf('\n', this.currentIndex + 1);
        if (this.currentIndex === -1) { return -1; }
        this.currentLine++;
    }
    return this.currentIndex + column + 1;
};

/**
 * Analogous to String#slice, but uses (line, column) pairs, and returns an array of lines.
 * Includes the end, i.e. the character having `(endLine, endCol)`.
 */
MultilineString.prototype.sliceByLineColNum = function (startLine, startCol, endLine, endCol) {
    var start = this.getIndexByLineColNum(startLine, startCol);
    var end = this.getIndexByLineColNum(endLine, endCol);
    return this.str.slice(start, end + 1);
};

/**
 * @class
 * @member matchPatterns
 */
function Builder() {
    this.text = '';
    this.indentLevel = 1;

    this.cannotUseGmDirective = false;
    this.matchPatterns = [];
}

Builder.prototype.emit = function(text) {
    var indent = '';
    var indentLevel = this.indentLevel;
    while (indentLevel--) {
        indent += '    ';
    }
    this.text += indent + text + '\n';
};

Builder.prototype.indent = function() {
    this.indentLevel++;
}

Builder.prototype.outdent = function() {
    this.indentLevel--;
}

var reLineBreak = /\r?\n/g
Builder.prototype.emitCSS = function (str) {
    var lines = str.split(reLineBreak);
    for (var line of lines) {
        if (line.trim().length === 0) continue;
        this.emit(`cssText += "${escapeDoubleQuote(line)}";`);
    }
};

Builder.prototype.emitNodeContent = function(node) {
    var source = node.source;
    // PostCSS AST has 1-based indices
    var l0 = source.start.line - 1;
    var c0 = source.start.column - 1;
    var l1 = source.end.line - 1;
    var c1 = source.end.column - 1;
    var content = this.raw.sliceByLineColNum(l0, c0, l1, c1);
    this.emitCSS(content);
};

Builder.prototype.emitChildrenContent = function(node) {
    var l0 = node.first.source.start.line - 1;
    var c0 = node.first.source.start.column - 1;
    var l1 = node.last.source.end.line - 1;
    var c1 = node.last.source.end.column - 1;
    var content = this.raw.sliceByLineColNum(l0, c0, l1, c1);
    this.emitCSS(content);
};

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
        params = params.slice(l + 1);
    }

    this.emitUrlCondition(name, arg); 

    match = /^\s*(,)?/.exec(params);
    if (match[1]) {
        this.emit('||');
    }    
    params = params.slice(match[0].length);
    return params;
};

/**
 * See {@link https://github.com/stylish-userstyles/stylish/wiki/Valid-@-moz-document-rules}
 * Interpretes @-moz-document at-rules into javascript conditions.
 * Tries to generate @match GM directives.
 */
Builder.prototype.emitUrlCondition = function (name, arg) {
    switch (name) {
        case "domain":
            this.emit(`/(?:^|\\.)${escapeDomain(arg)}$/.test(domain)`);
            if (!this.cannotUseGmDirective) {
                this.matchPatterns.push(`*://${arg}/*`);
                this.matchPatterns.push(`*://*.${arg}/*`);
            }            
            break;
        case "url":
            this.emit(`url === ${arg}`);
            if (!this.cannotUseGmDirective) {
                this.matchPatterns.push(arg);
            }
            break;
        case "url-prefix":
            this.emit(`url.indexOf("${escapeDoubleQuote(arg)}") === 0`);
            if (!this.cannotUseGmDirective) {
                var pathStartInd = arg.indexOf('/', 8);
                if (pathStartInd !== -1) {
                    this.matchPatterns.push(arg.slice(0, pathStartInd) + '/*');
                } else {
                    this.cannotUseGmDirective = true;
                    this.matchPatterns = [];
                }
            }
            break;
        case "regexp":
            this.emit(`/${escapeRegexSource(arg)}/.test(url)`);
            this.cannotUseGmDirective = true; // 
            this.matchPatterns = [];
            break;
        default: 
            throw "Invalid userstyle";
    }
};

Builder.prototype.consumeMozDocBlock = function (mozDocNode) {
    var params = mozDocNode.params;
    this.emit("if (");
    this.indent();
    while (params) {
        params = this.consumeMozDocParam(params);
    }
    this.outdent();
    this.emit(') {');
    this.indent();
    this.emitChildrenContent(mozDocNode);
    this.outdent();
    this.emit('}');
};

Builder.prototype.consumeEverythingElse = function (anyNode) {
    this.emitNodeContent(anyNode);
};

Builder.prototype.consumeNS = function (nsNode) {
    this.emitNodeContent(nsNode);
};

Builder.prototype.consumeRaw = function (raw) {
    this.ast = parser(raw);
    this.raw = new MultilineString(this.ast.source.input.css);
    // Iterates over top nodes
    for (let child of this.ast.nodes) {
        if (child.type === "atrule") {
            switch (child.name) {
                case "namespace":
                    this.consumeNS(child);
                    continue;
                case "-moz-document":
                    this.consumeMozDocBlock(child);
                    continue;
            }
        }
        this.consumeEverythingElse(child);
    }
};

var prelude = 
`(function() {
    var domain = window.location.hostname;
    var url = window.location.href;
    var cssText = '';`;

var postlude =
`    if (cssText.length > 0) {
        GM_addStyle(cssText);
    }
})();
`;

Builder.prototype.makeUserscript = function(name, author, homepage) {
    var buff = [];
    buff.push(`\// ==UserScript==`)
    if (name)
    buff.push(`// @name `)
    buff.push(`// @namespace     userstyle`)
    if (author)
    buff.push(`// @author        ${author}`)
    if (homepage)
    buff.push(`// @homepage      ${homepage}`)
    buff.push(`// @run-at        document-start`)
    buff.push(`// @grant         GM_addStyle`)
    for (var match of this.matchPatterns)
    buff.push(`// @match         ${match}`)
    buff.push(`// ==/UserScript==`)
    buff.push(prelude)
    buff.push(this.text)
    buff.push(postlude);

    return buff.join('\n');
}

function unescape(str) {
    return str.replace(/\\(.)/g, '$1');
}

var reCharsToEscapedInDoubleQuotes = /(?:[\\"]|\r?\n)/g
function escapeDoubleQuote(str) {
    return str.replace(reCharsToEscapedInDoubleQuotes, escape);
}

function escape(m) {
    return '\\' + m;
}

function escapeDomain(str) {
    return str.replace(/\./g, '\\.');
}

/**
 * Escape backslashes in order to fit a regex source string
 * into `/.../`.
 */
var reBackslash = /((?:[^\\/]|\\.)*)\//g;
function escapeRegexSource(str) {
    return str.replace(reBackslash, addEscapedBackslash);
}

function addEscapedBackslash(_, c1) {
    return c1 + "\\/";
}

module.exports = Builder;
