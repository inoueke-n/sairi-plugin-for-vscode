// https://github.com/microsoft/vscode-languageserver-node/blob/3c7d1d1a116dd12eaa42d15a7c340333a0921ccd/server/src/common/server.ts#L80-L257 からコピーしてきた

import {
  Emitter,
  TextDocumentChangeEvent,
  TextDocumentSyncKind,
  Event,
  Connection,
  DidOpenTextDocumentParams,
  DidChangeTextDocumentParams,
  DidCloseTextDocumentParams,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import * as fs from "fs";
import * as url from "url";

import { submit } from "@inoueke-n/sairi-common";

type FreezedDocuments = { [uri: string]: TextDocument };

/**
 * A manager for our text documents
 */
export class CustomTextDocuments {
  private _synkKind: TextDocumentSyncKind;
  private _freezedDocuments: FreezedDocuments;

  private _onDidChangeContent: Emitter<DidChangeTextDocumentParams>;
  private _onDidOpen: Emitter<TextDocumentChangeEvent<TextDocument>>;
  private _onDidClose: Emitter<TextDocumentChangeEvent<TextDocument>>;

  public constructor(syncKind: TextDocumentSyncKind) {
    this._synkKind = syncKind;
    this._freezedDocuments = Object.create(null);
    this._onDidChangeContent =
      new Emitter<submit.TextDocumentEditEventPayload>();
    this._onDidOpen = new Emitter<TextDocumentChangeEvent<TextDocument>>();
    this._onDidClose = new Emitter<TextDocumentChangeEvent<TextDocument>>();
  }

  public get syncKind(): TextDocumentSyncKind {
    return this._synkKind;
  }

  /**
   * このマネージャで管理しているドキュメントが開かれるか変更されたとき
   */
  public get onDidChangeContent(): Event<DidChangeTextDocumentParams> {
    return this._onDidChangeContent.event;
  }

  /**
   * このマネージャで管理しているファイルが開かれたとき
   */
  public get onDidOpen(): Event<TextDocumentChangeEvent<TextDocument>> {
    return this._onDidOpen.event;
  }

  /**
   * このマネージャで管理しているファイルが閉じられたとき
   */
  public get onDidClose(): Event<TextDocumentChangeEvent<TextDocument>> {
    return this._onDidClose.event;
  }

  /**
   * URIに対応するドキュメントを返す。ドキュメントが管理されていなければundefined
   * @param uri 探索するドキュメントのURI
   */
  public getDocumentByUri(uri: string): TextDocument | undefined {
    return this._freezedDocuments[uri];
  }

  public allFreezedDocuments(): TextDocument[] {
    return Object.keys(this._freezedDocuments).map(
      (key) => this._freezedDocuments[key]
    );
  }

  public documentUris(): string[] {
    return Object.keys(this._freezedDocuments);
  }

  /**
   * URIが指すドキュメントの内容を返す。freezedDocuments通さなくて良い？
   * @param uri ドキュメントのURI
   */
  private readUriContent(uri: string): string {
    const p = url.fileURLToPath(uri);
    return fs.readFileSync(p, { encoding: "utf8" });
  }

  // リセット時に呼ばれる
  public updateFreezedDocuments(): void {
    const newdocs: TextDocument[] = this.allFreezedDocuments()
      .map((doc) => {
        const { uri, languageId } = doc;
        const content = this.readUriContent(uri);
        return TextDocument.create(uri, languageId, 9999, content);
      })
      .map((x) => Object.freeze(x));

    const newDic: FreezedDocuments = {};
    newdocs.forEach((doc) => {
      newDic[doc.uri] = doc;
    });

    this._freezedDocuments = newDic;
  }

  /**
   * Listens for `low level` notification on the given connection to
   * update the text documents managed by this instance.
   *
   * Please note that the connection only provides handlers not an event model. Therefore
   * listening on a connection will overwrite the following handlers on a connection:
   * `onDidOpenTextDocument`, `onDidChangeTextDocument`, `onDidCloseTextDocument`,
   * `onWillSaveTextDocument`, `onWillSaveTextDocumentWaitUntil` and `onDidSaveTextDocument`.
   *
   * Use the correspnding events on the TextDocuments instance instead.
   *
   * @param connection The connection to listen on.
   */
  public listen(connection: Connection): void {
    connection.onDidOpenTextDocument((event: DidOpenTextDocumentParams) => {
      const { uri, languageId, version, text } = event.textDocument;
      const document = TextDocument.create(uri, languageId, version, text);
      // ドキュメントリストに保存
      this._freezedDocuments[uri] = Object.freeze(document);
      //  Object.freezeをすることでオブジェクトの子要素を不可変にする
      // (ただし、子要素の子要素まではfreezeされない)
      this._onDidOpen.fire(Object.freeze({ document }));
    });

    connection.onDidChangeTextDocument((event: DidChangeTextDocumentParams) => {
      if (event.contentChanges.length > 0) {
        this._onDidChangeContent.fire(
          Object.freeze({
            textDocument: event.textDocument,
            contentChanges: event.contentChanges,
          })
        );
      }
    });

    connection.onDidCloseTextDocument((event: DidCloseTextDocumentParams) => {
      const document = this._freezedDocuments[event.textDocument.uri];
      if (document) {
        // ドキュメントリストから消す
        delete this._freezedDocuments[event.textDocument.uri];
        this._onDidClose.fire(Object.freeze({ document }));
      }
    });
  }
}
