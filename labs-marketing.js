(function () {
  const sliders = document.querySelectorAll("[data-slider]");

  sliders.forEach((slider) => {
    const slidesWrap = slider.querySelector(".mk-slides");
    const slides = Array.from(slidesWrap.querySelectorAll(".mk-slide"));
    const prevBtn = slider.querySelector(".mk-prev");
    const nextBtn = slider.querySelector(".mk-next");
    const dotsWrap = slider.querySelector(".mk-dots");

    if (!slides.length) return;

    // dots 생성
    dotsWrap.innerHTML = "";
    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mk-dot" + (i === 0 ? " is-active" : "");
      b.setAttribute("aria-label", `go to slide ${i + 1}`);
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
      return b;
    });

    let idx = slides.findIndex((s) => s.classList.contains("is-active"));
    if (idx < 0) idx = 0;

    const hostSection = slider.closest(".mk-xsec");
    const autoplay = hostSection?.dataset.autoplay === "true";
    const intervalMs = Number(hostSection?.dataset.interval || 2500);

    let timer = null;
    let busy = false;

    function setActive(i) {
      slides.forEach((s) => s.classList.remove("is-active"));
      dots.forEach((d) => d.classList.remove("is-active"));
      slides[i].classList.add("is-active");
      dots[i]?.classList.add("is-active");
      idx = i;
    }

    function go(nextIndex, userAction = false) {
      if (busy) return;
      busy = true;

      // clamp
      if (nextIndex < 0) nextIndex = slides.length - 1;
      if (nextIndex >= slides.length) nextIndex = 0;

      setActive(nextIndex);

      // user가 눌렀으면 리셋(확확 느낌 유지)
      if (userAction) restart();
      setTimeout(() => (busy = false), 220);
    }

    function next(userAction = false) {
      go(idx + 1, userAction);
    }
    function prev(userAction = false) {
      go(idx - 1, userAction);
    }

    prevBtn?.addEventListener("click", () => prev(true));
    nextBtn?.addEventListener("click", () => next(true));

    function start() {
      if (!autoplay) return;
      stop();
      timer = setInterval(() => next(false), intervalMs);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function restart() {
      if (!autoplay) return;
      start();
    }

    // hover 시 잠깐 멈춤(원치 않으면 아래 2줄 제거)
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    // init
    setActive(idx);
    start();
  });
})();

(function () {
  // ✅ ticker 안의 video autoplay 안정화
  const videos = document.querySelectorAll(".lab-marketing .mk-ticker video");

  videos.forEach((v) => {
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.playsInline = true;

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    // load 이후 시도
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });

    // iOS 대응: 첫 터치 때 한번 더
    window.addEventListener("touchstart", tryPlay, {
      once: true,
      passive: true,
    });
  });
})();

