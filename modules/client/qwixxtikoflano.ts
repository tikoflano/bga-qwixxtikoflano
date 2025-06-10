/*
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * QwixxTikoflano implementation : © tikoflano
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/**
 * See {@link ../../node_modules/bga-ts-template/docs/typescript/index.md} for a LOT more information on this file.
 * The file include alternative ways to structure this file, how to break it up into multiple files, and more.
 */

// Defines the name of this module. Same as putting this code into a file at path: bgagame/qwixxtikoflano.ts
/// <amd-module name="bgagame/qwixxtikoflano"/>

import Gamegui = require("ebg/core/gamegui");
import "ebg/counter";
import {
  getPlayerBoard,
  getBoxByPosition,
  isLTRRow,
  objectEntries,
  setDiceFaces,
  getBoxByValue,
  getPenaltyBox,
} from "./ts/utils";
import { onCheckBox, onCheckPenaltyBox, onPass } from "./ts/userActionsHandlers";
import {
  ntf_boxCheckedHandler,
  ntf_diceRolledHandler,
  ntf_penaltyBoxChecked,
  ntf_scoreChanged,
} from "./ts/notificationsHandlers";

export type RowColor = "red" | "yellow" | "green" | "blue";
export type WhiteDice = "white_1" | "white_2";
export type DieColor = WhiteDice | RowColor;
export type DiceValues = Record<DieColor, { color: string; value: string; in_play: string }>;
export interface DiceCombinations {
  white_1: { [key in Exclude<DieColor, "white_1">]: number };
  white_2: { [key in Exclude<DieColor, "white_2">]: number };
}
type RowValues = Record<RowColor, number>;

interface PlayerData extends BGA.GamePlayer {
  penalty_count: number;
}

// Typescript casting, which results in no impact.
const SetupGamegui = Gamegui as DojoJS.DojoClassFrom<
  [
    typeof Gamegui,
    {
      // Redefine any properties desired...
      player_id: BGA.ID; // no longer nullable
      gamedatas: BGA.Gamedatas; // no longer nullable
      game_id: number; // no longer undefinable
    },
  ]
>;

/** See {@link BGA.Gamegui} for more information. */
export class QwixxTikoflano extends SetupGamegui {
  private max_checked_box_position: RowValues = {
    red: -1,
    yellow: -1,
    green: -1,
    blue: -1,
  };
  private click_connections: DojoJS.Handle[] = [];

  /** See {@link BGA.Gamegui} for more information. */
  constructor() {
    super();
    console.log("qwixxtikoflano constructor");
  }

