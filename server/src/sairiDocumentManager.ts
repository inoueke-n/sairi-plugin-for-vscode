import { Connection, TextDocumentSyncKind } from "vscode-languageserver/node";
import { Result, result } from "folktale";

import { submit } from "@inoueke-n/sairi-common";

import { CustomTextDocuments } from "./customTextDocuments";
import {
  IDocumentChangeRecorder,
  IEditorActionRecorder,
} from "./models/recorders/editorActionRecorder";
import { FileActionRecorder } from "./models/recorders/impl/fileActionsRecorder";
import { DocumentChangeRecorder } from "./models/recorders/impl/documentChangeRecorder";

export class SairiDocumentManager {
  private _documents: CustomTextDocuments;
  private documentChangeRecorder: IDocumentChangeRecorder;
  private fileActionsRecorder: FileActionRecorder;
  private _recording: boolean;

  constructor() {
    this._documents = new CustomTextDocuments(TextDocumentSyncKind.Incremental);
    this.documentChangeRecorder = new DocumentChangeRecorder();
    this.fileActionsRecorder = new FileActionRecorder();
    this._recording = false;
  }

  private get allRecorders(): IEditorActionRecorder[] {
    return [this.documentChangeRecorder, this.fileActionsRecorder];
  }

  /**
   * 記録の開始
   */
  public startRecording(): void {
    if (this._recording) throw new Error("Already recording");

    // 取得する情報に対する動作の登録
    this.fileActionsRecorder.subscribeOpen(this._documents.onDidOpen);
    //this.fileActionsRecorder.subscribeClose(this._documents.onDidClose);
    this._documents.onDidChangeContent((params) => {
      this.documentChangeRecorder.record(params);
    });

    this._recording = true;
  }

  public listen(connection: Connection): void {
    this._documents.listen(connection);
  }

  /**
   * 監視下にあるファイルの一覧
   */
  public getFiles(): submit.FileInfo[] {
    return this._documents.allFreezedDocuments().map((doc) => ({
      uri: doc.uri,
      initialFullContent: doc.getText(),
    }));
  }

  /**
   * （統合後の）編集履歴を返す
   */
  public getEditorEvents(): Result<string, submit.EditorEvent[]> {
    try {
      const evs1 = this.documentChangeRecorder.dumpEvents();
      if (evs1.length === 0) {
        // 編集操作がないときは何もすることがないので空の配列を返す
        return result.Ok([]);
      } else {
        const allEvents = this.allRecorders.flatMap((x) => x.dumpEvents());
        return result.Ok(sortByTimeAscending(allEvents));
      }
      // workaround
    } catch (error: any) {
      return result.Error(error);
    }
  }

  /**
   * 編集履歴の生データ
   */
  public getRawEditorEvents(): submit.EditorEvent[] {
    const a = this.allRecorders.flatMap((x) => x.dumpRawEvents());
    return sortByTimeAscending(a);
  }

  /**
   * これまで記録したイベントの全てをリセットして空にします
   */
  public reset(): void {
    this.allRecorders.forEach((x) => x.reset());
    // リセット時にinitialFullContentも更新される必要がある
    this._documents.updateFreezedDocuments();
  }
}

function sortByTimeAscending(
  editorEvents: submit.EditorEvent[]
): submit.EditorEvent[] {
  // ここでチェックを入れる
  if (editorEvents.length > 0) {
    return editorEvents.sort((a, b) => (a.time > b.time ? 1 : -1));
  } else {
    return editorEvents;
  }
}
