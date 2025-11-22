import {getDuration} from "src/util/DateTime";

export class TimerModule {
	startTime: Date
	endTime: Date

	init(startTime: Date) {
		this.startTime = startTime
		this.endTime = startTime
	}

	getDuration(): string {
		return getDuration(this.startTime, this.endTime)
	}

	getStartTime(): Date {
		return this.startTime;
	}

	getEndTime(): Date {
		return this.endTime;
	}
}
