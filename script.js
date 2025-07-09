// Frontend interactivity for Desencripta

document.addEventListener('DOMContentLoaded', () => {
    const floppyButton = document.querySelector('.floppy-disk-button');
    const codeDisplay = document.querySelector('.code-display');
    const newGameButton = document.getElementById('new-game-button');
    const tokenButtons = document.querySelectorAll('.token-button');
    const clearButton = document.querySelector('.encryptor-card .clear-button');
    const clueInputs = document.querySelectorAll('.encryptor-card input');
    const noteAreas = document.querySelectorAll('.opponent-notes-grid textarea');
    const keywordSlots = document.querySelectorAll('.keyword-slot');

    let wordBank = [];
    let roundNumber = 1;

    async function loadWordBank() {
        if (wordBank.length) return;
        const response = await fetch('keywords.json');
        const data = await response.json();
        wordBank = data.map(item => item.word);
    }

    function pickRandomWords(count = 4) {
        const available = [...wordBank];
        const selected = [];
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * available.length);
            selected.push(available.splice(idx, 1)[0]);
        }
        return selected;
    }

    function displayKeywords(words) {
        keywordSlots.forEach((slot, i) => {
            slot.innerHTML = `<span class="keyword-number">${i + 1}</span>${words[i] || ''}`;
        });
    }

    function resetTokens() {
        document.querySelectorAll('.token-display').forEach(td => td.classList.remove('active'));
    }

    function clearCluesAndNotes() {
        clueInputs.forEach(input => input.value = '');
        noteAreas.forEach(area => area.value = '');
    }

    async function startNewGame() {
        await loadWordBank();
        const words = pickRandomWords(4);
        displayKeywords(words);
        resetTokens();
        codeDisplay.style.display = 'none';
        floppyButton.style.display = 'block';
        clearCluesAndNotes();
        roundNumber = 1;
    }

    function generateRoundCode() {
        const digits = [1, 2, 3, 4];
        const code = [];
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * digits.length);
            code.push(digits.splice(idx, 1)[0]);
        }
        return code;
    }

    if (floppyButton) {
        floppyButton.addEventListener('click', () => {
            const code = generateRoundCode();
            codeDisplay.textContent = code.join('-');
            codeDisplay.style.display = 'block';
            floppyButton.style.display = 'none';
        });
    }

    if (newGameButton) {
        newGameButton.addEventListener('click', startNewGame);
    }

    tokenButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const display = btn.querySelector('.token-display');
            display.classList.toggle('active');
        });
    });

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clueInputs.forEach(input => input.value = '');
        });
    }

    startNewGame();
});
