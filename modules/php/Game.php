<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * QwixxTikoflano implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */
declare(strict_types=1);

namespace Bga\Games\QwixxTikoflano;

use BgaSystemException;
use BgaVisibleSystemException;

require_once APP_GAMEMODULE_PATH . "module/table/table.game.php";
require_once __DIR__ . "/constants.inc.php";

class Game extends \Table {
    /**
     * Your global variables labels:
     *
     * Here, you can assign labels to global variables you are using for this game. You can use any number of global
     * variables with IDs between 10 and 99. If your game has options (variants), you also have to associate here a
     * label to the corresponding ID in `gameoptions.inc.php`.
     *
     * NOTE: afterward, you can get/set the global variables with `getGameStateValue`, `setGameStateInitialValue` or
     * `setGameStateValue` functions.
     */
    public function __construct() {
        parent::__construct();

        $this->initGameStateLabels([]);

        $this->notify->addDecorator(
            fn(string $message, array $args) => Utility::decoratePlayerNameNotifArg($message, $args, [
                $this,
                "getPlayerNameById",
            ])
        );
    }

    /**
     * ----
     * ARGS
     * ----
     */

    public function argValidModes() {
        $dice = DBAccesor::getDice();
        $checked_boxes_py_player = DBAccesor::getCheckedBoxesByPlayer();

        $players = $this->loadPlayersBasicInfos();
        $private_args = [];

        foreach (array_keys($players) as $player_id) {
            $private_args[$player_id]["valid_moves"] = Utility::getPlayerValidMoves(
                $this->gamestate->state()["name"],
                $dice,
                $checked_boxes_py_player[$player_id] ?? []
            );
        }

        return ["_private" => $private_args, "active_player" => $this->getActivePlayerId()];
    }

    /**
     * ------------
     * USER ACTIONS
     * ------------
     */

    public function actPass(): void {
        $current_state_name = $this->gamestate->state()["name"];

        switch ($current_state_name) {
            case ST_USE_WHITE_SUM_NAME:
                // Retrieve the current player ID. This is the player who sent the pass action, not the active player.
                $player_id = (int) $this->getCurrentPlayerId();

                $this->transitionAfterWhiteDice($player_id);
                break;
            case ST_MAY_USE_COLOR_SUM_NAME:
                $this->gamestate->nextState(TN_PASS);
                break;
            default:
                throw new BgaSystemException("Passing is not allowed in this state: $current_state_name");
                break;
        }
    }

    public function actCheckBox(string $color, int $position, int $value): void {
        // Retrieve the current player ID. This is the player who sent the check box action
        $player_id = (int) $this->getCurrentPlayerId();

        Validator::validatePositionValue($color, $position, $value);
        Validator::validateValue($this->gamestate->state()["name"], $color, $value);
        Validator::validatePosition($player_id, $color, $position);
        Validator::validateDieIsInPlay($color);

        DBAccesor::setCheckedBox($player_id, $color, $position);

        // Notify all players about the checked box
        $this->notify->all(
            NT_BOX_CHECKED,
            clienttranslate(
                '${player_name} has crossed out <span class="box_number" data-color="${color}" data-value="${value}"></span>'
            ),
            [
                "player_id" => $player_id,
                "color" => $color,
                "position" => $position,
                "value" => $value,
            ]
        );

        // If checking the last number, also check the lock. The die will be removed on the nextPlayer state
        if ($position == 10) {
            DBAccesor::setCheckedBox($player_id, $color, 11);

            // Notify all players about the checked lock
            $this->notify->all(NT_BOX_CHECKED, clienttranslate('${player_name} has completed the ${color} row'), [
                "player_id" => $player_id,
                "color" => $color,
                "position" => 11,
            ]);
        }

        Utility::updateAndNotifyScore($player_id, [$this->notify, "all"]);

        if ($this->gamestate->state()["name"] == ST_USE_WHITE_SUM_NAME) {
            if ($player_id == $this->getActivePlayerId()) {
                $this->globals->set(GL_WHITE_DICE_USED, true);
            }

            $this->transitionAfterWhiteDice($player_id);
        } else {
            $this->gamestate->nextState(TN_CHECK_BOX);
        }
    }

    public function actCheckPenaltyBox(): void {
        // Retrieve the current player ID. This is the player who sent the penalty action
        $player_id = (int) $this->getCurrentPlayerId();
        $current_penalty_count = DBAccesor::getPlayerPenaltyCount($player_id);

        if ($current_penalty_count >= 4) {
            throw new BgaVisibleSystemException(clienttranslate("penalty count has already reached the limit"));
        }

        DBAccesor::increasePlayerPenalty($player_id);

        // Notify all players about the player penalty check
        $this->notify->all(NT_PENALTY_BOX_CHECKED, clienttranslate('${player_name} checks a penalty box'), [
            "player_id" => $player_id,
            "penalty_count" => $current_penalty_count + 1,
        ]);

        Utility::updateAndNotifyScore($player_id, [$this->notify, "all"]);

        $this->gamestate->nextState(TN_CHECK_PENALTY_BOX);
    }

    private function transitionAfterWhiteDice($player_id) {
        // Check if we have 2 or more completed rows
        if (count(DBAccesor::getCompletedColors()) > 1) {
            $this->gamestate->setPlayerNonMultiactive($player_id, TN_END_GAME);
            return;
        }

        $transition = TN_PASS;
        if ($this->globals->get(GL_WHITE_DICE_USED, false)) {
            $transition = TN_CHECK_BOX;
        }

        $this->gamestate->setPlayerNonMultiactive($player_id, $transition);
    }

