// Frontend interactivity for Desencripta

document.addEventListener('DOMContentLoaded', () => {
    const floppyButton = document.querySelector('.floppy-disk-button');
    const codeDisplay = document.querySelector('.code-display');
    const newGameButton = document.getElementById('new-game-button');
    const tokenButtons = document.querySelectorAll('.token-button');
    const newRoundButton = document.getElementById('new-round-button');
    const givenCluesButton = document.getElementById('given-clues-button');
    const givenCluesTooltip = document.getElementById('given-clues-tooltip');
    const clueInputs = document.querySelectorAll('.encryptor-card .clue-input');
    const guessInputs = document.querySelectorAll('.encryptor-card .guess-box');
    const roundCounterEl = document.getElementById('round-counter');
    const noteAreas = document.querySelectorAll('.opponent-notes-grid textarea');
    const keywordSlots = document.querySelectorAll('.keyword-slot');

    let wordBank = [];
    let roundNumber = 1;
    let myTeamClueHistory = [];

    function updateRoundCounter() {
        if (roundCounterEl) {
            const displayNum = String(roundNumber).padStart(2, '0');
            roundCounterEl.textContent = `ROUND ${displayNum}`;
        }
    }

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
        guessInputs.forEach(input => input.value = '');
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
        myTeamClueHistory = [];
        updateRoundCounter();

        // Refresh animated background for each new game
        if (window.generateRandomBackground) {
            window.generateRandomBackground();
        }
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
        newGameButton.addEventListener('click', () => {
            startNewGame();
        });
    }

    if (newRoundButton) {
        newRoundButton.addEventListener('click', () => {
            const clues = Array.from(clueInputs).map(inp => inp.value.trim());
            myTeamClueHistory.push({ round: roundNumber, clues });

            roundNumber++;
            updateRoundCounter();
            clueInputs.forEach(input => input.value = '');
            guessInputs.forEach(input => input.value = '');
            codeDisplay.style.display = 'none';
            floppyButton.style.display = 'block';
        });
    }

    if (givenCluesButton) {
        givenCluesButton.addEventListener('click', () => {
            const html = myTeamClueHistory
                .map(entry => `Round ${entry.round}: ${entry.clues.join(', ')}`)
                .join('<br>');
            givenCluesTooltip.innerHTML = html;

            if (givenCluesTooltip.style.display === 'none' || !givenCluesTooltip.style.display) {
                givenCluesTooltip.style.display = 'block';
            } else {
                givenCluesTooltip.style.display = 'none';
            }
        });
    }

    tokenButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const display = btn.querySelector('.token-display');
            display.classList.toggle('active');
        });
    });



});
