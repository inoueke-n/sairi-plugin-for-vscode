import { RequestType } from "vscode-languageserver-protocol";
import { createLSPMethod } from "./helper";
import { Successful, submit } from "@inoueke-n/sairi-common";

const methodName = "saveEditHistory";

export namespace SaveEditHistoryRequest {
  // 型パラメータの意味
  // 1. Params type
  // 2. Return type
  // 3. Error type
  /**
   * 保存要求
   */
  export const type = new RequestType<
    SaveEditHistoryParams,
    SaveEditHistoryReturn.Type,
    void
  >(createLSPMethod(methodName));
}

export interface SaveEditHistoryParams {
  /**
   * ワークスペースのURI
   */
  workspace: string;
  editorInfo: submit.EditorInfo;
  sendTo: SaveEditHistorySendTo;
  publicKey: string;
  uid: string;
  apiEndpoint: string;
}

export namespace SaveEditHistoryReturn {
  export type Type = Successful<{ savedLocation: string }>;
}

// ローカルに保存するか、サーバ上に保存するか決める
export type SaveEditHistorySendTo = "desktop" | "web";

export interface SaveEditHistoryFailReason {
  msg: string;
  payload: {
    raw: {
      editorEvents: submit.EditorEvent[];
      files: submit.FileInfo[];
    };
  };
}
