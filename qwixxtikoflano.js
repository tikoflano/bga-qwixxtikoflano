var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("ts/userActionsHandlers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onCheckBox = onCheckBox;
    exports.onPass = onPass;
    function onCheckBox(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!(evt.currentTarget instanceof HTMLElement)) {
            throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
        }
        if (!evt.currentTarget.classList.contains("clickable")) {
            return;
        }
        var _a = evt.currentTarget.dataset, color = _a.color, position = _a.position, value = _a.value;
        this.bgaPerformAction("actCheckBox", { color: color, position: position, value: value });
    }
    function onPass(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!(evt.currentTarget instanceof HTMLElement)) {
            throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
        }
        this.bgaPerformAction("actPass", {});
    }
});
define("ts/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLTRRow = isLTRRow;
    exports.getPlayerBoard = getPlayerBoard;
    exports.getBoxBy = getBoxBy;
    exports.getBoxByPosition = getBoxByPosition;
    exports.getBoxByValue = getBoxByValue;
    exports.getDiceSum = getDiceSum;
    exports.objectEntries = objectEntries;
    exports.setDiceFaces = setDiceFaces;
    function isLTRRow(color) {
        return ["red", "yellow"].includes(color);
    }
    function getPlayerBoard(player_id) {
        var player_board = dojo.query(".player_area[data-player-id=\"".concat(player_id, "\"] .player_board"))[0];
        if (!player_board) {
            throw Error("Player board not found!");
        }
        return player_board;
    }
    function getBoxBy(player_id, color, value, data_attribute) {
        var player_board = getPlayerBoard(player_id);
        var box = dojo.query(".box[data-color=\"".concat(color, "\"][data-").concat(data_attribute, "=\"").concat(value, "\"]"), player_board)[0];
        if (!box) {
            throw Error("Box not found!");
        }
        return box;
    }
    function getBoxByPosition(player_id, color, position) {
        return getBoxBy(player_id, color, position, "position");
    }
    function getBoxByValue(player_id, color, value) {
        return getBoxBy(player_id, color, value, "value");
    }
    function getDiceSum(die1_color, die2_color) {
        var die1 = dojo.byId("die_".concat(die1_color));
        var die2 = dojo.byId("die_".concat(die2_color));
        if (!die1 || !die2) {
            throw Error("Die not found!");
        }
        var value1 = die1.dataset["value"];
        var value2 = die2.dataset["value"];
        if (!value1 || !value2) {
            throw Error("Die value not found");
        }
        return parseInt(value1) + parseInt(value2);
    }
    function objectEntries(obj) {
        return Object.entries(obj);
    }
    function setDiceFaces(dice_values) {
        for (var _i = 0, _a = objectEntries(dice_values); _i < _a.length; _i++) {
            var _b = _a[_i], color = _b[0], value = _b[1];
            dojo.byId("die_".concat(color)).dataset["value"] = "".concat(value);
        }
    }
});
define("ts/notificationsHandlers", ["require", "exports", "ts/utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ntf_boxCheckedHandler = ntf_boxCheckedHandler;
    exports.ntf_diceRolledHandler = ntf_diceRolledHandler;
    function ntf_boxCheckedHandler(notif) {
        this.markCheckedBox(notif.args["player_id"], notif.args["color"], notif.args["position"]);
        this.updateInvalidBoxes();
        if (notif.args["player_id"] == this.player_id) {
            this.clearClickHandlers();
        }
    }
    function ntf_diceRolledHandler(notif) {
        (0, utils_1.setDiceFaces)(notif.args["dice"]);
    }
});
define("bgagame/qwixxtikoflano", ["require", "exports", "ebg/core/gamegui", "ts/utils", "ts/userActionsHandlers", "ts/notificationsHandlers", "ebg/counter"], function (require, exports, Gamegui, utils_2, userActionsHandlers_1, notificationsHandlers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QwixxTikoflano = void 0;
    var SetupGamegui = Gamegui;
    var QwixxTikoflano = (function (_super) {
        __extends(QwixxTikoflano, _super);
        function QwixxTikoflano() {
            var _this = _super.call(this) || this;
            _this.max_checked_box_position = {
                red: -1,
                yellow: -1,
                green: -1,
                blue: -1,
            };
            _this.click_connections = [];
            _this.setupNotifications = function () {
                console.log("notifications subscriptions setup");
                dojo.subscribe("boxChecked", _this, notificationsHandlers_1.ntf_boxCheckedHandler);
                dojo.subscribe("diceRolled", _this, notificationsHandlers_1.ntf_diceRolledHandler);
            };
            console.log("qwixxtikoflano constructor");
            return _this;
        }
        QwixxTikoflano.prototype.setup = function (gamedatas) {
            console.log("Starting game setup", gamedatas);
            var die_tray = "\n        <div id=\"die_tray\">\n          <span id=\"die_white_1\" class=\"die\" data-value=\"1\" data-color=\"white\"></span>\n          <span id=\"die_white_2\" class=\"die\" data-value=\"2\" data-color=\"white\"></span>\n          <span id=\"die_red\" class=\"die\" data-value=\"3\" data-color=\"red\"></span>\n          <span id=\"die_yellow\" class=\"die\" data-value=\"4\" data-color=\"yellow\"></span>\n          <span id=\"die_green\" class=\"die\" data-value=\"5\" data-color=\"green\"></span>\n          <span id=\"die_blue\" class=\"die\" data-value=\"6\" data-color=\"blue\"></span>\n        </div>\n      ";
            dojo.place(die_tray, "game_play_area", "first");
            var player_id;
            for (player_id in gamedatas.players) {
                var player = gamedatas.players[player_id];
                var isCurrentPlayer = this.player_id == player_id;
                var player_area_tpl = "\n        <div class=\"player_area\" data-player-id=\"".concat(player_id, "\">\n          <span class=\"player_name\">").concat(player === null || player === void 0 ? void 0 : player.name, "</span>\n          <div class=\"player_board\"></div>\n        </div>\n      ");
                dojo.place(player_area_tpl, "game_play_area", isCurrentPlayer ? 2 : "last");
                var player_board = (0, utils_2.getPlayerBoard)(player_id);
                var height = 37;
                var colors = ["red", "yellow", "green", "blue"];
                for (var i = 0; i < colors.length; i++) {
                    var top_1 = 15 + (height + 14) * i;
                    for (var x = 2; x <= 12; x++) {
                        var left = 26 + 39 * (x - 2);
                        var cell_number = (0, utils_2.isLTRRow)(colors[i]) ? x : 14 - x;
                        dojo.place("\n              <div\n                class=\"box\"\n                data-color=\"".concat(colors[i], "\"\n                data-position=\"").concat(x - 2, "\"\n                data-value=\"").concat(cell_number, "\"\n                style=\"left: ").concat(left, "px; top: ").concat(top_1, "px; height: ").concat(height, "px\"\n              ></div>\n            "), player_board);
                    }
                    dojo.place("<div\n            class=\"box lock\"\n            data-color=\"".concat(colors[i], "\"\n            data-position=\"11\"\n            data-value=\"lock\"\n            style=\"top: ").concat(top_1 + 5, "px;\"\n          ></div>"), player_board);
                }
            }
            (0, utils_2.setDiceFaces)(gamedatas["dice"]);
            for (var _i = 0, _a = gamedatas["checkedBoxes"]; _i < _a.length; _i++) {
                var checkedBox = _a[_i];
                var box_player_id = checkedBox["player_id"];
                var box_color = checkedBox["color"];
                var box_position = parseInt(checkedBox["position"]);
                this.markCheckedBox(box_player_id, box_color, box_position);
            }
            this.updateInvalidBoxes();
            this.setupNotifications();
            console.log("Ending game setup");
        };
        QwixxTikoflano.prototype.onEnteringState = function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var stateName = _a[0], state = _a[1];
            console.log("Entering state: " + stateName, state);
            switch (stateName) {
                case "useWhiteSum":
                    var white_dice_sum = (0, utils_2.getDiceSum)("white_1", "white_2");
                    for (var _b = 0, _c = (0, utils_2.objectEntries)(this.max_checked_box_position); _b < _c.length; _b++) {
                        var row_color = _c[_b][0];
                        this.makeBoxClickable(row_color, white_dice_sum);
                    }
                    break;
                case "useColorSum":
                    var possible_sums = {
                        red: { white_1: -1, white_2: -1 },
                        yellow: { white_1: -1, white_2: -1 },
                        green: { white_1: -1, white_2: -1 },
                        blue: { white_1: -1, white_2: -1 },
                    };
                    for (var _d = 0, _e = ["red", "yellow", "green", "blue"]; _d < _e.length; _d++) {
                        var color_die = _e[_d];
                        for (var _f = 0, _g = ["white_1", "white_2"]; _f < _g.length; _f++) {
                            var white_die = _g[_f];
                            possible_sums[color_die][white_die] = (0, utils_2.getDiceSum)(color_die, white_die);
                        }
                    }
                    if (state.active_player == this.player_id) {
                        for (var _h = 0, _j = (0, utils_2.objectEntries)(possible_sums); _h < _j.length; _h++) {
                            var _k = _j[_h], row_color = _k[0], sum_data = _k[1];
                            for (var _l = 0, _m = (0, utils_2.objectEntries)(sum_data); _l < _m.length; _l++) {
                                var _o = _m[_l], sum = _o[1];
                                this.makeBoxClickable(row_color, sum);
                            }
                        }
                    }
                    break;
            }
        };
        QwixxTikoflano.prototype.onLeavingState = function (stateName) {
            console.log("Leaving state: " + stateName);
            switch (stateName) {
                case "useWhiteSum":
                case "useColorSum":
                    this.clearClickHandlers();
                    break;
            }
        };
        QwixxTikoflano.prototype.onUpdateActionButtons = function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var stateName = _a[0], args = _a[1];
            console.log("onUpdateActionButtons: " + stateName, args);
            if (this.isSpectator)
                return;
            switch (stateName) {
                case "useWhiteSum":
                    if (this.isCurrentPlayerActive()) {
                        this.addActionButton("button_pass", _("Pass"), userActionsHandlers_1.onPass);
                    }
                    else {
                        this.removeActionButtons();
                    }
                    break;
            }
        };
        QwixxTikoflano.prototype.makeBoxClickable = function (color, value) {
            var box = (0, utils_2.getBoxByValue)(this.player_id, color, value);
            if (box.classList.contains("invalid") || box.classList.contains("clickable")) {
                return;
            }
            dojo.addClass(box, "clickable");
            this.click_connections.push(dojo.connect(box, "click", this, userActionsHandlers_1.onCheckBox));
        };
        QwixxTikoflano.prototype.markCheckedBox = function (player_id, color, position) {
            var box = (0, utils_2.getBoxByPosition)(player_id, color, position);
            dojo.addClass(box, "crossed");
            if (player_id == this.player_id) {
                this.max_checked_box_position[color] = Math.max(this.max_checked_box_position[color], position);
            }
        };
        QwixxTikoflano.prototype.updateInvalidBoxes = function () {
            for (var _i = 0, _a = (0, utils_2.objectEntries)(this.max_checked_box_position); _i < _a.length; _i++) {
                var _b = _a[_i], row_color = _b[0], max_position = _b[1];
                for (var position = 0; position <= max_position; position++) {
                    var box = (0, utils_2.getBoxByPosition)(this.player_id, row_color, position);
                    dojo.addClass(box, "invalid");
                }
            }
        };
        QwixxTikoflano.prototype.clearClickHandlers = function () {
            this.click_connections.forEach(function (connection) { return dojo.disconnect(connection); });
            dojo.query(".clickable").removeClass("clickable");
        };
        return QwixxTikoflano;
    }(SetupGamegui));
    exports.QwixxTikoflano = QwixxTikoflano;
    window.bgagame = { qwixxtikoflano: QwixxTikoflano };
});
