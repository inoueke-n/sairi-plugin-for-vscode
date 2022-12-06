import { RequestType } from "vscode-languageclient";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import { Successful } from "@inoueke-n/sairi-common";

export const sendRequestToLangServer =
  (connection: LanguageClient) =>
  <P, R, E>(type: RequestType<P, R, E>, params: P): Thenable<Successful<R>> => {
    const outfilled = (value: R): Successful<R> => {
      return { success: true, value };
    };

    const rejected = (reason: any): Successful<R> => {
      if (reason.message) {
        vscode.window.showErrorMessage(reason.message);
      } else {
        vscode.window.showErrorMessage("[kamakura] Unknown error occured.");
      }
      return { success: false, reason };
    };

    return connection.sendRequest(type, params).then(outfilled, rejected);
  };
