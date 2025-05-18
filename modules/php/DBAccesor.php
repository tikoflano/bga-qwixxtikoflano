<?php
namespace Bga\Games\QwixxTikoflano;

use BgaSystemException;

class DBAccesor extends \Table {
    public function getAllDatas(): array {
        throw new BgaSystemException("This method is not expected to be called");
    }

    public function getGameName() {
        throw new BgaSystemException("This method is not expected to be called");
    }

    public function setupNewGame($players, $options = []) {
        throw new BgaSystemException("This method is not expected to be called");
    }

    public function zombieTurn($state, $active_player): void {
        throw new BgaSystemException("This method is not expected to be called");
    }

    /**
     * GETTERS
     */

    public static function getCheckedBoxes() {
        return self::getObjectListFromDB("SELECT * FROM checkedboxes");
    }

    public static function getHighestCheckedBoxPosition($player_id, $color) {
        $highest_position = self::getUniqueValueFromDB(
            "SELECT position FROM checkedboxes WHERE player_id = '$player_id' and color = '$color' ORDER BY position DESC LIMIT 1"
        );

        return is_null($highest_position) ? -1 : $highest_position;
    }

    public static function getPlayerPenaltyCount($player_id) {
        return self::getUniqueValueFromDB("SELECT `player_penalty_count` FROM `player` WHERE player_id = $player_id");
    }

    public static function getDice() {
        return self::getCollectionFromDB("SELECT color,value FROM dice", true);
    }

    public static function getPlayerScore($player_id) {
        return self::getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
    }

    public static function getScorePerColor($player_id) {
        return self::getCollectionFromDB(
            "SELECT color, COUNT(position) as `count`, CAST((COUNT(position) * (COUNT(position) + 1) / 2) AS UNSIGNED) as score 
                FROM `checkedboxes` WHERE player_id = '$player_id' GROUP BY color"
        );
    }

    public static function getCompletedColors() {
        return self::getObjectListFromDB("SELECT DISTINCT color FROM `checkedboxes` WHERE position = 11", true);
    }

    /**
     * SETTERS
     */

    public static function setDice($dice) {
        self::DbQuery(
            "INSERT INTO dice (color,value) VALUES
                ('" .
                DIE_WHITE_1 .
                "', 
                '" .
                $dice[DIE_WHITE_1] .
                "'),
                ('" .
                DIE_WHITE_2 .
                "', '" .
                $dice[DIE_WHITE_2] .
                "'),
                ('" .
                DIE_RED .
                "', '" .
                $dice[DIE_RED] .
                "'),
                ('" .
                DIE_YELLOW .
                "', '" .
                $dice[DIE_YELLOW] .
                "'),
                ('" .
                DIE_GREEN .
                "', '" .
                $dice[DIE_GREEN] .
                "'),
                ('" .
                DIE_BLUE .
                "', '" .
                $dice[DIE_BLUE] .
                "')
                ON DUPLICATE KEY UPDATE
                color=VALUES(color), value=VALUES(value)"
        );
    }

    public static function setCheckedBox($player_id, $color, $position) {
        $escaped_player_id = self::escapeStringForDB($player_id);
        $escaped_color = self::escapeStringForDB($color);
        $escaped_position = self::escapeStringForDB($position);

        self::DbQuery(
            "INSERT INTO checkedboxes (player_id, color, position) VALUES ($escaped_player_id, '$escaped_color', $escaped_position)"
        );
    }

    public static function increasePlayerPenalty($player_id) {
        $escaped_player_id = self::escapeStringForDB($player_id);

        self::DbQuery(
            "UPDATE player SET player_penalty_count = player_penalty_count + 1 WHERE player_id = $escaped_player_id"
        );
    }

    public static function setPlayerScore($player_id, $new_score) {
        self::DbQuery("UPDATE player SET player_score='$new_score' WHERE player_id='$player_id'");
    }
}
