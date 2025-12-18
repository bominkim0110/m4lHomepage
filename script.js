// script.js

document.addEventListener("DOMContentLoaded", () => {
  setupSplitText(); // "We create culture"
  setupFadeText(); // 다른 섹션 페이드
  setupWhoSection(); // WHO 섹션 두 줄 교체
});

/* ============================================================
   1. SPLIT TEXT (We create culture) + 그라데이션 정렬
   ============================================================ */

function setupSplitText() {
  const splitTargets = document.querySelectorAll(".split-text");
  if (!splitTargets.length) return;

  splitTargets.forEach((el) => {
    const original = el.innerText.trim();
    const words = original.split(" ");

    el.innerHTML = "";
    const isGradient = el.classList.contains("split-text--gradient");

    words.forEach((word, i) => {
      const outer = document.createElement("span");
      outer.className = "split-word";

      const inner = document.createElement("span");
      inner.className = "split-word-inner";
      inner.textContent = word;

      outer.appendChild(inner);
      el.appendChild(outer);

      if (i < words.length - 1) {
        el.append(" ");
      }
    });

    if (isGradient) {
      requestAnimationFrame(() => {
        const totalWidth = el.offsetWidth;
        const parentRect = el.getBoundingClientRect();

        el.querySelectorAll(".split-word-inner").forEach((inner) => {
          const rect = inner.getBoundingClientRect();
          const offsetX = rect.left - parentRect.left;

          inner.style.backgroundSize = totalWidth + "px auto";
          inner.style.backgroundPosition = `-${offsetX}px 0`;
        });
      });
    }

    const baseDelay = Number(el.dataset.splitDelay || "0") * 1000;
    const wordEls = el.querySelectorAll(".split-word");

    wordEls.forEach((wordEl, idx) => {
      setTimeout(() => {
        wordEl.classList.add("is-animated");
      }, baseDelay + idx * 160);
    });
  });
}

/* ============================================================
   2. FADE TEXT (기존 .fade-text 인터섹션)
   ============================================================ */

function setupFadeText() {
  const fadeTargets = document.querySelectorAll(".fade-text");
  if (!fadeTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
        }
      });
    },
    { threshold: 0.4 }
  );

  fadeTargets.forEach((el) => observer.observe(el));
}

/* ============================================================
   3. WHO 섹션 – 두 문장 교체
   ============================================================ */

function setupWhoSection() {
  const section = document.querySelector(".about-section--who");
  if (!section) return;

  const lines = section.querySelectorAll(".who-line");
  if (!lines.length) return;

  // index번째 줄만 is-active 붙여주는 헬퍼
  function setActive(index) {
    lines.forEach((el, i) => {
      if (i === index) el.classList.add("is-active");
      else el.classList.remove("is-active");
    });
  }

  // 처음에는 첫 번째 줄 강조 (스크립트 동작하는지 바로 눈으로 확인용)
  setActive(0);

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // 섹션이 화면 안에 들어온 비율 (0 ~ 1)
    const ratio = (vh - rect.top) / vh;

    if (ratio < 0.5) {
      // 아직 거의 안 보임 → 둘 다 흐리게
      setActive(-1); // 아무 것도 활성화 안 함
    } else if (ratio < 0.95) {
      // 중간쯤 → 첫 번째 문장 강조
      setActive(0);
    } else {
      // 더 내려옴 → 두 번째 문장 강조
      setActive(1);
    }
  }

  // 스크롤 이벤트 등록 & 초기 호출
  window.addEventListener("scroll", onScroll);
  onScroll();
}

document.addEventListener("DOMContentLoaded", () => {
  // 이미 있는 함수들 (setupSplitText, setupFadeText 등) 그대로 두고
  // 그 아래에 추가해줘.

  setupRevealOnScroll();
  setupNumberCounters();
});

/* 요소 페이드 인 / 슬라이드 인 ---------------------------------- */
function setupRevealOnScroll() {
  const revealTargets = document.querySelectorAll(".js-reveal");

  if (!revealTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

/* 숫자 카운트업 -------------------------------------------------- */
function setupNumberCounters() {
  const counters = document.querySelectorAll(".number-card .count");
  if (!counters.length) return;

  const animated = new WeakSet();

  function animate(el) {
    if (animated.has(el)) return;
    animated.add(el);

    const target = Number(el.dataset.target || "0");
    const formatComma = el.dataset.format === "comma";
    const duration = 1500; // ms
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(target * progress);

      el.textContent = formatComma
        ? value.toLocaleString("ko-KR")
        : String(value);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target.querySelector(".count");
          if (el) {
            animate(el);
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => {
    const card = c.closest(".number-card");
    if (card) observer.observe(card);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll("[data-animate-number]");
  if (!elements.length) return;

  function animateValue(el, start, end, duration, formatter) {
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // 부드러운 가속/감속
      const value = Math.floor(start + (end - start) * eased);
      el.textContent = formatter ? formatter(value) : value;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function getFormatter(el) {
    return el.dataset.format === "comma"
      ? (v) => v.toLocaleString("ko-KR")
      : null;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target; // 숫자 span (.numbers-value)
        const target = Number(el.dataset.target);
        if (isNaN(target)) return;

        const duration = Number(el.dataset.duration) || 1500;
        const formatter = getFormatter(el);

        // 숫자 카운트 업
        animateValue(el, 0, target, duration, formatter);

        // 같은 카드 안의 일러스트 img 찾아서 등장 효과 주기
        const card = el.closest(".numbers-card");
        if (card) {
          const iconImg = card.querySelector(".numbers-card-illu img");
          if (iconImg && !iconImg.classList.contains("is-visible")) {
            // 숫자가 시작되고 150ms 뒤에 아이콘 등장
            setTimeout(() => {
              iconImg.classList.add("is-visible");
            }, 150);
          }
        }

        // 이 숫자는 한 번만 애니메이션
        obs.unobserve(el);
      });
    },
    {
      threshold: 0.4,
      rootMargin: "0px 0px -20% 0px",
    }
  );

  elements.forEach((el) => observer.observe(el));
});

// ============== HISTORY 섹션 스크롤 페이드인 ==============
(function setupHistoryReveal() {
  const historySection = document.querySelector("#history");
  if (!historySection) return;

  const historyHead = historySection.querySelector(".history-head");
  const historyItems = historySection.querySelectorAll(".history-item");

  // IntersectionObserver 옵션
  const observerOptions = {
    threshold: 0.25, // 요소의 25% 정도 보이면 발동
    rootMargin: "0px 0px -10% 0px", // 살짝 일찍/늦게 조정하고 싶으면 여기 값 조절
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target); // 한 번 보이면 다시 관찰 안 함
    });
  }, observerOptions);

  // 1) 헤더(메디포랩 연혁 + 설명) 페이드인
  if (historyHead) {
    observer.observe(historyHead);
  }

  // 2) 연도 + 상세내용(각 history-item) 개별 페이드인
  historyItems.forEach((item) => {
    observer.observe(item);
  });
})();