(function () {
  // ✅ mk-step(샥샥) 전용: data-step="true"만 움직임
  const steps = document.querySelectorAll(
    '.lab-marketing .mk-slider[data-step="true"]'
  );

  steps.forEach((slider) => {
    const viewport = slider.querySelector(".mk-ticker-viewport");
    const track = slider.querySelector(".mk-ticker-track");
    const items = Array.from(slider.querySelectorAll(".mk-ticker-item"));
    if (!viewport || !track || items.length <= 1) return;

    // hover 멈춤을 원하지 않는다고 했으니: 멈추지 않음
    const stepMs = Number(slider.dataset.stepMs || 240);

    let idx = 0;
    let timer = null;

    function computeAndApplyItemWidth() {
      // ✅ "박스 내부" 기준으로 카드 폭을 계산 (비율 안정)
      const rect = viewport.getBoundingClientRect();
      const styles = getComputedStyle(viewport);
      const padL = parseFloat(styles.paddingLeft) || 0;
      const padR = parseFloat(styles.paddingRight) || 0;
      const innerW = Math.max(0, rect.width - padL - padR);

      // 한 번에 1장 중심으로, 양 옆 살짝 보이게(원하면 0.68~0.78)
      const itemW = Math.round(innerW * 0.72);

      items.forEach((el) => (el.style.width = itemW + "px"));
    }

    function getGapPx() {
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
      return gap;
    }

    function jumpTo(i, instant = false) {
      const gap = getGapPx();
      const w = items[0].getBoundingClientRect().width;
      const x = (w + gap) * i;

      if (instant) track.style.transition = "none";
      else track.style.transition = "transform 160ms steps(1, end)";

      track.style.transform = `translate3d(${-x}px, 0, 0)`;

      if (instant) {
        // reflow 후 transition 복구
        track.getBoundingClientRect();
        track.style.transition = "transform 160ms steps(1, end)";
      }
    }

    function step() {
      idx += 1;
      if (idx >= items.length) {
        // 끝 → 즉시 0으로 리셋 후 다시 진행 (샥샥 느낌)
        idx = 0;
        jumpTo(0, true);
        return;
      }
      jumpTo(idx, false);
    }

    function start() {
      stop();
      timer = setInterval(step, stepMs);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // ✅ 초기화
    computeAndApplyItemWidth();
    jumpTo(0, true);
    start();

    // ✅ 리사이즈 대응(비율 유지)
    window.addEventListener("resize", () => {
      computeAndApplyItemWidth();
      jumpTo(idx, true);
    });

    // ✅ 비디오 autoplay 안정화(추가 안전)
    slider.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.playsInline = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  });
})();

(function () {
  const cuts = document.querySelectorAll(
    '.lab-marketing .mk-slider[data-cut="true"]'
  );

  cuts.forEach((slider) => {
    const viewport = slider.querySelector(".mk-ticker-viewport");
    const track = slider.querySelector(".mk-ticker-track");
    const items = Array.from(slider.querySelectorAll(".mk-ticker-item"));
    if (!viewport || !track || items.length <= 1) return;

    const imageHoldMs = Number(slider.dataset.cutMs || 260);
    let idx = 0;
    let busy = false;

    function applyWidth() {
      const rect = viewport.getBoundingClientRect();
      const styles = getComputedStyle(viewport);
      const pad =
        (parseFloat(styles.paddingLeft) || 0) +
        (parseFloat(styles.paddingRight) || 0);

      const innerW = rect.width - pad;
      const itemW = Math.round(innerW * 0.98);
      items.forEach((el) => (el.style.width = itemW + "px"));
    }

    function getGap() {
      const styles = getComputedStyle(track);
      return parseFloat(styles.gap || "0") || 0;
    }

    function moveTo(i) {
      const gap = getGap();
      const w = items[0].getBoundingClientRect().width;
      const x = (w + gap) * i;

      track.style.transform = `translate3d(${-x}px,0,0)`;

      // 컷 이펙트
      viewport.classList.remove("is-cutting");
      void viewport.offsetWidth;
      viewport.classList.add("is-cutting");
    }

    function next() {
      idx = (idx + 1) % items.length;
      playCurrent();
    }

    function playCurrent() {
      if (busy) return;
      busy = true;

      moveTo(idx);

      const item = items[idx];
      const video = item.querySelector("video");

      if (video) {
        video.currentTime = 0;
        video.muted = true;
        video.play().catch(() => {});

        const onEnd = () => {
          video.removeEventListener("ended", onEnd);
          busy = false;
          next();
        };

        video.addEventListener("ended", onEnd, { once: true });
      } else {
        setTimeout(() => {
          busy = false;
          next();
        }, imageHoldMs);
      }
    }

    // init
    applyWidth();
    moveTo(0);
    playCurrent();

    window.addEventListener("resize", () => {
      applyWidth();
      moveTo(idx);
    });

    // iOS autoplay safety
    window.addEventListener(
      "touchstart",
      () => {
        slider.querySelectorAll("video").forEach((v) => {
          v.muted = true;
          v.play().catch(() => {});
        });
      },
      { once: true, passive: true }
    );
  });
})();

(function () {
  const sliders = document.querySelectorAll(
    '.lab-marketing .mk-snap[data-snap="true"]'
  );

  sliders.forEach((slider) => {
    const view = slider.querySelector(".mk-snap-view");
    const source = slider.querySelector(".mk-snap-source");
    if (!view || !source) return;

    const items = Array.from(source.children).filter((el) =>
      el.matches("figure")
    );
    if (items.length === 0) return;

    const hold = Number(slider.dataset.hold || 2000); // ✅ 2초 고정
    const swipe = Number(slider.dataset.swipe || 220); // ✅ 샥 속도(0.18~0.28 추천)

    slider.style.setProperty("--mk-swipe", swipe + "ms");

    let idx = 0;
    let timer = null;

    function cloneForView(el) {
      const card = document.createElement("div");
      card.className = "mk-snap-card is-enter";

      const cloned = el.cloneNode(true);

      // video autoplay 안정화
      const v = cloned.querySelector("video");
      if (v) {
        v.muted = true;
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.playsInline = true;
        v.loop = true; // ✅ 일단 2초 홀드 반복이니까 loop 유지가 자연스럽다
      }

      card.appendChild(cloned);
      return card;
    }

    function show(i) {
      // 기존 화면 정리(한 장만 유지)
      view.innerHTML = "";

      const card = cloneForView(items[i]);
      view.appendChild(card);

      // 애니메이션 후 class 정리
      setTimeout(() => {
        card.classList.remove("is-enter");
      }, swipe + 30);

      // video play 시도
      const v = card.querySelector("video");
      if (v) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    }

    function next() {
      idx = (idx + 1) % items.length;
      show(idx);
    }

    function start() {
      stop();
      // 첫 장
      show(idx);
      // 이후 반복
      timer = setInterval(next, hold + swipe); // 홀드 + 전환시간
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    start();

    // iOS: 첫 터치 때 play 재시도
    window.addEventListener(
      "touchstart",
      () => {
        const v = view.querySelector("video");
        if (v) {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        }
      },
      { once: true, passive: true }
    );
  });
})();
