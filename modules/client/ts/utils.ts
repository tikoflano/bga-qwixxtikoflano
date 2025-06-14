// This file needs to be imported by the mainfile, otherwise it won't recognize the BGA namespace

import { RowColor, type DieColor, type DiceValues, WhiteDice } from "../qwixxtikoflano";

type ValueOf<T> = T[keyof T];
type Entries<T> = [keyof T, ValueOf<T>][];

export function isIncreasingColor(color: RowColor) {
  return ["red", "yellow"].includes(color);
}

export function getPlayerBoard(player_id: BGA.ID) {
  const player_board = dojo.query<HTMLElement>(`.player_area[data-player-id="${player_id}"] .player_board`)[0];

  if (!player_board) {
    throw Error("Player board not found!");
  }

  return player_board;
}

export function getBoxBy(player_id: BGA.ID, color: RowColor, value: number, data_attribute: string) {
  const player_board = getPlayerBoard(player_id);
  const box = dojo.query<HTMLElement>(
    `.box[data-color="${color}"][data-${data_attribute}="${value}"]`,
    player_board,
  )[0];

  if (!box) {
    throw Error("Box not found!");
  }

  return box;
}

export function getBoxByPosition(player_id: BGA.ID, color: RowColor, position: number) {
  return getBoxBy(player_id, color, position, "position");
}

export function getBoxByValue(player_id: BGA.ID, color: RowColor, value: number) {
  return getBoxBy(player_id, color, value, "value");
}

export function getPenaltyBox(player_id: BGA.ID, position: number) {
  const player_board = getPlayerBoard(player_id);
  const penaltyBox = dojo.query<HTMLElement>(`.box.penalty[data-position="${position}"]`, player_board)[0];

  if (!penaltyBox) {
    throw Error("Penalty box not found!");
  }

  return penaltyBox;
}

export function getDiceSum(die1_color: DieColor, die2_color: DieColor) {
  const die1 = dojo.query<HTMLElement>(`.die[data-color="${die1_color}"]`)[0];
  const die2 = dojo.query<HTMLElement>(`.die[data-color="${die2_color}"]`)[0];

  if (!die1 || !die2) {
    throw Error("Die not found!");
  }

  const value1 = die1.dataset["value"];
  const value2 = die2.dataset["value"];

  if (!value1 || !value2) {
    throw Error("Die value not found");
  }

  return parseInt(value1) + parseInt(value2);
}

// Same as `Object.entries()` but with type inference
export function objectEntries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}

export function setDiceFaces(dice_values: DiceValues) {
  for (const [color, die_data] of objectEntries(dice_values)) {
    const node = dojo.query<HTMLElement>(`.die[data-color="${color}"]`)[0];

    if (die_data["in_play"] === "1") {
      if (!node) {
        throw Error(`Die element not found: ${color}`);
      }
      node.dataset["value"] = `${die_data["value"]}`;
    } else {
      if (node) {
        dojo.destroy(node);
      }
    }
  }

  setDiceCombinations(dice_values);
}

function setDiceCombinations(dice_values: DiceValues) {
  dojo.empty(`dice_combinations_wrapper`);

  dojo.place(
    /* HTML */
    `<div id="dice_combinations_white" class="dice_combinations">
      <div class="dice_combination">
        <span class="die" data-value="${dice_values["white_1"]["value"]}" data-color="white_1"></span>
        <span class="plus"> + </span>
        <span class="die" data-value="${dice_values["white_2"]["value"]}" data-color="white_2"></span>
        <span class="equals"> = </span>
        <span
          class="box_number"
          data-color="white"
          data-value="${parseInt(dice_values["white_1"]["value"]) + parseInt(dice_values["white_2"]["value"])}"
        >
        </span>
      </div>
    </div>`,
    `dice_combinations_wrapper`,
  );

  for (const white_die of ["white_1", "white_2"] as WhiteDice[]) {
    dojo.place(
      /* HTML */
      `<div id="dice_combinations_${white_die}" class="dice_combinations"></div>`,
      `dice_combinations_wrapper`,
    );
    for (const color_die of ["red", "yellow", "green", "blue"] as RowColor[]) {
      if (dice_values[color_die]["in_play"] !== "1") {
        continue;
      }

      dojo.place(
        /* HTML */
        `<div class="dice_combination">
          <span class="die" data-value="${dice_values[white_die]["value"]}" data-color="${white_die}"></span>
          <span class="plus"> + </span>
          <span class="die" data-value="${dice_values[color_die]["value"]}" data-color="${color_die}"></span>
          <span class="equals"> = </span>
          <span
            class="box_number"
            data-color="${color_die}"
            data-value=" ${parseInt(dice_values[white_die]["value"]) + parseInt(dice_values[color_die]["value"])}"
          >
          </span>
        </div>`,
        `dice_combinations_${white_die}`,
      );
    }
  }
}
