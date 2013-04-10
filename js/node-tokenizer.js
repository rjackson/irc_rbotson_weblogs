var tokens = [];
var source = '';
var regexQueue = [];

var rule = function rule(tokenType, re) {
  regexQueue.push(function () {
    var ret = false;
    var result = re.exec(source);
    if (result) {
      tokens.push([result[0], tokenType]);
      source = source.substring(result[0].length);
      ret = true;
    }
    return ret;
  });
};

var tokenize = function tokenize(src) {
  tokens = [];
  source = '';
  source = src;

  while (source) {
    var foundToken = regexQueue.some(function (element, index, array) {
      return element();
    });
    if (!foundToken) {
      console.error('Did not find any tokens on this pass:');
      logSrc();
      process.exit(1);
    }
  }

  return tokens;
};