"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HomeRuntime.module.css";

const HERO_VIDEOS = [
  "https://www.golibertychurch.com/assets/hero_vids/bible_hero.mp4",
  "https://www.golibertychurch.com/assets/hero_vids/the_cross_hero.mp4",
  "https://www.golibertychurch.com/assets/hero_vids/worship_hero.mp4",
  "https://www.golibertychurch.com/assets/hero_vids/worship_hero_1.mp4",
];

function randomHeroVideo() {
  return HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)];
}

export function HomeRuntime() {
  const [isOpen, setIsOpen] = useState(false);
  const [welcomeHtml, setWelcomeHtml] = useState("");
  const [hasLoadedWelcome, setHasLoadedWelcome] = useState(false);
  const lastFocusRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const heroVideo = document.getElementById("heroVideo");
    if (heroVideo && !heroVideo.getAttribute("src")) {
      heroVideo.setAttribute("src", randomHeroVideo());
      heroVideo.addEventListener(
        "loadeddata",
        () => {
          heroVideo.classList.add("ready");
        },
        { once: true },
      );
    }

    const sections = Array.from(document.querySelectorAll(".section"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.remove("is-paused");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    sections.forEach((section) => {
      section.classList.add("is-paused");
      observer.observe(section);
    });

    const lazyImages = Array.from(document.querySelectorAll('img[loading="lazy"][data-src]'));
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const image = entry.target;
          const dataSrc = image.getAttribute("data-src");
          if (dataSrc) {
            image.setAttribute("src", dataSrc);
            image.classList.add("loaded");
          }
          imageObserver.unobserve(image);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    lazyImages.forEach((img) => imageObserver.observe(img));

    return () => {
      observer.disconnect();
      imageObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const button = document.getElementById("reopenWelcome");
    if (!button) {
      return undefined;
    }
    const handleClick = () => {
      lastFocusRef.current = document.activeElement;
      setIsOpen(true);
      try {
        localStorage.setItem("welcomeSeen", "1");
      } catch {
        // Ignore storage errors
      }
    };
    button.addEventListener("click", handleClick);
    return () => {
      button.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (hasLoadedWelcome || !isOpen) {
      return;
    }
    setHasLoadedWelcome(true);
    fetch("/welcome.html", { cache: "no-store" })
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error("fail"))))
      .then((html) => setWelcomeHtml(html))
      .catch(() => {
        setWelcomeHtml("<p class=\"muted-text\">Welcome message unavailable right now.</p>");
      });
  }, [hasLoadedWelcome, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove("modal-open");
      return undefined;
    }

    document.body.classList.add("modal-open");

    const modal = modalRef.current;
    if (!modal) {
      return () => document.body.classList.remove("modal-open");
    }

    const focusables = Array.from(
      modal.querySelectorAll(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const heading = modal.querySelector("#welcomeTitle");
    heading?.focus({ preventScroll: true });

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab" || !first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    modal.addEventListener("keydown", handleKeydown);

    const signatureWrapper = modal.querySelector(".signature-wrapper");
    if (signatureWrapper && !signatureWrapper.dataset.animated) {
      setTimeout(() => {
        signatureWrapper.classList.add("signature-animate");
        signatureWrapper.dataset.animated = "true";
      }, 450);
    }

    return () => {
      modal.removeEventListener("keydown", handleKeydown);
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, welcomeHtml]);

  useEffect(() => {
    let timer;
    try {
      const seen = localStorage.getItem("welcomeSeen");
      if (!seen) {
        timer = window.setTimeout(() => {
          lastFocusRef.current = document.activeElement;
          setIsOpen(true);
          localStorage.setItem("welcomeSeen", "1");
        }, 800);
      }
    } catch {
      // Ignore storage errors
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  function closeModal() {
    setIsOpen(false);
    const lastFocus = lastFocusRef.current;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      id="welcomeModal"
      ref={modalRef}
      className={styles.welcomeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcomeTitle"
    >
      <button
        type="button"
        className={styles.backdrop}
        onClick={closeModal}
        aria-label="Close welcome message"
      />
      <div className={styles.dialog} role="document">
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close"
          onClick={closeModal}
        >
          ×
        </button>
        <div className={styles.body}>
          <h2 id="welcomeTitle" className={styles.title} tabIndex={-1}>
            We&apos;re so glad you&apos;re here!
          </h2>
          <div
            id="welcomeContent"
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: welcomeHtml }}
          />
        </div>
      </div>
    </div>
  );
}
