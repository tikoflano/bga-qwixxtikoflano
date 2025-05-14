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

    // Setting up player boards
    var player_id: BGA.ID;
    const player_areas = [];
    for (player_id in gamedatas.players) {
      var player = gamedatas.players[player_id];
      const player_area_tpl = /*HTML*/ `
        <div id="player_area_${player_id}" class="player_area">
          <span class="player_name">${player?.name}</span>
          <div id="player_board_${player_id}" class="player_board"></div>
        </div>
      `;

      if (this.player_id == player_id) {
        player_areas.unshift(player_area_tpl);
      } else {
        player_areas.push(player_area_tpl);
      }
    }

    player_areas.forEach((pa) => dojo.place(pa, "game_play_area"));

    // Set up clickable boxes
    const height = 37;
    const colors = ["red", "yellow", "green", "blue"];
    for (let i = 0; i < colors.length; i++) {
      const top = 15 + (height + 14) * i;
      for (let x = 2; x <= 12; x++) {
        const left = 26 + 39 * (x - 2);

        const cell_number = ["green", "blue"].includes(colors[i]!) ? 14 - x : x;

        dojo.place(
          `<div id="square_${colors[i]}_${cell_number}" class="square" style="left: ${left}px; top: ${top}px; height: ${height}px"></div>`,
          `player_board_${this.player_id}`,
          "first",
        );
      }
    }

    // Hook up listeners
    dojo.query<HTMLElement>(".square").connect("click", this, "onSelectSquare");

    // TODO: Set up your game interface here, according to "gamedatas"

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  ///////////////////////////////////////////////////
  //// Game & client states

  /** See {@link BGA.Gamegui#onEnteringState} for more information. */
  override onEnteringState(...[stateName, state]: BGA.GameStateTuple<["name", "state"]>): void {
    console.log("Entering state: " + stateName);

    switch (stateName) {
      case "dummmy":
        // enable/disable any user interaction...
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

    if (!this.isCurrentPlayerActive()) return;

    switch (stateName) {
      case "dummmy":
        // Add buttons to action bar...
        // this.addActionButton( 'button_id', _('Button label'), this.onButtonClicked );
        break;
    }
  }

  ///////////////////////////////////////////////////
  //// Utility methods

  ///////////////////////////////////////////////////
  //// Player's action

  /*
		Here, you are defining methods to handle player's action (ex: results of mouse click on game objects).
		
		Most of the time, these methods:
		- check the action is possible at this game state.
		- make a call to the game server
	*/

  onSelectSquare(evt: Event) {
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

    dojo.addClass(evt.currentTarget, "crossed");
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
