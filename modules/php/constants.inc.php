<?php

/*
 * State constants
 */
const ST_BGA_GAME_SETUP = 1;
const ST_USE_WHITE_SUM = 10;
const ST_USE_COLOR_SUM = 11;
const ST_NEXT_PLAYER = 12;
const ST_END_GAME = 99;

/*
 * Transitions
 */
const TN_CHECK_BOX = "checkBox";
const TN_PASS = "pass";
const TN_ZOMBIE_PASS = "zombiePass";
const TN_NEXT_TURN = "nextTurn";
const TN_END_GAME = "endGame";

/*
 * Player Actions
 */

const ACT_PASS = "actPass";
const ACT_CHECK_BOX = "actCheckBox";

/*
 * Die colors
 */
const DIE_WHITE_1 = "white_1";
const DIE_WHITE_2 = "white_2";
const DIE_RED = "red";
const DIE_YELLOW = "yellow";
const DIE_GREEN = "green";
const DIE_BLUE = "blue";

/*
 * Notifications
 */
const NT_CHECK_BOX = "checkBox";
