// src/game/Game.ts
import {Player} from 'src/entities/Player';
import {Coordinate} from 'src/types/Coordinate';
import {generateMaze, Maze} from 'src/entities/Maze';
import {PlayerBehaviorResult} from 'src/types/PlayerBehaviorResult';

export class GameMazeField {
	maze: Maze;
	player: Player
	playerMoveCount: number

	initMap(wallHeight: number, wallWidth: number) {
		this.maze = generateMaze(wallHeight, wallWidth, {coordX: 1, coordY: 1}, {
			coordX: wallHeight - 2,
			coordY: wallWidth - 2
		});
		this.player = new Player(this.maze.startCoord)
		this.playerMoveCount = 0
	}

	movePlayer(dx: number, dy: number): PlayerBehaviorResult {
		this.playerMoveCount += 1
		const newLocation = {
			coordX: this.player.position.posX + dx,
			coordY: this.player.position.posY + dy,
		}

		// 맵 경계 및 벽(#) 충돌 검사
		if (this.isValidLocationForPlayer(newLocation)) {
			this.player.position.updatePosition(newLocation)
			return PlayerBehaviorResult.success(
				'move', this.playerMoveCount == 1
			)
		}

		return PlayerBehaviorResult.fail(
			'move', '어딘가 걸렸나봅니다'
		)
	}

	isPlayerHere(location: Coordinate): boolean {
		return location.coordX === this.player.position.posX && location.coordY === this.player.position.posY
	}

	isPlayerFinished(): boolean {
		return this.isFinishLocation({coordX: this.player.position.posX, coordY: this.player.position.posY})
	}

	isStartLocation(location: Coordinate): boolean {
		return location.coordX === this.maze.startCoord.coordX && location.coordY === this.maze.startCoord.coordY
	}

	isFinishLocation(location: Coordinate): boolean {
		return location.coordX === this.maze.finishCoord.coordX && location.coordY === this.maze.finishCoord.coordY
	}

	isValidLocationForPlayer(coordinate: Coordinate): boolean {
		return this.maze.isInsideWall(coordinate)
			&& !this.maze.isWall(coordinate)
	}

	getMazeRenderOutput(): string {
		let output = '';

		for (let x = 0; x < this.maze.wallHeight; x++) {
			let row = '';
			for (let y = 0; y < this.maze.wallWidth; y++) {
				let currentLocation = {coordX: x, coordY: y};
				try {
					if (this.isPlayerHere(currentLocation)) {
						row += this.player.getCharacter();
					} else {
						if (this.isStartLocation(currentLocation)) {
							row += this.maze.getStartObject();
						} else if (this.isFinishLocation(currentLocation)) {
							row += this.maze.getFinishObject();
						} else {
							row += this.maze.getObject(currentLocation);
						}
					}
				} catch (e) {
					console.error(e)
					row += '/'
				}
			}
			output += row + '\n';
		}

		return output
	}
}
