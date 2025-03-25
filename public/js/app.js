// Card configuration
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

// Move this to the top of the file
const { ipcRenderer } = require('electron');

// DOM elements
const cardContainer = document.querySelector('.card-container');
const cardFront = document.querySelector('.card-face.front img');
const cardBack = document.querySelector('.card-face.back img');
const nextButton = document.querySelector('.control-button.next');
const previousButton = document.querySelector('.control-button.previous');
const playButton = document.querySelector('.control-button.play');
const controlButtons = document.querySelectorAll('.control-button img');
const textContent = document.querySelector('.text-content');
const sliderProgress = document.querySelector('.slider-progress');
const sliderHandle = document.querySelector('.slider-handle');
const sliderBar = document.querySelector('.slider-bar');
const minimizeIcon = document.querySelector('.minimize-icon');
const backFace = document.querySelector('.card-face.back');
const backCardImage = document.querySelector('.card-face.back img');
const minimizeButton = document.querySelector('.window-button.minimize');
const closeButton = document.querySelector('.window-button.close');

let cardDeck = [];
let currentCardIndex = 0;
let cardHistory = [];
let lastDirection = null;

// State variables
let isCardFlipped = false;
let isAnimating = false;
let currentCard = { suit: 'diamonds', number: '2' };

function createAndShuffleDeck() {
    cardDeck = [];
    suits.forEach(suit => {
        numbers.forEach(number => {
            cardDeck.push({ suit, number });
        });
    });
    
    // Fisher-Yates shuffle
    for (let i = cardDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
    }
}

function updateColors(suit) {
    const isRed = suit === 'hearts' || suit === 'diamonds';
    const color = isRed ? '#ff0000' : '#000000';
    
    textContent.style.color = color;
    sliderBar.style.backgroundColor = `${color}33`;
    sliderProgress.style.backgroundColor = color;
    sliderHandle.style.backgroundColor = color;
    
    controlButtons.forEach(button => {
        if (isRed) {
            button.style.filter = 'brightness(0) saturate(100%) invert(12%) sepia(100%) saturate(5699%) hue-rotate(0deg) brightness(100%) contrast(118%)';
        } else {
            button.style.filter = 'brightness(0)';
        }
    });

    minimizeIcon.style.backgroundColor = color;
    
    const closeIconBefore = document.createElement('style');
    closeIconBefore.textContent = `
        .close-icon::before,
        .close-icon::after {
            background-color: ${color} !important;
        }
    `;
    document.head.appendChild(closeIconBefore);
}


function updateCard(newCard) {
    currentCard = newCard;
    const cardPath = `svgs/cards/${newCard.suit}_${newCard.number}.svg`;
    cardFront.src = cardPath;
    updateColors(newCard.suit);
}


function getNextCard() {
    if (lastDirection === 'prev') {
        // If we're coming from a previous action, move forward one step
        currentCardIndex++;
        lastDirection = 'next';
    }
    
    if (currentCardIndex >= cardDeck.length) {
        currentCardIndex = 0; // Reset to beginning of deck
    }
    
    const card = cardDeck[currentCardIndex];
    if (lastDirection !== 'prev') {
        currentCardIndex++;
        cardHistory.push(currentCardIndex - 1);
    }
    
    return card;
}
function getPreviousCard() {
    if (cardHistory.length > 1) {
        lastDirection = 'prev';
        cardHistory.pop(); // Remove current index
        currentCardIndex = cardHistory[cardHistory.length - 1]; // Get previous index
        return cardDeck[currentCardIndex];
    }
    return cardDeck[0]; // Return first card if no previous cards
}

function flipCard() {
    if (isAnimating) return;
    isAnimating = true;
    
    cardContainer.classList.toggle('flipped');
    isCardFlipped = !isCardFlipped;
    
    setTimeout(() => {
        isAnimating = false;
    }, 600);
}

// Event Listeners
nextButton.addEventListener('click', () => {
    if (isAnimating || isCardFlipped) return;
    isAnimating = true;
    
    const frontFace = document.querySelector('.card-face.front');
    const whiteFrame = document.querySelector('.white-frame');
    
    frontFace.classList.add('next-animation');
    whiteFrame.classList.add('next-animation');
    
    setTimeout(() => {
        const newCard = getNextCard();
        updateCard(newCard);
    }, 300);
    
    setTimeout(() => {
        frontFace.classList.remove('next-animation');
        whiteFrame.classList.remove('next-animation');
        isAnimating = false;
    }, 600);
});

previousButton.addEventListener('click', () => {
    if (isAnimating || isCardFlipped) return;
    isAnimating = true;
    
    const frontFace = document.querySelector('.card-face.front');
    const whiteFrame = document.querySelector('.white-frame');
    
    frontFace.classList.add('prev-animation');
    whiteFrame.classList.add('prev-animation');
    
    setTimeout(() => {
        const previousCard = getPreviousCard();
        updateCard(previousCard);
    }, 300);
    
    setTimeout(() => {
        frontFace.classList.remove('prev-animation');
        whiteFrame.classList.remove('prev-animation');
        isAnimating = false;
    }, 600);
});

playButton.addEventListener('click', flipCard);

backFace.addEventListener('click', () => {
    if (!isCardFlipped || isAnimating) return;
    flipCard();
});

// Window control button event listeners
if (minimizeButton) {
    minimizeButton.addEventListener('click', () => {
        console.log('Minimize button clicked');
        ipcRenderer.send('minimize');
    });
} else {
    console.error('Minimize button not found in DOM');
}

if (closeButton) {
    closeButton.addEventListener('click', () => {
        console.log('Close button clicked');
        ipcRenderer.send('close');
    });
} else {
    console.error('Close button not found in DOM');
}

// Initialize
createAndShuffleDeck();
const initialCard = getNextCard();
updateCard(initialCard);
