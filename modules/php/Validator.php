<?php
namespace Bga\Games\QwixxTikoflano;

use BgaUserException;
use BgaVisibleSystemException;

class Validator {
    public static function validatePositionValue(string $color, int $position, int $value) {
        if (Utility::positionToValue($color, $position) != $value) {
            throw new BgaVisibleSystemException(clienttranslate("Position and value do not match"));
        }
    }

    public static function validateValue(string $game_state, string $color, int $value) {
        $dice = DBAccesor::getDice();
        $dice_combinations = Utility::getDiceCombination($dice);

        if ($game_state == ST_USE_WHITE_SUM_NAME) {
            if ($value == $dice_combinations[DIE_WHITE_1][DIE_WHITE_2]) {
                return;
            }
        } else {
            foreach ([DIE_WHITE_1, DIE_WHITE_2] as $white) {
                if ($value == $dice_combinations[$white][$color]) {
                    return;
                }
            }
        }

        throw new BgaVisibleSystemException(clienttranslate("The sent value does not match any valid combination"));
    }

    public static function validatePosition(int $player_id, string $color, int $position) {
        $highest_position = DBAccesor::getHighestCheckedBoxPosition($player_id, $color);

        if ($highest_position >= $position) {
            throw new BgaUserException(clienttranslate("Invalid move"));
        }

        // Can't check the last position unless 5 are already checked
        if ($position == 10) {
            $checked_boxes = DBAccesor::getCheckedBoxesFromPlayer($player_id);
            if (!isset($checked_boxes[$color]) || count($checked_boxes[$color]) < 5) {
                throw new BgaUserException(clienttranslate("Invalid move"));
            }
        }
    }

    public static function validateDieIsInPlay(string $color) {
        $die = DBAccesor::getDie($color);

        if ($die["in_play"] != 1) {
            throw new BgaUserException(clienttranslate("Invalid move: $color die is not in play"));
        }
    }
}
