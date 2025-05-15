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
import { getPlayerBoard, getBox } from "./utils";

type RowColor = "red" | "yellow" | "green" | "blue";
type DieColor = "white_1" | "white_2" | RowColor;
type DiceValues = Record<DieColor, number>;

/** See {@link BGA.Gamegui} for more information. */
class QwixxTikoflano extends Gamegui {
  /** See {@link BGA.Gamegui} for more information. */
  constructor() {
    super();
    console.log("qwixxtikoflano constructor");
  }

  /** See {@link  BGA.Gamegui#setup} for more information. */
  override setup(gamedatas: BGA.Gamedatas): void {
    console.log("Starting game setup", gamedatas);

    // Set up die tray
    const die_tray = /*HTML*/ `
        <div id="die_tray">
          <span id="die_white_1" class="die" data-value="1" data-color="white"></span>
          <span id="die_white_2" class="die" data-value="2" data-color="white"></span>
          <span id="die_red" class="die" data-value="3" data-color="red"></span>
          <span id="die_yellow" class="die" data-value="4" data-color="yellow"></span>
          <span id="die_green" class="die" data-value="5" data-color="green"></span>
          <span id="die_blue" class="die" data-value="6" data-color="blue"></span>
        </div>
      `;
    dojo.place(die_tray, "game_play_area", "first");

    // Setting up player boards
    let player_id: BGA.ID;
    for (player_id in gamedatas.players) {
      const player = gamedatas.players[player_id];
      const isCurrentPlayer = this.player_id == player_id;
      const player_area_tpl = /* HTML */ `
        <div class="player_area" data-player-id="${player_id}">
          <span class="player_name">${player?.name}</span>
          <div class="player_board"></div>
        </div>
      `;

      dojo.place(player_area_tpl, "game_play_area", isCurrentPlayer ? 2 : "last");
      const player_board = getPlayerBoard(player_id);

      // Set up boxes
      const height = 37;
      const colors = ["red", "yellow", "green", "blue"];
      for (let i = 0; i < colors.length; i++) {
        const top = 15 + (height + 14) * i;
        for (let x = 2; x <= 12; x++) {
          const left = 26 + 39 * (x - 2);

          const cell_number = this.isLTRRow(colors[i]!) ? x : 14 - x;

          dojo.place(
            /* HTML */ `
              <div
                class="box ${isCurrentPlayer ? "clickable" : ""}"
                data-color="${colors[i]}"
                data-position="${x - 2}"
                data-value="${cell_number}"
                style="left: ${left}px; top: ${top}px; height: ${height}px"
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
            style="top: ${top + 5}px;"
          ></div>`,
          player_board,
        );
      }
    }

    // Hook up listeners
    dojo.query<HTMLElement>(".box").connect("click", this, "onCheckBox");

    // TODO: Set up your game interface here, according to "gamedatas"

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  ///////////////////////////////////////////////////
  //// Game & client states

  /** See {@link BGA.Gamegui#onEnteringState} for more information. */
  override onEnteringState(...[stateName, state]: BGA.GameStateTuple<["name", "state"]>): void {
    console.log("Entering state: " + stateName, state);

    switch (stateName) {
      case "useWhiteSum":
        for (const [color, value] of Object.entries(state.args["die"] as DiceValues)) {
          dojo.byId(`die_${color}`)!.dataset["value"] = `${value}`;
        }

        const maxCheckedBoxPosition: Record<RowColor, number> = {
          red: -1,
          yellow: -1,
          green: -1,
          blue: -1,
        };

        for (const checkedBox of state.args["checkedBoxes"]) {
          const box_color: RowColor = checkedBox["color"];
          const box_position: number = parseInt(checkedBox["position"]);
          const box_player_id: BGA.ID = checkedBox["player_id"];
          const player_board = getPlayerBoard(box_player_id);
          const box = getBox(player_board, box_color, box_position);

          if (box_player_id == this.player_id) {
            maxCheckedBoxPosition[box_color] = Math.max(maxCheckedBoxPosition[box_color], box_position);
          }

          dojo.addClass(box, "crossed");
        }

        console.log("MAX POS", maxCheckedBoxPosition);

        const my_player_board = getPlayerBoard(this.player_id);
        for (const [row_color, max_position] of Object.entries(maxCheckedBoxPosition)) {
          for (let position = 0; position <= max_position; position++) {
            const box = getBox(my_player_board, row_color, position);

            dojo.addClass(box, "invalid");
          }
        }

        break;
    }
  }

  /** See {@link BGA.Gamegui#onLeavingState} for more information. */
  override onLeavingState(stateName: BGA.ActiveGameState["name"]): void {
    console.log("Leaving state: " + stateName);

    switch (stateName) {
      case "dummmy":
        // enable/disable any user interaction...
        break;
    }
  }

  /** See {@link BGA.Gamegui#onUpdateActionButtons} for more information. */
  override onUpdateActionButtons(...[stateName, args]: BGA.GameStateTuple<["name", "args"]>): void {
    console.log("onUpdateActionButtons: " + stateName, args);

    if (this.isSpectator) return;

    switch (stateName) {
      case "useWhiteSum":
        if (this.isCurrentPlayerActive()) {
          this.addActionButton("button_pass", _("Pass"), this.onPass);
        } else {
          this.removeActionButtons();
        }
        break;
    }
  }

  ///////////////////////////////////////////////////
  //// Utility methods

  isLTRRow(color: string) {
    return ["red", "yellow"].includes(color);
  }

  ///////////////////////////////////////////////////
  //// Player's action

  /*
		Here, you are defining methods to handle player's action (ex: results of mouse click on game objects).
		
		Most of the time, these methods:
		- check the action is possible at this game state.
		- make a call to the game server
	*/

  onCheckBox(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();

    if (!(evt.currentTarget instanceof HTMLElement)) {
      throw new Error(
        "evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.",
      );
    }

    if (evt.currentTarget.classList.contains("crossed")) {
      return;
    }

    const [, color, value] = evt.currentTarget.id.split("_");
  }

  onPass(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();

    if (!(evt.currentTarget instanceof HTMLElement)) {
      throw new Error(
        "evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.",
      );
    }

    this.bgaPerformAction("actPass", {});
  }

  ///////////////////////////////////////////////////
  //// Reaction to cometD notifications

  /** See {@link BGA.Gamegui#setupNotifications} for more information. */
  override setupNotifications = () => {
    console.log("notifications subscriptions setup");

    // TODO: here, associate your game notifications with local methods

    // Builtin example...
    // dojo.subscribe( 'cardPlayed_1', this, "ntf_any" );
    // dojo.subscribe( 'actionTaken', this, "ntf_actionTaken" );
    // dojo.subscribe( 'cardPlayed_0', this, "ntf_cardPlayed" );
    // dojo.subscribe( 'cardPlayed_1', this, "ntf_cardPlayed" );

    //	With CommonMixin from 'cookbook/common'...
    // this.subscribeNotif( "cardPlayed_1", this.ntf_any );
    // this.subscribeNotif( "actionTaken", this.ntf_actionTaken );
    // this.subscribeNotif( "cardPlayed_0", this.ntf_cardPlayed );
    // this.subscribeNotif( "cardPlayed_1", this.ntf_cardPlayed );
  };

  /* Example:

	ntf_any( notif: BGA.Notif )
	{
		console.log( 'ntf_any', notif );
		notif.args!['arg_0'];
	}

	ntf_actionTaken( notif: BGA.Notif<'actionTaken'> ) {
		console.log( 'ntf_actionTaken', notif );
	}

	ntf_cardPlayed( notif: BGA.Notif<'cardPlayed_0' | 'cardPlayed_1'> )
	{
		console.log( 'ntf_cardPlayed', notif );
		switch( notif.type ) {
			case 'cardPlayed_0':
				notif.args.arg_0;
				break;
			case 'cardPlayed_1':
				notif.args.arg_1;
				break;
		}
	}

	*/
}

// The global 'bgagame.qwixxtikoflano' class is instantiated when the page is loaded and used as the Gamegui.
window.bgagame = { qwixxtikoflano: QwixxTikoflano };
