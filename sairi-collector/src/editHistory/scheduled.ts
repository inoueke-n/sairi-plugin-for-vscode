import {
  scheduleJob,
  rescheduleJob,
  Range,
  RecurrenceRule,
} from "node-schedule";
import * as moment from "moment";

export interface CancelableToken {
  cancelNextInvocation: () => boolean;
  cancel: () => void;
  postpone: (minutes: 60) => void;
  nextInvocation: () => Date | undefined;
}

// 定期送信の設定と開始
export function startSchedule(
  everyNMinute: number,
  callback: () => void
): CancelableToken {
  if (everyNMinute <= 0 || everyNMinute > 59) {
    throw new Error("Unexpected argument: 'everyMinute' is " + everyNMinute);
  }

  const rule = new RecurrenceRule();
  rule.minute = new Range(0, 59, everyNMinute);
  console.log("every minute", everyNMinute);

  const job = scheduleJob(rule, callback);

  function postpone(minutes: number) {
    const start = moment().add(minutes, "minutes").toDate();
    const end = moment.max().toDate();
    const rule = "*/5 * * * *";

    const spec = { start, end, rule };
    rescheduleJob(job, spec);
  }

  return {
    cancelNextInvocation: () => job.cancelNext(),
    cancel: () => job.cancel(),
    postpone: (minutes) => postpone(minutes),
    nextInvocation: () => job.nextInvocation(),
  };
}
