// ==============================
// GIRLS FRIEND DAYS - PUZZLE JS
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initPuzzle();
});

// ==============================
// FLOATING PARTICLES
// ==============================
function initParticles() {
    const container = document.getElementById('particles');
    const count = 25;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.opacity = Math.random() * 0.4 + 0.1;
        container.appendChild(particle);
    }
}

// ==============================
// PUZZLE LOGIC
// ==============================
let placedCount = 0;
const TOTAL_PIECES = 4;

function initPuzzle() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const dropZone = document.getElementById('drop-zone');
    const slots = document.querySelectorAll('.target-slot');

    // --- DRAG & DROP (Desktop) ---
    pieces.forEach(piece => {
        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragend', handleDragEnd);
    });

    // Allow drop on the entire drop zone and individual slots
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    slots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
    });

    // --- TOUCH SUPPORT (Mobile) ---
    pieces.forEach(piece => {
        piece.addEventListener('touchstart', handleTouchStart, { passive: false });
        piece.addEventListener('touchmove', handleTouchMove, { passive: false });
        piece.addEventListener('touchend', handleTouchEnd, { passive: false });
    });
}

// ==============================
// DRAG HANDLERS
// ==============================
let draggedPiece = null;

function handleDragStart(e) {
    draggedPiece = e.target.closest('.puzzle-piece');
    e.dataTransfer.setData('text/plain', draggedPiece.dataset.piece);
    e.dataTransfer.effectAllowed = 'move';
    
    setTimeout(() => {
        draggedPiece.style.opacity = '0.4';
    }, 0);
}

function handleDragEnd(e) {
    e.target.closest('.puzzle-piece').style.opacity = '1';
    document.getElementById('drop-zone').classList.remove('drag-over');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.getElementById('drop-zone').classList.add('drag-over');
}

function handleDragLeave(e) {
    document.getElementById('drop-zone').classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');

    const pieceId = e.dataTransfer.getData('text/plain');
    const piece = document.querySelector(`.puzzle-piece[data-piece="${pieceId}"]`);
    
    if (piece && !piece.classList.contains('placed')) {
        placePiece(piece, pieceId);
    }
}

// ==============================
// TOUCH HANDLERS
// ==============================
let touchOffsetX = 0;
let touchOffsetY = 0;
let touchPiece = null;

function handleTouchStart(e) {
    e.preventDefault();
    touchPiece = e.target.closest('.puzzle-piece');
    if (!touchPiece || touchPiece.classList.contains('placed')) return;

    const touch = e.touches[0];
    const rect = touchPiece.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

    touchPiece.style.zIndex = '100';
    touchPiece.style.transform = 'scale(1.15)';
    touchPiece.style.transition = 'none';
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!touchPiece) return;

    const touch = e.touches[0];
    const puzzleArea = document.getElementById('puzzle-area');
    const areaRect = puzzleArea.getBoundingClientRect();

    const x = touch.clientX - areaRect.left - touchOffsetX;
    const y = touch.clientY - areaRect.top - touchOffsetY;

    touchPiece.style.left = x + 'px';
    touchPiece.style.top = y + 'px';
    touchPiece.style.right = 'auto';
    touchPiece.style.bottom = 'auto';
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!touchPiece) return;

    const touch = e.changedTouches[0];
    const dropZone = document.getElementById('drop-zone');
    const dzRect = dropZone.getBoundingClientRect();

    // Check if dropped inside the drop zone
    if (
        touch.clientX >= dzRect.left &&
        touch.clientX <= dzRect.right &&
        touch.clientY >= dzRect.top &&
        touch.clientY <= dzRect.bottom
    ) {
        const pieceId = touchPiece.dataset.piece;
        placePiece(touchPiece, pieceId);
    } else {
        // Reset
        touchPiece.style.zIndex = '10';
        touchPiece.style.transform = '';
        touchPiece.style.transition = '';
    }

    touchPiece = null;
}

// ==============================
// PLACE PIECE
// ==============================
function placePiece(piece, pieceId) {
    const slot = document.querySelector(`.target-slot[data-piece="${pieceId}"]`);
    if (!slot) return;

    // Move piece into the slot
    piece.classList.add('placed');
    piece.style.position = 'absolute';
    piece.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    piece.style.zIndex = '5';
    piece.style.transform = 'rotate(0deg) scale(1)';

    // Position within drop zone
    const dropZone = document.getElementById('drop-zone');
    const dzWidth = dropZone.offsetWidth;
    const dzHeight = dropZone.offsetHeight;

    // Calculate position based on piece ID
    let targetLeft, targetTop;
    const pw = piece.offsetWidth;
    const ph = piece.offsetHeight;

    switch(pieceId) {
        case '1': // Top-left
            targetLeft = 0;
            targetTop = 0;
            break;
        case '2': // Top-right
            targetLeft = dzWidth / 2;
            targetTop = 0;
            break;
        case '3': // Bottom-left
            targetLeft = 0;
            targetTop = dzHeight / 2;
            break;
        case '4': // Bottom-right
            targetLeft = dzWidth / 2;
            targetTop = dzHeight / 2;
            break;
    }

    // Append to drop zone and position
    dropZone.appendChild(piece);
    piece.style.left = targetLeft + 'px';
    piece.style.top = targetTop + 'px';
    piece.style.right = 'auto';
    piece.style.bottom = 'auto';
    piece.style.width = (dzWidth / 2) + 'px';
    piece.style.height = (dzHeight / 2) + 'px';
    piece.style.opacity = '1';

    slot.classList.add('filled');
    placedCount++;

    // Create a small sparkle effect
    createSparkle(piece);

    // Check if puzzle is complete
    if (placedCount === TOTAL_PIECES) {
        setTimeout(() => {
            onPuzzleComplete();
        }, 600);
    }
}

// ==============================
// SPARKLE EFFECT
// ==============================
function createSparkle(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: #ff6b8a;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${centerX}px;
            top: ${centerY}px;
        `;
        document.body.appendChild(sparkle);

        const angle = (Math.PI * 2 / 8) * i;
        const distance = 40 + Math.random() * 30;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        sparkle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0, 0.8, 0.2, 1)',
            fill: 'forwards'
        });

        setTimeout(() => sparkle.remove(), 700);
    }
}

// ==============================
// PUZZLE COMPLETE
// ==============================
function onPuzzleComplete() {
    // Show success overlay
    const overlay = document.getElementById('success-overlay');
    overlay.classList.add('active');

    // Start lily shower!
    startLilyShower();
}

// ==============================
// LILY FLOWER SHOWER
// ==============================
function startLilyShower() {
    const container = document.getElementById('lily-container');
    const totalLilies = 50;
    const duration = 4000; // 4 seconds of shower

    for (let i = 0; i < totalLilies; i++) {
        setTimeout(() => {
            const lily = document.createElement('div');
            lily.classList.add('lily');

            // Random properties
            const size = 30 + Math.random() * 50;
            const left = Math.random() * 100;
            const animDuration = 3 + Math.random() * 4;
            const delay = Math.random() * 0.5;

            lily.style.width = size + 'px';
            lily.style.height = size + 'px';
            lily.style.left = left + '%';
            lily.style.top = '-80px';
            lily.style.animationDuration = animDuration + 's';
            lily.style.animationDelay = delay + 's';

            container.appendChild(lily);

            // Remove after animation
            setTimeout(() => {
                lily.remove();
            }, (animDuration + delay) * 1000 + 500);
        }, i * (duration / totalLilies));
    }
}