// Frontend interactivity for Desencripta

document.addEventListener('DOMContentLoaded', () => {
    const floppyButton = document.querySelector('.floppy-disk-button');
    const codeDisplay = document.querySelector('.code-display');
    const newGameButton = document.getElementById('new-game-button');
    const bodyElement = document.body;
    const gameConsole = document.querySelector('.game-console');
    const tokenButtons = document.querySelectorAll('.token-button');
    const newRoundButton = document.getElementById('new-round-button');
    const givenCluesButton = document.getElementById('given-clues-button');
    const givenCluesTooltip = document.getElementById('given-clues-tooltip');
    const clueInputs = document.querySelectorAll('.encryptor-card .clue-input');
    const guessInputs = document.querySelectorAll('.encryptor-card .guess-box');
    const correctAnswerBoxes = document.querySelectorAll('.correct-answer-box');
    const roundCounterEl = document.getElementById('round-counter');
    const noteAreas = document.querySelectorAll('.opponent-notes-grid textarea');
    const keywordSlots = document.querySelectorAll('.keyword-slot');

    // Elements for the settings modal
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsButton = settingsModal ? settingsModal.querySelector('.modal-close-button') : null;
    const startGameButton = document.getElementById('start-game-button');
    const levelContainer = document.getElementById('level-selection-container');
    const tagContainer = document.getElementById('tag-selection-container');
    const toggleTagsButton = document.getElementById('toggle-tags-button');

    let masterWordBank = [];
    let allTags = [];

    let wordBank = [];
    let roundNumber = 1;
    let myTeamClueHistory = [];
    let isGameStarted = false;

    function randomColor() {
        const h = Math.floor(Math.random() * 360);
        const s = 60 + Math.floor(Math.random() * 40);
        const l = 50 + Math.floor(Math.random() * 10);
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    function generateRandomGradient() {
        const container = document.getElementById('gradient-container');
        if (!container) return;
        const c1 = randomColor();
        const c2 = randomColor();
        container.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
    }

    window.generateRandomGradient = generateRandomGradient;

    // Ensure guess boxes only accept numbers 1-4
    guessInputs.forEach(input => {
        input.addEventListener('input', () => {
            const num = parseInt(input.value, 10);
            if (isNaN(num) || num < 1 || num > 4) {
                input.value = '';
            }
        });
    });

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
        if (available.length < count) {
            console.error("Not enough words in the bank to pick from.");
            return new Array(count).fill("----");
        }
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

    // --- Game Settings Modal Logic ---
    function createCheckbox(id, value, label, checked = false) {
        const item = document.createElement('label');
        item.className = 'checkbox-item';
        item.htmlFor = id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.value = value;
        checkbox.checked = checked;

        item.appendChild(checkbox);
        item.appendChild(document.createTextNode(label));
        return item;
    }

    async function setupSettings() {
        if (masterWordBank.length) return;

        const response = await fetch('keywords.json');
        masterWordBank = await response.json();

        const levels = [...new Set(masterWordBank.map(item => item.level))].sort();
        allTags = [...new Set(masterWordBank.map(item => item.tag))].sort();

        levels.forEach(level => {
            const isDefault = level === 'A1';
            const checkbox = createCheckbox(`level-${level}`, level, level.toUpperCase(), isDefault);
            levelContainer.appendChild(checkbox);
        });

        allTags.forEach(tag => {
            const isDefault = tag !== 'país';
            const checkbox = createCheckbox(`tag-${tag}`, tag, tag, isDefault);
            tagContainer.appendChild(checkbox);
        });
    }

    async function startNewGame(customWordList = null) {
        if (!customWordList) {
            await loadWordBank();
        } else {
            wordBank = customWordList;
        }
        const words = pickRandomWords(4);
        displayKeywords(words);
        resetTokens();
        codeDisplay.style.display = 'none';
        floppyButton.style.display = 'block';
        clearCluesAndNotes();
        roundNumber = 1;
        myTeamClueHistory = [];
        updateRoundCounter();

        // Refresh background gradient for each new game
        if (window.generateRandomGradient) {
            window.generateRandomGradient();
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

    if (newGameButton && settingsModal) {
        newGameButton.addEventListener('click', async () => {
            if (!isGameStarted) {
                bodyElement.classList.remove('splash-active');
                gameConsole.classList.remove('hidden');
                isGameStarted = true;
                setTimeout(async () => {
                    await setupSettings();
                    settingsModal.classList.remove('hidden');
                }, 800);
            } else {
                await setupSettings();
                settingsModal.classList.remove('hidden');
            }
        });
    }

    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    if (toggleTagsButton) {
        toggleTagsButton.addEventListener('click', () => {
            const checkboxes = tagContainer.querySelectorAll('input[type="checkbox"]');
            const isSelectAll = toggleTagsButton.textContent === 'Select All';
            checkboxes.forEach(cb => cb.checked = isSelectAll);
            toggleTagsButton.textContent = isSelectAll ? 'Select None' : 'Select All';
        });
    }

    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            const selectedLevels = Array.from(levelContainer.querySelectorAll('input:checked')).map(cb => cb.value);
            const selectedTags = Array.from(tagContainer.querySelectorAll('input:checked')).map(cb => cb.value);

            const filteredWords = masterWordBank.filter(word => {
                return selectedLevels.includes(word.level) && selectedTags.includes(word.tag);
            });

            if (filteredWords.length < 4) {
                alert('Not enough words with the selected criteria. Please select more levels or tags.');
                return;
            }

            settingsModal.classList.add('hidden');
            gameConsole.classList.remove('hidden');
            startNewGame(filteredWords.map(item => item.word));
        });
    }

    if (newRoundButton) {
        newRoundButton.addEventListener('click', () => {
            const clues = Array.from(clueInputs).map(inp => inp.value.trim());
            const correctAnswers = Array.from(correctAnswerBoxes).map(inp => inp.value);

            const roundHistory = clues.map((clue, index) => ({
                clue: clue,
                correctNumber: correctAnswers[index] || '?'
            }));

            myTeamClueHistory.push({ round: roundNumber, data: roundHistory });

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
            const html = myTeamClueHistory.map(entry => {
                const cluesText = entry.data
                    .map(d => `${d.clue} (#${d.correctNumber})`)
                    .join(', ');
                return `<strong>Round ${entry.round}:</strong> ${cluesText}`;
            }).join('<br>');

            givenCluesTooltip.innerHTML = html || 'No clues given yet.';

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

    // --- Modal Logic for "How to Play" ---
    const howToPlayButton = document.getElementById('how-to-play-button');
    const modal = document.getElementById('how-to-play-modal');
    const closeModalButton = modal ? modal.querySelector('.modal-close-button') : null;

    if (howToPlayButton && modal && closeModalButton) {
        const openModal = () => {
            modal.classList.remove('hidden');
        };

        const closeModal = () => {
            modal.classList.add('hidden');
        };

        howToPlayButton.addEventListener('click', openModal);
        closeModalButton.addEventListener('click', closeModal);

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    // Initial background on page load
    if (window.generateRandomGradient) {
        window.generateRandomGradient();
    }



});
