'use strict';

let cards = document.querySelectorAll('.card');
let openedCards = [];
let correctedMoves = 0;
let moves = 0;
let startTime;
let timer;
let deck = document.getElementById('deck');

const TWO_STAR_THRESHOLD = 24;
const ONE_STAR_THRESHOLD = 30;

// Initialize
function startGame() {
    openedCards.length = 0;
    correctedMoves = 0;

    moves = 0;
    document.querySelector('.moves').textContent = '0';

    displayScoreStars();

    startTime = null;
    clearInterval(timer);
    timer = null;
    document.querySelector('.timer').textContent = '00:00:00';

    document.querySelector('.modal-wrapper').style.display = 'none';
    document.documentElement.style.overflow = 'auto';

    // recreate deck
    cards.forEach(card => {
        card.classList.remove("open");
        card.classList.remove("show");
        card.classList.remove("match");
    });

    let nodesArray = Array.prototype.slice.call(cards);
    shuffle(nodesArray);

    const fragment = document.createDocumentFragment();

    nodesArray.forEach(node => {
        fragment.appendChild(node);
    });

    deck.innerHTML = '';
    deck.appendChild(fragment);
}

// Flip 1 card
function toggleCard(card) {
    card.classList.toggle('show');
    card.classList.toggle('open');
}

// Add card to openedCard array
function addOpenedCard(card) {
    openedCards.push(card);
}

// Second card matched first card?
function isMatchedCard() {
    let isMatched = false;
    if (openedCards[0].firstElementChild.classList.item(1) === openedCards[1].firstElementChild.classList.item(1)) {
        isMatched = true;
    }
    return isMatched;
}

// Lock both cards when guessing correctly
function lockCards() {
    for (let i = 0; i < openedCards.length; i++) {
        openedCards[i].classList.add('match');
        openedCards[i].classList.remove('show', 'open');
    }

    correctedMoves++;

    openedCards.length = 0;
}

// Flip both cards when guessing wrong
function flipCards() {
    for (let i = 0; i < openedCards.length; i++) {
        toggleCard(openedCards[i]);

        // add animation
        openedCards[i].classList.add('wrong');
        setTimeout(function () {
            let wrong = document.getElementsByClassName('wrong');
            while (wrong.length) {
                wrong[0].classList.remove('wrong');
            }
            openedCards.length = 0;
        }, 500);
    }
}

// Winning state
function endGame() {
    clearInterval(timer);
    timer = null;

    document.querySelector('.modal-moves').textContent = moves;
    displayModalStars();
    displayTime(false);

    document.querySelector('.modal-wrapper').style.display = 'inline';
    document.documentElement.style.overflow = 'hidden';
}

// Main function
function cardClicked(evt) {
    if (openedCards.length >= 2 || evt.target.nodeName !== 'LI' || evt.target.classList.contains('open') || evt.target.classList.contains('match')) {
        return;
    }

    if (moves === 0) {
        startTime = Date.now();
        timer = setInterval(function () {
            displayTime(true);
        }, 1000);
    }

    toggleCard(evt.target);

    addOpenedCard(evt.target);

    if (openedCards.length >= 2) {
        if (isMatchedCard()) {
            lockCards();
        } else {
            flipCards();
        }
    }

    addDisplayMoves();
    displayScoreStars();

    if (correctedMoves >= 8) {
        setTimeout(function () {
            endGame();
        }, 500);
    }
}

// Helper functions

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}

function addDisplayMoves() {
    moves++;
    document.querySelector('.moves').textContent = moves;
}

function displayScoreStars() {
    const stars = document.querySelector('.stars').querySelectorAll('.fa');

    // remove second star and third star (via fall thru)
    if (moves >= ONE_STAR_THRESHOLD && !stars[1].classList.contains('fa-star-o')) {
        stars[1].classList.remove('fa-star');
        stars[1].classList.add('fa-star-o');
    }
    // remove third star
    if (moves >= TWO_STAR_THRESHOLD && !stars[2].classList.contains('fa-star-o')) {
        stars[2].classList.remove('fa-star');
        stars[2].classList.add('fa-star-o');
    }
    if (moves === 0) {
        for (let i = 0; i < 3; i++) {
            stars[i].classList.remove('fa-star-o');
            stars[i].classList.add('fa-star');
        }
    }
}

function displayModalStars() {
    let result = '3 Stars';
    if (moves >= ONE_STAR_THRESHOLD) {
        result = '1 Star';
    } else if (moves >= TWO_STAR_THRESHOLD) {
        result = '2 Stars';
    }
    document.querySelector('.modal-stars').textContent = result;
}

function displayTime(isScorePanel) {
    const time = ~~((Date.now() - startTime) / 1000);
    const hr = ~~(time / 3600);
    const min = ~~((time % 3600) / 60);
    const sec = time % 60;

    let result = '';

    if (isScorePanel) {
        result = (hr < 10 ? '0' + hr : hr) + ':' + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
        document.querySelector('.timer').textContent = result;
    } else {
        result = (hr > 0 ? hr + ' hours ' : '') + (min > 0 ? min + ' mins ' : '') + sec + ' seconds';
        document.querySelector('.modal-time').textContent = result;
    }
}
// End helper functions

startGame();
deck.addEventListener('click', cardClicked);
document.querySelector('.restart').addEventListener('click', startGame);
document.querySelector('.modal-restart').addEventListener('click', startGame);
