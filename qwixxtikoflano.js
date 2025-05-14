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
            var width = 36;
            var top = 15;
            for (var x = 2; x <= 12; x++) {
                var left = Math.round((x - 2) * width + 26 + (x - 2) * 3);
                dojo.place("<div id=\"square_red_".concat(x, "\" class=\"square\" style=\"left: ").concat(left, "px; top: ").concat(top, "px; width: ").concat(width, "px\"></div>"), "player_board_".concat(this.player_id), "first");
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
            console.log("Entering state: " + stateName);
            switch (stateName) {
                case "dummmy":
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
            if (!this.isCurrentPlayerActive())
                return;
            switch (stateName) {
                case "dummmy":
                    break;
            }
        };
        return QwixxTikoflano;
    }(Gamegui));
    window.bgagame = { qwixxtikoflano: QwixxTikoflano };
});
