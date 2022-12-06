import { Result } from "folktale";
import * as R from "ramda";

import { submit, sairiCrypt, sairiCompress } from "@inoueke-n/sairi-common";

import { EditHistorySubmitter, EditHistory } from "./types";
import { historyToJson } from "./history";
import { api } from ".";

/**
 * サーバに送信
 */
export class SairiServerSubmitter implements EditHistorySubmitter {
  name = "Server";

  private _uid: string;
  private _publicKey: string;
  private _apiEndpoint: string;

  constructor(uid: string, publicKey: string, apiEndpoint: string) {
    this._uid = uid;
    this._publicKey = publicKey;
    this._apiEndpoint = apiEndpoint;
  }

  private compressCrypt(
    history: EditHistory | undefined,
    success: boolean,
    reason: string,
    raw: submit.EditorEvent[],
    iv: Buffer,
    key: Buffer
  ): Promise<Buffer> {
    const json = historyToJson(history, success, reason, raw);
    const h = R.pipe(
      sairiCompress.compress,
      this.mapPromise(sairiCrypt.encryptAES(iv, key))
    );
    return h(Buffer.from(json));
  }

  private mapPromise: <T1, T2>(
    f: (a: T1) => T2
  ) => (a: Promise<T1>) => Promise<T2> = (f) => async (a) => {
    const r = await a;
    return f(r);
  };

  private compress(
    history: EditHistory | undefined,
    success: boolean,
    reason: string,
    raw: submit.EditorEvent[]
  ): Promise<Buffer> {
    const json = historyToJson(history, success, reason, raw);
    return sairiCompress.compress(Buffer.from(json));
  }

  private encryptKeyBase64(key: Buffer, publicKey: string): string {
    const encryptedKey = sairiCrypt.encrypt(publicKey)(key);
    return encryptedKey.toString("base64");
  }

  private ivBase64(iv: Buffer): string {
    return iv.toString("base64");
  }

  async submit(
    history: EditHistory | undefined,
    success: boolean,
    reason: string,
    raw: submit.EditorEvent[],
    skipEncrypt = true
  ): Promise<Result<string, string>> {
    const iv = sairiCrypt.generateIV();
    const key = sairiCrypt.generate256BitKey();
    // 現在はcompressCryptは呼ばれない
    const encryptedData = skipEncrypt
      ? await this.compress(history, success, reason, raw)
      : await this.compressCrypt(history, success, reason, raw, iv, key);
    //const encryptedData = Buffer.from(historyToJson(history, success, reason, raw));

    // …が、APIの仕様により鍵は必要。サーバ側でチェックが走る
    const result = await api.send(this._apiEndpoint, {
      uid: this._uid,
      encryptedData,
      encryptedKey: this.encryptKeyBase64(key, this._publicKey),
      iv: this.ivBase64(iv),
      skipEncrypt,
      success,
      reason,
    });

    return result;
  }
}
