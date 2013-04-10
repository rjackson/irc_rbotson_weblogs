// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

// End Joyent code.

rule("bold",          /^\u0002/);
rule("colour_fg_bg",  /^\u0003(\d{1,2}),(\d{1,2})/);
rule("colour_fg",     /^\u0003(\d{1,2})/);
rule("colour_reset",  /^\u0003/);
rule("italic",        /^\u0009/);
// tokenizer.rule("strike",        /^\u0013/);
rule("reset",         /^\u000f/);
rule("underline",     /^\u001f/);
// tokenizer.rule("reverse",       /^\u0016/);
rule("catch_all",     /^(.|\n)+?/);

var colVals = { // Using default mIRC colours
            White: "#CCCCCC", // 0 "White",
            Black: "#000000", // 1 "Black",
            DarkBlue: "#3636B2", // 2 "DarkBlue",
            DarkGreen: "#2A8C2A", // 3 "DarkGreen",
            Red: "#C33B3B", // 4 "Red",
            DarkRed: "#C73232", // 5 "DarkRed",
            DarkViolet: "#80267F", // 6 "DarkViolet",
            Orange: "#66361F", // 7 "Orange",
            Yellow: "#D9A641", // 8 "Yellow",
            LightGreen: "#3DCC3D", // 9 "LightGreen",
            Cyan: "#1A5555", // 10 "Cyan",
            LightCyan: "#2F8C74", // 11 "LightCyan",
            Blue: "#4545E6", // 12 "Blue",
            Violet: "#B037B0", // 13 "Violet",
            DarkGray: "#4C4C4C", // 14 "DarkGray",
            LightGray: "#959595" // 15 "LightGray"
    };

var colNames = [
    "White",
    "Black",
    "DarkBlue",
    "DarkGreen",
    "Red",
    "DarkRed",
    "DarkViolet",
    "Orange",
    "Yellow",
    "LightGreen",
    "Cyan",
    "LightCyan",
    "Blue",
    "Violet",
    "DarkGray",
    "LightGray"
];

function colour(identifier) {
    return (isNaN(identifier)) ? colVals[identifier] : colVals[colNames[identifier]];
}

function htmlColour (identifier, content) {
    return "<span style=\"color:" + colour(identifier) + "\">" + content + "</span>";
}

function ircToHtml(raw_text) {
    var tokens = tokenize(raw_text);
    var states = {
        bold: false,
        colour: false,
        italic: false,
        underline: false
    };
    var output = "";
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        switch (token[1]) {
            case "bold": // Bold
                output += (states.bold === false) ? "<strong>" : "</strong>";
                states.bold = !states.bold;
                break;

            case "colour_fg_bg": // Colour FG BG
                var result = /^\u0003(\d{1,2}),(\d{1,2})/.exec(token[0]);
                output += "<span style=\"color:" + colour(parseInt(result[1], 10)) + ";background-color:" + ircColours[parseInt(result[2], 10)] + "\">";
                break;

            case "colour_fg": // Colour FG
                var result = /^\u0003(\d{1,2})/.exec(token[0]);
                output += "<span style=\"color:" + colour(parseInt(result[1], 10)) + "\">";
                // output += "<span style=\"color:" + colour(parseInt(token[0].substring(1), 10)) + "\">";
                break;

            case "colour_reset": // Colour
                output += "</span>";
                states.colour = false;
                break;

            case "italic": // Italic
                output += (states.italic === false) ? "<em>" : "</em>";
                states.italic = !states.italic;
                break;

            case "reset": // Reset
                if (states.bold === true) {
                    output += "</strong>";
                }
                if (states.colour === true) {
                    output += "</span>";
                }
                if (states.italic === true) {
                    output += "</em>";
                }
                if (states.underline === true) {
                    output += "</span>";
                }
                states = {
                    bold: false,
                    colour: false,
                    italic: false,
                    underline: false
                };
                break;

            case "underline": // Underline
                output += (states.underline === false) ? "<span style=\"text-decoration: underline;\">" : "</span>";
                states.underline = !states.underline;
                break;

            default: // Rest
                output += token[0];
        }
    }
    return output;
}


function dataParse(data){
    var message;
    var channel = data.channel;
    var actor = data.actor;
    var args = data.args;
    var user = "*";
    var rawUser = user;

    switch (data.command) {
        case "PRIVMSG":
            message = ircToHtml(args[0]);
            rawUser = "&lt;" + actor.name + "&gt;";
            user = htmlColour("Blue", rawUser);

            // Do fancy stuff if it's the bot talking.
            if (["RBotson", "RFeedson"].indexOf(actor.name) > -1) {
                var steamIdentifier = "[<span style=\"text-decoration: underline;\">STEAM</span>]";
                if (message.indexOf(steamIdentifier) === 0) {
                    // Steam message.  Be fancy
                    message = message.substring(steamIdentifier.length + 1);
                    rawUser = "STEAM";
                    user = htmlColour("Blue", rawUser);
                }
            }
            break;

        case "JOIN":
            message = htmlColour("DarkGreen", format("%s (%s@%s) has joined %s", actor.name, actor.user, actor.host, channel));
            user = htmlColour("DarkGreen", rawUser);
            break;

        case "PART":
            message = htmlColour("DarkRed", format("%s (%s@%s) has left %s", actor.name, actor.user, actor.host, channel));
            user = htmlColour("DarkRed", rawUser);
            break;

        case "TOPIC":
            message = format("%s has changed the topic to: %s", actor.name, args[0]);
            break;

        case "MODE":
            if (data.actedUpon) {
                var actedUpon = data.actedUpon;
                modes = args[0];
                sign = args[0].substring(0, 1);
                message = format((sign == "+") ? "%s gives %s to %s" : "%s removes %s from %s", actor.name, modes, actedUpon.name);
            }
            else {
                message = format("%s sets mode %s %s", actor.name, args[0], channel);
            }
            break;

        case "KICK":
            var actedUpon = data.actedUpon;
            message = format("%s has kicked %s from %s (%s)", actor.name, actedUpon.name, channel, args[0]);
            break;

        case "NICK":
            message = format("%s is now known as %s", actor.name, args[0]);
            break;

        case "KILL":
            message = format("THE ALLLL~~MIGHTY LORD, FROM THE HEAVENS ABOVE, STRIKES DOWN THE NONBELIEVER.  BYE %s (%s)", actor.name, args[0]);
            break;
    }
    return {
        timestamp: data.timestamp,
        user: user,
        rawUser: rawUser.replace("&lt;", "<").replace("&gt;", ">"),
        message: message,
        channel: channel
    };
}