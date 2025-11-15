import {Coordinate, CoordinateUtil} from 'src/types/Coordinate';

export class Maze {
	field: string[]
	wallHeight: number
	wallWidth: number
	startCoord: Coordinate
	finishCoord: Coordinate

	constructor(field: string[], wallHeight: number, wallWidth: number, startCoord: Coordinate, finishCoord: Coordinate) {
		this.field = field;
		this.wallHeight = wallHeight;
		this.wallWidth = wallWidth;
		this.startCoord = startCoord;
		this.finishCoord = finishCoord;
	}

	getObject(location: Coordinate): string {
		return this.field[location.coordX][location.coordY]
	}

	isWall(location: Coordinate): boolean {
		return this.getObject(location) === '#'
	}

	isInsideWall(location: Coordinate): boolean {
		return 1 <= location.coordX && location.coordX <= this.wallHeight - 2
			&& 1 <= location.coordY && location.coordY <= this.wallWidth - 2
	}

	getStartObject(): string {
		return "S";
	}

	getFinishObject(): string {
		return "F";
	}
}

type Direction = { dx: number; dy: number };

export function generateMaze(
	height: number,
	width: number,
	start: Coordinate,
	finish: Coordinate
): Maze {
	const oddStart = CoordinateUtil.toLargestOddBelow(start)
	const oddFinish: Coordinate = CoordinateUtil.toLargestOddBelow(finish)

	// 파라미터 정합성 체크
	if (height < 3 || width < 3) {
		throw new Error(`Maze size too small: ${height}x${width}. Minimum is 3x3.`);
	}

	if (oddStart.coordX <= 0 || oddStart.coordX >= height - 1 ||
		oddStart.coordY <= 0 || oddStart.coordY >= width - 1) {
		throw new Error(`Start position out of bounds: (${oddStart.coordX}, ${oddStart.coordY})`);
	}

	if (oddFinish.coordX <= 0 || oddFinish.coordX >= height - 1 ||
		oddFinish.coordY <= 0 || oddFinish.coordY >= width - 1) {
		debugger
		throw new Error(`Finish position out of bounds: (${oddFinish.coordX}, ${oddFinish.coordY})`);
	}

	if (oddStart.coordX === oddFinish.coordX && oddStart.coordY === oddFinish.coordY) {
		throw new Error('Start and finish positions cannot be the same');
	}

	// 초기화: 모두 벽
	const maze: string[][] = Array(height)
		.fill(null)
		.map(() => Array(width).fill('#'));

	const directions: Direction[] = [
		{dx: 0, dy: -2},
		{dx: 0, dy: 2},
		{dx: -2, dy: 0},
		{dx: 2, dy: 0},
	];

	const isValid = (coord: Coordinate): boolean => {
		return (
			coord.coordX > 0 &&
			coord.coordX < height - 1 &&
			coord.coordY > 0 &&
			coord.coordY < width - 1
		);
	};

	const getUnvisitedNeighbors = (pos: Coordinate): Coordinate[] => {
		const neighbors: Coordinate[] = [];

		for (const dir of directions) {
			const neighbor: Coordinate = {
				coordX: pos.coordX + dir.dx,
				coordY: pos.coordY + dir.dy,
			};

			if (isValid(neighbor) && maze[neighbor.coordX][neighbor.coordY] === '#') {
				neighbors.push(neighbor);
			}
		}

		return neighbors;
	};

	const shuffle = <T>(array: T[]): T[] => {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	};

	// Backtracking
	const stack: Coordinate[] = [];
	maze[oddStart.coordX][oddStart.coordY] = '.';
	stack.push(oddStart);

	while (stack.length > 0) {
		const current = stack[stack.length - 1];
		const neighbors = getUnvisitedNeighbors(current);

		if (neighbors.length > 0) {
			const next = shuffle(neighbors)[0];

			// 중간 벽 제거
			const wallX = Math.floor((current.coordX + next.coordX) / 2);
			const wallY = Math.floor((current.coordY + next.coordY) / 2);
			maze[wallX][wallY] = '.';

			// 다음 위치 길로 만들기
			maze[next.coordX][next.coordY] = '.';
			stack.push(next);
		} else {
			stack.pop();
		}
	}

	// finish로 가는 경로 보장
	if (maze[oddFinish.coordX][oddFinish.coordY] === '#') {
		ensurePathToFinish(maze, oddFinish);
	}

	// S, F 배치
	maze[oddStart.coordX][oddStart.coordY] = 'S';
	maze[oddFinish.coordX][oddFinish.coordY] = 'F';

	return new Maze(
		maze.map(row => row.join('')),
		height,
		width,
		oddStart,
		oddFinish,
	);
}

// finish로 가는 경로를 보장하는 헬퍼 함수
function ensurePathToFinish(maze: string[][], finish: Coordinate): void {
	// finish를 길로 만들기
	maze[finish.coordX][finish.coordY] = '.';

	// finish 주변 4방향 중 길과 연결
	const directions = [
		{dx: 0, dy: -2},
		{dx: 0, dy: 2},
		{dx: -2, dy: 0},
		{dx: 2, dy: 0},
	];

	// 주변에 길이 있는지 확인
	let connected = false;
	for (const dir of directions) {
		const neighborX = finish.coordX + dir.dx;
		const neighborY = finish.coordY + dir.dy;

		if (neighborX > 0 && neighborX < maze.length - 1 &&
			neighborY > 0 && neighborY < maze[0].length - 1 &&
			maze[neighborX][neighborY] === '.') {
			// 중간 벽 제거하여 연결
			const wallX = Math.floor((finish.coordX + neighborX) / 2);
			const wallY = Math.floor((finish.coordY + neighborY) / 2);
			maze[wallX][wallY] = '.';
			connected = true;
			break;
		}
	}

	// 주변에 길이 없다면 1칸씩 확장해서 찾기
	if (!connected) {
		const queue: Coordinate[] = [{coordX: finish.coordX, coordY: finish.coordY}];
		const visited = new Set<string>();
		visited.add(`${finish.coordX},${finish.coordY}`);

		while (queue.length > 0 && !connected) {
			const current = queue.shift()!;

			for (const dir of directions) {
				const nextX = current.coordX + dir.dx;
				const nextY = current.coordY + dir.dy;
				const key = `${nextX},${nextY}`;

				if (nextX > 0 && nextX < maze.length - 1 &&
					nextY > 0 && nextY < maze[0].length - 1 &&
					!visited.has(key)) {
					visited.add(key);

					if (maze[nextX][nextY] === '.') {
						// 경로 연결: current에서 next까지
						let pathX = current.coordX;
						let pathY = current.coordY;
						const stepX = dir.dx > 0 ? 2 : (dir.dx < 0 ? -2 : 0);
						const stepY = dir.dy > 0 ? 2 : (dir.dy < 0 ? -2 : 0);

						while (pathX !== nextX || pathY !== nextY) {
							maze[pathX][pathY] = '.';
							if (pathX !== nextX) {
								const wallX = pathX + (stepX > 0 ? 1 : -1);
								maze[wallX][pathY] = '.';
								pathX += stepX;
							} else if (pathY !== nextY) {
								const wallY = pathY + (stepY > 0 ? 1 : -1);
								maze[pathX][wallY] = '.';
								pathY += stepY;
							}
						}
						connected = true;
						break;
					} else {
						queue.push({coordX: nextX, coordY: nextY});
					}
				}
			}
		}
	}
}
