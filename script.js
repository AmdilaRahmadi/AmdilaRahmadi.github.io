const container = document.getElementById('container');
const maxBalls = 999;
let balls = [];
let isDragging = false;
let draggingBall = null;
let animationFrame;

const gravity = 0.2;
const damping = 0.7;
const footerOffset = 90;
const stopThreshold = 0.1;

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createBall(x, y) {
    if (balls.length >= maxBalls) return;

    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.style.backgroundColor = getRandomColor();
    ball.style.width = '50px';
    ball.style.height = '50px';
    ball.style.position = 'absolute';
    container.appendChild(ball);

    balls.push({
        element: ball,
        position: { x: x - 25, y: y - 25 },
        velocity: { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 },
        radius: 25,
    });

    ball.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
}

function resolveCollision(ballObj, otherBallObj) {
    const dx = ballObj.position.x - otherBallObj.position.x;
    const dy = ballObj.position.y - otherBallObj.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ballObj.radius + otherBallObj.radius;

    if (distance < minDistance) {
        const angle = Math.atan2(dy, dx);
        const speed1 = Math.sqrt(ballObj.velocity.x ** 2 + ballObj.velocity.y ** 2);
        const speed2 = Math.sqrt(otherBallObj.velocity.x ** 2 + otherBallObj.velocity.y ** 2);
        const direction1 = Math.atan2(ballObj.velocity.y, ballObj.velocity.x);
        const direction2 = Math.atan2(otherBallObj.velocity.y, otherBallObj.velocity.x);

        const newVelocityX1 = speed2 * Math.cos(direction2 - angle);
        const newVelocityY1 = speed2 * Math.sin(direction2 - angle);
        const newVelocityX2 = speed1 * Math.cos(direction1 - angle);
        const newVelocityY2 = speed1 * Math.sin(direction1 - angle);

        ballObj.velocity.x = newVelocityX2 * Math.cos(angle) - newVelocityY2 * Math.sin(angle);
        ballObj.velocity.y = newVelocityX2 * Math.sin(angle) + newVelocityY2 * Math.cos(angle);
        otherBallObj.velocity.x = newVelocityX1 * Math.cos(angle) - newVelocityY1 * Math.sin(angle);
        otherBallObj.velocity.y = newVelocityX1 * Math.sin(angle) + newVelocityY1 * Math.cos(angle);

        const overlap = minDistance - distance;
        const correctionX = (overlap / 2) * (dx / distance);
        const correctionY = (overlap / 2) * (dy / distance);

        ballObj.position.x += correctionX;
        ballObj.position.y += correctionY;
        otherBallObj.position.x -= correctionX;
        otherBallObj.position.y -= correctionY;
    }
}

function moveBalls() {
    balls.forEach(ballObj => {
        if (!isDragging || ballObj.element !== draggingBall) {
            const ball = ballObj.element;
            let { position, velocity, radius } = ballObj;

            position.x += velocity.x;
            position.y += velocity.y;
            velocity.y += gravity;

            const footerHeight = document.querySelector('footer').clientHeight;
            const containerHeight = window.innerHeight - footerHeight;
            const maxX = window.innerWidth - radius * 2;
            const maxY = containerHeight - radius * 2 - footerOffset;

            if (position.x >= maxX) {
                position.x = maxX;
                velocity.x *= -1;
            } else if (position.x <= 0) {
                position.x = 0;
                velocity.x *= -1;
            }

            if (position.y >= maxY) {
                position.y = maxY;
                velocity.y *= -damping;
            } else if (position.y <= 0) {
                position.y = 0;
                velocity.y *= -damping;
            }

            balls.forEach(otherBallObj => {
                if (ballObj === otherBallObj) return;
                resolveCollision(ballObj, otherBallObj);
            });

            if (Math.abs(velocity.x) < stopThreshold && Math.abs(velocity.y) < stopThreshold) {
                velocity.x = 0;
                velocity.y = 0;
            }

            ball.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }
    });

    animationFrame = requestAnimationFrame(moveBalls);
}

container.addEventListener('click', (e) => {
    const x = e.clientX - container.getBoundingClientRect().left;
    const y = e.clientY - container.getBoundingClientRect().top;
    createBall(x, y);
    if (!animationFrame) moveBalls();
});

container.addEventListener('mousedown', (e) => {
    const ball = e.target.closest('.ball');
    if (!ball) return;

    draggingBall = ball;
    const ballObj = balls.find(b => b.element === ball);
    if (!ballObj) return;

    isDragging = true;
    cancelAnimationFrame(animationFrame);

    const offsetX = e.clientX - ballObj.position.x;
    const offsetY = e.clientY - ballObj.position.y;

    function onMouseMove(e) {
        if (isDragging) {
            ballObj.position.x = e.clientX - offsetX;
            ballObj.position.y = e.clientY - offsetY;
            ballObj.element.style.transform = `translate(${ballObj.position.x}px, ${ballObj.position.y}px)`;
        }
    }

    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('mouseup', () => {
        isDragging = false;
        draggingBall = null;

        // Reset kecepatan bola saat dilepas
        const ballObj = balls.find(b => b.element === ball);
        if (ballObj) {
            ballObj.velocity.x = 0;
            ballObj.velocity.y = 0;
        }

        moveBalls();
        document.removeEventListener('mousemove', onMouseMove);
    }, { once: true });
});
