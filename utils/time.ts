import {
    getYear, getMonth, getDate, differenceInDays, subDays, addDays, isSameMonth, isFirstDayOfMonth, isLastDayOfMonth, addMonths,
    isSameYear, startOfMonth, endOfMonth, format, isSameDay, differenceInCalendarDays, isMonday, isSunday, getDayOfYear, isLeapYear, startOfWeek, startOfYear, endOfYear, addYears, endOfWeek, addWeeks, toDate
} from "date-fns"

/**
 * 
 *   YYYYMMDD 
 */

export class DateTimeHelper {
    static toDate(numberedDate: number): Date {
        return new Date(
            DateTimeHelper.getYear(numberedDate),
            DateTimeHelper.getMonth(numberedDate) - 1,
            DateTimeHelper.getDayOfMonth(numberedDate)
        )
    }

    static toNumberedDateFromValues(year: number, month: number, day: number): number {
        return year * 10000 + month * 100 + day
    }

    static toNumberedDateFromDate(date: Date): number {
        return this.toNumberedDateFromValues(getYear(date), getMonth(date) + 1, getDate(date))
    }

    static getYear(numberedDate: number): number {
        return Math.floor(numberedDate / 10000)
    }

    static getMonth(numberedDate: number): number {
        return Math.floor((numberedDate % 10000) / 100)
    }

    static getDayOfMonth(numberedDate: number): number {
        return numberedDate % 100
    }

    static toFormattedString(numberedDate: number): string {
        return pad(this.getYear(numberedDate), 4) + "-" + pad(this.getMonth(numberedDate), 2) + "-" + pad(this.getDayOfMonth(numberedDate), 2)
    }

    static fromFormattedString(str: string): number {
        const split = str.split('-')
        return this.toNumberedDateFromValues(Number.parseInt(split[0]), Number.parseInt(split[1]), Number.parseInt(split[2]))
    }

    static splitRange(start: number, end: number, maxNumDays: number): Array<[number, number]> {

        const startDate = this.toDate(start)
        const endDate = this.toDate(end)
        const wholeDiff = differenceInDays(endDate, startDate) + 1
        if (wholeDiff <= maxNumDays) {
            return [[start, end]]
        } else {
            var chunks: Array<[number, number]> = []
            var pointer: Date = endDate
            var leftDays = wholeDiff
            while (leftDays >= maxNumDays) {

                const newStart = subDays(pointer, maxNumDays - 1)
                chunks.push([this.toNumberedDateFromDate(newStart), this.toNumberedDateFromDate(pointer)])
                pointer = subDays(newStart, 1)
                leftDays -= maxNumDays
            }

            if (leftDays > 0) {
                chunks.push([this.toNumberedDateFromDate(subDays(pointer, leftDays - 1)), this.toNumberedDateFromDate(pointer)])
            }

            return chunks
        }
    }

    static getNumDays(start: number | Date, end: number | Date): number {
        const fromDate: Date = typeof start === 'number' ? DateTimeHelper.toDate(start) : start
        const toDate: Date = typeof end === 'number' ? DateTimeHelper.toDate(end) : end
        return -differenceInCalendarDays(fromDate, toDate) + 1
    }

    static rangeSemantic(start: number | Date, end: number | Date, ref?: Date): { semantic: "mondayWeek" | "sundayWeek" | "month" | "year", differenceToRef?: number } | null {
        const fromDate: Date = typeof start === 'number' ? DateTimeHelper.toDate(start) : start
        const toDate: Date = typeof end === 'number' ? DateTimeHelper.toDate(end) : end

        const numDays = -differenceInCalendarDays(fromDate, toDate) + 1

        if (isSameYear(fromDate, toDate) === true && getDayOfYear(fromDate) === 1 && (isLeapYear(fromDate) === true && numDays === 366 || isLeapYear(fromDate) === false && numDays === 365)) {

            return {
                semantic: 'year',
                differenceToRef: ref ? getYear(ref) - getYear(fromDate) : undefined
            }
        } if (isSameYear(fromDate, toDate) === true && getMonth(fromDate) === getMonth(toDate) && isFirstDayOfMonth(fromDate) === true && isLastDayOfMonth(toDate)) {

            return {
                semantic: 'month',
                differenceToRef: ref ? 12 * (getYear(ref) - getYear(fromDate)) + getMonth(ref) - getMonth(fromDate) : undefined
            }
        } else if (numDays === 7) {
            if (isMonday(fromDate)) {
                return {
                    semantic: 'mondayWeek',
                    differenceToRef: ref ? Math.floor(differenceInCalendarDays(startOfWeek(ref, { weekStartsOn: 1 }), fromDate) / 7) : undefined
                }
            } else if (isSunday(fromDate)) {
                return {
                    semantic: 'sundayWeek',
                    differenceToRef: ref ? Math.floor(differenceInCalendarDays(startOfWeek(ref, { weekStartsOn: 0 }), fromDate) / 7) : undefined
                }
            }
        }

        return null
    }

