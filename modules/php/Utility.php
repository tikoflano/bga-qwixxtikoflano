<?php
namespace Bga\Games\QwixxTikoflano;

use BgaUserException;

class Utility {
    public static function decoratePlayerNameNotifArg(
        string $message,
        array $args,
        callable $get_player_name_by_id_fn
    ): array {
        // if the notif message contains ${player_name} but it isn't set in the args, add it on args from $args['player_id']
        if (isset($args["player_id"]) && !isset($args["player_name"]) && str_contains($message, '${player_name}')) {
            $args["player_name"] = $get_player_name_by_id_fn($args["player_id"]);
        }
        return $args;
    }

    public static function debugx($content) {
        throw new BgaUserException(print_r($content, true));
    }

    public static function rollDice() {
        $dice = [
            DIE_WHITE_1 => bga_rand(1, 6),
            DIE_WHITE_2 => bga_rand(1, 6),
            DIE_RED => bga_rand(1, 6),
            DIE_YELLOW => bga_rand(1, 6),
            DIE_GREEN => bga_rand(1, 6),
            DIE_BLUE => bga_rand(1, 6),
        ];

        DBAccesor::setDice($dice);

        return $dice;
    }

    public static function notifyScore(int $player_id, callable $notify_fn) {
        $score_per_color = DBAccesor::getScorePerColor($player_id);
        $total_score = array_reduce(array_values($score_per_color), fn($acc, $entry) => $acc + $entry["score"], 0);

        DBAccesor::setPlayerScore($player_id, $total_score);

        $notify_fn(NT_SCORE_CHANGED, "", [
            "player_id" => $player_id,
            "score_per_color" => $score_per_color,
            "total_score" => $total_score,
        ]);
    }

    /**
     * To be used to generate valid moves, delete if this won't happen in the backend
     */
    public static function getDiceCombination($dice) {
        $response = [
            DIE_WHITE_1 => [DIE_WHITE_2 => $dice[DIE_WHITE_1] + $dice[DIE_WHITE_2]],
            DIE_WHITE_2 => [DIE_WHITE_1 => $dice[DIE_WHITE_1] + $dice[DIE_WHITE_2]],
        ];

        foreach ([DIE_WHITE_1, DIE_WHITE_2] as $white) {
            foreach ([DIE_RED, DIE_YELLOW, DIE_GREEN, DIE_BLUE] as $color) {
                $value1 = $dice[$white];
                $value2 = $dice[$color];

                $response[$white][$color] = $value1 + $value2;
            }
        }

        return $response;
    }
}
