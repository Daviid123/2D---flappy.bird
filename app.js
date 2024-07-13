let move_speed = 5, gravity = 0.5; // Nastavení rychlosti pohybu a gravitace
let bird = document.querySelector('.bird'); // Výběr prvku ptáčka
let img = document.getElementById('bird-1'); // Výběr obrázku ptáčka
let bird_props = bird.getBoundingClientRect(); // Získání pozice a velikosti ptáčka
let background = document.querySelector('.background').getBoundingClientRect(); // Získání pozice a velikosti pozadí
let score_val = document.querySelector('.score_val'); // Výběr prvku pro hodnotu skóre
let message = document.querySelector('.message'); // Výběr prvku pro zprávy
let score_title = document.querySelector('.score_title'); // Výběr prvku pro název skóre
let startTime;
let timerInterval;
let lastChickenTime = 0;
const minChickenInterval = 5000;

function updateTimer() {
    // Získání aktuálního času v milisekundách
    const currentTime = new Date().getTime();

    // Výpočet uplynulého času od startTime do currentTime
    const elapsedTime = new Date(currentTime - startTime);

    // Získání minut a sekund z uplynulého času a jejich formátování
    const minutes = elapsedTime.getMinutes().toString().padStart(2, '0');
    const seconds = elapsedTime.getSeconds().toString().padStart(2, '0');

    // Aktualizace textu časovače na stránce s minutami a sekundami
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function endGame() {
game_state = 'End';
clearInterval(timerInterval);  // Zastaví časovač

// Zobrazí konečnou zprávu
message.innerHTML = 'Hra skončila<br>Stiskni Enter pro restart';
message.style.left = '28vw';

// Zobrazí tabulku skóre
showScoreBoard();

// Zastaví pohyb překážek a srdíček
document.querySelectorAll('.pipe_sprite, .heart_sprite').forEach(element => {
    element.style.animation = 'none';
    element.style.left = element.getBoundingClientRect().left + 'px';
});

// Zastaví ptáčka
bird.style.animation = 'none';

// Uloží nejlepší skóre, pokud je současné skóre vyšší
const currentScore = parseInt(score_val.innerHTML);
if (currentScore > bestScore) {
    bestScore = currentScore;
    document.getElementById('best-score').innerText = bestScore;
}

// Zobrazí celkový čas hry
const timerElement = document.getElementById('timer');
const finalTime = timerElement.textContent;
console.log('Celkový čas hry:', finalTime);
}

function getLives() {
    // Funkce, která vrací počet viditelných životů (srdíček)
    return document.querySelectorAll('.heart').length;
}

let game_state = 'Start'; // Počáteční stav hry
let isInvincible = false; // Zda je ptáček nezranitelný
let bird_dy = 0; // Vertikální rychlost ptáčka
let isPaused = false; // Stav pozastavení hry

document.addEventListener('keydown', (e) => {
    // Funkce, která se spustí při stisknutí klávesy
    if (e.key === 'Enter' && game_state !== 'Play' && !isPaused) {
        // Pokud je stisknut Enter a hra není v režimu "Play" a není pozastavena

        document.querySelectorAll('.pipe_sprite').forEach((e) => {
            // Odstraní všechny prvky s třídou 'pipe_sprite'
            e.remove();

            hideScoreBoard(); // Skryje tabulku skóre
            
            document.querySelectorAll('.heart').forEach(heart => {
                heart.style.display = 'inline'; // Zobrazí všechny životy
            });
        });
        img.style.display = 'block'; // Zobrazí obrázek ptáčka
        bird.style.top = '40vh'; // Nastaví pozici ptáčka na 40vh
        game_state = 'Play'; // Změní stav hry na "Play"
        message.innerHTML = ''; // Vymaže zprávu
        score_title.innerHTML = 'Skóre : '; // Nastaví název skóre
        score_val.innerHTML = '0'; // Nastaví hodnotu skóre na 0
        
        document.querySelectorAll('.heart').forEach(heart => {
            heart.style.display = 'inline'; // Zobrazí všechny životy
        });

        play(); // Spustí hru
    }
    if (e.key === 'Escape' && game_state === 'Play') {
        // Pokud je stisknut Escape a hra je v režimu "Play"
        togglePause(); // Přepne stav hry mezi "Pozastaveno" a "Play"
    }
});

function play() {
    // Funkce, která řídí hlavní smyčku hry
    createPipe();
    createChicken();
    move();
    if (heart_separation >= Math.floor(Math.random() * (max_heart_separation - min_heart_separation + 1)) + min_heart_separation) {
        heart_separation = 0;
        createChicken();
    }
    
    startTime =  new Date().getTime();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    function move() {
        if (game_state !== 'Play' || isPaused) return;
    
        let pipe_sprites = document.querySelectorAll('.pipe_sprite');
        let chicken_sprites = document.querySelectorAll('.chicken_sprite');
    
        pipe_sprites.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();
    
            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                if (
                    !isInvincible &&
                    bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                    bird_props.left + bird_props.width > pipe_sprite_props.left &&
                    bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                    bird_props.top + bird_props.height > pipe_sprite_props.top
                ) {
                    handleCollision();
                } else {
                    if (
                        pipe_sprite_props.right < bird_props.left &&
                        pipe_sprite_props.right + move_speed >= bird_props.left &&
                        element.increase_score === '1'
                    ) {
                        score_val.innerHTML = +score_val.innerHTML + 1;
                        element.increase_score = '0';
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
    
        chicken_sprites.forEach((element) => {
            let chicken_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();
        
            if (chicken_sprite_props.right <= 0) {
                element.remove();
            } else if (
                bird_props.left < chicken_sprite_props.left + chicken_sprite_props.width &&
                bird_props.left + bird_props.width > chicken_sprite_props.left &&
                bird_props.top < chicken_sprite_props.top + chicken_sprite_props.height &&
                bird_props.top + bird_props.height > chicken_sprite_props.top
            ) {
                element.remove();
                addLife();
            } else {
                element.style.left = chicken_sprite_props.left - move_speed + 'px';
            }
        });
    
        requestAnimationFrame(move);
    }
    let bird_dy = 0;
    function applyGravity() {
        // Funkce, která aplikuje gravitaci na ptáčka
        if (game_state !== 'Play' || isPaused) return;
        bird_dy += gravity;
        
        if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
            endGame();
            game_state = 'End'; // Změní stav hry na "End", pokud ptáček narazí do horní nebo dolní části obrazovky
            message.innerHTML = 'Stiskni Enter pro restart'; // Zobrazí zprávu o restartu hry
            message.style.left = '28vw';
            return;
        }
        bird.style.top = bird_props.top + bird_dy + 'px'; // Aplikuje gravitaci na ptáčka
        bird_props = bird.getBoundingClientRect(); // Aktualizuje pozici a velikost ptáčka
        requestAnimationFrame(applyGravity); // Pokračování animace
    }
    requestAnimationFrame(applyGravity);

    createPipe(); // Vytvoření překážky

    function handleJump(e) {
        // Funkce, která zpracovává skok ptáčka
        if (e.key === 'ArrowUp' || e.key === ' ') {
            bird_dy = -7.6;
        }
    }

    document.addEventListener('keydown', handleJump); // Přidá událost pro skok

    createPipe(); // Vytvoření překážky
}
let pipe_separation = 0;
let pipe_gap = 40;
const min_pipe_separation = 200; // Minimální mezera mezi překážkami
const max_pipe_separation = 300; // Maximální mezera mezi překážkami

function createPipe() {
    if (game_state !== 'Play' || isPaused) return;

    if (pipe_separation > 115) {
        pipe_separation = 0;

        let pipe_posi = Math.floor(Math.random() * 43) + 8;
        
        let pipe_sprite_inv = document.createElement('div');
        pipe_sprite_inv.className = 'pipe_sprite';
        pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
        pipe_sprite_inv.style.left = '100vw';
        document.body.appendChild(pipe_sprite_inv);

        let pipe_sprite = document.createElement('div');
        pipe_sprite.className = 'pipe_sprite';
        pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
        pipe_sprite.style.left = '100vw';
        pipe_sprite.increase_score = '1';
        document.body.appendChild(pipe_sprite);

        console.log('Pipes created');

        // Zde voláme createChicken s určitou pravděpodobností
        if (Math.random() < 0.15 && Date.now() - lastChickenTime > minChickenInterval) { // 15% šance na vytvoření kuřete
            setTimeout(() => {
                createChicken();
                lastChickenTime = Date.now();
            }, 500);
        }
    }
    pipe_separation++;
    requestAnimationFrame(createPipe);
}

function handleCollision() {
    const hearts = document.querySelectorAll('.heart');
    const visibleHearts = Array.from(hearts).filter(heart => heart.style.display !== 'none');
    
    if (visibleHearts.length > 0) {
        // Přidáme třídu pro blikání všem viditelným srdíčkům
        visibleHearts.forEach(heart => {
            heart.classList.add('heart-blink');
        });

        // Odebere poslední srdíčko po animaci
        setTimeout(() => {
            visibleHearts[visibleHearts.length - 1].style.display = 'none';
            
            // Odebere třídu pro blikání
            visibleHearts.forEach(heart => {
                heart.classList.remove('heart-blink');
            });

            if (visibleHearts.length <= 1) { // Poslední srdíčko bylo právě odebráno
                endGame();
            }
        }, 1000); // 1000ms odpovídá délce animace
    } else {
        endGame();
        return;
    }

    isInvincible = true;

    let pipes = document.querySelectorAll('.pipe_sprite');
    if (pipes.length >= 2) {
        let topPipe = pipes[0];
        let bottomPipe = pipes[1];
        
        // Vypočítáme střed mezi překážkami
        let topPipeBottom = topPipe.getBoundingClientRect().bottom;
        let bottomPipeTop = bottomPipe.getBoundingClientRect().top;
        let middleY = (topPipeBottom + bottomPipeTop) / 2;
        
        // Umístíme ptáčka do středu
        bird.style.top = middleY - bird.offsetHeight / 2 + 'px';
    } else {
        // Pokud nejsou viditelné překážky, umístíme ptáčka doprostřed obrazovky
        bird.style.top = '40vh';
    }
    
    bird_dy = 0; // Zastavíme vertikální pohyb ptáčka

    setTimeout(() => {
        isInvincible = false;
    }, 1500); // Prodloužíme dobu nezranitelnosti, aby pokryla celou animaci a ještě chvíli navíc
}

function updateLives() {
    // Funkce, která aktualizuje životy ptáčka
    const hearts = document.querySelectorAll('.heart');
    const currentLives = getLives();
    if (currentLives > 0) {
        hearts[currentLives - 1].style.display = 'none';
    }
}

function addLife() {
    const hearts = document.querySelectorAll('.heart');
    for (let i = 0; i < hearts.length; i++) {
        if (hearts[i].style.display === 'none') {
            hearts[i].style.display = 'inline';
            break;
        }
    }
}

let bestScore = 0;

function updateScoreBoard() {
    // Funkce, která aktualizuje tabulku skóre
    const currentScore = parseInt(score_val.innerHTML);
    if (currentScore > bestScore) {
        bestScore = currentScore;
    }

    document.getElementById('current-score').innerText = currentScore;
    document.getElementById('best-score').innerText = bestScore;
}

function showScoreBoard() {
    // Funkce, která zobrazí tabulku skóre
    updateScoreBoard();
    document.getElementById('score-board').style.display = 'block';
}

function hideScoreBoard() {
    // Funkce, která skryje tabulku skóre
    document.getElementById('score-board').style.display = 'none';
}

function togglePause() {
    // Funkce, která přepíná stav hry mezi "Pozastaveno" a "Play"
    isPaused = !isPaused;
    if (isPaused) {
        message.innerHTML = 'Hra pozastavena<br>Stiskni Escape pro pokračování'; // Zobrazí zprávu o pozastavení
        message.style.left = '28vw';
    } else {
        message.innerHTML = ''; // Vymaže zprávu
    }
}

document.addEventListener('keydown', (e) => {
    // Funkce, která zpracovává restart hry při stisknutí Enteru
    if (e.key === 'Enter' && game_state === 'End') {
        console.log('Restarting game...');
        hideScoreBoard(); // Skryje tabulku skóre při restartu hry
    }

    // Funkce, která zpracovává opětovné spuštění hry při stisknutí Enteru, pokud je hra pozastavena
    if (e.key === 'Enter' && game_state !== 'Play' && isPaused) {
        document.querySelectorAll('.pipe_sprite').forEach((e) => {
            e.remove();

            hideScoreBoard(); // Skryje tabulku skóre
            
            document.querySelectorAll('.heart').forEach(heart => {
                heart.style.display = 'inline'; // Zobrazí všechny životy
            });
        });
        img.style.display = 'block'; // Zobrazí obrázek ptáčka
        bird.style.top = '40vh'; // Nastaví pozici ptáčka na 40vh
        game_state = 'Play'; // Změní stav hry na "Play"
        message.innerHTML = ''; // Vymaže zprávu
        score_title.innerHTML = 'Skóre : '; // Nastaví název skóre
        score_val.innerHTML = '0'; // Nastaví hodnotu skóre na 0
        
        document.querySelectorAll('.heart').forEach(heart => {
            heart.style.display = 'inline'; // Zobrazí všechny životy
        });

        play(); // Spustí hru
    }

    // Funkce, která zpracovává pozastavení hry při stisknutí Escape
    if (e.key === 'Escape') {
        togglePause(); // Přepne stav hry mezi "Pozastaveno" a "Play"
    }
});

let heart_separation = 0;
const min_heart_separation = 5; // Minimální počet překážek mezi srdíčky
const max_heart_separation = 10; // Maximální počet překážek mezi srdíčky

function createChicken() {
    console.log('Attempting to create chicken');
    if (game_state !== 'Play' || isPaused) {
        console.log('Game not in play state or paused, chicken not created');
        return;
    }

    let pipe_sprites = document.querySelectorAll('.pipe_sprite');
    console.log('Number of pipe sprites:', pipe_sprites.length);
    if (pipe_sprites.length >= 2) {
        let topPipe = pipe_sprites[pipe_sprites.length - 2];
        let bottomPipe = pipe_sprites[pipe_sprites.length - 1];
        
        let topPipeRect = topPipe.getBoundingClientRect();
        let bottomPipeRect = bottomPipe.getBoundingClientRect();
        
        let chickenY = topPipeRect.bottom + (bottomPipeRect.top - topPipeRect.bottom) / 2 - 25;
        let chickenX = topPipeRect.right + (window.innerWidth - topPipeRect.right) / 2 - 25;
        
        let chicken_sprite = document.createElement('img');
        chicken_sprite.src = 'images/chicken.png';
        chicken_sprite.className = 'chicken_sprite';
        chicken_sprite.style.top = chickenY + 'px';
        chicken_sprite.style.left = chickenX + 'px';
        document.body.appendChild(chicken_sprite);
        
        console.log('Chicken created at X:', chickenX, 'Y:', chickenY);
    } else {
        console.log('Not enough pipe sprites to create chicken');
    }
}


// Inicializace hry
message.innerHTML = 'Stiskni Enter pro start hry'; // Zobrazení úvodní zprávy
