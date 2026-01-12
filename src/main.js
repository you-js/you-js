// Engine Bootstrap
// This file connects the engine to the user's game code.

// Just import the user's main game file to execute it.
// Expose input to global for convenience
import { input } from './core/input.js';
window.input = input;

// Load the user's game
import '../app/main.js';
