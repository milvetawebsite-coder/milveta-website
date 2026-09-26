/* ==================================================
   HOME SLIDER
   Matches the real markup:
     .home-slider > .slider-track > .slide (img)
     #prevBtn / #nextBtn
   Transform-based (translateX), no dot navigation
   (there are no .dot elements in the markup).
================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const slider = document.querySelector(".home-slider");
    const track = document.getElementById("sliderTrack");
    const slides = document.querySelectorAll(".slide");
    const prevButton = document.getElementById("prevBtn");
    const nextButton = document.getElementById("nextBtn");

    /* Bail out quietly if the slider isn't on this page,
       or there's nothing to slide — avoids console errors
       on pages that don't include this markup, and avoids
       a useless interval when there's only one slide. */
    if (!slider || !track || slides.length < 2) {
        return;
    }

    const SLIDE_DELAY = 5000;
    const SWIPE_THRESHOLD = 50;

    /* People who've asked their OS/browser to reduce motion
       still get manual prev/next, just no forced auto-advance
       and no animated transition. */
    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentSlide = 0;
    let autoSlideTimer = null;

    function showSlide(index) {

        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        track.style.transform = "translateX(-" + (currentSlide * 100) + "%)";
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function previousSlide() {
        showSlide(currentSlide - 1);
    }

    function startAutoSlide() {

        if (prefersReducedMotion) {
            return;
        }

        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(nextSlide, SLIDE_DELAY);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideTimer);
    }

    function restartAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    /* ---------- Arrow buttons ---------- */

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            nextSlide();
            restartAutoSlide();
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", function () {
            previousSlide();
            restartAutoSlide();
        });
    }

    /* ---------- Pause on hover / focus ---------- */

    slider.addEventListener("mouseenter", stopAutoSlide);
    slider.addEventListener("mouseleave", startAutoSlide);

    /* Keyboard users tabbing to the arrow buttons get the
       same pause-while-interacting behaviour as mouse users. */
    slider.addEventListener("focusin", stopAutoSlide);
    slider.addEventListener("focusout", startAutoSlide);

    /* ---------- Touch swipe ---------- */

    let touchStartX = 0;

    slider.addEventListener("touchstart", function (event) {
        touchStartX = event.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });

    slider.addEventListener("touchend", function (event) {

        const touchEndX = event.changedTouches[0].screenX;
        const distance = touchStartX - touchEndX;

        if (Math.abs(distance) > SWIPE_THRESHOLD) {
            if (distance > 0) {
                nextSlide();
            } else {
                previousSlide();
            }
        }

        restartAutoSlide();

    }, { passive: true });

    /* ---------- Pause when the tab isn't visible ----------
       Without this, a backgrounded tab keeps silently
       advancing the slider and firing layout work for no
       one to see — wasted battery/CPU on mobile especially. */

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });

    /* ---------- Pause when scrolled out of view ----------
       This is a long single-page site — once someone scrolls
       past the hero, there's no reason to keep animating it. */

    if ("IntersectionObserver" in window) {

        const visibilityObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                startAutoSlide();
            } else {
                stopAutoSlide();
            }
        }, { threshold: 0.1 });

        visibilityObserver.observe(slider);
    }

    /* ---------- Init ---------- */

    showSlide(0);
    startAutoSlide();

});