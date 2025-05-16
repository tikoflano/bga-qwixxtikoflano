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
define("utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLTRRow = isLTRRow;
    exports.getPlayerBoard = getPlayerBoard;
    exports.getBoxByPosition = getBoxByPosition;
    exports.getBoxByValue = getBoxByValue;
    exports.getDiceSum = getDiceSum;
    exports.objectEntries = objectEntries;
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
    function getBoxBy(palyer_board, color, value, data_attribute) {
        var box = dojo.query(".box[data-color=\"".concat(color, "\"][data-").concat(data_attribute, "=\"").concat(value, "\"]"), palyer_board)[0];
        if (!box) {
            throw Error("Box not found!");
        }
        return box;
    }
    function getBoxByPosition(palyer_board, color, position) {
        return getBoxBy(palyer_board, color, position, "position");
    }
    function getBoxByValue(palyer_board, color, value) {
        return getBoxBy(palyer_board, color, value, "value");
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
});
define("listeners", ["require", "exports"], function (require, exports) {
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
        console.log("CLICK", { color: color, position: position, value: value });
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
define("bgagame/qwixxtikoflano", ["require", "exports", "ebg/core/gamegui", "utils", "listeners", "ebg/counter"], function (require, exports, Gamegui, utils_1, listeners_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QwixxTikoflano = void 0;
    var QwixxTikoflano = (function (_super) {
        __extends(QwixxTikoflano, _super);
        function QwixxTikoflano() {
            var _this = _super.call(this) || this;
            _this.setupNotifications = function () {
                console.log("notifications subscriptions setup");
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
                var player_board = (0, utils_1.getPlayerBoard)(player_id);
                var height = 37;
                var colors = ["red", "yellow", "green", "blue"];
                for (var i = 0; i < colors.length; i++) {
                    var top_1 = 15 + (height + 14) * i;
                    for (var x = 2; x <= 12; x++) {
                        var left = 26 + 39 * (x - 2);
                        var cell_number = (0, utils_1.isLTRRow)(colors[i]) ? x : 14 - x;
                        dojo.place("\n              <div\n                class=\"box\"\n                data-color=\"".concat(colors[i], "\"\n                data-position=\"").concat(x - 2, "\"\n                data-value=\"").concat(cell_number, "\"\n                style=\"left: ").concat(left, "px; top: ").concat(top_1, "px; height: ").concat(height, "px\"\n              ></div>\n            "), player_board);
                    }
                    dojo.place("<div\n            class=\"box lock\"\n            data-color=\"".concat(colors[i], "\"\n            data-position=\"11\"\n            data-value=\"lock\"\n            style=\"top: ").concat(top_1 + 5, "px;\"\n          ></div>"), player_board);
                }
            }
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
                    for (var _b = 0, _c = Object.entries(state.args["die"]); _b < _c.length; _b++) {
                        var _d = _c[_b], color = _d[0], value = _d[1];
                        dojo.byId("die_".concat(color)).dataset["value"] = "".concat(value);
                    }
                    var maxCheckedBoxPosition = {
                        red: -1,
                        yellow: -1,
                        green: -1,
                        blue: -1,
                    };
                    for (var _e = 0, _f = state.args["checkedBoxes"]; _e < _f.length; _e++) {
                        var checkedBox = _f[_e];
                        var box_color = checkedBox["color"];
                        var box_position = parseInt(checkedBox["position"]);
                        var box_player_id = checkedBox["player_id"];
                        var player_board = (0, utils_1.getPlayerBoard)(box_player_id);
                        var box = (0, utils_1.getBoxByPosition)(player_board, box_color, box_position);
                        if (box_player_id == this.player_id) {
                            maxCheckedBoxPosition[box_color] = Math.max(maxCheckedBoxPosition[box_color], box_position);
                        }
                        dojo.addClass(box, "crossed");
                    }
                    var my_player_board = (0, utils_1.getPlayerBoard)(this.player_id);
                    for (var _g = 0, _h = (0, utils_1.objectEntries)(maxCheckedBoxPosition); _g < _h.length; _g++) {
                        var _j = _h[_g], row_color = _j[0], max_position = _j[1];
                        for (var position = 0; position <= max_position; position++) {
                            var box = (0, utils_1.getBoxByPosition)(my_player_board, row_color, position);
                            dojo.addClass(box, "invalid");
                        }
                    }
                    var white_dice_sum = (0, utils_1.getDiceSum)("white_1", "white_2");
                    for (var _k = 0, _l = (0, utils_1.objectEntries)(maxCheckedBoxPosition); _k < _l.length; _k++) {
                        var row_color = _l[_k][0];
                        var box = (0, utils_1.getBoxByValue)(my_player_board, row_color, white_dice_sum);
                        if (!box.classList.contains("invalid")) {
                            dojo.addClass(box, "clickable");
                            dojo.connect(box, "click", this, listeners_1.onCheckBox);
                        }
                    }
                    break;
            }
        };
        QwixxTikoflano.prototype.onLeavingState = function (stateName) {
            console.log("Leaving state: " + stateName);
            switch (stateName) {
                case "dummmy":
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
                        this.addActionButton("button_pass", _("Pass"), listeners_1.onPass);
                    }
                    else {
                        this.removeActionButtons();
                    }
                    break;
            }
        };
        return QwixxTikoflano;
    }(Gamegui));
    exports.QwixxTikoflano = QwixxTikoflano;
    window.bgagame = { qwixxtikoflano: QwixxTikoflano };
});
