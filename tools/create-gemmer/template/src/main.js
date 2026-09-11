import { Game, Scene } from 'gemmer';

const game = new Game(new Scene());

// Initialize Game (800x600)
game.init({ width: 800, height: 600 });

// Start the game loop (Empty canvas for now)
game.start();
