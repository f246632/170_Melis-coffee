// ========================================
// Gallery Lightbox Functionality
// ========================================

(function() {
    'use strict';

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item');

    let currentImageIndex = 0;
    let images = [];

    // ========================================
    // Initialize Gallery
    // ========================================
    function initGallery() {
        // Collect all gallery images
        galleryItems.forEach((item, index) => {
            const imgSrc = item.getAttribute('data-image') || item.querySelector('img').src;
            const imgAlt = item.querySelector('img').alt || `Gallery Image ${index + 1}`;

            images.push({
                src: imgSrc,
                alt: imgAlt
            });

            // Add click event to gallery item
            item.addEventListener('click', () => {
                openLightbox(index);
            });

            // Keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Open ${imgAlt} in lightbox`);

            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });
    }

    // ========================================
    // Open Lightbox
    // ========================================
    function openLightbox(index) {
        if (!lightbox || !lightboxImg) return;

        currentImageIndex = index;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        updateLightboxImage();

        // Focus on lightbox for keyboard navigation
        lightbox.focus();
    }

    // ========================================
    // Close Lightbox
    // ========================================
    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // ========================================
    // Update Lightbox Image
    // ========================================
    function updateLightboxImage() {
        if (images.length === 0 || !lightboxImg) return;

        const currentImage = images[currentImageIndex];

        // Add fade effect
        lightboxImg.style.opacity = '0';

        setTimeout(() => {
            lightboxImg.src = currentImage.src;
            lightboxImg.alt = currentImage.alt;
            lightboxImg.style.opacity = '1';
        }, 200);
    }

    // ========================================
    // Navigate to Previous Image
    // ========================================
    function showPreviousImage() {
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = images.length - 1; // Loop to last image
        }
        updateLightboxImage();
    }

    // ========================================
    // Navigate to Next Image
    // ========================================
    function showNextImage() {
        currentImageIndex++;
        if (currentImageIndex >= images.length) {
            currentImageIndex = 0; // Loop to first image
        }
        updateLightboxImage();
    }

    // ========================================
    // Event Listeners
    // ========================================

    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Previous button
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showPreviousImage();
        });
    }

    // Next button
    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
    }

    // Close when clicking on background
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    // ========================================
    // Touch/Swipe Support for Mobile
    // ========================================
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for swipe
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - show next image
                showNextImage();
            } else {
                // Swiped right - show previous image
                showPreviousImage();
            }
        }
    }

    // ========================================
    // Preload Adjacent Images
    // ========================================
    function preloadAdjacentImages() {
        if (images.length === 0) return;

        const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
        const nextIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;

        // Preload previous image
        const prevImg = new Image();
        prevImg.src = images[prevIndex].src;

        // Preload next image
        const nextImg = new Image();
        nextImg.src = images[nextIndex].src;
    }

    // Update preload on image change
    if (lightbox) {
        const observer = new MutationObserver(() => {
            if (lightbox.classList.contains('active')) {
                preloadAdjacentImages();
            }
        });

        observer.observe(lightbox, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // ========================================
    // Accessibility: Focus Trap
    // ========================================
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }

    if (lightbox) {
        trapFocus(lightbox);
    }

    // ========================================
    // Image Counter Display (Optional)
    // ========================================
    function updateImageCounter() {
        const caption = document.getElementById('lightbox-caption');
        if (caption && images.length > 0) {
            caption.textContent = `${currentImageIndex + 1} / ${images.length}`;
        }
    }

    // ========================================
    // Initialize Gallery on Page Load
    // ========================================
    window.addEventListener('DOMContentLoaded', () => {
        initGallery();
    });

    // ========================================
    // Prevent Image Dragging
    // ========================================
    if (lightboxImg) {
        lightboxImg.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    }

    // ========================================
    // Loading Animation for Images
    // ========================================
    if (lightboxImg) {
        lightboxImg.addEventListener('load', () => {
            lightboxImg.style.opacity = '1';
        });

        lightboxImg.addEventListener('error', () => {
            console.error('Failed to load image:', lightboxImg.src);
            lightboxImg.alt = 'Image failed to load';
        });
    }

})();
