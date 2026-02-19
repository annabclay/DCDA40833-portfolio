// Image Carousel functionality with accessibility enhancements
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const carousel = document.querySelector('.carousel');

// Show specific slide
function showSlide(n) {
    // Remove active class from all slides and dots
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
        slide.setAttribute('tabindex', '-1');
    });
    
    dots.forEach(dot => {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
        dot.setAttribute('tabindex', '-1');
    });
    
    // Wrap around if out of bounds
    if (n >= slides.length) {
        currentSlide = 0;
    } else if (n < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = n;
    }
    
    // Add active class to current slide and dot
    slides[currentSlide].classList.add('active');
    slides[currentSlide].setAttribute('aria-hidden', 'false');
    slides[currentSlide].setAttribute('tabindex', '0');
    
    dots[currentSlide].classList.add('active');
    dots[currentSlide].setAttribute('aria-selected', 'true');
    dots[currentSlide].setAttribute('tabindex', '0');
    
    // Update slide labels
    slides[currentSlide].setAttribute('aria-label', `Slide ${currentSlide + 1} of ${slides.length}`);
    
    // Announce to screen readers
    const announcement = `Showing slide ${currentSlide + 1} of ${slides.length}`;
    announceToScreenReader(announcement);
}

// Next slide
function nextSlide() {
    showSlide(currentSlide + 1);
}

// Previous slide
function prevSlide() {
    showSlide(currentSlide - 1);
}

// Event listeners for buttons
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Event listeners for dots with keyboard support
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'));
        showSlide(slideIndex);
    });
    
    // Keyboard navigation for dots
    dot.addEventListener('keydown', (e) => {
        let newIndex;
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                newIndex = index - 1 < 0 ? dots.length - 1 : index - 1;
                dots[newIndex].focus();
                showSlide(newIndex);
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                newIndex = index + 1 >= dots.length ? 0 : index + 1;
                dots[newIndex].focus();
                showSlide(newIndex);
                break;
            case 'Home':
                e.preventDefault();
                dots[0].focus();
                showSlide(0);
                break;
            case 'End':
                e.preventDefault();
                dots[dots.length - 1].focus();
                showSlide(dots.length - 1);
                break;
        }
    });
});

// Function to announce to screen readers
function announceToScreenReader(message) {
    const announcement = document.getElementById('carousel-announcement');
    if (announcement) {
        announcement.textContent = message;
    }
}

// Auto-advance carousel every 5 seconds
let autoSlide = setInterval(nextSlide, 5000);
let isAutoPlaying = true;

// Pause auto-advance on hover
carousel.addEventListener('mouseenter', () => {
    clearInterval(autoSlide);
    isAutoPlaying = false;
});

carousel.addEventListener('mouseleave', () => {
    autoSlide = setInterval(nextSlide, 5000);
    isAutoPlaying = true;
});

// Pause on focus (keyboard users)
carousel.addEventListener('focusin', () => {
    clearInterval(autoSlide);
    isAutoPlaying = false;
});

carousel.addEventListener('focusout', () => {
    if (!carousel.contains(document.activeElement)) {
        autoSlide = setInterval(nextSlide, 5000);
        isAutoPlaying = true;
    }
});

// Keyboard navigation (arrow keys) when carousel is focused
document.addEventListener('keydown', (e) => {
    // Only respond if carousel or its children have focus
    if (!carousel.contains(document.activeElement)) return;
    
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        prevBtn.focus();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        nextBtn.focus();
    }
});

// Initialize first slide with proper attributes
showSlide(0);
