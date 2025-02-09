let deck, playerHand, dealerHand, tokens;

document.addEventListener("DOMContentLoaded", () => {
    tokens = localStorage.getItem("tokens") ? parseInt(localStorage.getItem("tokens")) : 100;
    document.getElementById("tokens").innerText = tokens;
});

function updateTokens(amount) {
    tokens = Math.max(0, tokens + amount);
    localStorage.setItem("tokens", tokens);
    document.getElementById("tokens").innerText = tokens;
}

function createDeck() {
    let suits = ['♠', '♥', '♦', '♣'];
    let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}

function startGame() {
    let bet = parseInt(document.getElementById('bet').value);
    if (bet > tokens || bet < 1) {
        alert("Invalid bet amount!");
        return;
    }
    
    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stand-btn").disabled = false;
    document.getElementById("new-game-btn").disabled = true;
    
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    
    displayCards();
    document.getElementById("message").innerText = "Game Started!";
}

function displayCards() {
    let playerDiv = document.getElementById("player-cards");
    let dealerDiv = document.getElementById("dealer-cards");
    playerDiv.innerHTML = "";
    dealerDiv.innerHTML = "";
    
    playerHand.forEach((card, index) => {
        setTimeout(() => {
            let cardElement = createCardElement(card);
            playerDiv.appendChild(cardElement);
            animateCard(cardElement);
        }, index * 500);
    });
    
    dealerHand.forEach((card, index) => {
        setTimeout(() => {
            let cardElement = createCardElement(card);
            dealerDiv.appendChild(cardElement);
            animateCard(cardElement);
        }, (index + 1) * 500);
    });
}

function createCardElement(card) {
    let cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.innerHTML = `${card.value}${card.suit}`;
    return cardElement;
}

function animateCard(cardElement) {
    setTimeout(() => {
        cardElement.classList.add("show");
    }, 100);
}

function calculateHand(hand) {
    let values = hand.map(card => card.value);
    let sum = 0;
    let aces = 0;

    for (let value of values) {
        if (value === 'A') {
            aces += 1;
            sum += 11;
        } else if (['K', 'Q', 'J'].includes(value)) {
            sum += 10;
        } else {
            sum += parseInt(value);
        }
    }

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces -= 1;
    }

    return sum;
}

function hit() {
    playerHand.push(deck.pop());
    displayCards();
    
    let playerTotal = calculateHand(playerHand);
    if (playerTotal > 21) {
        document.getElementById("message").innerText = "You busted! Dealer wins.";
        updateTokens(-parseInt(document.getElementById('bet').value));
        endGame();
    }
}

function stand() {
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    
    while (calculateHand(dealerHand) < 17) {
        dealerHand.push(deck.pop());
        displayCards();
    }
    
    checkWinner();
}

function checkWinner() {
    let playerTotal = calculateHand(playerHand);
    let dealerTotal = calculateHand(dealerHand);
    let bet = parseInt(document.getElementById('bet').value);
    
    if (dealerTotal > 21 || playerTotal > dealerTotal) {
        document.getElementById("message").innerText = "You win!";
        updateTokens(bet);
    } else if (playerTotal < dealerTotal) {
        document.getElementById("message").innerText = "Dealer wins!";
        updateTokens(-bet);
    } else {
        document.getElementById("message").innerText = "It's a tie!";
    }
    
    endGame();
}

function endGame() {
    document.getElementById("new-game-btn").disabled = false;
}
