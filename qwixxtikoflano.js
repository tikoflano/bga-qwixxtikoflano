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
define("ts/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLTRRow = isLTRRow;
    exports.getPlayerBoard = getPlayerBoard;
    exports.getBoxBy = getBoxBy;
    exports.getBoxByPosition = getBoxByPosition;
    exports.getBoxByValue = getBoxByValue;
    exports.getPenaltyBox = getPenaltyBox;
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
    function getPenaltyBox(player_id, position) {
        var player_board = getPlayerBoard(player_id);
        var penaltyBox = dojo.query(".box.penalty[data-position=\"".concat(position, "\"]"), player_board)[0];
        if (!penaltyBox) {
            throw Error("Penalty box not found!");
        }
        return penaltyBox;
    }
    function getDiceSum(die1_color, die2_color) {
        var die1 = dojo.query(".die[data-color=\"".concat(die1_color, "\"]"))[0];
        var die2 = dojo.query(".die[data-color=\"".concat(die2_color, "\"]"))[0];
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
            var _b = _a[_i], color = _b[0], die_data = _b[1];
            var node = dojo.query(".die[data-color=\"".concat(color, "\"]"))[0];
            if (die_data["in_play"] === "1") {
                if (!node) {
                    throw Error("Die element not found: ".concat(color));
                }
                node.dataset["value"] = "".concat(die_data["value"]);
            }
            else {
                if (node) {
                    dojo.destroy(node);
                }
            }
        }
        setDiceCombinations(dice_values);
    }
    function setDiceCombinations(dice_values) {
        dojo.empty("dice_combinations_wrapper");
        dojo.place("<div id=\"dice_combinations_white\" class=\"dice_combinations\">\n      <div class=\"dice_combination\">\n        <span class=\"die\" data-value=\"".concat(dice_values["white_1"]["value"], "\" data-color=\"white_1\"></span>\n        <span class=\"plus\"> + </span>\n        <span class=\"die\" data-value=\"").concat(dice_values["white_2"]["value"], "\" data-color=\"white_2\"></span>\n        <span class=\"equals\"> = </span>\n        <span class=\"result\" data-color=\"white\">\n          ").concat(parseInt(dice_values["white_1"]["value"]) + parseInt(dice_values["white_2"]["value"]), "</span\n        >\n      </div>\n    </div>"), "dice_combinations_wrapper");
        for (var _i = 0, _a = ["white_1", "white_2"]; _i < _a.length; _i++) {
            var white_die = _a[_i];
            dojo.place("<div id=\"dice_combinations_".concat(white_die, "\" class=\"dice_combinations\"></div>"), "dice_combinations_wrapper");
            for (var _b = 0, _c = ["red", "yellow", "green", "blue"]; _b < _c.length; _b++) {
                var color_die = _c[_b];
                if (dice_values[color_die]["in_play"] !== "1") {
                    continue;
                }
                dojo.place("<div class=\"dice_combination\">\n          <span class=\"die\" data-value=\"".concat(dice_values[white_die]["value"], "\" data-color=\"").concat(white_die, "\"></span>\n          <span class=\"plus\"> + </span>\n          <span class=\"die\" data-value=\"").concat(dice_values[color_die]["value"], "\" data-color=\"").concat(color_die, "\"></span>\n          <span class=\"equals\"> = </span>\n          <span class=\"result\" data-color=\"").concat(color_die, "\">\n            ").concat(parseInt(dice_values[white_die]["value"]) + parseInt(dice_values[color_die]["value"]), "</span\n          >\n        </div>"), "dice_combinations_".concat(white_die));
            }
        }
    }
});
define("ts/userActionsHandlers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onCheckBox = onCheckBox;
    exports.onCheckPenaltyBox = onCheckPenaltyBox;
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
    function onCheckPenaltyBox(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!(evt.currentTarget instanceof HTMLElement)) {
            throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
        }
        if (!evt.currentTarget.classList.contains("clickable")) {
            return;
        }
        this.bgaPerformAction("actCheckPenaltyBox", {});
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
define("ts/notificationsHandlers", ["require", "exports", "ts/utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ntf_boxCheckedHandler = ntf_boxCheckedHandler;
    exports.ntf_diceRolledHandler = ntf_diceRolledHandler;
    exports.ntf_penaltyBoxChecked = ntf_penaltyBoxChecked;
    exports.ntf_scoreChanged = ntf_scoreChanged;
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
    function ntf_penaltyBoxChecked(notif) {
        this.markCheckedPenaltyBoxes(notif.args["player_id"], notif.args["penalty_count"]);
    }
    function ntf_scoreChanged(notif) {
        this.scoreCtrl[notif.args["player_id"]].setValue(notif.args["total_score"]);
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
                dojo.subscribe("penaltyBoxChecked", _this, notificationsHandlers_1.ntf_penaltyBoxChecked);
                dojo.subscribe("scoreChanged", _this, notificationsHandlers_1.ntf_scoreChanged);
            };
            console.log("qwixxtikoflano constructor");
            return _this;
        }
        QwixxTikoflano.prototype.setup = function (gamedatas) {
            console.log("Starting game setup", gamedatas);
            var players_area_id = "players_area";
            var other_players_area_id = "other_players_area";
            var this_player_area_id = "this_player_area";
            dojo.place("<div id=\"".concat(players_area_id, "\"></div>"), "game_play_area", "last");
            dojo.place("<div id=\"".concat(this_player_area_id, "\"></div>"), players_area_id, "last");
            dojo.place("<div id=\"".concat(other_players_area_id, "\"></div>"), players_area_id, "last");
            var player_id;
            for (player_id in gamedatas.players) {
                var player = gamedatas.players[player_id];
                var isCurrentPlayer = "".concat(this.player_id) == player_id;
                var player_area_tpl = "\n        <div class=\"player_area\" data-player-id=\"".concat(player_id, "\">\n          <span class=\"player_name\"><i class=\"fa fa-star\"></i>").concat(player.name, "</span>\n          <div class=\"player_board\"></div>\n        </div>\n      ");
                dojo.place(player_area_tpl, isCurrentPlayer ? this_player_area_id : other_players_area_id);
                var player_panel_tpl = "\n        <div class=\"player_panel\" data-player-id=\"".concat(player_id, "\">\n          <span class=\"box_counter\" data-color=\"red\" data-value=\"0\"></span>\n          <span class=\"box_counter\" data-color=\"yellow\" data-value=\"0\"></span>\n          <span class=\"box_counter\" data-color=\"green\" data-value=\"0\"></span>\n          <span class=\"box_counter\" data-color=\"blue\" data-value=\"0\"></span>\n        </div>\n      ");
                dojo.place(player_panel_tpl, this.getPlayerPanelElement(player_id), "last");
                var player_board = (0, utils_2.getPlayerBoard)(player_id);
                var colors = ["red", "yellow", "green", "blue"];
                for (var i = 0; i < colors.length; i++) {
                    var top_1 = 9 + 30.5 * i;
                    if (isCurrentPlayer) {
                        top_1 = 15 + 51 * i;
                    }
                    for (var x = 2; x <= 12; x++) {
                        var left = 16 + 23.3 * (x - 2);
                        if (isCurrentPlayer) {
                            left = 26 + 39 * (x - 2);
                        }
                        var cell_number = (0, utils_2.isLTRRow)(colors[i]) ? x : 14 - x;
                        dojo.place("\n              <div\n                class=\"box\"\n                data-color=\"".concat(colors[i], "\"\n                data-position=\"").concat(x - 2, "\"\n                data-value=\"").concat(cell_number, "\"\n                style=\"left: ").concat(left, "px; top: ").concat(top_1, "px;\"\n              ></div>\n            "), player_board);
                    }
                    dojo.place("<div\n            class=\"box lock\"\n            data-color=\"".concat(colors[i], "\"\n            data-position=\"11\"\n            data-value=\"lock\"\n            style=\"top: ").concat(top_1 + (isCurrentPlayer ? 5 : 3), "px;\"\n          ></div>"), player_board);
                }
                for (var i = 0; i < 4; i++) {
                    var left = 231 + 12.5 * i;
                    if (isCurrentPlayer) {
                        left = 387 + 20 * i;
                    }
                    dojo.place("<div class=\"box penalty\" data-position=\"".concat(i, "\" style=\"left: ").concat(left, "px;\"></div>"), player_board);
                }
            }
            var dice_tray = "\n      <div id=\"dice_tray\">\n        <div id=\"dice_results\">\n          <span class=\"die\" data-value=\"1\" data-color=\"white_1\"></span>\n          <span class=\"die\" data-value=\"2\" data-color=\"white_2\"></span>\n          <span class=\"die\" data-value=\"3\" data-color=\"red\"></span>\n          <span class=\"die\" data-value=\"4\" data-color=\"yellow\"></span>\n          <span class=\"die\" data-value=\"5\" data-color=\"green\"></span>\n          <span class=\"die\" data-value=\"6\" data-color=\"blue\"></span>\n        </div>\n        <div class=\"divider\"></div>\n        <div id=\"dice_combinations_wrapper\"></div>\n      </div>\n    ";
            dojo.place(dice_tray, this_player_area_id);
            (0, utils_2.setDiceFaces)(gamedatas["dice"]);
            for (var _i = 0, _a = gamedatas["checkedBoxes"]; _i < _a.length; _i++) {
                var checkedBox = _a[_i];
                var box_player_id = checkedBox["player_id"];
                var box_color = checkedBox["color"];
                var box_position = parseInt(checkedBox["position"]);
                this.markCheckedBox(box_player_id, box_color, box_position);
            }
            for (player_id in gamedatas.players) {
                var player_data = gamedatas.players[player_id];
                this.markCheckedPenaltyBoxes(player_id, player_data["penalty_count"]);
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
            if (!["multipleactiveplayer", "activeplayer"].includes(state.type)) {
                return;
            }
            var active_player_id = state.args["active_player"];
            var active_player_area = dojo.query(".player_area[data-player-id=\"".concat(active_player_id, "\"]"));
            if (!active_player_area.length) {
                throw Error("Player area not found for player: ".concat(active_player_id));
            }
            active_player_area.addClass("active_player");
            if ("".concat(active_player_id) === "".concat(this.player_id)) {
                dojo.addClass("this_player_area", "active_player");
            }
        };
        QwixxTikoflano.prototype.onLeavingState = function (stateName) {
            console.log("Leaving state: " + stateName);
            this.clearClickHandlers();
            dojo.query(".active_player").removeClass("active_player");
        };
        QwixxTikoflano.prototype.onUpdateActionButtons = function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var stateName = _a[0], args = _a[1];
            console.log("onUpdateActionButtons: " + stateName, args);
            if (!this.isCurrentPlayerActive() || !args["_private"]) {
                return;
            }
            if (["useWhiteSum", "mustUseColorSum", "mayUseColorSum"].includes(stateName)) {
                for (var _b = 0, _c = args["_private"]["valid_moves"]; _b < _c.length; _b++) {
                    var valid_move = _c[_b];
                    this.makeBoxClickable(valid_move["color"], valid_move["value"]);
                }
            }
            if (stateName === "useWhiteSum" || stateName === "mayUseColorSum") {
                this.addActionButton("button_pass", _("Pass"), userActionsHandlers_1.onPass);
            }
            if (stateName === "mustUseColorSum") {
                this.makeFirstPenaltyBoxClickable();
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
        QwixxTikoflano.prototype.makeFirstPenaltyBoxClickable = function () {
            var player_board = (0, utils_2.getPlayerBoard)(this.player_id);
            var penaltyBox = dojo.query(".box.penalty:not(.crossed)", player_board)[0];
            if (!penaltyBox) {
                throw Error("Penalty box not found!");
            }
            dojo.addClass(penaltyBox, "clickable");
            this.click_connections.push(dojo.connect(penaltyBox, "click", this, userActionsHandlers_1.onCheckPenaltyBox));
        };
        QwixxTikoflano.prototype.markCheckedBox = function (player_id, color, position) {
            var box = (0, utils_2.getBoxByPosition)(player_id, color, position);
            dojo.addClass(box, "crossed");
            var box_counter = dojo.query(".player_panel .box_counter[data-color=\"".concat(color, "\"]"), this.getPlayerPanelElement(player_id))[0];
            if (!box_counter) {
                throw Error("Box counter not found!");
            }
            box_counter.dataset["value"] = "".concat(parseInt(box_counter.dataset["value"]) + 1);
            if (player_id == this.player_id) {
                this.max_checked_box_position[color] = Math.max(this.max_checked_box_position[color], position);
            }
        };
        QwixxTikoflano.prototype.markCheckedPenaltyBoxes = function (player_id, amount) {
            for (var i = 0; i < amount; i++) {
                var penaltyBox = (0, utils_2.getPenaltyBox)(player_id, i);
                dojo.addClass(penaltyBox, "crossed");
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
