import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { Game } from 'src/app/game-logic/game';
import { GameMode, GameResult, Player } from 'src/app/models';
import { BoardComponent } from './board/board.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameBoard') boardComponent: BoardComponent;

  public readonly stoneTransitionTimeSec = 1.5;

  public gameOver = false;
  public gameLogic: Game;
  public gameMode: GameMode;

  private actualGameResult: GameResult;
  private moveSubscription: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnDestroy(): void {
    this.moveSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.initActualGameMode();
    this.gameLogic = new Game();
    this.gameLogic.initGame();
    this.startGameInProperMode();
  }

  private initActualGameMode(): void {
    const gameModeText = this.route.snapshot.paramMap.get('mode');
    switch (gameModeText) {
      case GameMode.PLAYER_VS_PLAYER: {
        this.gameMode = GameMode.PLAYER_VS_PLAYER;
        break;
      }
      default: {
        console.warn(
          `Incorrect game mode: ${gameModeText} - running in mode: ${this.gameMode} `
        );
        this.gameMode = GameMode.PLAYER_VS_PLAYER;
        break;
      }
    }
  }

  private startGameInProperMode(): void {
  }

  
  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public onRestartGameBtnClick() {
    const binsClickable = this.boardComponent?.binsAreClickable;
    
    if (binsClickable) {
      this.gameLogic.resetGame();
      this.boardComponent.resetGame();
      this.gameOver = false;
      this.gameLogic.actualPlayer = Player.B;
      this.startGameInProperMode();
    }
  }

  public onBinClick(binNumber: number): void {
    this.makeMove(binNumber);
    if (
      !this.gameOver &&
      this.gameLogic.actualPlayer === Player.A
    ) {
      //this.makeMoveByBot(Player.A);
    }
  }

  private makeMove(binNumber: number) {
    const [gameResult, gameOver] = this.gameLogic.makeMove(binNumber);
    this.gameOver = gameOver;
    this.actualGameResult = gameResult;
    this.boardComponent.lastClickedBinNumer = binNumber;
    this.boardComponent.onMoveHasBeenDone();
  }

  public backToHome(): void {
    this.router.navigateByUrl('/home');
  }

  /* ------------------------------------------- Getters / setters ------------------------------------------- */
  get headerText(): string {
    if (!this.gameOver) {
      return 'Mancala Game';
    }
    return `Game over. ${this.winnerInfoText}`;
  }

  get playerAText(): string {
    const playerVsPlayer = this.gameMode === GameMode.PLAYER_VS_PLAYER;
    return playerVsPlayer ? 'Player A' : 'Bot A';
  }

  get winnerInfoText(): string {
    if (this.actualGameResult === GameResult.TIE) {
      return "It's a tie !";
    }
    
  }

  
}
