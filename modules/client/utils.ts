// This file needs to be imported by the mainfile, otherwise it won't recognize the BGA namespace
export function getPlayerBoard(player_id: BGA.ID | number | `${number}` | null) {
  const player_board = dojo.query<HTMLElement>(`.player_area[data-player-id="${player_id}"] .player_board`)[0];

  if (!player_board) {
    throw Error("Player board not found!");
  }

  return player_board;
}

export function getBox(palyer_board: HTMLElement, color: string, position: number | string) {
  const box = dojo.query<HTMLElement>(`.box[data-color="${color}"][data-position="${position}"]`, palyer_board)[0];

  if (!box) {
    throw Error("Box not found!");
  }

  return box;
}
