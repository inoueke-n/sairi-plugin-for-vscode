import { Result, result } from "folktale";
import moment from "moment";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { promisify } from "util";

import { submit, sairiCrypt, sairiCompress } from "@inoueke-n/sairi-common";

import { EditHistorySubmitter, EditHistory } from "./types";
import { historyToJson } from "./history";

/**
 * for debugging
 * デスクトップに保存、暗号化を無視
 */
export class LocalSubmitter implements EditHistorySubmitter {
  name = "Desktop";

  private compress(
    history: EditHistory | undefined,
    success: boolean,
    reason: string,
    raw: submit.EditorEvent[]
  ): Promise<Buffer> {
    const json = historyToJson(history, success, reason, raw);
    return sairiCompress.compress(Buffer.from(json));
  }

  async submit(
    history: EditHistory | undefined,
    success: boolean,
    reason: string,
    raw: submit.EditorEvent[],
    skipEncrypt = true
  ): Promise<Result<string, string>> {
    const savePath = this.filePath();
    const json = historyToJson(history, true, "", []);
    await promisify(fs.writeFile)(savePath, json);

    const encryptedData = await this.compress(history, success, reason, raw);
    await promisify(fs.writeFile)(savePath + ".br", encryptedData);

    return result.Ok(savePath);
  }

  private filePath(extension = "json"): string {
    const filename = `${moment().format("YYYY-MM-DD HHmmss")}.${extension}`;
    const desktop = path.join(os.homedir(), "Desktop");
    const filePath = path.join(desktop, filename);
    return filePath;
  }
}
