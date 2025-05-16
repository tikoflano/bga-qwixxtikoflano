// This file needs to be imported by the mainfile, otherwise it won't recognize the BGA namespace

import { type QwixxTikoflano, RowColor, type DieColor, type DiceValues } from "../qwixxtikoflano";
import { onCheckBox } from "./userActionsHandlers";

type ValueOf<T> = T[keyof T];
type Entries<T> = [keyof T, ValueOf<T>][];

export function isLTRRow(color: RowColor) {
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

export function setDiceFaces(dice_values: DiceValues) {
  for (const [color, value] of objectEntries(dice_values)) {
    dojo.byId(`die_${color}`)!.dataset["value"] = `${value}`;
  }
}
