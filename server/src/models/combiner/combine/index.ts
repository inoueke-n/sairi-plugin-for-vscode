import { SerializableEditEvent } from "../events";
import { combineDeleteAdd } from "./deleteAdd";
import { combineDeleteDelete } from "./deleteDelete";
import { combineAddAdd } from "./addAdd";
import { combineAddDelete } from "./addDelete";

export type CombinedType =
  | SerializableEditEvent
  | [SerializableEditEvent, SerializableEditEvent];

export type CombineSignature<
  T1 extends SerializableEditEvent,
  T2 extends SerializableEditEvent
> = (e1: T1, e2: T2) => CombinedType;

/**
 * ２つの連続するイベントの場所を考慮して結合
 */
export function combine(
  e1: SerializableEditEvent,
  e2: SerializableEditEvent
): CombinedType {
  if (e1.type === "add" && e2.type === "add") {
    return combineAddAdd(e1, e2);
  } else if (e1.type === "add" && e2.type === "delete") {
    return combineAddDelete(e1, e2);
  } else if (e1.type === "delete" && e2.type === "add") {
    return combineDeleteAdd(e1, e2);
  } else if (e1.type === "delete" && e2.type === "delete") {
    return combineDeleteDelete(e1, e2);
  } else if (e1.type === "empty") {
    return e2;
  } else if (e2.type === "empty") {
    return e1;
  } else {
    const e1Content = JSON.stringify(e1, null, 2);
    const e2Content = JSON.stringify(e2, null, 2);
    throw new Error(
      `Unexpected serializable edit event pair pattern. Impossible. e1Content is ${e1Content}. e2Content is ${e2Content}`
    );
  }
}
