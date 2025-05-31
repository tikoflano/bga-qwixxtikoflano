<?php
namespace Bga\Games\QwixxTikoflano;

use BgaUserException;
use BgaSystemException;

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

    public static function rollDice(): void {
        $dice = [
            DIE_WHITE_1 => bga_rand(1, 6),
            DIE_WHITE_2 => bga_rand(1, 6),
            DIE_RED => bga_rand(1, 6),
            DIE_YELLOW => bga_rand(1, 6),
            DIE_GREEN => bga_rand(1, 6),
            DIE_BLUE => bga_rand(1, 6),
        ];

        DBAccesor::setDice($dice);
    }

    public static function updateAndNotifyScore(int $player_id, callable $notify_fn) {
        $score_per_color = DBAccesor::getScorePerColor($player_id);
        $total_score = array_reduce(array_values($score_per_color), fn($acc, $entry) => $acc + $entry["score"], 0);
        $total_score -= DBAccesor::getPenaltyScore($player_id);

        DBAccesor::setPlayerScore($player_id, $total_score);

        $notify_fn(NT_SCORE_CHANGED, "", [
            "player_id" => $player_id,
            "score_per_color" => $score_per_color,
            "total_score" => $total_score,
        ]);
    }

    public static function getDiceCombination($dice) {
        $response = [
            DIE_WHITE_1 => [DIE_WHITE_2 => $dice[DIE_WHITE_1]["value"] + $dice[DIE_WHITE_2]["value"]],
            DIE_WHITE_2 => [DIE_WHITE_1 => $dice[DIE_WHITE_1]["value"] + $dice[DIE_WHITE_2]["value"]],
        ];

        foreach ([DIE_WHITE_1, DIE_WHITE_2] as $white) {
            foreach ([DIE_RED, DIE_YELLOW, DIE_GREEN, DIE_BLUE] as $color) {
                $value1 = $dice[$white]["value"];
                $value2 = $dice[$color]["value"];

                $response[$white][$color] = $value1 + $value2;
            }
        }

        return $response;
    }

    public static function isIncreasingColor($color) {
        return in_array($color, [DIE_RED, DIE_YELLOW]);
    }

    public static function positionToValue($color, $position) {
        if (self::isIncreasingColor($color)) {
            return $position + 2;
        }

        return 12 - $position;
    }

    public static function valueToPosition($color, $value) {
        if (self::isIncreasingColor($color)) {
            return $value - 2;
        }

        return 12 - $value;
    }

    public static function getPlayerValidMoves($state, $dice, $checked_boxes) {
        $response = [];
        $dice_combinations = self::getDiceCombination($dice);

        $isValidPosition = fn($sum_position, $latest_checked_position, $count_checked_boxes) => $sum_position >
            $latest_checked_position &&
            ($sum_position != 10 || $count_checked_boxes > 4);

        if ($state == ST_USE_WHITE_SUM_NAME) {
            $sum = $dice_combinations[DIE_WHITE_1][DIE_WHITE_2];

            foreach ([DIE_RED, DIE_YELLOW, DIE_GREEN, DIE_BLUE] as $color) {
                if ($dice[$color]["in_play"] == 0) {
                    continue;
                }

                $sum_position = self::valueToPosition($color, $sum);
                $latest_checked_position = ($checked_boxes[$color] ?? [-1])[0];
                $count_checked_boxes = count($checked_boxes[$color] ?? []);

                if ($isValidPosition($sum_position, $latest_checked_position, $count_checked_boxes)) {
                    array_push($response, [
                        "color" => $color,
                        "position" => $sum_position,
                        "value" => $sum,
                    ]);
                }
            }
        } elseif ($state == ST_MAY_USE_COLOR_SUM_NAME || $state == ST_MUST_USE_COLOR_SUM_NAME) {
            $sum = $dice[DIE_WHITE_1] + $dice[DIE_WHITE_2];

            foreach ([DIE_RED, DIE_YELLOW, DIE_GREEN, DIE_BLUE] as $color) {
                if ($dice[$color]["in_play"] == 0) {
                    continue;
                }

                $color_min_pos = 100;
                foreach ([DIE_WHITE_1, DIE_WHITE_2] as $white) {
                    $sum = $dice_combinations[$white][$color];
                    $sum_position = self::valueToPosition($color, $sum);
                    $latest_checked_position = ($checked_boxes[$color] ?? [-1])[0];
                    $count_checked_boxes = count($checked_boxes[$color] ?? []);

                    if ($isValidPosition($sum_position, $latest_checked_position, $count_checked_boxes)) {
                        $color_min_pos = min($color_min_pos, $sum_position);
                    }
                }

                if ($color_min_pos != 100) {
                    array_push($response, [
                        "color" => $color,
                        "position" => $color_min_pos,
                        "value" => Utility::positionToValue($color, $color_min_pos),
                    ]);
                }
            }
        } else {
            throw new BgaSystemException("Trying to get valid moves for invalid state: $state");
        }

        return $response;
    }
}
