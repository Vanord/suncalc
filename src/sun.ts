import {CelestialBody} from './celestial-body';
import {Constants} from './constants';

export class Sun extends CelestialBody {

    public sunCoords(d) {

        let M = this.solarMeanAnomaly(d),
            L = this.eclipticLongitude(M);

        return {
            dec: this.declination(L, 0),
            ra: this.rightAscension(L, 0)
        };
    }

    // general sun calculations
    public solarMeanAnomaly(d) {
        return Constants.rad * (357.5291 + 0.98560028 * d);
    }

    public eclipticLongitude(M) {
        let C = Constants.rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)), // equation of center
            P = Constants.rad * 102.9372; // perihelion of the Earth
        return M + C + P + Math.PI;
    }
}
