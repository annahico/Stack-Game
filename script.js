const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const score = document.querySelector('#score')

// CONSTANTS
const MODES = {
    FALL: 'fall',        // Modo en el que el bloque cae
    BOUNCE: 'bounce',    // Modo en el que el bloque rebota
    GAMEOVER: 'gameover' // Modo de juego terminado
}
const INITIAL_BOX_WIDTH = 200    // Ancho inicial del bloque
const INITIAL_BOX_Y = 600        // Posición Y inicial

const BOX_HEIGHT = 50            // Altura del bloque
const INITIAL_Y_SPEED = 5        // Velocidad vertical inicial
const INITIAL_X_SPEED = 2        // Velocidad horizontal inicial

// STATE
let boxes = []                    // Arreglo que contiene los bloques
let debris = { x: 0, y: 0, width: 0 }  // Escombros del bloque que no encajó
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed  // Variables del estado del juego

// Genera un color aleatorio para cada bloque
function createStepColor(step) {
    if (step === 0) return 'white'  // El primer bloque es blanco

    const red = Math.floor(Math.random() * 255)
    const green = Math.floor(Math.random() * 255)
    const blue = Math.floor(Math.random() * 255)

    return `rgb(${red}, ${green}, ${blue})`  // Devuelve un color RGB aleatorio
}

// Actualiza la posición de la cámara si es necesario
function updateCamera() {
    if (scrollCounter > 0) {
        cameraY++            // Desplaza la cámara hacia arriba
        scrollCounter--       // Disminuye el contador de desplazamiento
    }
}

// Inicializa el estado del juego
function initializeGameState() {
    boxes = [{
        x: (canvas.width / 2) - (INITIAL_BOX_WIDTH / 2),  // Posición inicial en X del primer bloque
        y: 200,                                          // Posición inicial en Y
        width: INITIAL_BOX_WIDTH,                        // Ancho inicial
        color: 'white'                                   // Color del primer bloque
    }]

    debris = { x: 0, y: 0, width: 0 }  // Escombros iniciales
    current = 1                        // El índice del bloque actual
    mode = MODES.BOUNCE                // Inicia en el modo "rebote"
    xSpeed = INITIAL_X_SPEED           // Velocidad horizontal inicial
    ySpeed = INITIAL_Y_SPEED           // Velocidad vertical inicial
    scrollCounter = 0                  // Contador de desplazamiento
    cameraY = 0                        // Posición de la cámara

    createNewBox()                     // Crea un nuevo bloque
}

// Reinicia el juego
function restart() {
    initializeGameState()  // Reestablece el estado del juego
    draw()                 // Llama a la función de dibujo
}

// Ciclo principal de dibujo del juego
function draw() {
    if (mode === MODES.GAMEOVER) return  // No dibuja si el juego ha terminado

    drawBackground()  // Dibuja el fondo
    drawBoxes()       // Dibuja los bloques
    drawDebris()      // Dibuja los escombros

    if (mode === MODES.BOUNCE) {
        moveAndDetectCollision()  // Mueve el bloque actual y detecta colisiones
    } else if (mode === MODES.FALL) {
        updateFallMode()  // Actualiza el modo de caída
    }

    debris.y -= ySpeed  // Mueve los escombros hacia arriba
    updateCamera()      // Actualiza la cámara

    window.requestAnimationFrame(draw)  // Continúa el ciclo de animación
}

// Dibuja el fondo del juego
function drawBackground() {
    context.fillStyle = 'rgba(0, 0, 0, 0.5)'  // Color negro con transparencia
    context.fillRect(0, 0, canvas.width, canvas.height)  // Dibuja el rectángulo de fondo
}

// Dibuja los escombros cuando un bloque no encaja
function drawDebris() {
    const { x, y, width } = debris
    const newY = INITIAL_BOX_Y - y + cameraY  // Ajusta la posición en Y

    context.fillStyle = 'red'  // Color rojo para los escombros
    context.fillRect(x, newY, width, BOX_HEIGHT)  // Dibuja los escombros
}

// Dibuja todos los bloques en pantalla
function drawBoxes() {
    boxes.forEach((box) => {
        const { x, y, width, color } = box
        const newY = INITIAL_BOX_Y - y + cameraY  // Ajusta la posición del bloque

        context.fillStyle = color  // Asigna el color al bloque
        context.fillRect(x, newY, width, BOX_HEIGHT)  // Dibuja el bloque
    })
}

// Crea un nuevo bloque en la parte superior
function createNewBox() {
    boxes[current] = {
        x: 0,  // Posición inicial en X del nuevo bloque
        y: (current + 10) * BOX_HEIGHT,  // Posición en Y
        width: boxes[current - 1].width,  // El ancho del bloque es igual al del anterior
        color: createStepColor(current)  // Asigna un color al nuevo bloque
    }
}

