import {CelestialBody} from './celestial-body';
import {Constants} from './constants';

export class Moon extends CelestialBody {

    // moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas
    public moonCoords(d) { // geocentric ecliptic coordinates of the moon

        let L = Constants.rad * (218.316 + 13.176396 * d), // ecliptic longitude
            M = Constants.rad * (134.963 + 13.064993 * d), // mean anomaly
            F = Constants.rad * (93.272 + 13.229350 * d),  // mean distance

            l = L + Constants.rad * 6.289 * Math.sin(M), // longitude
            b = Constants.rad * 5.128 * Math.sin(F),     // latitude
            distanceToMoon = 385001 - 20905 * Math.cos(M);  // distance to the moon in km

        return {
            ra: this.rightAscension(l, b),
            dec: this.declination(l, b),
            dist: distanceToMoon
        };
    }
}
