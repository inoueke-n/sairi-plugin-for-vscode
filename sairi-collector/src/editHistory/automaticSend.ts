import * as vscode from "vscode";

import { startSchedule, CancelableToken } from "./scheduled";
import { Sairi } from "../resource";

export function scheduleAutomaticSend(everyMinute: number): CancelableToken {
  console.log(`Automatic send is scheduled in every ${everyMinute} minute(s).`);

  return startSchedule(everyMinute, () => {
    vscode.commands.executeCommand(Sairi.Command.sendDataManually).then(
      (value) => {
        console.log(value);
      },
      (value) => {
        console.error("On rejected:");
        console.error(value);
      }
    );
  });
}
