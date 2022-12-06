import * as vscode from "vscode";

export function addDisposable(disposable: vscode.Disposable): {
  to: (subscriptions: { dispose(): any }[]) => void;
} {
  return {
    to: (subscriptions) => subscriptions.push(disposable),
  };
}

export function addDisposables(disposables: vscode.Disposable[]): {
  to: (subscriptions: { dispose(): any }[]) => void;
} {
  return {
    to: (subscriptions) => {
      disposables.forEach((d) => addDisposable(d).to(subscriptions));
    },
  };
}

// メッセージをチェックマークとともに
export function showOkMessage(msg: string): void {
  vscode.window.showInformationMessage("✔️" + msg);
}
