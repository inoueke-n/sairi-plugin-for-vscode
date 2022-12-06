import { NotificationType0 } from "vscode-languageserver-protocol";
import { createLSPMethod } from "./helper";

const methodName = "startRecording";

export namespace StartRecordingNotification {
  /**
   * 記録開始通知
   */
  export const type = new NotificationType0(createLSPMethod(methodName));
}
