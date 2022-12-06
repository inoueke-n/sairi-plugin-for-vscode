import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import {
  SaveEditHistoryRequest,
  SaveEditHistorySendTo,
  SaveEditHistoryReturn,
  SaveEditHistoryFailReason,
} from "@inoueke-n/sairi-lsp";
import {
  Successful,
  isSuccess,
  isFail,
  FolktaleExtension,
} from "@inoueke-n/sairi-common";

import {
  getConfigUid,
  getConfigPublicKey,
  getConfigApiEndpoint,
} from "../extension/config";
import { sendRequestToLangServer } from "../extension/connect/sendRequest";
import { SendStatus } from "../statusBar/sendStatus";
import { Sairi } from "../resource";

function workspacePath() {
  // 単体ファイルだけを開いている時どうするか
  // @ts-expect-error: strictNullChecks
  return vscode.workspace.workspaceFolders[0].uri.path;
}

function sendSaveEditHistoryRequest(
  connection: LanguageClient,
  sendTo: SaveEditHistorySendTo,
  uid: string,
  apiEndpoint: string,
  publicKey: string
): Promise<SaveEditHistoryReturn.Type> {
  SaveEditHistoryRequest.type;

  return new Promise((resolve) => {
    const params = {
      workspace: workspacePath(),
      sendTo,
      uid,
      apiEndpoint,
      publicKey,
      editorInfo: {
        name: Sairi.Const.editorName,
        version: Sairi.Const.appVersion,
      },
    };
    sendRequestToLangServer(connection)(
      SaveEditHistoryRequest.type,
      params
    ).then(
      (value) => {
        if (isSuccess(value)) {
          resolve(value.value);
        }
        if (isFail(value)) {
          resolve({ success: false, reason: value.reason });
        }
      },
      (a) => {
        resolve({ success: false, reason: a });
      }
    );
  });
}

export interface DataSendResult {
  level: "warn" | "info";
  msg: string;
  savedLocation?: string;
}

export function sendEditHistoryTo(
  to: SaveEditHistorySendTo,
  connection: LanguageClient,
  event: vscode.EventEmitter<Successful<DataSendResult>>
): void {
  SendStatus.gotoState("Sending");
  SendStatus.show();

  FolktaleExtension.concatMaybe3(
    getConfigUid(),
    getConfigPublicKey(),
    getConfigApiEndpoint()
  ).matchWith({
    Just: async ({ value }) => {
      const [uid, publicKey, apiEndpoint] = value;
      const r = await sendSaveEditHistoryRequest(
        connection,
        to,
        uid,
        apiEndpoint,
        publicKey.replace(/\\n/g, "\n")
      );

      if (isSuccess(r)) {
        success();
        event.fire({
          success: true,
          value: {
            level: "info",
            msg: "Sent successfully",
            savedLocation: r.value.savedLocation,
          },
        });
      }
      if (isFail(r)) {
        const reason = r.reason as SaveEditHistoryFailReason;
        if (reason.msg === "No edit history") {
          SendStatus.hide();
          event.fire({
            success: true,
            value: { level: "warn", msg: reason.msg, savedLocation: undefined },
          });
        } else {
          const reasonAsStr = JSON.stringify(reason, undefined, 2);
          const msg = "Failed to save. Reason: " + reasonAsStr;

          console.log(reasonAsStr);

          failed(msg);
          event.fire({ success: false, reason: msg });
        }
      }
    },
    Nothing: () => {
      const msg =
        "'uid' or 'publicKey' or 'apiEndPoint' is invalid. Please check the extension configuration.";
      failed(msg);
      event.fire({ success: false, reason: msg });
    },
  });
}

function success() {
  SendStatus.gotoState("Finished");
  setTimeout(() => {
    SendStatus.hide();
  }, 1000);
}

function failed(msg: string) {
  vscode.window.showErrorMessage(msg);
  SendStatus.gotoState("Error");

  setTimeout(() => {
    SendStatus.hide();
  }, 1000);
}
