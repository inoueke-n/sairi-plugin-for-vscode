import { Connection } from "vscode-languageserver/node";
import * as R from "ramda";

import {
  SaveEditHistoryRequest,
  StartRecordingNotification,
  SaveEditHistoryParams,
  SaveEditHistoryReturn,
  SaveEditHistoryFailReason,
} from "@inoueke-n/sairi-lsp";
import { submit, Successful } from "@inoueke-n/sairi-common";

import { EditHistory, EditorInfo } from "./submit/types";
import { SairiDocumentManager } from "./sairiDocumentManager";
import { createSaveEditHistoryRequest } from "./requestHandlers";

const justOuputLogHandler = (connection: Connection, message: string) => () => {
  connection.console.log(message);
};

/*
 * イベントの管理
 */
export function handleConnectionEvents(
  connection: Connection,
  documentManager: SairiDocumentManager
): void {
  connection.onDidChangeWatchedFiles((_change) => {
    // Monitored files have change in VSCode
    connection.console.log("We received an file change event");
  });

  connection.onNotification(
    StartRecordingNotification.type,
    justOuputLogHandler(connection, StartRecordingNotification.type.method)
  );

  connection.onRequest(
    SaveEditHistoryRequest.type,
    saveEditHistoryRequestHandler(documentManager)
  );
}

/**
 * 保存要求に対する動作
 * @param documentManager
 */
const saveEditHistoryRequestHandler =
  (documentManager: SairiDocumentManager) =>
  async (
    params: SaveEditHistoryParams
  ): Promise<SaveEditHistoryReturn.Type> => {
    function createFailData(
      msg: string,
      documentManager: SairiDocumentManager
    ): Successful.Fail {
      const reason: SaveEditHistoryFailReason = {
        msg,
        payload: {
          raw: {
            editorEvents: documentManager.getRawEditorEvents(),
            files: documentManager.getFiles(),
          },
        },
      };
      return {
        success: false,
        reason,
      };
    }

    // OK Function
    async function Ok(value: {
      value: submit.EditorEvent[];
    }): Promise<SaveEditHistoryReturn.Type> {
      const { value: history } = value;

      if (history.length === 0) {
        const r = createFailData("No edit history", documentManager);
        return Promise.resolve(r);
      } else {
        const editedFilesUri = editedFiles(history);
        const files = documentManager
          .getFiles()
          .filter((x) => R.includes(x.uri, editedFilesUri)); // 変更があったファイルだけにフィルタリングしている
        const editHistory: EditHistory = {
          history,
          files,
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          lsVersion: require("../package.json").version,
          editor: params.editorInfo,
        };

        const success = true;
        const raw = documentManager.getRawEditorEvents();
        const result = await createSaveEditHistoryRequest(
          params,
          editHistory,
          success,
          "",
          raw
        );
        return result.matchWith<SaveEditHistoryReturn.Type>({
          Ok: ({ value }) => {
            return { success: true, value: { savedLocation: value } };
          },
          Error: ({ value }) => {
            return createFailData(value, documentManager);
          },
        });
      }
    }

    // Error function
    async function Error(value: {
      value: string;
    }): Promise<SaveEditHistoryReturn.Type> {
      const error = value.value;

      // 失敗の場合でもデータを保存するようにした
      const saveResult = await createSaveEditHistoryRequest(
        params,
        undefined,
        false,
        error,
        documentManager.getRawEditorEvents()
      );

      const msg = `${saveResult.value} Unexpected error: ${error}`;
      const failData = createFailData(msg, documentManager);
      return Promise.resolve(failData);
    }

    try {
      return documentManager.getEditorEvents().matchWith({
        Ok,
        Error,
      });
    } catch (error: any) {
      // workaround
      const failData = createFailData(error, documentManager);
      return Promise.resolve(failData);
    } finally {
      // documentManagerをリセットし、新しくイベントの記録を開始する
      documentManager.reset();
    }
  };

/**
 * submit.EditorEvent[]のうち編集されたファイルのURIを取り出す
 */
function editedFiles(es: submit.EditorEvent[]): string[] {
  const uris = es
    .filter((x) => x.type === "edit")
    .map((x) => x.payload.textDocument.uri);
  return R.uniq(uris);
}
