export interface Coordinate {
	coordX: number;
	coordY: number;
}

export class CoordinateUtil {
	static toLargestOddBelow(coord: Coordinate): Coordinate {
		return {
			coordX: (coord.coordX) % 2 == 0 ? coord.coordX - 1 : coord.coordX,
			coordY: (coord.coordY) % 2 == 0 ? coord.coordY - 1 : coord.coordY
		}
	}
}
