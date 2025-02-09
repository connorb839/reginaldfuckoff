let tokens = localStorage.getItem("tokens") ? parseInt(localStorage.getItem("tokens")) : 100;
document.getElementById("tokens").innerText = tokens;

function updateTokens(amount) {
    tokens = Math.max(1, tokens + amount);
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

let deck, playerHand, dealerHand, hiddenCard;

function startGame() {
    let bet = parseInt(document.getElementById('bet').value);
    if (bet > tokens || bet < 1) {
        alert("Invalid bet amount, my lovely!");
        return;
    }
    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stand-btn").disabled = false;
    document.getElementById("new-game-btn").disabled = true;
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop()];
    hiddenCard = deck.pop(); // Store hidden dealer card separately
    displayCards(false);
    document.getElementById("message").innerText = "Game Started!";
}

function displayCards(revealDealer) {
    let playerDiv = document.getElementById("player-cards");
    let dealerDiv = document.getElementById("dealer-cards");
    playerDiv.innerHTML = "";
    dealerDiv.innerHTML = "";

    function createCardElement(card) {
        let cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `${card.value}${card.suit}`;
        cardElement.style.opacity = "0";
        cardElement.style.transform = "translateY(-50px)";
        setTimeout(() => {
            cardElement.style.opacity = "1";
            cardElement.style.transform = "translateY(0)";
        }, 100);
        return cardElement;
    }

    playerHand.forEach(card => {
        playerDiv.appendChild(createCardElement(card));
    });

    dealerHand.forEach(card => {
        dealerDiv.appendChild(createCardElement(card));
    });

    if (!revealDealer) {
        let hiddenCardElement = document.createElement("div");
        hiddenCardElement.classList.add("card");
        hiddenCardElement.innerHTML = "?";
        dealerDiv.appendChild(hiddenCardElement);
    } else {
        dealerDiv.appendChild(createCardElement(hiddenCard));
    }
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
    displayCards(false);
    if (calculateHand(playerHand) > 21) {
        document.getElementById("message").innerText = "You busted!";
        updateTokens(-parseInt(document.getElementById('bet').value));
        endGame();
    }
}

function stand() {
    dealerHand.push(hiddenCard); // Reveal dealer's hidden card
    displayCards(true);
    setTimeout(() => {
        while (calculateHand(dealerHand) < 17) {
            dealerHand.push(deck.pop());
            displayCards(true);
        }
        checkWinner();
    }, 1000);
}

function checkWinner() {
    let playerTotal = calculateHand(playerHand);
    let dealerTotal = calculateHand(dealerHand);
    let bet = parseInt(document.getElementById('bet').value);

    setTimeout(() => {
        if (playerTotal > 21) {
            document.getElementById("message").innerText = "You lose!";
            updateTokens(-bet);
        } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
            document.getElementById("message").innerText = "You win!";
            updateTokens(bet);
        } else if (playerTotal < dealerTotal) {
            document.getElementById("message").innerText = "You lose!";
            updateTokens(-bet);
        } else {
            document.getElementById("message").innerText = "It's a tie!";
        }
        endGame();
    }, 1000);
}

function endGame() {
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    document.getElementById("new-game-btn").disabled = false;
}
