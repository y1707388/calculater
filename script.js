const resultInput = document.getElementById('result');
const buttons = document.querySelector('.buttons');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const clearHistoryBtn = document.getElementById('clear-history');
let currentInput = '';
let history = [];

// --- Helper Function ---
function isBinaryOperator(char) {
    // Include both display characters and standard keyboard characters for operators
    return ['+', '−', '×', '÷', '%', '^', '-', '*', '/'].includes(char);
}

// --- Event Listeners ---
buttons.addEventListener('click', (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const value = target.dataset.value;

    if (action) {
        handleAction(action);
    } else if (value) {
        appendValue(value);
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

clearHistoryBtn.addEventListener('click', () => {
    history = [];
    updateHistory();
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    console.log('Keydown event.key:', key); // Debugging: See what key is pressed

    // Handle specific control keys first
    if (key === 'Enter') {
        calculateResult();
        event.preventDefault(); // Prevent default browser action
    } else if (key === 'Backspace') {
        deleteLast();
        event.preventDefault(); // Prevent default browser action
    } else if (key === 'Escape') {
        clearDisplay();
        event.preventDefault(); // Prevent default browser action
    }
    // Handle number and decimal point input
    else if (/[0-9.]/.test(key)) {
        appendValue(key);
        event.preventDefault(); // Prevent default browser action
    }
    // Handle operator input
    else if (/[+\-*/^()]/.test(key)) {
        let mappedKey = key;
        if (key === '*') mappedKey = '×';
        if (key === '/') mappedKey = '÷';
        if (key === '-') mappedKey = '−';
        appendValue(mappedKey);
        event.preventDefault(); // Prevent default browser action
    }
    // IMPORTANT: Catch-all for any other key to prevent default browser behavior
    // This should stop F-keys, Alt, Ctrl, Shift, etc., from affecting the display.
    else {
        event.preventDefault();
    }
});

// --- Core Functions ---
function handleAction(action) {
    switch (action) {
        case 'clear':
            clearDisplay();
            break;
        case 'delete':
            deleteLast();
            break;
        case 'calculate':
            calculateResult();
            break;
    }
}

function appendValue(value) {
    const lastChar = currentInput.slice(-1);

    // Handle operator input
    if (isBinaryOperator(value)) {
        // If current input is empty, don't allow operator at the start
        if (currentInput === '') {
            return;
        }
        // If the last character is already an operator
        if (isBinaryOperator(lastChar)) {
            // Replace the last operator with the new one
            currentInput = currentInput.slice(0, -1) + value;
        } else {
            // Append the operator if the last char is a number
            currentInput += value;
        }
    } else if (value === '.') {
        // Prevent multiple decimal points in the current number
        const lastNumberMatch = currentInput.match(/(\d+\.?\d*)$/);
        if (lastNumberMatch && lastNumberMatch[0].includes('.')) {
            return; // Already has a decimal point
        }
        currentInput += value;
    } else if (/[0-9]/.test(value)) { // Only append if it's a number
        currentInput += value;
    }
    // Any other 'value' (like F10) will now be ignored by this function
    // because the keydown listener will prevent its default action and not call appendValue.
    updateDisplay();
}

function clearDisplay() {
    currentInput = '';
    updateDisplay();
}

function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function calculateResult() {
    try {
        if (currentInput === '') return;
        let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\^/g, '**');
        const result = new Function('return ' + expression)();
        addToHistory(currentInput + ' = ' + result);
        currentInput = result.toString();
    } catch (error) {
        currentInput = 'Error';
    } finally {
        updateDisplay();
    }
}

// --- UI Update Functions ---
function updateDisplay() {
    resultInput.value = currentInput;
    adjustFontSize();
    // Scroll to the end of the input to show the latest text
    resultInput.scrollLeft = resultInput.scrollWidth;
}

function adjustFontSize() {
    const inputLength = currentInput.length;
    if (inputLength > 16) {
        resultInput.style.fontSize = '24px';
    } else if (inputLength > 11) {
        resultInput.style.fontSize = '32px';
    } else if (inputLength > 8) {
        resultInput.style.fontSize = '40px';
    } else {
        resultInput.style.fontSize = '48px'; // Default size
    }
}

function addToHistory(entry) {
    history.push(entry);
    updateHistory();
}

function updateHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<li>No history yet.</li>';
        return;
    }
    history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        historyList.appendChild(li);
    });
}

// Initial call to set history message
updateHistory();