<?php

require_once "modules/php/constants.inc.php";

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * qwixxtikoflano implementation : © tikoflano
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * qwixxtikoflano game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: $this->checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

$machinestates = [
    ST_BGA_GAME_SETUP => [
        "name" => ST_BGA_GAME_SETUP_NAME,
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => ["" => ST_USE_WHITE_SUM],
    ],

    ST_USE_WHITE_SUM => [
        "name" => ST_USE_WHITE_SUM_NAME,
        "description" => clienttranslate("Waiting for other players"),
        "descriptionmyturn" => clienttranslate('${you} may check a box based on the white die'),
        "type" => "multipleactiveplayer",
        "action" => "stMakeEveryoneActive",
        "possibleactions" => [ACT_PASS, ACT_CHECK_BOX],
        "transitions" => [
            TN_CHECK_BOX => ST_MAY_USE_COLOR_SUM,
            TN_PASS => ST_MUST_USE_COLOR_SUM,
            TN_ZOMBIE_PASS => ST_NEXT_PLAYER,
        ],
    ],

    ST_MUST_USE_COLOR_SUM => [
        "name" => ST_MUST_USE_COLOR_SUM_NAME,
        "description" => clienttranslate('${actplayer} must check a number box or a penalty box'),
        "descriptionmyturn" => clienttranslate('${you} must check a number box or a penalty box'),
        "type" => "activeplayer",
        "possibleactions" => [ACT_CHECK_BOX, ACT_CHECK_PENALTY_BOX],
        "transitions" => [
            TN_CHECK_BOX => ST_NEXT_PLAYER,
            TN_CHECK_PENALTY_BOX => ST_NEXT_PLAYER,
            TN_ZOMBIE_PASS => ST_NEXT_PLAYER,
        ],
    ],

    ST_MAY_USE_COLOR_SUM => [
        "name" => ST_MAY_USE_COLOR_SUM_NAME,
        "description" => clienttranslate('${actplayer} may check a number box or pass'),
        "descriptionmyturn" => clienttranslate('${you} may check a number box or pass'),
        "type" => "activeplayer",
        "possibleactions" => [ACT_PASS, ACT_CHECK_BOX, ACT_CHECK_PENALTY_BOX],
        "transitions" => [
            TN_PASS => ST_NEXT_PLAYER,
            TN_CHECK_BOX => ST_NEXT_PLAYER,
            TN_CHECK_PENALTY_BOX => ST_NEXT_PLAYER,
            TN_ZOMBIE_PASS => ST_NEXT_PLAYER,
        ],
    ],

    ST_NEXT_PLAYER => [
        "name" => ST_NEXT_PLAYER_NAME,
        "type" => "game",
        "action" => "stNextPlayer",
        "updateGameProgression" => true,
        "transitions" => [
            TN_NEXT_TURN => ST_USE_WHITE_SUM,
            TN_END_GAME => ST_END_GAME,
        ],
    ],

    ST_END_GAME => [
        "name" => ST_END_GAME_NAME,
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd",
    ],
];
