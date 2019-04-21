// create reference to board table and notification div
const board = document.querySelector('#container');
const notification = document.querySelector('#notify');

// create variables to represent size of the board, mines, and flags
let rowCount = 10;
let columnCount = 10;
let mineCount = 10;
let flagCount = mineCount;
let gameOver = false;
let time = 0;
let t; // represents in game timer
let firstCellClicked = true; // used to know when to start timer

// set true to make mines visible
let testMode = false;

// create reference to reset smiley
let resetButton = document.getElementById('reset');
let resetIcon = document.getElementById('smiley');
resetButton.addEventListener('click', createBoard);

// create board
createBoard(rowCount, columnCount);

function changeLevel() {
    console.log("Level change");
    let level = document.getElementById('level-select').value;
    switch(level) {
        case "Beginner":
            rowCount = 10;
            columnCount = 10;
            mineCount = 10;
            break;
        case "Intermediate":
            rowCount = 16;
            columnCount = 16;
            mineCount = 40;
            break;
        case "Expert":
            rowCount = 16;
            columnCount = 30;
            mineCount = 99;
    }
    
    flagCount = mineCount;
    createBoard(rowCount, columnCount);
}

function createBoard(x = rowCount, y = columnCount) {
    // first delete all the old nodes
    while (board.hasChildNodes()) {
        board.removeChild(board.firstChild);
    }

    gameOver = false;
    flagCount = mineCount;
    notification.innerText = "";

    // reset timer 
    clearTimeout(t);
    time = 0;
    document.getElementById('timer').innerText = "000";
    firstCellClicked = true;

    // update reset icon
    resetIcon.innerHTML = '&#xf118;';

    //update flag display 
    document.getElementById('flag-display').innerText = pad(flagCount);

    // create the board
    for (let i = 0; i < rowCount; i++) {
        let row = board.insertRow(i);
        for (let j = 0; j < columnCount; j++) {

            let cell = row.insertCell(j);
            cell.className = 'not-clicked';

            // recognize when cell is clicked
            cell.onclick = function() { clickedCell(this); }; 

            cell.addEventListener('mousedown', function() {
                if (gameOver != true) resetIcon.innerHTML = '&#xf5c2;';   
            });

            cell.addEventListener('mouseup', function() {
                if (gameOver != true) resetIcon.innerHTML = '&#xf118;';
            });

            // add flag on right click
            cell.addEventListener('contextmenu', function(e) {
                e.preventDefault(); 
                flag(this);
            }, false);          
        }
    }

    placeMines(mineCount);

}

function placeMines(count) {
    // place mines on board randomly
    for (let i = 0; i < count; i++) {
        let row = Math.floor(Math.random() * rowCount);
        let column = Math.floor(Math.random() * columnCount);
        let cell = board.rows[row].cells[column];
        if (cell.getAttribute("data-mine") != "true") { // make sure not setting multiple mines in same spot
            cell.setAttribute("data-mine", "true");
            if (testMode) cell.innerText = "X";
        } else {
            i--; // loop again if mine not set
        }
    }
}

function showMines() {
    // loop through all cells and show which are mines
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            if (board.rows[i].cells[j].getAttribute("data-mine") === "true") {
                board.rows[i].cells[j].className = 'clicked';
                let mineIcon = document.createElement('i');
                mineIcon.className = 'fas fa-bomb'; // font-awesome class for mine icon
                board.rows[i].cells[j].appendChild(mineIcon); 
            }
            if (board.rows[i].cells[j].getAttribute("data-flag") === "true") {
                board.rows[i].cells[j].removeChild(board.rows[i].cells[j].firstChild); // remove flag icon
            }
        }
    }
}

function clickedCell(cell) {
    //start timer
    if (firstCellClicked) timer();
    firstCellClicked = false;

    // do nothing if user clicks flagged cell or if game over
    if (cell.getAttribute("data-flag") === "true" || gameOver) return;

    if (cell.getAttribute("data-mine") === "true") {
        // if user clicks mine, end game
        resetIcon.innerHTML = '&#xf567;';
        cell.style.backgroundColor = 'red';
        clearTimeout(t);
        showMines();
        gameOver = true;
        notification.innerText = "GAME OVER";
    } else {
        cell.className = 'clicked';

        let row = cell.parentNode.rowIndex;
        let column = cell.cellIndex;
        let mines = 0;

        // loop through cells touching clicked cell and count mine
        for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, rowCount - 1); i++) {
            for (let j = Math.max(column - 1, 0); j <= Math.min(column + 1, columnCount - 1); j++) {
                if (i === row && j === column) continue; 
                if (board.rows[i].cells[j].getAttribute("data-mine") === "true") {
                    mines++;
                }
            }
        }

        if (mines > 0) {
            cell.innerText = mines;
        } else {
            
            // if user clicks cell next to 0 mines, all surrounding cells are cleared
            for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, rowCount - 1); i++) {
                for (let j = Math.max(column - 1, 0); j <= Math.min(column + 1, columnCount - 1); j++) {
                    if (i === row && j === column) continue; // skip current cell
                    if (board.rows[i].cells[j].innerText === "" && board.rows[i].cells[j].className != 'clicked')  {
                        clickedCell(board.rows[i].cells[j]);
                    }
                }
            }
        }
        checkCompletion();
     }
}

function timer() {

    // prevent timer from running forever
    if (time === 999) {
        clearTimeout(t);
        return;
    }
    let timeDisplay = document.getElementById('timer');
    timeDisplay.innerText = pad(time);
    time++;
    t = setTimeout(timer, 1000);
}

function checkCompletion() {
    // checks if user has won
    let levelComplete = true;

    // loop through all cells, if all are clicked or mine user has won
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            levelComplete = levelComplete && (board.rows[i].cells[j].getAttribute("data-mine") === "true" || board.rows[i].cells[j].className === 'clicked');
        }
    }

    if (levelComplete){
        gameOver = true;

        for (let i = 0; i < rowCount; i++) {
            for (let j = 0; j < columnCount; j++) {
                if (board.rows[i].cells[j].getAttribute("data-mine") === "true" && board.rows[i].cells[j].getAttribute("data-flag") != "true") {
                    flag(board.rows[i].cells[j]);
                    console.log("flag");
                }
            }
        }
        clearTimeout(t);
        resetIcon.innerHTML = '&#xf587;';
        notification.innerText = "Congratulations! You beat minsweeper on " + document.getElementById('level-select').value + " mode in " + (time - 1) + " seconds!";
    } 
}

function flag(cell) {
    // do nothing if user has already clicked cell or if game over
    if (cell.className === 'clicked') return;

    let alreadyFlagged = cell.getAttribute("data-flag") === "true";
    let flagDisplay = document.getElementById('flag-display');

    // if not flagged, then add flag
    if (!alreadyFlagged) {
        // limit mines allowed to be set
        if (flagCount === 0) return;
        cell.setAttribute("data-flag", "true");
        let flagIcon = document.createElement('i');
        flagIcon.style.color = 'blue';
        flagIcon.className = 'fas fa-flag'; // font-awesome class for flag image
        cell.appendChild(flagIcon);
        flagCount--;
    } else { // remove flag if already flagged
        if (gameOver) return;
        cell.setAttribute("data-flag", "false");
        cell.removeChild(cell.firstChild);
        flagCount++;
    }
    flagDisplay.innerText = pad(flagCount);
}

// used to pad displays with 0's
function pad(num) {
    let str = num.toString();
    while (str.length < 3){
        str = "0" + str;
    } 
    return str;
}