    static mondayWeekStartFunc = (date: Date) => startOfWeek(date, { weekStartsOn: 1 })
    static mondayWeekEndFunc = (date: Date) => endOfWeek(date, { weekStartsOn: 1 })
    static sundayWeekStartFunc = (date: Date) => startOfWeek(date, { weekStartsOn: 0 })
    static sundayWeekEndFunc = (date: Date) => endOfWeek(date, { weekStartsOn: 0 })


    static getSemanticRange(ref: Date, semantic: 'year' | 'month' | 'sundayWeek' | 'mondayWeek', offset: number = 0): [number, number] {
        let startFunc: (date: Date) => Date
        let endFunc: (date: Date) => Date
        let offsetFunc: (date: Date, offset: number) => Date
        switch (semantic) {
            case 'year':
                startFunc = startOfYear
                endFunc = endOfYear
                offsetFunc = addYears
                break;
            case 'month':
                startFunc = startOfMonth
                endFunc = endOfMonth
                offsetFunc = addMonths
                break;
            case 'mondayWeek':
                startFunc = this.mondayWeekStartFunc
                endFunc = this.mondayWeekEndFunc
                offsetFunc = addWeeks
                break;
            case 'sundayWeek':
                startFunc = this.sundayWeekStartFunc
                endFunc = this.sundayWeekEndFunc
                offsetFunc = addWeeks
                break;
            default: throw Error("Unsupported semantic: " + semantic)
        }
        const offsetDate = offsetFunc(ref, offset)
        return [
            this.toNumberedDateFromDate(startFunc(offsetDate)),
            this.toNumberedDateFromDate(endFunc(offsetDate))
        ]
    }

    static formatDuration(durationInSeconds: number, roundToMins: boolean = false): string {
        var usedDuration = durationInSeconds
        if (usedDuration === 0) {
            return "0"
        }

        if (roundToMins === true) {
            if (durationInSeconds % 60 >= 30)
                usedDuration = durationInSeconds - (durationInSeconds % 60) + 60
            else usedDuration = durationInSeconds - (durationInSeconds % 60)
        }

        const hours = Math.floor(usedDuration / 3600)
        const minutes = Math.floor((usedDuration % 3600) / 60)
        const seconds = usedDuration % 60
        return ((hours > 0 ? (hours + "h ") : "") + (minutes > 0 ? (minutes + "m ") : "") + (seconds > 0 ? (seconds + "s ") : "")).trim()
    }

    static formatDurationParsed(durationInSeconds: number, roundToMins: boolean = false): Array<{ type: "unit" | "digit", text: string }> {
        var usedDuration = durationInSeconds
        if (usedDuration === 0) {
            return [{ type: "digit", text: "0" }, { type: "digit", text: " mins" }]
        }

        if (roundToMins === true) {
            if (durationInSeconds % 60 >= 30)
                usedDuration = durationInSeconds - (durationInSeconds % 60) + 60
            else usedDuration = durationInSeconds - (durationInSeconds % 60)
        }

        const hours = Math.floor(usedDuration / 3600)
        const minutes = Math.floor((usedDuration % 3600) / 60)
        const seconds = usedDuration % 60

        const result: Array<{ type: "unit" | "digit", text: string }> = []
        if (hours > 0) {
            result.push({ type: 'digit', text: hours.toString() })
            result.push({ type: 'unit', text: "hr" })
        }

        if (minutes > 0) {
            result.push({ type: "digit", text: minutes.toString() })
            result.push({ type: "unit", text: "min" })
        }

        if (seconds > 0) {
            result.push({ type: "digit", text: seconds.toString() })
            result.push({ type: "unit", text: "sec" })
        }

        return result
    }

