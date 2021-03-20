function main() {
    'use strict';
    function init() {
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
        rows = canvas.width/CELL_SIZE;
        columns = canvas.height/CELL_SIZE;
        game = new Game(rows, columns);
    }

    function drawSquare(ctx, x, y, size, color){
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
    }

    function drawCheckerboard(ctx, canvas){
        for (let i = 0; i < canvas.width; i += CELL_SIZE){
            for(let j = 0; j < canvas.height; j += CELL_SIZE){
                let cellColor = ((i+j)/CELL_SIZE%2==1)? 'rgba(64,64,64,1)':'white';
                drawSquare(ctx, i, j, CELL_SIZE, cellColor);
            }
        }
    }
    class Cell {
        constructor(state=0) {
            this.state = state;
        }
        clone() {
            return new Cell(this.state);
        }
    }

    class Game {
        constructor(rows, columns) {
            this.rows = rows;
            this.columns = columns;
            this.alive_color = 'rgba(64,64,64,1)';
            this.dead_color = 'white';
            this.counter = 0;

            // board
            this.board = Array.from(Array(this.rows), () => new Array(this.columns));
            for (let i = 0; i < this.rows; i++){
                for(let j = 0; j < this.columns; j++){
                    this.board[i][j] = new Cell((i+j)%2);
                }
            }
        }

        draw() {
            for (let i = 0; i < this.rows; i++){
                for(let j = 0; j < this.columns; j++){
                    let cell = this.board[i][j];
                    let cellColor = (cell.state==1)? this.alive_color:this.dead_color;
                    drawSquare(ctx, i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, cellColor);
                }
            }
        }

        randomize(percent_alive=0.5) {
            for (let i = 0; i < this.rows; i++){
                for(let j = 0; j < this.columns; j++){
                    let state = (Math.random() < percent_alive)?1:0;
                    this.board[i][j].state = state;
                }
            }
        }

        step() {
            let new_board = deepCopyBoard(this.board);
            for (let i = 0; i < this.rows; i++){
                for(let j = 0; j < this.columns; j++){
                    let newState = this.getNewState(i,j);
                    new_board[i][j].state = newState;
                }
            }
            this.board = new_board;
            this.counter++;
        }

        getNewState(i,j){
            let alive_neighbours = this.getAliveNeighbours(i,j);
            let cell = this.board[i][j];
            if (cell.state==0) {
                if (alive_neighbours==3){
                    return 1;
                } else {
                    return 0;
                }
            } else if (cell.state==1) {
                if (alive_neighbours==2 || alive_neighbours==3){
                    return 1;
                } else {
                    return 0;
                }
            } else {
                throw "Invalid cell state" + cell.state;
            }
        }

        getAliveNeighbours(i,j) {
            let alive_count = 0;
            for(let k = i-1; k <=i+1; k++){
                for(let l = j-1; l <=j+1; l++){
                    if (k==i && l==j) continue;
                    let cell = this.getCell(k,l);
                    if (cell.state==1) alive_count++;
                }
            }
            // console.log(alive_count)
            return alive_count;
        }

        getCell(i,j){
            // Negative indexing
            let k = (this.rows+i) % this.rows;
            let l = (this.columns+j) % this.columns;
            return this.board[k][l];
        }
    }
    function deepCopyBoard(old_board) {
        let rows = old_board.length;
        let columns = old_board[0].length;
        let new_board = Array.from(Array(rows), () => new Array(columns));
            for (let i = 0; i < rows; i++){
                for(let j = 0; j < columns; j++){
                    new_board[i][j] = old_board[i][j].clone();
                }
            }
        return new_board;
    }

    function startGame() {
        let step = 0;
        
        timer = setInterval(function() {
            game.step();
            game.draw();
            step++;
            document.getElementById("counter").innerHTML = step;
            if (step >= MAX_STEPS) stopGame();
        }, DT);
    }

    function stopGame() {
        clearInterval(timer);
    }



// ****************************** Event listeners ******************************
    document.getElementById("changeSize").addEventListener("click", function() {
        // remove old canvas
        let resX = document.getElementById("resX").value;
        let resY = document.getElementById("resY").value;
        let oldCanvas = document.querySelector('#gameCanvas');
        oldCanvas.parentNode.removeChild(oldCanvas);

        // create new canvas
        let newCanvas = document.createElement("CANVAS");
        newCanvas.id = "gameCanvas";
        newCanvas.width = resX;
        newCanvas.height = resY;
        let content = document.querySelector('#gameDiv')
        content.prepend(newCanvas);
        init();
    });

    document.getElementById("btnStart").addEventListener("click", function() {
        startGame();
    });

    document.getElementById("btnStop").addEventListener("click", function() {
        stopGame();
    });

    // Update slider (each time you drag the slider handle)
    let slider = document.getElementById("popSlider");
    let sliderValue = document.getElementById("popValue");
    sliderValue.innerHTML = slider.value/100.0;
    slider.oninput = function() {
        let percent_alive = slider.value/100.0;
        sliderValue.innerHTML = percent_alive;
        game.randomize(percent_alive);
        game.draw()
    }

// ****************************** Init ******************************
    let canvas;
    let ctx;
    let rows;
    let columns;
    let game;
    let timer;
    const CELL_SIZE = 8;
    const DT = 100; // Time step [ms]
    const MAX_STEPS = 1000;
    init();
    game.randomize();
    game.draw();
    // game.step()

}

window.onload = main;