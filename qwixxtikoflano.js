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
define("bgagame/qwixxtikoflano", ["require", "exports", "ebg/core/gamegui", "ebg/counter"], function (require, exports, Gamegui) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            dojo.place(die_tray, "game_play_area");
            var player_id;
            var player_areas = [];
            for (player_id in gamedatas.players) {
                var player = gamedatas.players[player_id];
                var player_area_tpl = "\n        <div id=\"player_area_".concat(player_id, "\" class=\"player_area\">\n          <span class=\"player_name\">").concat(player === null || player === void 0 ? void 0 : player.name, "</span>\n          <div id=\"player_board_").concat(player_id, "\" class=\"player_board\"></div>\n        </div>\n      ");
                if (this.player_id == player_id) {
                    player_areas.unshift(player_area_tpl);
                }
                else {
                    player_areas.push(player_area_tpl);
                }
            }
            player_areas.forEach(function (pa) { return dojo.place(pa, "game_play_area"); });
            var height = 37;
            var colors = ["red", "yellow", "green", "blue"];
            for (var i = 0; i < colors.length; i++) {
                var top_1 = 15 + (height + 14) * i;
                for (var x = 2; x <= 12; x++) {
                    var left = 26 + 39 * (x - 2);
                    var cell_number = this.isLTRRow(colors[i]) ? x : 14 - x;
                    dojo.place("<div id=\"square_".concat(colors[i], "_").concat(cell_number, "\" class=\"square\" style=\"left: ").concat(left, "px; top: ").concat(top_1, "px; height: ").concat(height, "px\"></div>"), "player_board_".concat(this.player_id));
                }
                dojo.place("<div id=\"square_".concat(colors[i], "_lock\" class=\"square lock\" style=\"top: ").concat(top_1 + 5, "px;\"></div>"), "player_board_".concat(this.player_id));
            }
            dojo.query(".square").connect("click", this, "onCheckBox");
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
                    var maxCheckedBox = {
                        red: 0,
                        yellow: 0,
                        green: 13,
                        blue: 13,
                    };
                    for (var _e = 0, _f = state.args["checkedBoxes"]; _e < _f.length; _e++) {
                        var dieData = _f[_e];
                        var dieColor = dieData["color"];
                        var dieValue = parseInt(dieData["value"]);
                        var boxSelector = "square_".concat(dieColor, "_").concat(dieValue);
                        var box = dojo.byId(boxSelector);
                        if (!box) {
                            throw Error("Invalid box selector: ".concat(boxSelector));
                        }
                        if (this.isLTRRow(dieColor)) {
                            maxCheckedBox[dieColor] = Math.max(maxCheckedBox[dieColor], dieData["value"]);
                        }
                        else {
                            maxCheckedBox[dieColor] = Math.min(maxCheckedBox[dieColor], dieData["value"]);
                        }
                        dojo.addClass(box, "crossed");
                    }
                    for (var _g = 0, _h = Object.entries(maxCheckedBox); _g < _h.length; _g++) {
                        var _j = _h[_g], dieColor = _j[0], maxCheckedBoxValue = _j[1];
                        if (this.isLTRRow(dieColor)) {
                            for (var dieValue = 2; dieValue <= maxCheckedBoxValue; dieValue++) {
                                var boxSelector = "square_".concat(dieColor, "_").concat(dieValue);
                                var box = dojo.byId(boxSelector);
                                if (!box) {
                                    throw Error("Invalid box selector: ".concat(boxSelector));
                                }
                                dojo.addClass(box, "invalid");
                            }
                        }
                        else {
                            for (var dieValue = 12; dieValue >= maxCheckedBoxValue; dieValue--) {
                                var boxSelector = "square_".concat(dieColor, "_").concat(dieValue);
                                var box = dojo.byId(boxSelector);
                                if (!box) {
                                    throw Error("Invalid box selector: ".concat(boxSelector));
                                }
                                dojo.addClass(box, "invalid");
                            }
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
                        this.addActionButton("button_pass", _("Pass"), this.onPass);
                    }
                    else {
                        this.removeActionButtons();
                    }
                    break;
            }
        };
        QwixxTikoflano.prototype.isLTRRow = function (color) {
            return ["red", "yellow"].includes(color);
        };
        QwixxTikoflano.prototype.onCheckBox = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (!(evt.currentTarget instanceof HTMLElement)) {
                throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
            }
            if (evt.currentTarget.classList.contains("crossed")) {
                return;
            }
            var _a = evt.currentTarget.id.split("_"), color = _a[1], value = _a[2];
        };
        QwixxTikoflano.prototype.onPass = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (!(evt.currentTarget instanceof HTMLElement)) {
                throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
            }
            this.bgaPerformAction("actPass", {});
        };
        return QwixxTikoflano;
    }(Gamegui));
    window.bgagame = { qwixxtikoflano: QwixxTikoflano };
});