    static pageRange(start: number | Date, end: number | Date, direction: -1 | 1): [number, number] {
        const startDate: Date = typeof start === 'number' ? DateTimeHelper.toDate(start) : start
        const endDate: Date = typeof end === 'number' ? DateTimeHelper.toDate(end) : end
        const semanticTest = this.rangeSemantic(startDate, endDate)
        if (semanticTest) {
            return this.getSemanticRange(startDate, semanticTest.semantic, direction)
        } else {
            const numDays = differenceInDays(endDate, startDate) + 1
            return [DateTimeHelper.toNumberedDateFromDate(addDays(startDate, direction * numDays)),
            DateTimeHelper.toNumberedDateFromDate(addDays(endDate, direction * numDays))]
        }
    }

    static formatRange(range: [number, number], singleLine: boolean = false): string[] {
        const startDate = DateTimeHelper.toDate(range[0])
        const endDate = DateTimeHelper.toDate(range[1])

        if (isSameYear(startDate, endDate) && DateTimeHelper.getMonth(range[0]) === 1 && DateTimeHelper.getDayOfMonth(range[0]) === 1 && DateTimeHelper.getMonth(range[1]) === 12 && DateTimeHelper.getDayOfMonth(range[1]) === 31) {
            //yaer
            return [DateTimeHelper.getYear(range[0]).toString()]
        } else if (isSameMonth(startDate, endDate) && DateTimeHelper.toNumberedDateFromDate(startOfMonth(startDate)) === range[0] && DateTimeHelper.toNumberedDateFromDate(endOfMonth(endDate)) === range[1]) {
            return [format(startDate, "MMMM yyyy")]
        } else if (isSameYear(startDate, endDate) === true) {
            if (isSameMonth(startDate, endDate) === true) {
                return singleLine === true ? [`${format(startDate, "MMM dd")} - ${format(endDate, "dd")}, ${format(endDate, "yyyy")}`]
                    : [`${format(startDate, "MMM dd")} - ${format(endDate, "dd")}`, format(endDate, "yyyy")]
            } else return singleLine === true ? [`${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}, ${format(endDate, "yyyy")}`]
                : [`${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`, format(endDate, "yyyy")]
        } else return singleLine === true ? [`${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`]
            : [format(startDate, "MMM dd, yyyy -"), format(endDate, "MMM dd, yyyy")]
    }

    static subtract(left: [number, number], right: [number, number]): { overlap: boolean, rest: Array<[number, number]> } {
        if (left[0] <= right[1] && left[1] >= right[0]) {
            //overlaps
            if (left[0] < right[0] && left[1] > right[1]) {
                return {
                    overlap: true,
                    rest: [
                        [left[0], DateTimeHelper.toNumberedDateFromDate(subDays(DateTimeHelper.toDate(right[0]), 1))],
                        [DateTimeHelper.toNumberedDateFromDate(addDays(DateTimeHelper.toDate(right[1]), 1)), left[1]]
                    ]
                }
            } else if (left[0] < right[0] && left[1] <= right[1]) {
                return {
                    overlap: true,
                    rest: [
                        [left[0], DateTimeHelper.toNumberedDateFromDate(subDays(DateTimeHelper.toDate(right[0]), 1))]
                    ]
                }
            } else if (left[0] >= right[0] && left[1] > right[1]) {
                return {
                    overlap: true,
                    rest: [
                        [DateTimeHelper.toNumberedDateFromDate(addDays(DateTimeHelper.toDate(right[1]), 1)), left[1]]
                    ]
                }
            } else {
                return {
                    overlap: true,
                    rest: []
                }
            }
        } else {
            return {
                overlap: false,
                rest: [left]
            }
        }
    }
}


export function pad(n: number, len: number) {

    var s = n.toString();
    if (s.length < len) {
        s = ('0000' + s).slice(-len);
    }

    return s;

}

export function isToday(date: Date, today: Date = new Date()): boolean {
    return isSameDay(date, today)
}

export function isYesterday(date: Date, today: Date = new Date()): boolean {
    return differenceInDays(today, date) === 1
}