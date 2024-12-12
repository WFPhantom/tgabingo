let inputs = [];
const letters = 'abcdefghijklmnopqrstuvwx'.split('');

fetch('input.txt')
    .then(response => response.text())
    .then(text => {
        inputs = text.trim().split('\n');
        loadBingoGrid();
    });

function shuffleArray(array, seed) {
    let random = seedRandom(seed);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function seedRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return function () {
        x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
}

function saveBingoGrid() {
    const gridState = [];
    document.querySelectorAll('.bingo-square').forEach((square, index) => {
        gridState.push({
            text: square.textContent,
            clicked: square.classList.contains('clicked')
        });
    });
    localStorage.setItem('bingoGridTGA', JSON.stringify(gridState));
    localStorage.setItem('bingoSeedTGA', document.getElementById('current-seed').textContent);
}

function loadBingoGrid() {
    const savedGrid = localStorage.getItem('bingoGridTGA');
    const savedSeed = localStorage.getItem('bingoSeedTGA');
    if (savedGrid && savedSeed) {
        document.getElementById('current-seed').textContent = savedSeed;
        const gridState = JSON.parse(savedGrid);
        const grid = document.querySelector('.bingo-grid');
        grid.innerHTML = '';

        const columns = ['B', 'I', 'N', 'G', 'O'];
        columns.forEach(column => {
            const columnDiv = document.createElement('div');
            columnDiv.classList.add('bingo-column');
            columnDiv.textContent = column;
            grid.appendChild(columnDiv);
        });

        gridState.forEach((squareState, index) => {
            const square = document.createElement('div');
            square.classList.add('bingo-square');
            if (index === 12) {
                const img = document.createElement('img');
                img.src = 'tgalogo.svg';
                img.alt = 'tgalogo';
                square.appendChild(img);
                square.style.cursor = 'default';
                square.innerHTML += '<span class="free-text">WORLD PREMIERE</span>';
            } else {
                square.textContent = squareState.text;
                if (squareState.clicked) {
                    square.classList.add('clicked');
                }
                square.addEventListener('click', () => {
                    square.classList.toggle('clicked');
                    updateSeed(square, index);
                    saveBingoGrid();
                });
            }
            grid.appendChild(square);
            adjustFontSize(square);
        });
    } else {
        generateBingoGrid();
    }
}

function generateBingoGrid() {
    let seedInput = document.getElementById('seed-input').value;
    let preselectedLetters = '';
    if (seedInput.includes('.')) {
        [seedInput, preselectedLetters] = seedInput.split('.');
    }
    if (!seedInput) {
        seedInput = Math.random().toString();
    } else if (!seedInput.startsWith('0.')) {
        seedInput = '0.' + seedInput;
    }
    document.getElementById('current-seed').textContent = `Seed: ${seedInput.substring(2)}.${preselectedLetters}`;
    const grid = document.querySelector('.bingo-grid');
    grid.innerHTML = '';

    const columns = ['B', 'I', 'N', 'G', 'O'];
    columns.forEach(column => {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('bingo-column');
        columnDiv.textContent = column;
        grid.appendChild(columnDiv);
    });

    const shuffledInputs = shuffleArray(inputs.slice(), seedInput).slice(0, 24);
    let squareIndex = 0;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const square = document.createElement('div');
            square.classList.add('bingo-square');
            if (row === 2 && col === 2) {
                const img = document.createElement('img');
                img.src = 'tgalogo.svg';
                img.alt = 'tgalogo';
                square.appendChild(img);
                square.style.cursor = 'default';
                square.innerHTML += '<span class="free-text">WORLD PREMIERE</span>';
            } else {
                square.textContent = shuffledInputs[squareIndex];
                if (squareIndex < letters.length && preselectedLetters.includes(letters[squareIndex])) {
                    square.classList.add('clicked');
                }
                (function (index) {
                    square.addEventListener('click', () => {
                        square.classList.toggle('clicked');
                        updateSeed(square, index >= 12 ? index + 1 : index);
                        saveBingoGrid();
                    });
                })(squareIndex);
                squareIndex++;
            }
            grid.appendChild(square);
            adjustFontSize(square);
        }
    }
    saveBingoGrid();
}

function updateSeed(square, index) {
    const currentSeedElement = document.getElementById('current-seed');
    let currentSeedText = currentSeedElement.textContent.replace('Seed: ', '');
    let [seed, preselectedLetters] = currentSeedText.split('.');
    preselectedLetters = preselectedLetters || '';
    const letterIndex = index >= 12 ? index - 1 : index;
    const letter = letters[letterIndex];
    if (square.classList.contains('clicked')) {
        if (!preselectedLetters.includes(letter)) {
            preselectedLetters += letter;
        }
    } else {
        preselectedLetters = preselectedLetters.replace(letter, '');
    }
    currentSeedElement.textContent = `Seed: ${seed}.${preselectedLetters}`;
}

function adjustFontSize(element) {
    const maxFontSize = 16;
    const minFontSize = 8;
    let fontSize = maxFontSize;
    element.style.fontSize = fontSize + 'px';
    while (element.scrollHeight > element.clientHeight && fontSize > minFontSize) {
        fontSize--;
        element.style.fontSize = fontSize + 'px';
    }
}

document.querySelector('.generate-button').addEventListener('click', generateBingoGrid);