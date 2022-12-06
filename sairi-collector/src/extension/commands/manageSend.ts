import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import { Successful } from "@inoueke-n/sairi-common";

import { CommandTuple } from ".";
import { Sairi } from "../../resource";
import { CancelableToken } from "../../editHistory/scheduled";
import {
  sendEditHistoryTo,
  DataSendResult,
} from "../../editHistory/sendEditHistory";

export const sendDataManually =
  (
    client: LanguageClient,
    cancelToken: CancelableToken,
    event: vscode.EventEmitter<Successful<DataSendResult>>
  ) =>
  (): void => {
    cancelToken.cancelNextInvocation();
    // TODO: イベントを発火する
    sendEditHistoryTo("web", client, event);
  };

// 一時停止ボタン
export const pauseAutomaticSend = (token: CancelableToken) => (): void => {
  token.postpone(60);
  vscode.window.showErrorMessage("Automatic send is paused.");
};

// 履歴クリック用
export const onClickHistoryItem = (result: {
  success: boolean;
  savedLocation: string;
  msg: string;
}): void => {
  const { success, savedLocation, msg } = result;
  if (success) {
    vscode.window
      .showInformationMessage(`Saved at: ${savedLocation}`, "Open in Browser")
      .then((selected) => {
        switch (selected) {
          case "Open in Browser":
            vscode.env.openExternal(vscode.Uri.parse(savedLocation));
            break;
          default:
            throw new Error("Unexpected case. Not catched");
            break;
        }
      });
  } else {
    vscode.window.showErrorMessage(
      "This is failed item. There is nothing to do. " + msg
    );
  }
};

export const commands: (
  client: LanguageClient,
  cancelAutoSendToken: CancelableToken,
  event: vscode.EventEmitter<Successful<DataSendResult>>
) => CommandTuple[] = (client, token, event) => [
  [Sairi.Command.sendDataManually, sendDataManually(client, token, event)],
  // [
  //   Kamakura.Command.sendDataAutomatically,
  //   sendDataAutomatically(client, event)
  // ],
  [Sairi.Command.DataSend.pauseAutomaticSend, pauseAutomaticSend(token)],
  // [Kamakura.Command.DataSend.stopAutomaticSend, stopAutomaticSend(token)],
  [Sairi.Command.DataSend.onClickHistoryItem, onClickHistoryItem],
];
