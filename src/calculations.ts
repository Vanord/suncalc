import {Constants} from './constants';
import {CalendarTools} from './calendar-tools';

export class Calculations {
    static azimuth(H, phi, dec) {
        return Math.atan(Math.sin(H) * Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
    }

    static altitude(H, phi, dec) {
        return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    }

    static siderealTime(d, lw) {
        return Constants.rad * (280.16 + 360.9856235 * d) - lw;
    }

    static astroRefraction(h) {
        if (h < 0) // the following formula works for positive altitudes only.
            h = 0; // if h = -0.08901179 a div/0 would occur.

        // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
    }

    // calculations for sun times

    static julianCycle(d, lw) {
        return Math.round(d - CalendarTools.J0 - lw / (2 * Math.PI));
    }

    static approxTransit(Ht, lw, n) {
        return CalendarTools.J0 + (Ht + lw) / (2 * Math.PI) + n;
    }

    static solarTransitJ(ds, M, L) {
        return CalendarTools.J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    }

    static hourAngle(h, phi, d) {
        return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
    }

    static observerAngle(height) {
        return -2.076 * Math.sqrt(height) / 60;
    }

// returns set time for the given sun altitude
    static getSetJ(h, lw, phi, dec, n, M, L) {

        let w = this.hourAngle(h, phi, dec),
            a = this.approxTransit(w, lw, n);
        return this.solarTransitJ(a, M, L);
    }

    static hoursLater(date, h) {
        return new Date(date.valueOf() + h * CalendarTools.dayMs / 24);
    }


}
