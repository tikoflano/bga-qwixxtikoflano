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
        return self::getObjectListFromDB(
            "SELECT player_id, color, position FROM checkedboxes ORDER BY player_id, color, position DESC"
        );
    }

    public static function getCheckedBoxesByPlayer() {
        $response = self::getCheckedBoxes();

        $grouped = array_reduce(
            $response,
            function ($acc, $el) {
                $player_id = $el["player_id"];
                $color = $el["color"];

                if (!isset($acc[$player_id])) {
                    $acc[$player_id] = [];
                }

                if (!isset($acc[$player_id][$color])) {
                    $acc[$player_id][$color] = [];
                }

                array_push($acc[$player_id][$color], $el["position"]);

                return $acc;
            },
            []
        );

        return $grouped;
    }

    public static function getCheckedBoxesFromPlayer(int $player_id) {
        $response = self::getCollectionFromDB(
            "SELECT color, GROUP_CONCAT(position) as checkedboxes FROM `checkedboxes` WHERE player_id = $player_id GROUP BY color"
        );

        array_walk($response, fn(&$item) => ($item = explode(",", $item["checkedboxes"])));

        return $response;
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
        return self::getCollectionFromDB("SELECT color,value,in_play FROM dice");
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

    public static function getPenaltyScore($player_id) {
        return self::getUniqueValueFromDB(
            "SELECT player_penalty_count * 5 as penalty_score FROM `player` WHERE player_id = $player_id"
        );
    }

    public static function getCompletedColors() {
        return self::getObjectListFromDB("SELECT DISTINCT color FROM `checkedboxes` WHERE position = 11", true);
    }

    public static function getDie($color) {
        return self::getObjectListFromDB("SELECT color,value,in_play FROM dice WHERE color = '$color'")[0];
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

    public static function setDiceOutOfPlay($color) {
        self::DbQuery("UPDATE dice SET in_play = 0 WHERE color='$color'");
    }
}
