<?php
namespace Bga\Games\QwixxTikoflano;

use BgaUserException;
use BgaVisibleSystemException;

class Validator {
    public static function validatePositionValue(string $color, int $position, int $value) {
        if (in_array($color, [DIE_RED, DIE_YELLOW])) {
            if ($position + 2 == $value) {
                return;
            }
        } elseif (in_array($color, [DIE_GREEN, DIE_BLUE])) {
            if ($position + $value == 12) {
                return;
            }
        } else {
            throw new BgaVisibleSystemException(clienttranslate("Unexpected color received: $color"));
        }

        throw new BgaVisibleSystemException(clienttranslate("Position and value do not match"));
    }

    public static function validateValue($game_state, $color, $value) {
        $dice = DBAccesor::getDice();

        if ($game_state == ST_USE_WHITE_SUM_NAME) {
            $value1 = $dice[DIE_WHITE_1];
            $value2 = $dice[DIE_WHITE_2];

            if ($value == $value1 + $value2) {
                return true;
            }
        } else {
            foreach ([DIE_WHITE_1, DIE_WHITE_2] as $white) {
                $value1 = $dice[$color];
                $value2 = $dice[$white];

                if ($value == $value1 + $value2) {
                    return true;
                }
            }
        }

        throw new BgaVisibleSystemException(clienttranslate("The sent value does not match any valid combination"));
    }

    public static function validatePosition($player_id, $color, $position) {
        $highest_position = DBAccesor::getHighestCheckedBoxPosition($player_id, $color);

        if ($highest_position >= $position) {
            throw new BgaUserException(clienttranslate("Invalid move"));
        }
    }
}
