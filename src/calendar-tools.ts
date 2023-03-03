export class CalendarTools {

    static dayMs = 1000 * 60 * 60 * 24;
    static J1970 = 2440588; // year 1970
    static J2000 = 2451545; // year 2000
    static J0 = 0.0009; // year 0


    /**
     * Converting date to julian calendar time
     * @param date
     */
    static toJulian(date: Date) {
        return date.valueOf() / this.dayMs - 0.5 + this.J1970;
    }


    /**
     * Convert Julian to Date
     * @param julian
     */
    static fromJulian(julian: number) {
        return new Date((julian + 0.5 - this.J1970) * this.dayMs);
    }

    /**
     * Convert Date to days
     * @param date
     */
    static toDays(date: Date) {
        return this.toJulian(date) - this.J2000;
    }
}