// Crea los escombros cuando un bloque no encaja correctamente
function createNewDebris(difference) {
    const currentBox = boxes[current]
    const previousBox = boxes[current - 1]

    const debrisX = currentBox.x > previousBox.x
        ? currentBox.x + currentBox.width  // Calcula la posición de los escombros
        : currentBox.x

    debris = {
        x: debrisX,       // Posición X de los escombros
        y: currentBox.y,  // Posición Y de los escombros
        width: difference // Ancho de los escombros
    }
}

// Actualiza el modo de caída cuando el bloque está cayendo
function updateFallMode() {
    const currentBox = boxes[current]
    currentBox.y -= ySpeed  // Mueve el bloque hacia abajo

    const positionPreviousBox = boxes[current - 1].y + BOX_HEIGHT

    if (currentBox.y === positionPreviousBox) {
        handleBoxLanding()  // Si aterriza en el bloque anterior, maneja el aterrizaje
    }
}

// Ajusta el tamaño y posición del bloque actual
function adjustCurrentBox(difference) {
    const currentBox = boxes[current]
    const previousBox = boxes[current - 1]

    if (currentBox.x > previousBox.x) {
        currentBox.width -= difference  // Ajusta el ancho si el bloque está desplazado a la derecha
    } else {
        currentBox.width += difference  // Ajusta el ancho si está desplazado a la izquierda
        currentBox.x = previousBox.x    // Alinea el bloque con el anterior
    }
}

// Termina el juego y muestra el mensaje de "Game Over"
function gameOver() {
    mode = MODES.GAMEOVER  // Cambia el modo a "GAMEOVER"

    context.fillStyle = 'rgba(255, 0, 0, 0.5)'  // Fondo rojo semitransparente
    context.fillRect(0, 0, canvas.width, canvas.height)  // Cubre el canvas

    context.font = 'bold 20px Arial'  // Estilo del texto
    context.fillStyle = 'white'       // Color del texto
    context.textAlign = 'center'      // Alineación del texto
    context.fillText(
        'Game Over',                 // Texto de fin de juego
        canvas.width / 2,            // Posición en X
        canvas.height / 2            // Posición en Y
    )
}

// Maneja el aterrizaje del bloque cuando cae
function handleBoxLanding() {
    const currentBox = boxes[current]
    const previousBox = boxes[current - 1]

    const difference = currentBox.x - previousBox.x  // Diferencia de posición entre los bloques

    if (Math.abs(difference) >= currentBox.width) {
        gameOver()  // Si la diferencia es mayor que el ancho del bloque, termina el juego
        return
    }

    adjustCurrentBox(difference)  // Ajusta el tamaño del bloque
    createNewDebris(difference)   // Crea los escombros

    xSpeed += xSpeed > 0 ? 1 : -1  // Aumenta la velocidad horizontal
    current++                      // Avanza al siguiente bloque
    scrollCounter = BOX_HEIGHT     // Ajusta el desplazamiento
    mode = MODES.BOUNCE            // Cambia al modo de rebote

    score.textContent = current - 1  // Actualiza la puntuación

    createNewBox()  // Crea un nuevo bloque
}

// Mueve el bloque actual y detecta colisiones con los bordes
function moveAndDetectCollision() {
    const currentBox = boxes[current]
    currentBox.x += xSpeed  // Mueve el bloque en el eje X

    const isMovingRight = xSpeed > 0
    const isMovingLeft = xSpeed < 0

    const hasHitRightSide =
        currentBox.x + currentBox.width > canvas.width

    const hasHitLeftSide = currentBox.x < 0

    if (
        (isMovingRight && hasHitRightSide) ||
        (isMovingLeft && hasHitLeftSide)
    ) {
        xSpeed = -xSpeed  // Invierte la dirección al chocar con los bordes
    }
}

// Detecta la tecla presionada para cambiar el modo de caída
document.addEventListener('keydown', (event) => {
    if (event.key === ' ' && mode === MODES.BOUNCE) {
        mode = MODES.FALL  // Cambia al modo de caída cuando se presiona la barra espaciadora
    }
})

// Detecta el clic del ratón o toque en pantalla para reiniciar o cambiar el modo
canvas.onpointerdown = () => {
    if (mode === MODES.GAMEOVER) {
        restart()  // Reinicia si el juego ha terminado
    } else if (mode === MODES.BOUNCE) {
        mode = MODES.FALL  // Cambia al modo de caída si el bloque está rebotando
    }
}

restart()  // Inicia el juego
