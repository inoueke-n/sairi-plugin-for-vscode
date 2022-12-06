import * as R from "ramda";

import { SerializableEditEvent } from "./events";
import { combine } from "./combine";

export function reduceSrializeableEvent(
  events: SerializableEditEvent[]
): SerializableEditEvent[] {
  // @ts-expect-error: strictNullChecks
  let r: SerializableEditEvent[] = [R.head(events)];

  let i = 1;
  while (i < events.length) {
    const a = R.last(r);
    const b = events[i];

    // @ts-expect-error: strictNullChecks
    const result = combine(a, b);
    if (Array.isArray(result)) {
      r = R.dropLast(1, r);
      const [c, d] = result;
      r.push(c, d);
      i++;
    } else if (R.or(result.type === "add", result.type === "delete")) {
      r = R.dropLast(1, r);
      r.push(result);
      i++;
    } else if (result.type === "empty") {
      r = R.dropLast(1, r);
      if (i + 1 < events.length) {
        r = R.append(events[i + 1], r);
      }
      i += 2;
    }
  }

  return r;
}
