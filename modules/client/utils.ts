// This file needs to be imported by the mainfile, otherwise it won't recognize the BGA namespace

import { RowColor, type DieColor } from "./qwixxtikoflano";

type ValueOf<T> = T[keyof T];
type Entries<T> = [keyof T, ValueOf<T>][];

export function isLTRRow(color: string) {
  return ["red", "yellow"].includes(color);
}

export function getPlayerBoard(player_id: BGA.ID | number | `${number}` | null) {
  const player_board = dojo.query<HTMLElement>(`.player_area[data-player-id="${player_id}"] .player_board`)[0];

  if (!player_board) {
    throw Error("Player board not found!");
  }

  return player_board;
}

function getBoxBy(palyer_board: HTMLElement, color: RowColor, value: number | string, data_attribute: string) {
  const box = dojo.query<HTMLElement>(
    `.box[data-color="${color}"][data-${data_attribute}="${value}"]`,
    palyer_board,
  )[0];

  if (!box) {
    throw Error("Box not found!");
  }

  return box;
}

export function getBoxByPosition(palyer_board: HTMLElement, color: RowColor, position: number | string) {
  return getBoxBy(palyer_board, color, position, "position");
}

export function getBoxByValue(palyer_board: HTMLElement, color: RowColor, value: number | string) {
  return getBoxBy(palyer_board, color, value, "value");
}

export function getDiceSum(die1_color: DieColor, die2_color: DieColor) {
  const die1 = dojo.byId(`die_${die1_color}`);
  const die2 = dojo.byId(`die_${die2_color}`);

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
