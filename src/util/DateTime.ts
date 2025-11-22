import {formatDuration, intervalToDuration} from "date-fns";
import {ko} from "date-fns/locale";

export function getDuration(startTime: Date, endTime: Date): string {
	const duration = intervalToDuration({start: startTime, end: endTime});

	return formatDuration(duration, {
		format: ['hours', 'minutes', 'seconds'],
		locale: ko
	});
}
