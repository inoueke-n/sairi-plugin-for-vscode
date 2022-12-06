import * as moment from "moment";

function timestamp(date: Date): string {
  return `[${moment(date).format("LTS")}]`;
}

export function successMessage(date: Date, msg: string): string {
  return `🆗 ${timestamp(date)} ${msg}`;
}

export function warnMessage(date: Date, msg: string): string {
  return `⚠️ ${timestamp(date)} ${msg}`;
}

export function failMessage(date: Date): string {
  return `🆖 ${timestamp(date)} Failed to send.`;
}
