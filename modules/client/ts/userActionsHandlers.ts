import { type QwixxTikoflano } from "../qwixxtikoflano";

export function onCheckBox(this: QwixxTikoflano, evt: Event) {
  evt.preventDefault();
  evt.stopPropagation();

  if (!(evt.currentTarget instanceof HTMLElement)) {
    throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
  }

  if (!evt.currentTarget.classList.contains("clickable")) {
    return;
  }

  const { color, position, value } = evt.currentTarget.dataset;

  this.bgaPerformAction("actCheckBox", { color, position, value });
}

export function onCheckPenaltyBox(this: QwixxTikoflano, evt: Event) {
  evt.preventDefault();
  evt.stopPropagation();

  if (!(evt.currentTarget instanceof HTMLElement)) {
    throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
  }

  if (!evt.currentTarget.classList.contains("clickable")) {
    return;
  }

  this.bgaPerformAction("actCheckPenaltyBox", {});
}

export function onPass(this: QwixxTikoflano, evt: Event) {
  evt.preventDefault();
  evt.stopPropagation();

  if (!(evt.currentTarget instanceof HTMLElement)) {
    throw new Error("evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.");
  }

  this.bgaPerformAction("actPass", {});
}
