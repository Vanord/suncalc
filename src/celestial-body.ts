import {Constants} from './constants';

export class CelestialBody {

    public rightAscension(l, b) {
        return Math.atan(Math.sin(l) * Math.cos(Constants.earthObliquity) - Math.tan(b) * Math.sin(Constants.earthObliquity) * Math.cos(l));
    }

    public declination(l, b) {
        return Math.asin(Math.sin(b) * Math.cos(Constants.earthObliquity) + Math.cos(b) * Math.sin(Constants.earthObliquity) * Math.sin(l));
    }
}
