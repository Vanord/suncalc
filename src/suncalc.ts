import {CalendarTools} from './calendar-tools';
import {Sun} from './sun';
import {Constants} from './constants';
import {Calculations} from './calculations';
import {Moon} from './moon';

export class SunCalc {
    private sun: Sun = new Sun();

    private moon: Moon = new Moon();

    private times: any[] = [
        [-0.833, 'sunrise', 'sunset'],
        [-0.3, 'sunriseEnd', 'sunsetStart'],
        [-6, 'dawn', 'dusk'],
        [-12, 'nauticalDawn', 'nauticalDusk'],
        [-18, 'nightEnd', 'night'],
        [6, 'goldenHourEnd', 'goldenHour']
    ];

    public getPosition(date, lat, lng) {
        let lw = Constants.rad * -lng,
            phi = Constants.rad * lat,
            d = CalendarTools.toDays(date),

            c = this.sun.sunCoords(d),
            H = Calculations.siderealTime(d, lw) - c.ra;

        return {
            azimuth: Calculations.azimuth(H, phi, c.dec),
            altitude: Calculations.altitude(H, phi, c.dec)
        };
    }

    // adds a custom time to the times config
    public addTime(angle, riseName, setName) {
        this.times.push([angle, riseName, setName]);
    }

    // calculates sun times for a given date, latitude/longitude, and, optionally,
    // the observer height (in meters) relative to the horizon
    public getTimes(date, lat, lng, height) {
        height = height || 0;

        let lw = Constants.rad * -lng,
            phi = Constants.rad * lat,

            dh = Calculations.observerAngle(height),

            d = CalendarTools.toDays(date),
            n = Calculations.julianCycle(d, lw),
            ds = Calculations.approxTransit(0, lw, n),

            M = this.sun.solarMeanAnomaly(ds),
            L = this.sun.eclipticLongitude(M),
            dec = this.sun.declination(L, 0),

            Jnoon = Calculations.solarTransitJ(ds, M, L),

            i, len, time, h0, Jset, Jrise;


        let result = {
            solarNoon: CalendarTools.fromJulian(Jnoon),
            nadir: CalendarTools.fromJulian(Jnoon - 0.5)
        };

        for (i = 0, len = this.times.length; i < len; i += 1) {
            time = this.times[i];
            h0 = (time[0] + dh) * Constants.rad;

            Jset = Calculations.getSetJ(h0, lw, phi, dec, n, M, L);
            Jrise = Jnoon - (Jset - Jnoon);

            result[time[1]] = CalendarTools.fromJulian(Jrise);
            result[time[2]] = CalendarTools.fromJulian(Jset);
        }

        return result;
    }

    public getMoonPosition(date, lat, lng) {

        let lw = Constants.rad * -lng,
            phi = Constants.rad * lat,
            d = CalendarTools.toDays(date),

            c = this.moon.moonCoords(d),
            H = Calculations.siderealTime(d, lw) - c.ra,
            h = Calculations.altitude(H, phi, c.dec),
            // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
            pa = Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(c.dec) - Math.sin(c.dec) * Math.cos(H));

        h = h + Calculations.astroRefraction(h); // altitude correction for refraction

        return {
            azimuth: Calculations.azimuth(H, phi, c.dec),
            altitude: h,
            distance: c.dist,
            parallacticAngle: pa
        };
    };

    // calculations for illumination parameters of the moon,
    // based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
    // Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

    public getMoonIllumination(date) {

        let d = CalendarTools.toDays(date || new Date()),
            s = this.sun.sunCoords(d),
            m = this.moon.moonCoords(d),

            sdist = 149598000, // distance from Earth to Sun in km

            phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra)),
            inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi)),
            angle = Math.atan2(Math.cos(s.dec) * Math.sin(s.ra - m.ra), Math.sin(s.dec) * Math.cos(m.dec) -
                Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));

        return {
            fraction: (1 + Math.cos(inc)) / 2,
            phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
            angle: angle
        };
    };

    // calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

    public getMoonTimes(date, lat, lng, inUTC) {
        let t = new Date(date);
        if (inUTC) t.setUTCHours(0, 0, 0, 0);
        else t.setHours(0, 0, 0, 0);

        let hc = 0.133 * Constants.rad,
            h0 = this.getMoonPosition(t, lat, lng).altitude - hc,
            h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

        // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
        for (let i = 1; i <= 24; i += 2) {
            h1 = this.getMoonPosition(Calculations.hoursLater(t, i), lat, lng).altitude - hc;
            h2 = this.getMoonPosition(Calculations.hoursLater(t, i + 1), lat, lng).altitude - hc;

            a = (h0 + h2) / 2 - h1;
            b = (h2 - h0) / 2;
            xe = -b / (2 * a);
            ye = (a * xe + b) * xe + h1;
            d = b * b - 4 * a * h1;
            roots = 0;

            if (d >= 0) {
                dx = Math.sqrt(d) / (Math.abs(a) * 2);
                x1 = xe - dx;
                x2 = xe + dx;
                if (Math.abs(x1) <= 1) roots++;
                if (Math.abs(x2) <= 1) roots++;
                if (x1 < -1) x1 = x2;
            }

            if (roots === 1) {
                if (h0 < 0) rise = i + x1;
                else set = i + x1;

            } else if (roots === 2) {
                rise = i + (ye < 0 ? x2 : x1);
                set = i + (ye < 0 ? x1 : x2);
            }

            if (rise && set) break;

            h0 = h2;
        }

        let result: {rise: Date, set: Date} = {
            rise: null,
            set: null
        };

        if (rise) result.rise = Calculations.hoursLater(t, rise);
        if (set) result.set = Calculations.hoursLater(t, set);

        if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

        return result;
    };


}
