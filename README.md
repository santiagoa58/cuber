# cuber
A basic game built with Three.js. As the player, you control a green cube navigating through a field of spontaneously spawning red cubes. The game is centered around colliding with these cubes.

## Gameplay

Your cube's speed adapts based on the canvas size, ensuring a consistent gaming experience across different devices and screen sizes. Navigate your cube through the swarm of red ones, dodging or colliding with them to score points. With each collision, the red cube disappears and your score increments.

## Features

- Adaptive cube speed: Your cube's speed adjusts based on the canvas size.
- Dynamic enemy spawn: Red cubes spawn spontaneously.
- Scoring system: Each collision with a red cube increments your score.

## Tech Stack

This game is built primarily using:
- [Three.js](https://threejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

## How to Run Locally

1. Clone this repository to your local machine using `git clone https://github.com/santiagoa58/cuber.git`.
2. Navigate to the project folder using `cd cuber`.
3. Install all necessary dependencies using `npm install`.
4. Start the development server using `npm run dev`.
5. Open your browser and go to `http://localhost:5173/` to start playing the game