  /** See {@link  BGA.Gamegui#setup} for more information. */
  override setup(gamedatas: BGA.Gamedatas): void {
    console.log("Starting game setup", gamedatas);

    // Setting up player boards
    const players_area_id = "players_area";
    const other_players_area_id = "other_players_area";
    const this_player_area_id = "this_player_area";
    dojo.place(`<div id="${players_area_id}"></div>`, "game_play_area", "last");
    dojo.place(`<div id="${this_player_area_id}"></div>`, players_area_id, "last");
    dojo.place(`<div id="${other_players_area_id}"></div>`, players_area_id, "last");

    let player_id: BGA.ID;
    for (player_id in gamedatas.players) {
      const player = gamedatas.players[player_id]!;
      const isCurrentPlayer = `${this.player_id}` == player_id;
      const player_area_tpl = /* HTML */ `
        <div class="player_area" data-player-id="${player_id}">
          <span class="player_name"><i class="fa fa-star"></i>${player.name}</span>
          <div class="player_board"></div>
        </div>
      `;

      dojo.place(player_area_tpl, isCurrentPlayer ? this_player_area_id : other_players_area_id);

      const player_panel_tpl = /* HTML */ `
        <div class="player_panel" data-player-id="${player_id}">
          <span class="box_number" data-color="red" data-value="0"></span>
          <span class="box_number" data-color="yellow" data-value="0"></span>
          <span class="box_number" data-color="green" data-value="0"></span>
          <span class="box_number" data-color="blue" data-value="0"></span>
        </div>
      `;

      dojo.place(player_panel_tpl, this.getPlayerPanelElement(player_id)!, "last");

      const player_board = getPlayerBoard(player_id);

      // Set up boxes
      const colors: RowColor[] = ["red", "yellow", "green", "blue"];
      for (let i = 0; i < colors.length; i++) {
        let top = 9 + 30.5 * i;
        if (isCurrentPlayer) {
          top = 15 + 51 * i;
        }

        for (let x = 2; x <= 12; x++) {
          let left = 16 + 23.3 * (x - 2);
          if (isCurrentPlayer) {
            left = 26 + 39 * (x - 2);
          }

          const cell_number = isLTRRow(colors[i]!) ? x : 14 - x;

          dojo.place(
            /* HTML */ `
              <div
                class="box"
                data-color="${colors[i]}"
                data-position="${x - 2}"
                data-value="${cell_number}"
                style="left: ${left}px; top: ${top}px;"
              ></div>
            `,
            player_board,
          );
        }

        dojo.place(
          /* HTML */ `<div
            class="box lock"
            data-color="${colors[i]}"
            data-position="11"
            data-value="lock"
            style="top: ${top + (isCurrentPlayer ? 5 : 3)}px;"
          ></div>`,
          player_board,
        );
      }

      // Add penalty boxes
      for (let i = 0; i < 4; i++) {
        let left = 231 + 12.5 * i;
        if (isCurrentPlayer) {
          left = 387 + 20 * i;
        }

        dojo.place(
          /* HTML */ `<div class="box penalty" data-position="${i}" style="left: ${left}px;"></div>`,
          player_board,
        );
      }
    }

    // Set up dice tray
    const dice_tray = /* HTML */ `
      <div id="dice_tray">
        <div id="dice_results">
          <span class="die" data-value="1" data-color="white_1"></span>
          <span class="die" data-value="2" data-color="white_2"></span>
          <span class="die" data-value="3" data-color="red"></span>
          <span class="die" data-value="4" data-color="yellow"></span>
          <span class="die" data-value="5" data-color="green"></span>
          <span class="die" data-value="6" data-color="blue"></span>
        </div>
        <div class="divider"></div>
        <div id="dice_combinations_wrapper"></div>
      </div>
    `;
    dojo.place(dice_tray, this_player_area_id);

    // TODO: Set up your game interface here, according to "gamedatas"
    // Set dice faces
    setDiceFaces(gamedatas["dice"]);

    // Mark checked boxes
    for (const checkedBox of gamedatas["checkedBoxes"]) {
      const box_player_id: BGA.ID = checkedBox["player_id"];
      const box_color: RowColor = checkedBox["color"];
      const box_position: number = parseInt(checkedBox["position"]);

      this.markCheckedBox(box_player_id, box_color, box_position);
    }

    // Mark penalty boxes
    for (player_id in gamedatas.players) {
      const player_data = gamedatas.players[player_id] as PlayerData;
      this.markCheckedPenaltyBoxes(player_id, player_data["penalty_count"]);
    }

    // Mark invalid box
    this.updateInvalidBoxes();

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  ///////////////////////////////////////////////////
  //// Game & client states

  /** See {@link BGA.Gamegui#onEnteringState} for more information. */
  override onEnteringState(...[stateName, state]: BGA.GameStateTuple<["name", "state"]>): void {
    console.log("Entering state: " + stateName, state);

    if (!["multipleactiveplayer", "activeplayer"].includes(state.type)) {
      return;
    }

    const active_player_id = state.args["active_player"];
    const active_player_area = dojo.query(`.player_area[data-player-id="${active_player_id}"]`);

    if (!active_player_area.length) {
      throw Error(`Player area not found for player: ${active_player_id}`);
    }

    active_player_area.addClass("active_player");

    if (`${active_player_id}` === `${this.player_id}`) {
      dojo.addClass("this_player_area", "active_player");
    }
  }

  /** See {@link BGA.Gamegui#onLeavingState} for more information. */
  override onLeavingState(stateName: BGA.ActiveGameState["name"]): void {
    console.log("Leaving state: " + stateName);

    this.clearClickHandlers();

    dojo.query(".active_player").removeClass("active_player");
  }

  /** See {@link BGA.Gamegui#onUpdateActionButtons} for more information. */
  override onUpdateActionButtons(...[stateName, args]: BGA.GameStateTuple<["name", "args"]>): void {
    console.log("onUpdateActionButtons: " + stateName, args);

    // This cannot be handled on onEnteringState as player are not active yet in a multipleactiveplayer state
    // Ref: https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js#File_structure
    if (!this.isCurrentPlayerActive() || !args["_private"]) {
      this.clearClickHandlers();
      return;
    }

    if (["useWhiteSum", "mustUseColorSum", "mayUseColorSum"].includes(stateName)) {
      for (const valid_move of args["_private"]["valid_moves"]) {
        this.makeBoxClickable(valid_move["color"], valid_move["value"]);
      }
    }

    if (stateName === "useWhiteSum" || stateName === "mayUseColorSum") {
      this.addActionButton("button_pass", _("Pass"), onPass);
    }

    if (stateName === "mustUseColorSum") {
      this.makeFirstPenaltyBoxClickable();
    }
  }

  ///////////////////////////////////////////////////
  //// Utility methods

  makeBoxClickable(color: RowColor, value: number) {
    const box = getBoxByValue(this.player_id!, color, value);

    if (box.classList.contains("invalid") || box.classList.contains("clickable")) {
      return;
    }

    dojo.addClass(box, "clickable");
    this.click_connections.push(dojo.connect(box, "click", this, onCheckBox));
  }

  makeFirstPenaltyBoxClickable() {
    const player_board = getPlayerBoard(this.player_id);
    const penaltyBox = dojo.query<HTMLElement>(`.box.penalty:not(.crossed)`, player_board)[0];

    if (!penaltyBox) {
      throw Error("Penalty box not found!");
    }

    dojo.addClass(penaltyBox, "clickable");
    this.click_connections.push(dojo.connect(penaltyBox, "click", this, onCheckPenaltyBox));
  }

  markCheckedBox(player_id: BGA.ID, color: RowColor, position: number) {
    const box = getBoxByPosition(player_id, color, position);
    dojo.addClass(box, "crossed");

    const box_counter = dojo.query<HTMLElement>(
      `.player_panel .box_number[data-color="${color}"]`,
      this.getPlayerPanelElement(player_id)!,
    )[0];

    if (!box_counter) {
      throw Error("Box counter not found!");
    }

    box_counter.dataset["value"] = `${parseInt(box_counter.dataset["value"]!) + 1}`;

    if (player_id == this.player_id) {
      this.max_checked_box_position[color] = Math.max(this.max_checked_box_position[color], position);
    }
  }

  markCheckedPenaltyBoxes(player_id: BGA.ID, amount: number) {
    for (let i = 0; i < amount; i++) {
      const penaltyBox = getPenaltyBox(player_id, i);
      dojo.addClass(penaltyBox, "crossed");
    }
  }

  updateInvalidBoxes() {
    for (const [row_color, max_position] of objectEntries(this.max_checked_box_position)) {
      for (let position = 0; position <= max_position; position++) {
        const box = getBoxByPosition(this.player_id, row_color, position);

        dojo.addClass(box, "invalid");
      }
    }
  }

  clearClickHandlers() {
    this.click_connections.forEach((connection) => dojo.disconnect(connection));
    dojo.query(".clickable").removeClass("clickable");
  }

  ///////////////////////////////////////////////////
  //// Player's action

  /*
		Here, you are defining methods to handle player's action (ex: results of mouse click on game objects).

		Most of the time, these methods:
		- check the action is possible at this game state.
		- make a call to the game server
	*/

  ///////////////////////////////////////////////////
  //// Reaction to cometD notifications

  /** See {@link BGA.Gamegui#setupNotifications} for more information. */
  override setupNotifications = () => {
    console.log("notifications subscriptions setup");

    // REF: https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js#Ignoring_notifications
    // this.notifqueue.setIgnoreNotificationCheck("boxChecked", (notif) => notif.args.player_id == this.player_id);
    dojo.subscribe("boxChecked", this, ntf_boxCheckedHandler);
    dojo.subscribe("diceRolled", this, ntf_diceRolledHandler);
    dojo.subscribe("penaltyBoxChecked", this, ntf_penaltyBoxChecked);
    dojo.subscribe("scoreChanged", this, ntf_scoreChanged);
  };
}

// The global 'bgagame.qwixxtikoflano' class is instantiated when the page is loaded and used as the Gamegui.
window.bgagame = { qwixxtikoflano: QwixxTikoflano };
