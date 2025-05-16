import { setDiceFaces } from "./utils";
import { type QwixxTikoflano } from "../qwixxtikoflano";

export function ntf_boxCheckedHandler(this: QwixxTikoflano, notif: BGA.Notif) {
  this.markCheckedBox(notif.args!["player_id"], notif.args!["color"], notif.args!["position"]);
  this.updateInvalidBoxes();

  if (notif.args!["player_id"] == this.player_id) {
    this.clearClickHandlers();
  }
}

export function ntf_diceRolledHandler(this: QwixxTikoflano, notif: BGA.Notif) {
  setDiceFaces(notif.args!["dice"]);
}

export function ntf_penaltyBoxChecked(this: QwixxTikoflano, notif: BGA.Notif) {
  this.markCheckedPenaltyBoxes(notif.args!["player_id"], notif.args!["penalty_count"]);
}
