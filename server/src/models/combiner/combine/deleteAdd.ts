import { CombineSignature } from ".";
import { DeleteEvent } from "../events/delete";
import { AddEvent } from "../events/add";

export const combineDeleteAdd: CombineSignature<DeleteEvent, AddEvent> = (
  e1,
  e2
) => {
  // TODO: DeleteEventにDeletedTextプロパティを追加して実装する
  return [e1, e2];
};
