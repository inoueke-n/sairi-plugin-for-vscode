import * as vscode from "vscode";
import { Maybe, maybe } from "folktale";

export type ConfigGetter<T> = () => Maybe<T>;

export function getConfigCreator<T>(
  sec: string,
  subsec: string
): ConfigGetter<T> {
  return () => getConfig(sec, subsec);
}

function getConfig<T>(section: string, subsection: string): Maybe<T> {
  const config = vscode.workspace.getConfiguration(section);
  if (config.has(subsection) && config.get(subsection)) {
    // @ts-expect-error: strictNullChecks
    return maybe.Just(config.get<T>(subsection));
  } else {
    return maybe.Nothing();
  }
}
