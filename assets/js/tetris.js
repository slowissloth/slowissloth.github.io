const canvas1 = document.getElementById('tetris1');
const context1 = canvas1.getContext('2d');
const scoreElement1 = document.getElementById('score1');

const canvas2 = document.getElementById('tetris2');
const context2 = canvas2.getContext('2d');
const scoreElement2 = document.getElementById('score2');

context1.scale(25, 25);
context2.scale(25, 25);

function arenaSweep(arena, player) {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function draw(context, arena, player) {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas1.width, canvas1.height);
    drawMatrix(context, arena, {x: 0, y: 0});
    drawMatrix(context, player.matrix, player.pos);
}

function drawMatrix(context, matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop(arena, player) {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset(arena, player);
        arenaSweep(arena, player);
        updateScore(player);
    }
    player.dropCounter = 0;
}

function playerMove(arena, player, dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset(arena, player) {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore(player);
    }
}

function playerRotate(arena, player, dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    player1.dropCounter += deltaTime;
    if (player1.dropCounter > dropInterval) {
        playerDrop(arena1, player1);
    }

    player2.dropCounter += deltaTime;
    if (player2.dropCounter > dropInterval) {
        playerDrop(arena2, player2);
    }

    draw(context1, arena1, player1);
    draw(context2, arena2, player2);

    if (player1.score >= 10 || player2.score >= 10) {
        pauseGame();
        return;
    }

    requestAnimationFrame(update);
}

function updateScore(player) {
    if (player === player1) {
        scoreElement1.innerText = player.score;
    } else {
        scoreElement2.innerText = player.score;
    }
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena1 = createMatrix(12, 20);
const arena2 = createMatrix(12, 20);

const player1 = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    dropCounter: 0,
};

const player2 = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    dropCounter: 0,
};

function pauseGame() {
    cancelAnimationFrame(update);
    document.getElementById('video-container').style.display = 'flex'; // 동영상 보이기
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    player1.dropCounter += deltaTime;
    if (player1.dropCounter > dropInterval) {
        playerDrop(arena1, player1);
    }

    player2.dropCounter += deltaTime;
    if (player2.dropCounter > dropInterval) {
        playerDrop(arena2, player2);
    }

    draw(context1, arena1, player1);
    draw(context2, arena2, player2);

    if (player1.score >= 100 || player2.score >= 100) {
        pauseGame();
        return;
    }

    requestAnimationFrame(update);
}

document.getElementById('start-game').addEventListener('click', () => {
    const player1Name = document.getElementById('player1-name').value || 'Player 1';
    const player2Name = document.getElementById('player2-name').value || 'Player 2';
    
    document.getElementById('player1-title').innerText = player1Name;
    document.getElementById('player2-title').innerText = player2Name;

    document.getElementById('name-input').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';

    playerReset(arena1, player1);
    playerReset(arena2, player2);
    updateScore(player1);
    updateScore(player2);
    update();
});

document.addEventListener('keydown', event => {
    // Player 1 controls
    if (event.keyCode === 65) {  // A
        playerMove(arena1, player1, -1);
    } else if (event.keyCode === 68) {  // D
        playerMove(arena1, player1, 1);
    } else if (event.keyCode === 83) {  // S
        playerDrop(arena1, player1);
    } else if (event.keyCode === 87) {  // W
        playerRotate(arena1, player1, 1);
    }

    // Player 2 controls
    if (event.keyCode === 100) {  // 숫자패드 4 (왼쪽)
        playerMove(arena2, player2, -1);
    } else if (event.keyCode === 102) {  // 숫자패드 6 (오른쪽)
        playerMove(arena2, player2, 1);
    } else if (event.keyCode === 101) {  // 숫자패드 5 (아래쪽)
        playerDrop(arena2, player2);
    } else if (event.keyCode === 104) {  // 숫자패드 8 (위쪽)
        playerRotate(arena2, player2, 1);
    }
});

playerReset(arena1, player1);
playerReset(arena2, player2);
updateScore(player1);
update();

