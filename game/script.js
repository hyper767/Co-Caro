let BOARD_SIZE = 9;
const EMPTY = '';
const PLAYER_X = 'X';
const PLAYER_O = 'O';
let board = [];
let gameOver = false;

function initBoard() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    gameOver = false;
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    boardDiv.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 40px)`;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardDiv.appendChild(cell);
        }
    }
    document.getElementById('turnMessage').textContent = 'Lượt của bạn (X)';
}

function handleCellClick(event) {
    if (gameOver) return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (board[row][col] !== EMPTY) return;

    board[row][col] = PLAYER_X;
    event.target.textContent = PLAYER_X;
    event.target.classList.add('x');

    if (checkWin(PLAYER_X)) {
        endGame('Bạn thắng!');
        return;
    }
    if (isBoardFull()) {
        endGame('Hòa!');
        return;
    }

    document.getElementById('turnMessage').textContent = 'Bot đang suy nghĩ...';
    setTimeout(() => {
        const [botRow, botCol] = findBestMove();
        if (botRow === -1 || botCol === -1) {
            console.error("Bot không tìm được nước đi!");
            return;
        }
        board[botRow][botCol] = PLAYER_O;
        const botCell = document.querySelector(`[data-row="${botRow}"][data-col="${botCol}"]`);
        if (botCell) {
            botCell.textContent = PLAYER_O;
            botCell.classList.add('o');
        } else {
            console.error("Không tìm thấy ô để cập nhật!");
        }

        if (checkWin(PLAYER_O)) {
            endGame('Bot thắng!');
            return;
        }
        if (isBoardFull()) {
            endGame('Hòa!');
            return;
        }
        document.getElementById('turnMessage').textContent = 'Lượt của bạn (X)';
    }, 400);
}

function checkWin(player) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j <= BOARD_SIZE - 5; j++) {
            if (board[i].slice(j, j + 5).every(cell => cell === player)) return true;
        }
    }
    for (let i = 0; i <= BOARD_SIZE - 5; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if ([0, 1, 2, 3, 4].every(k => board[i + k][j] === player)) return true;
        }
    }
    for (let i = 0; i <= BOARD_SIZE - 5; i++) {
        for (let j = 0; j <= BOARD_SIZE - 5; j++) {
            if ([0, 1, 2, 3, 4].every(k => board[i + k][j + k] === player)) return true;
        }
    }
    for (let i = 4; i < BOARD_SIZE; i++) {
        for (let j = 0; j <= BOARD_SIZE - 5; j++) {
            if ([0, 1, 2, 3, 4].every(k => board[i - k][j + k] === player)) return true;
        }
    }
    return false;
}

function isBoardFull() {
    return board.every(row => row.every(cell => cell !== EMPTY));
}

function evaluate() {
    if (checkWin(PLAYER_O)) return 10000;
    if (checkWin(PLAYER_X)) return -10000;

    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            for (const [di, dj] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
                let playerCount = 0, emptyCount = 0, isOpen = true;
                for (let k = -1; k <= 5; k++) {
                    const ni = i + k * di, nj = j + k * dj;
                    if (ni < 0 || ni >= BOARD_SIZE || nj < 0 || nj >= BOARD_SIZE) {
                        isOpen = false;
                        break;
                    }
                    if (board[ni][nj] === PLAYER_O) playerCount++;
                    else if (board[ni][nj] === EMPTY) emptyCount++;
                    else isOpen = false;
                }
                if (isOpen) {
                    if (playerCount === 4 && emptyCount >= 1) score += 500;
                    if (playerCount === 3 && emptyCount >= 2) score += 100;
                }

                playerCount = 0; emptyCount = 0; isOpen = true;
                for (let k = -1; k <= 5; k++) {
                    const ni = i + k * di, nj = j + k * dj;
                    if (ni < 0 || ni >= BOARD_SIZE || nj < 0 || nj >= BOARD_SIZE) {
                        isOpen = false;
                        break;
                    }
                    if (board[ni][nj] === PLAYER_X) playerCount++;
                    else if (board[ni][nj] === EMPTY) emptyCount++;
                    else isOpen = false;
                }
                if (isOpen) {
                    if (playerCount === 4 && emptyCount >= 1) score -= 450;
                    if (playerCount === 3 && emptyCount >= 2) score -= 90;
                }
            }
        }
    }
    return score;
}

{
    const score = evaluate();
    if (score >= 10000 || score <= -10000 || depth === maxDepth) return score;
    if (isBoardFull()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    board[i][j] = PLAYER_O;
                    const score = minimax(depth + 1, false, alpha, beta, maxDepth);
                    board[i][j] = EMPTY;
                    bestScore = Math.max(bestScore, score);
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) return bestScore;
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    board[i][j] = PLAYER_X;
                    const score = minimax(depth + 1, true, alpha, beta, maxDepth);
                    board[i][j] = EMPTY;
                    bestScore = Math.min(bestScore, score);
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) return bestScore;
                }
            }
        }
        return bestScore;
    }
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = [-1, -1];
    let alpha = -Infinity, beta = Infinity;
    const maxDepth = 1;

    const moves = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) {
                let isNear = false;
                for (let di = -2; di <= 2; di++) {
                    for (let dj = -2; dj <= 2; dj++) {
                        const ni = i + di, nj = j + dj;
                        if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] !== EMPTY) {
                            isNear = true;
                            break;
                        }
                    }
                    if (isNear) break;
                }
                if (isNear) moves.push([i, j]);
            }
        }
    }

    if (moves.length === 0) {
        const center = Math.floor(BOARD_SIZE / 2);
        return [center, center];
    }

    for (const [i, j] of moves) {
        board[i][j] = PLAYER_O;
        const score = minimax(0, false, alpha, beta, maxDepth);
        board[i][j] = EMPTY;
        if (score > bestScore) {
            bestScore = score;
            bestMove = [i, j];
        }
        alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
}

function startGame() {
    BOARD_SIZE = parseInt(document.getElementById('boardSize').value);
    document.getElementById('startMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('endMenu').classList.add('hidden');
    initBoard();
}

function endGame(message) {
    gameOver = true;
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('endMenu').classList.remove('hidden');
    document.getElementById('endMessage').textContent = message;
}

function backToMenu() {
    document.getElementById('endMenu').classList.add('hidden');
    document.getElementById('startMenu').classList.remove('hidden');
}

startGame();