    /**
     * Compute and return the current game progression.
     *
     * The number returned must be an integer between 0 and 100.
     *
     * This method is called each time we are in a game state with the "updateGameProgression" property set to true.
     *
     * @return int
     * @see ./states.inc.php
     */
    public function getGameProgression() {
        // TODO: compute and return the game progression

        return 0;
    }

    /**
     * Game state action, example content.
     *
     * The action method of state `nextPlayer` is called everytime the current game state is set to `nextPlayer`.
     */
    public function stNextPlayer(): void {
        // Retrieve the active player ID.
        $player_id = (int) $this->getActivePlayerId();

        // Give some extra time to the active player when he completed an action
        $this->giveExtraTime($player_id);

        $current_penalty_count = DBAccesor::getPlayerPenaltyCount($player_id);

        if ($current_penalty_count == 4 || count(DBAccesor::getCompletedColors()) > 1) {
            $this->gamestate->nextState(TN_END_GAME);
            return;
        }

        DBAccesor::setDiceOutOfPlay();

        $this->activeNextPlayer();
        $this->gamestate->setAllPlayersMultiactive();

        Utility::rollDice();
        $new_dice = DBAccesor::getDice();
        $this->globals->set(GL_WHITE_DICE_USED, false);

        // Notify all players about the dice roll
        $this->notify->all(NT_DICE_ROLLED, "", ["dice" => $new_dice]);

        // Go to another gamestate
        // Here, we would detect if the game is over, and in this case use "endGame" transition instead
        $this->gamestate->nextState(TN_NEXT_TURN);
    }

    /**
     * Migrate database.
     *
     * You don't have to care about this until your game has been published on BGA. Once your game is on BGA, this
     * method is called everytime the system detects a game running with your old database scheme. In this case, if you
     * change your database scheme, you just have to apply the needed changes in order to update the game database and
     * allow the game to continue to run with your new version.
     *
     * @param int $from_version
     * @return void
     */
    public function upgradeTableDb($from_version) {
        //       if ($from_version <= 1404301345)
        //       {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
        //
        //       if ($from_version <= 1405061421)
        //       {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
    }

    /*
     * Gather all information about current game situation (visible by the current player).
     *
     * The method is called each time the game interface is displayed to a player, i.e.:
     *
     * - when the game starts
     * - when a player refreshes the game page (F5)
     */
    protected function getAllDatas(): array {
        $result = [];

        // WARNING: We must only return information visible by the current player.
        // $current_player_id = (int) $this->getCurrentPlayerId();

        // Get information about players.
        // NOTE: you can retrieve some extra field you added for "player" table in `dbmodel.sql` if you need it.
        $result["players"] = $this->getCollectionFromDb(
            "SELECT `player_id` `id`, `player_score` `score`, `player_penalty_count` `penalty_count` FROM `player`"
        );

        // Gather all information about current game situation (visible by player $current_player_id).
        $result["checkedBoxes"] = DBAccesor::getCheckedBoxes();
        $result["dice"] = DBAccesor::getDice();

        return $result;
    }

    /**
     * Returns the game name.
     *
     * IMPORTANT: Please do not modify.
     */
    protected function getGameName() {
        return "qwixxtikoflano";
    }

    /**
     * This method is called only once, when a new game is launched. In this method, you must setup the game
     *  according to the game rules, so that the game is ready to be played.
     */
    protected function setupNewGame($players, $options = []) {
        // Set the colors of the players with HTML color code. The default below is red/green/blue/orange/brown. The
        // number of colors defined here must correspond to the maximum number of players allowed for the gams.
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos["player_colors"];

        foreach ($players as $player_id => $player) {
            // Now you can access both $player_id and $player array
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $player_id,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        // Create players based on generic information.
        //
        // NOTE: You can add extra field on player table in the database (see dbmodel.sql) and initialize
        // additional fields directly here.
        static::DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->reloadPlayersBasicInfos();

        // Init global values with their initial values.

        // Init game statistics.
        //
        // NOTE: statistics used in this file must be defined in your `stats.inc.php` file.

        // Dummy content.
        // $this->initStat("table", "table_teststat1", 0);
        // $this->initStat("player", "player_teststat1", 0);

        // TODO: Setup the initial game situation here.
        Utility::rollDice();

        // Activate first player once everything has been initialized and ready.
        $this->activeNextPlayer();
    }

    /**
     * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
     * You can do whatever you want in order to make sure the turn of this player ends appropriately
     * (ex: pass).
     *
     * Important: your zombie code will be called when the player leaves the game. This action is triggered
     * from the main site and propagated to the gameserver from a server, not from a browser.
     * As a consequence, there is no current player associated to this action. In your zombieTurn function,
     * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, otherwise it will fail with a
     * "Not logged" error message.
     *
     * @param array{ type: string, name: string } $state
     * @param int $active_player
     * @return void
     * @throws feException if the zombie mode is not supported at this game state.
     */
    protected function zombieTurn(array $state, int $active_player): void {
        $state_name = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($state_name) {
                default:
                    $this->gamestate->nextState("zombiePass");
                    break;
            }

            return;
        }

        // Make sure player is in a non-blocking status for role turn.
        if ($state["type"] === "multipleactiveplayer") {
            $this->gamestate->setPlayerNonMultiactive($active_player, "");
            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }

    /**
     * ---------
     * UTILITIES
     * ---------
     */
}
