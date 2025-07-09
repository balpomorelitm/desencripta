// Frontend interactivity for Desencripta

document.addEventListener('DOMContentLoaded', () => {
    const floppyButton = document.querySelector('.floppy-disk-button');
    const codeDisplay = document.querySelector('.code-display');
    const newRoundButton = document.querySelector('.new-round-button');
    const tokenButtons = document.querySelectorAll('.token-button');
    const clearButton = document.querySelector('.encryptor-card .clear-button');
    const clueInputs = document.querySelectorAll('.encryptor-card input');

    if (floppyButton) {
        floppyButton.addEventListener('click', () => {
            const code = game.generate_round_code();
            codeDisplay.textContent = Array.isArray(code) ? code.join('-') : code;
            codeDisplay.style.display = 'block';
            floppyButton.style.display = 'none';
        });
    }

    if (newRoundButton) {
        newRoundButton.addEventListener('click', () => {
            codeDisplay.style.display = 'none';
            floppyButton.style.display = 'block';
        });
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
});
