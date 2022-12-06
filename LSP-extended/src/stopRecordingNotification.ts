import { NotificationType0 } from "vscode-languageserver-protocol";
import { createLSPMethod } from "./helper";

const methodName = "stopRecording";

export namespace StopRecordingNotification {
  /**
   * 記録停止通知
   */
  export const type = new NotificationType0(createLSPMethod(methodName));
}
