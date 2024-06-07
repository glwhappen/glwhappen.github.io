/*
 * This is a script that makes Taskboard Lite awesome ;)
 * At least it's my very humble opinion.
 */
// 初始化 Parse
Parse.initialize("happen-app", "YOUR_JAVASCRIPT_KEY"); 
Parse.serverURL = 'https://parse.glwsq.cn/parse';
const currentUser = Parse.User.current();
const Card = Parse.Object.extend("Card");
async function fetchCards() {
    const query = new Parse.Query(Card);
    // query.equalTo("user", currentUser.value);
    return await query.find();
}



(function (document, $, storage) { // let's pull all of this into context of nice function

// So here we start with very long definition of constants.
// These are strings and other values used a lot in the script.
// Sometimes they may feel as an overhead, but it was all done
// to make this script nicely minify.

    // CONSTANTS
    // ===========

var HTML_CARD = "<section class=card><div class=text>",

    // some class names
    DRAG = "drag",
    EDIT = "edit",
    PICK = "pick",
    MARK = "mark",

    // selectors
    CARD      = ".card",
    TEXT      = ".text",
    TAG       = ".tag",
    ACTION    = "menu a",

    HAS_MARK = ':has(.' + MARK + ')',

    DOT = ".", // :) used to turn class names into selectors

    // events
    CLICK     = "click",
    DBLCLICK  = "dblclick",
    HOVER     = "hover",
    KEYDOWN   = "keydown",
    MOUSEDOWN = "mousedown",
    MOUSEUP   = "mouseup",
    MOUSEMOVE = "mousemove",

    // other strings
    CONTENTEDITABLE = "contentEditable",

    VALUE = "value",

    TOP  = "top",
    LEFT = "left",

    STORAGE_KEY = "board",

    TRUE  = !0 + "", // == "true"  //  little inconsistency, but I use "true" only as a string
    FALSE = !1,      // == false   //  and false more as boolean

    COLORS = ['white', 'green', 'blue', 'red', 'orange', 'yellow'],

    // checks if class name contains one of the colors
    R_COLORCLASS = new RegExp('\\b(' + COLORS.join(')|(') + ')\\b'),

    // checks if event type is mouseenter or mouseover
    R_MOUSEIN = /^mouse(enter|over)/i,

    // namespace object for actions triggered by toolbar icons
    ACTIONS = {

        // clears board by removing saved data & reloads the page
        r: function () {
            if (confirm("你确定要清除所有储存的资料？")) {
                storage.removeItem(STORAGE_KEY); // .clear() would be fine too
                location.reload();
            }
        },

        // CARD ACTIONS
        
        // edit
        e: function ($card) {
            $card[DBLCLICK](); // hacky way of saying .trigger("dblclick"),
        },
        
        // change color, by switching to next color from the list
        // 'cause color pickers are so unusable...
        // and, anyway, there are only six colors, right?
        c: function ($card) {
            var color = $card.color();
            if (color) {
                $card.rC(color); // .removeClass
                color = COLORS.indexOf(color);
                color = COLORS[++color < 6 ? color : 0]; // 6 is COLORS.length
                $card.aC(color); // .addClass
                save();
            }
        },
        
        // delete
        d: function ($card) {
            if (confirm("您确定要删除这张卡片吗？")) {
                $card.fadeOut(function () {
                    $actions.detach();
                    $card.remove();
                    save();
                });
            }
        },

        // TEXT FORMATTING
        
        // bold -- yes, you guessed it right ;)
        b: function () {
            document.execCommand("bold", FALSE, "");
        },
        
        // italic
        i: function () {
            document.execCommand("italic", FALSE, "");
        },
        
        // heading
        h: function () {
            block("p", "h2");
        },
        
        // paragraph
        p: function () {
            block("h2", "p");
        }

    },

    // list of some more or less useful tips
    TIPS = [
        "需要一个新的卡？只要抓住它从左侧甲板拉出",
        "移动卡片，安排他们在任何你想要的方式：待办事项列表？看板？",
        "卡片可以编辑",
        "你编辑文本时可以用热键，例如<i> Ctrl+I </i>或<b> Ctrl + B </b>！",
        //"Just guess what <i>ESC</i> and <i>Ctrl+S</i> do", -- let them discover it... cause Ctrl+S is not working in IE9
        "每一个变化立即保存在您的浏览器",
        "你已经注意到#标签，不是吗？",
        "点击一下看看，可以编辑哦！",
		"喜欢吗？需不需要设为主页！",
        0, // pause
        "没有更多的提示…是你自己操控的时候了 ;)"
    ],

// Now, these down there can be finally called variables
// even though some of them don't change much

    // VARIABLES
    // ===========

    // jQuery objects with application elements
    $document = $(document),
    $body = $(document.body),
    
    $board,   // <section id=board> -- contains all the cards added by user
    $deck,    // <aside id=deck>    -- contains set of new cards to take
    $actions, // <menu>             -- toolbar with card actions
    $editbar, // <menu class=edit>  -- toolbar with text formatting actions

    lastTip = -1, // index of last used tip

    data; // here is were board data is loaded

// http://en.wikipedia.org/wiki/Truecolor ;)
TIPS[24] = "哦，我忘了告诉你关于进制的颜色标签# F5A";

// little easter egg ;)
TIPS[42] = "对于生命，宇宙和一切<b> 42 </b>";


// FUNCTIONS
// ===========

// returns tips, one by one
function tip() {
    return TIPS[++lastTip] ? "<p>" + TIPS[lastTip] + " #tip</p>" : "";
}

// Firefox for some reason didn't work well with execCommand("formatblock",...)
// so here is some workaround for that
//   find     - is name of the tag we want to replace
//   replace  - is name of the tag we want to have
// In the case of card text only "p" and "h2" are possible
function block(find, replace) {
    if ($.browser.mozilla) {
        var $node = $(getSelection().anchorNode);
        if ($node.is(TEXT)) {
            $node = $node.$(find).eq(0);
        } else {
            $node = $node.up(TEXT + " " + find);
        }
        $node.replaceWith(function (i, html) {
            return "<" + replace + ">" + html + "</" + replace + ">";
        });
    } else {
        document.execCommand("formatblock", FALSE, "<" + replace + ">");
    }
}

// returns all the tags with given text
function tags(text) {
    return $board.$(TAG).filter(function () {
        return $(this).text().toLowerCase() == text.toLowerCase();
    });
}

// saves current board state to local storage
function save() {
    var cards = [],
        $card; // used in .each loop, but it saves one 'var' statement
    
    $board.$(CARD).each(function () {
        $card = $(this);
        cards.push($.extend($card.offset(), {
            type: $card.color(),
            text: $card.data(VALUE) || ""
        }));
    });
    console.log(data)
    console.log(cards)
    // storage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

// builds an actions toolbar for given list of actions
//   actions -- is an array of action definitions, where first element of each
//              action definition is a class name (action alias) and the second
//              one is a title to display in tooltip
function buildActions(actions) {
    var menu = $("<menu>");
    $.each(actions, function (i, action) {
        menu.append("<a href=# class=" + action[0] + " title='" + action[1] + "'/>");
    });
    return menu
            // on click on action icon
            .dlg(ACTION, CLICK, function (e) {
                ACTIONS[this.className]($(this).up(CARD)); // launch action based on class name
                return FALSE;
            });
}

// closes edit mode and stores or discards changes
// by default changes are saved
//   cancel - if true, discards the changes
function closeEdit(cancel) {
    var $card = $board.$(CARD + DOT + EDIT).eq(0), value;
    
    $editbar.detach();

    $body.add($card.drop()).rC(EDIT); // .removeClass
    value = cancel ? $card.data(VALUE) : $card.$(TEXT).html();
    $card.saveText(value)
        .$(TEXT)
            .attr(CONTENTEDITABLE, FALSE) // cannot remove the attr because Firefox is complaining
            .blur();
    $document.unbind(KEYDOWN);
    save();
}


// key code based action aliases (for hot-keys)
$.extend(ACTIONS, {
    66: ACTIONS.b, // Ctrl + B
    73: ACTIONS.i, // Ctrl + I
    72: ACTIONS.h, // Ctrl + H
    // 80: ACTIONS.p -- using 'G' as a hotkey for paraGraph, as printing on Ctrl+P cannot be canceled in IE9
    71: ACTIONS.p, // Ctrl + G
    83: closeEdit  // Ctrl + S -- not working in IE9 (cannot prevent save dialog)
});


// JQUERY EXTENSIONS
// ===================

// override default easing with easeOutBack
// this is a shortened version of easeOutBack from jQuery UI
$.easing.swing = function (x, t, b, c, d, s) {
    return c * ((t = t / d - 1) * t * (((s = 1.70158) + 1) * t + s) + 1) + b;
};

// jQuery.fn.pick -- visually picks the card(s) (by adding 'pick' class and moving
//                   it a little to top / left
//
// jQuery.fn.drop -- drops the card(s) back
$.each([PICK, "drop"], function (i, name) {
    var pick = name == PICK;
    function offset(i, value) {
        return parseInt(value, 10) + (pick ? -5 : 5);
    }
    
    $.fn[name] = function () {
        return this.each(function ($this) {
            $this = $(this);
            if ($this.hC(PICK) != pick) { // .hasClass
                $this.tC(PICK, pick).css(TOP, offset).css(LEFT, offset); // .toggleClass
            }
        });
    };
});

$.fn.extend({

    // jQuery.fn.color -- returns a color class of the card
    color: function (color) { // var as param
        color = this[0].className.match(R_COLORCLASS);
        return color ? color[0] : "";
    },
    id: function(id) {
        this.attr('id', id)
        return this;
    },

    // jQuery.fn.saveText -- saves and formats card text... and something more ;)
    saveText: function (text) {

        // if HEX color tag found in text, use this color as card background :)
        var colorTag = text.match(/(\s|^|>)(#[a-f0-9]{3}([a-f0-9]{3})?)\b/i);
        colorTag = colorTag ? colorTag[2] : "";

        this.up(CARD)
            .css({ backgroundColor: colorTag, borderColor: colorTag }) // change color to HEX tag found (if any)
            .data(VALUE, text)                                         // store raw text
            .$(TEXT).html(                                             // format and put card text
                text.replace(/(\s|^|>)(#\w*)(\b)/gi, "$1<span class=tag>$2</span>$3")   // #tags

                    // parsing and making links clickable is done with *VERY* basic regexp
                    // so fingers crossed that it will not cause problems ;)
                    //
                    // one of the problems -- &nbsp; may break link parsing
                    .replace(/&nbsp;/g, " ")
                    .replace(/(\s|^|>)(https?\:\/\/[^\s<>]+)/g, "$1<a href=$2>$2</a>")
            );
        return this;
    },

    // jQuery.fn.move -- a shortcut to the only animation used
    move: function (left) {
        return this.animate({ left: left });
    },

    // short aliases to commonly used jQuery functions
    // I know, it makes the code a little bit harder to read, but it saves
    // some precious bytes so get used to it ;)

    dlg: $.fn.delegate,
    $: $.fn.find,

    up: $.fn.closest,
    to: $.fn.appendTo,

    aC: $.fn.addClass,
    rC: $.fn.removeClass,
    tC: $.fn.toggleClass,
    hC: $.fn.hasClass

});


// And after all these definitions finally something will begin to happen

(async function () { // $(document).ready() -- theoretically not needed, as we don't manipulate the document contents
                //                        and this script is loaded in the end anyway

    // loading data from storage (or using some dummy cards)
    // 获取数据
    // data = storage.getItem(STORAGE_KEY);
    // data = data ? JSON.parse(data) : [
    //     { type: COLORS[0], text: "<p><i>欢迎光临</i></p><h2>给力任务板</h2>", top: 10, left: 30 },
    //     { type: COLORS[5], text: tip(), top: 120, left: 80 },
    //     { type: COLORS[1], text: "<p><b>注：所有的修改只会保存在你的电脑中</b></p>", top: 190, left: 80 }
    // ];
    await $(document).ready(); // 等待 DOM 加载完成
    data = [
        { type: COLORS[0], text: "<p><i>欢迎光临</i></p><h2>给力任务板</h2>", top: 10, left: 30 },
        { type: COLORS[5], text: tip(), top: 120, left: 80 },
        { type: COLORS[1], text: "<p><b>注：所有的修改只会保存在你的电脑中</b></p>", top: 190, left: 80 }
    ];

    data = await fetchCards()
    data = data.map(item => {
        console.log(item)
        return {...item.attributes, id: item.id}
    })
    console.log(data)

    // building the board
    $board = $("<section id=board>").to($body);

    $.each(data, function (i, card) {
        $(HTML_CARD)
            .aC(card.type || COLORS[5]) // .addClass
            .css(card) // we are interested in top and left values only, rest will be hopefully ignored ;)
            .saveText(card.text)
            .id(card.id)
            .to($board);
    });

    // preparing toolbars
    $actions = buildActions([ ["e", "退出"], ["c", "换颜色"], ["d", "删除"]]);

    $editbar = buildActions([["b", "加粗 (Ctrl+B)"],
                             ["i", "斜体 (Ctrl+I)"],
                             ["h", "加大 (Ctrl+H)"],
                             ["p", "缩小 (Ctrl+R)"]]).aC(EDIT); // .addClass

    buildActions([["r", "透明板"]]).to($body);

    // preparing deck with new cards
    $deck = $("<aside id=deck>").to($body)
        // on hover cards in deck are animated to encourage users to take them :)
        .dlg(CARD, HOVER, function (event) {
            if (!$body.hC(EDIT) && !$body.hC(MARK)) { // .hasClass
                $(this).stop().move(R_MOUSEIN.test(event.type) ? 20 : 0);
            }
        })
        // on mousedown new card is added to the board and can be dragged
        .dlg(CARD, MOUSEDOWN, function (event) {
            // adding new cards from deck
            if (!$body.hC(EDIT) && !$body.hC(MARK)) { // .hasClass
                var $card = $(this);
                $card.clone()          // clone deck card and add it to the board
                    .pick().aC(DRAG)
                    .css($card.offset())
                    .saveText(tip())
                    .to($board)
                    .trigger(event);   // start dragging new card
                
                $card.hide();             // hide deck card
                setTimeout(function () {  // and show it again after a while
                    $card.css(LEFT, -40).show().move(0);
                }, 1000);
            }
        });
    
    // add a card to the deck for each color
    $.each(COLORS, function (i, color) {
        i = 6 - i; // 6 is COLORS.length
        $(HTML_CARD)
            .to($deck)
            .aC(color) // .addClass
            .css(TOP, i * 30).css(LEFT, -40)
            .delay(i * 100) // animate cards into view one by one
            .move(0);
    });

// And finally the most interesting part - here it what is going on on the board

    $board
        // CARD EVENTS
        // on mousedown init card dragging
        .dlg(CARD, MOUSEDOWN, function (mouseDownEvent) {
            // don't drag in edit mode or if a tag or action is clicked on a card
            if (!$body.hC(EDIT) && !$(mouseDownEvent.target).is(TAG + "," + ACTION)) { // .hasClass
                var $card = $(this).to($board),
                    offset = $card.offset();
                
                $document
                    .bind(MOUSEMOVE, function (moveEvent) {
                        // pick a card and move it around
                        $card.pick().aC(DRAG) // .addClass
                            .css(LEFT, offset[LEFT] + moveEvent.pageX - mouseDownEvent.pageX)
                            .css(TOP,  offset[TOP]  + moveEvent.pageY - mouseDownEvent.pageY);
                    });
                
                return FALSE; // and don't select text, please
            }
        })
        // on mouseup finish dragging
        .dlg(CARD, MOUSEUP, function ($card) { // var as param
            $card = $(this);
            $document.unbind(MOUSEMOVE);
            if ($card.hC(DRAG)) { // .hasClass
                $card.rC(DRAG);   // .removeClass
                if (!$card.hC(MARK)) {
                    $card.drop(); // drop a card, but only if it is not selected
                }
                save();
            }
        })
        // on dblclick start editing card text
        .dlg(CARD, DBLCLICK, function (event) {
            // don't start editing if a tag or action was clicked
            if (!$(event.target).is(TAG + "," + ACTION)) {
                var $card = $(this),
                    $text = $card.$(TEXT),
                    value = $card.data(VALUE);
                
                if ($text[0][CONTENTEDITABLE] != TRUE) {
                    $document[CLICK](); // trigger document click to unselect cards
                                        // check line 549 to see what it does
                    $body.add($card.pick().rC(MARK)).aC(EDIT); // .addClass
                    $editbar.to($card);
                    
                    $text
                        .html(value)
                        .attr(CONTENTEDITABLE, TRUE)
                        .focus();
                    
                    $document.bind(KEYDOWN, function (keyEvent) { // bind hot-keys listener
                            if (keyEvent.which == 27) { // ESC pressed - cancel edit
                                closeEdit(TRUE);
                            }
                            if (keyEvent.ctrlKey && ACTIONS[keyEvent.which]) {
                                ACTIONS[keyEvent.which]();
                                return FALSE;
                            }
                    });
                }
            }
        })
        // on hover show action toolbar
        .dlg(CARD, HOVER, function (event) {
            if (R_MOUSEIN.test(event.type)) {
                $actions.to($(this));
            } else {
                $actions.detach();
            }
        })
        
        // TAG EVENTS
        // on hover highlight all tags with same text
        .dlg(TAG, HOVER, function (event) {
            // toggle hover class on all tags with same text
            tags($(this).text()).tC(HOVER, R_MOUSEIN.test(event.type)); // .toggleClass
        })
        // on click select all cards with same tags
        .dlg(TAG, CLICK, function ($cards) { // var as param
            $cards = tags($(this).text()).tC(MARK).up(CARD); // .toggleClass
            
            if ($(this).hC(MARK)) { // .hasClass
                // tags were selected, so highlight tagged cards
                $cards.pick()
                    .add($body).aC(MARK); // .addClass
            } else {
                // tags were unselected, so drop tagged cards
                $cards.not(HAS_MARK).rC(MARK).drop();
                $body.not(HAS_MARK).rC(MARK); // .removeClass
            }
        });

// We are almost at the end of out journey.
// Last but not least, the event bound to the document itself.

    $document
        // when clicked somewhere on the page close edit mode and unselect all cards
        .bind(CLICK, function ($target) {
            $target = $($target.target);
            if ($body.hC(EDIT) && !$target.up(CARD + DOT + EDIT)[0]) { // .hasClass
            // if in edit mode and clicked outside edited card, close edit mode and save
                closeEdit();
            } else if ($target.has($body)[0]) { // .has($body) is a short way of checking if element is document root
                // if clicked somewhere on the page background, unselect all cards
                $(DOT + MARK).rC(MARK).drop(); // .removeClass
            }
        });

})();

// And that's all folks!

})(document, jQuery, storage2);

// 写一个类似 localStorage 的函数，有里面的几个方法，setItem、getItem、removeItem、clear，这样就可以在不支持 localStorage 的浏览器上使用了。

// localStorage polyfill
var storage2 = (function () {
    var data = {};
    return {
        setItem: function (key, value) {
            data[key] = value;
        },
        getItem: function (key) {
            return data[key];
        },
        removeItem: function (key) {
            delete data[key];
        },
        clear: function () {
            data = {};
        }
    };
})();
