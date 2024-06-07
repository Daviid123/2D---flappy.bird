let move_speed = 3, gravity = 0.5;  // Nastavení rychlosti pohybu překážek a gravitace
let bird = document.querySelector('.bird');  // Výběr elementu ptáčka
let img = document.getElementById('bird-1');  // Výběr obrázku ptáčka
//let sound_point = new Audio('sounds effect/point.mp3');  // Zvuk pro získání bodu
//let sound_die = new Audio('sounds effect/die.mp3');  // Zvuk pro konec hry

// Získání vlastností elementu ptáčka (pozice a rozměry)
let bird_props = bird.getBoundingClientRect();

// Získání vlastností pozadí hry (pozice a rozměry)
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');  // Výběr elementu zobrazujícího skóre
let message = document.querySelector('.message');  // Výběr elementu zobrazujícího zprávy
let score_title = document.querySelector('.score_title');  // Výběr elementu zobrazujícího nadpis skóre

let game_state = 'Start';  // Počáteční stav hry
let is_paused = false;  // Stav pauzy hry
img.style.display = 'none';  // Skrytí obrázku ptáčka na začátku
message.classList.add('messageStyle');  // Přidání stylu k úvodní zprávě

// Tato funkce naslouchá události stisknutí klávesy a kontroluje, zda byla stisknuta klávesa 'Enter' nebo 'Escape'.
// Pokud je hra v jiném stavu než 'Play', resetuje hru a připraví ji k novému spuštění.
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (game_state === 'Start' || game_state === 'End') {
            // Odstraní všechny prvky s třídou 'pipe_sprite'
            document.querySelectorAll('.pipe_sprite').forEach((el) => {
                el.remove();
            });
            // Zobrazí obrázek ptáčka
            img.style.display = 'block';
            // Nastaví pozici ptáčka na 40vh (vertikální výška)
            bird.style.top = '40vh';
            // Změní stav hry na 'Play'
            game_state = 'Play';
            // Vymaže zprávu a aktualizuje skóre
            message.innerHTML = '';
            score_title.textContent = 'Skóre : ';
            score_val.textContent = '0';
            message.classList.remove('messageStyle');
            // Spustí funkci play()
            play();
        } else if (game_state === 'Paused') {
            // Pokud je hra v pauze, pokračuje ve hře
            game_state = 'Play';
            message.innerHTML = '';
            message.classList.remove('messageStyle');
            play();
        }
    } else if (e.key === 'Escape' && game_state === 'Play') {
        // Pokud je hra v režimu 'Play', přepne na režim 'Paused'
        togglePause();
    }
});

// Funkce pro přepnutí stavu pauzy
function togglePause() {
    if (game_state === 'Play') {
        is_paused = !is_paused;
        if (is_paused) {
            game_state = 'Paused';
            message.innerHTML = 'Hra pozastavena'.fontcolor('yellow') + '<br>Stiskni enter pro pokračování';
            message.classList.add('messageStyle');
        }
    }
}

function play() {
    // Funkce move zajišťuje pohyb potrubí a kontroluje kolize mezi ptáčkem a potrubím.
    function move() {
        if (game_state !== 'Play') return;

        let pipe_sprites = document.querySelectorAll('.pipe_sprite');
        pipe_sprites.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            // Pokud je potrubí mimo obrazovku (jeho pravý okraj je menší nebo rovný 0), odstraní ho.
            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                // Kontrola kolize mezi ptáčkem a potrubím.
                if (
                    bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                    bird_props.left + bird_props.width > pipe_sprite_props.left &&
                    bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                    bird_props.top + bird_props.height > pipe_sprite_props.top
                ) {
                    // Pokud dojde ke kolizi, hra končí.
                    game_state = 'End';
                    message.innerHTML = 'Hra skončila'.fontcolor('red') + '<br>Stiskni enter pro restart';
                    message.classList.add('messageStyle');
                    img.style.display = 'none';
                    //sound_die.play();
                    return;
                } else {
                    // Zvýšení skóre, pokud ptáček úspěšně proletí mezi potrubími.
                    if (pipe_sprite_props.right < bird_props.left && pipe_sprite_props.right + move_speed >= bird_props.left && element.increase_score === '1') {
                        score_val.innerHTML = +score_val.innerHTML + 1;
                        //sound_point.play();
                    }
                    // Posunutí potrubí doleva.
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    let bird_dy = 0;
    // Funkce apply_gravity zajišťuje gravitační efekt na ptáčka.
    function apply_gravity() {
        if (game_state !== 'Play') return;
        bird_dy += gravity;

        // Naslouchá stisknutí klávesy 'ArrowUp' nebo mezerníku pro skok ptáčka.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === ' ') {
                img.src = 'images/Bird.png';
                bird_dy = -7.6;
            }
        });

        // Naslouchá uvolnění klávesy 'ArrowUp' nebo mezerníku
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === ' ') {
                img.src = 'images/Bird.png';
            }
        });

        // Kontrola, zda ptáček narazil do horní nebo dolní části obrazovky.
        if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
            game_state = 'End';
            message.style.left = '28vw';
            window.location.reload();
            message.classList.remove('messageStyle');
            return;
        }
        // Aktualizace pozice ptáčka.
        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_separation = 0;
    let pipe_gap = 35;

    // Funkce create_pipe vytváří nová potrubí v pravidelných intervalech.
    function create_pipe() {
        if (game_state !== 'Play') return;

        // Každých 115 jednotek času vytvoří nové potrubí.
        if (pipe_separation > 115) {
            pipe_separation = 0;

            // Náhodně umístí nové potrubí - překážky.
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
        }
        pipe_separation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}