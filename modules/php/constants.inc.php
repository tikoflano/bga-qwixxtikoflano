<?php

/*
 * Globals
 */
const GL_WHITE_DICE_USED = "whiteDiceUsed";

/*
 * State IDs
 */
const ST_BGA_GAME_SETUP = 1;
const ST_USE_WHITE_SUM = 10;
const ST_MUST_USE_COLOR_SUM = 20;
const ST_MAY_USE_COLOR_SUM = 21;
const ST_NEXT_PLAYER = 30;
const ST_END_GAME = 99;

/*
 * State names
 */
const ST_BGA_GAME_SETUP_NAME = "gameSetup";
const ST_USE_WHITE_SUM_NAME = "useWhiteSum";
const ST_MUST_USE_COLOR_SUM_NAME = "mustUseColorSum";
const ST_MAY_USE_COLOR_SUM_NAME = "mayUseColorSum";
const ST_NEXT_PLAYER_NAME = "nextPlayer";
const ST_END_GAME_NAME = "gameEnd";

/*
 * Transitions
 */
const TN_CHECK_BOX = "checkBox";
const TN_CHECK_PENALTY_BOX = "checkPenaltyBox";
const TN_PASS = "pass";
const TN_ZOMBIE_PASS = "zombiePass";
const TN_NEXT_TURN = "nextTurn";
const TN_END_GAME = "endGame";

/*
 * Player Actions
 */
const ACT_PASS = "actPass";
const ACT_CHECK_BOX = "actCheckBox";
const ACT_CHECK_PENALTY_BOX = "actCheckPenaltyBox";

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
const NT_BOX_CHECKED = "boxChecked";
const NT_PENALTY_BOX_CHECKED = "penaltyBoxChecked";
const NT_DICE_ROLLED = "diceRolled";
const NT_PASS = "pass";
const NT_SCORE_CHANGED = "scoreChanged";
