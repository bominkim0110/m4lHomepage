// Education page JS (Hero video autoplay 안정화)
(function () {
  const heroVideo = document.querySelector(".lab-education .mk-hero-video");
  if (!heroVideo) return;

  heroVideo.muted = true;
  heroVideo.setAttribute("muted", "");
  heroVideo.setAttribute("playsinline", "");
  heroVideo.playsInline = true;

  const tryPlay = () => {
    const p = heroVideo.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  if (heroVideo.readyState >= 2) tryPlay();
  else heroVideo.addEventListener("loadeddata", tryPlay, { once: true });

  window.addEventListener("touchstart", tryPlay, { once: true, passive: true });
})();

// labs-education.js
(function () {
  // "더 알아보기" 버튼 → 상세 섹션 스크롤 이동
  const btns = document.querySelectorAll("[data-scroll]");
  if (!btns.length) return;

  const header = document.querySelector(".site-header");
  const headerH = header ? header.offsetHeight : 0;

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sel = btn.getAttribute("data-scroll");
      const target = sel ? document.querySelector(sel) : null;
      if (!target) return;

      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        (headerH + 24);
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // 해시(#ed-detail-01)로 들어왔을 때도 header offset 적용
  window.addEventListener("load", () => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + window.pageYOffset - (headerH + 24);
    window.scrollTo(0, y);
  });
})();

(function () {
  document.querySelectorAll("[data-ed-sol-acc]").forEach((root) => {
    const items = Array.from(root.querySelectorAll(".ed-sol-item"));
    const btns = Array.from(root.querySelectorAll(".ed-sol-top"));

    // 초기 aria 세팅
    items.forEach((it) => {
      const btn = it.querySelector(".ed-sol-top");
      if (!btn) return;
      btn.setAttribute(
        "aria-expanded",
        it.classList.contains("is-open") ? "true" : "false"
      );
    });

    // 클릭 시 토글 (모바일/데스크톱 모두 지원)
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".ed-sol-item");
        if (!item) return;

        const willOpen = !item.classList.contains("is-open");

        // 한 번에 하나만 열기
        items.forEach((it) => {
          it.classList.remove("is-open");
          const b = it.querySelector(".ed-sol-top");
          if (b) b.setAttribute("aria-expanded", "false");
        });

        if (willOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  });
})();
