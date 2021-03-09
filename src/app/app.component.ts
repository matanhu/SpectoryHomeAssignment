import { Component, HostListener, OnInit } from '@angular/core';
import { CONTROLS, GAME_BOARD_COLUMN_TYPE, GAME_BOARD_SIZE } from './app.constants';
import { PositionModel } from './models/position-model';
import { SnakeModel } from './models/snake-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private interval = 150;
  public gameBoard: Array<Array<boolean>>;
  private tempDirection: CONTROLS = CONTROLS.LEFT;

  public score = 0;

  public snake: SnakeModel = {
    direction: CONTROLS.LEFT,
    vertebrals: new Array({
      x: -1,
      y: -1
    })
  };

  private isGameOver = false;
  private fruit = {
    x: -1,
    y: -1
  }

  ngOnInit(): void {
    this.setGameBoard();
  }

  /**
   * Listen to keydown event on document
   * If the event arrived from arrows key of keyboard,
   * check the current snake direction and set the tempDirection to new direcion
   * 
   * @param event keyboard event - arrived by js
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (CONTROLS.LEFT === event.keyCode && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT
    } else if (CONTROLS.RIGHT === event.keyCode && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT
    } else if (CONTROLS.UP === event.keyCode && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP
    } else if (CONTROLS.DOWN === event.keyCode && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN
    }
  }

  /**
   * Build Game Board 
   * GAME_BOARD_SIZE - determine count of rows and columns
   */
  setGameBoard(): void {
    this.gameBoard = new Array(GAME_BOARD_SIZE);

    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
      this.gameBoard[i] = new Array(GAME_BOARD_SIZE).fill(false);
    }
  }

  /**
   * Reset all state of game and snake.
   * Set initial snake location.
   * Set first fruit and start move snake.
   */
  startGame(): void {
    this.isGameOver = false;
    this.interval = 150;
    this.score = 0;

    this.snake = {
      direction: CONTROLS.LEFT,
      vertebrals: new Array()
    };

    for (let i = 0; i < 3; i++) {
      this.snake.vertebrals.push({ x: 8 + i, y: 8 });
    }

    this.setNewFruit();
    this.snakeMove();
  }

  /**
   * Set new fruit by random position(x,y) inside the game board.
   * If the random numbers is one of position of snake, call this method again
   */
  setNewFruit(): void {
    const newFruit = {
      x: this.randomNumber(),
      y: this.randomNumber()
    };

    if (this.gameBoard[newFruit.y][newFruit.x]) {
      this.setNewFruit();
    }

    this.fruit = newFruit;
  }

  /**
   * Set snake as eat a fruit
   * Increase score by 1
   * Increase the snake by one vertebral
   * 
   * Check if score is modulo of 5 - if true increase spead of snake by decrease interval time
   * 
   * Call to set new fruit location 
   */
  snakeEatFruit(): void {
    this.score++;

    let newTail = { ...this.snake.vertebrals[this.snake.vertebrals.length - 1] };
    this.snake.vertebrals.push(newTail);

    if (this.score % 5 === 0) {
      this.interval -= 15;
    }
    this.setNewFruit()
  }

  /**
   * Set a snake move one one step by current direction
   * 
   * Check if there was a collision, if true, call to  setGameOver.
   * Check if fruite was eat, if true, call to snakeEatFruit.
   * 
   * Call this method again after timeout of interval time to move snake forward.
   */
  snakeMove(): void {
    let newHead = this.getNewHeadPosition();

    if (this.boardCollision(newHead) || this.selfCollision(newHead)) {
      this.setGameOver();
      return;
    } else if (this.fruitCollision(newHead)) {
      this.snakeEatFruit();
    }
    let oldTail = this.snake.vertebrals.pop();
    this.gameBoard[oldTail.y][oldTail.x] = false;

    this.snake.vertebrals.unshift(newHead);
    this.gameBoard[newHead.y][newHead.x] = true;

    this.snake.direction = this.tempDirection;
    setTimeout(() => {
      this.snakeMove();
    }, this.interval);
  }

  /**
   * Decision of new position of snake head.
   * The decision based on old head position and direction
   *  
   * @returns The new position(x,y) of head
   */
  getNewHeadPosition(): PositionModel {
    let newHead = { ...this.snake.vertebrals[0] };

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }

  /**
   * Check if the vertebral param is on one of the border of board
   * 
   * @param vertebral Position that need to be check
   * @returns True or False of the checking result
   */
  boardCollision(vertebral: PositionModel): boolean {
    return vertebral.x === GAME_BOARD_SIZE || vertebral.x === -1 || vertebral.y === GAME_BOARD_SIZE || vertebral.y === -1;
  }

  /**
   * Check if the vertebral param is on one of the snake vertebrals
   * 
   * @param vertebral Position that need to be check
   * @returns True or False of the checking result
   */
  selfCollision(vertebral: PositionModel): boolean {
    return this.gameBoard[vertebral.y][vertebral.x] === true;
  }

  /**
     * Check if the vertebral param is on the fruit position
     * 
     * @param vertebral Position that need to be check
     * @returns True or False of the checking result
     */
  fruitCollision(vertebral: PositionModel): boolean {
    return this.fruit.x === vertebral.x && this.fruit.y === vertebral.y;
  }

  /**
   * Set gameOver to true and reset the board.
   */
  setGameOver(): void {
    this.isGameOver = true;
    this.setGameBoard();
  }

  getColType(col: number, row: number): string {
    if (this.isGameOver) {
      return GAME_BOARD_COLUMN_TYPE.GAME_OVER;
    } else if (this.fruit.x === row && this.fruit.y === col) {
      return GAME_BOARD_COLUMN_TYPE.FRUIT;
    } else if (this.snake.vertebrals[0].x === row && this.snake.vertebrals[0].y === col) {
      return GAME_BOARD_COLUMN_TYPE.SNAKE_HEAD;
    } else if (this.gameBoard[col][row] === true) {
      return GAME_BOARD_COLUMN_TYPE.SNAKE_BODY;
    }
  };

  /**
   * Get random number based on GAME_BOARD_SIZE
   * @returns Number 
   */
  randomNumber(): number {
    return Math.floor(Math.random() * GAME_BOARD_SIZE);
  }
}
