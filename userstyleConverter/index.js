var Builder = require('./builder');

convertBtn.onclick = function() {
    var content = contentArea.value;
    var builder = new Builder();
    window.builder = builder;
    builder.consumeRaw(content);
    outputArea.value = builder.makeUserscript();
};
