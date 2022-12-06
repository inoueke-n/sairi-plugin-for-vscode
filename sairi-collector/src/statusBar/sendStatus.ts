import * as vscode from "vscode";

export namespace SendStatus {
  function createItem(): vscode.StatusBarItem {
    const item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );

    item.text = "sairi";

    return item;
  }

  export type State = "Sending" | "Finished" | "Error";

  export const item = createItem();

  export function show(): void {
    item.show();
  }

  export function hide(): void {
    item.hide();
  }

  function changeText(text: string) {
    item.text = text;
  }

  export function gotoState(state: State): void {
    if (state === "Sending") {
      changeText("$(info)Sending to the server...");
    }
    if (state === "Finished") {
      changeText("$(check)Finished.");
    }
    if (state === "Error") {
      changeText("$(alert)An error occured");
    }
  }
}
