// ===== 아코디언: Header Hover(PC) + Click(모바일) =====
const root = document.querySelector('[data-accordion="startup"]');
const items = root ? root.querySelectorAll(".lab-accordion-item") : [];

const closeAll = () => items.forEach((el) => el.classList.remove("is-open"));
const openOne = (item) => {
  closeAll();
  item.classList.add("is-open");
};

items.forEach((item) => {
  const header = item.querySelector(".lab-accordion-header");
  const btn = item.querySelector(".lab-acc-toggle");

  // PC: 헤더에 마우스 올리면 열기
  if (header) header.addEventListener("mouseenter", () => openOne(item));

  // 모바일/터치: 버튼 클릭 토글
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = item.classList.contains("is-open");
      closeAll();
      if (!isOpen) item.classList.add("is-open");
    });
  }
});

// 영역 밖으로 나가면 닫기(원하면 삭제 가능)
if (root) root.addEventListener("mouseleave", closeAll);

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".lab-step-card");
  let index = 0;

  setInterval(() => {
    cards.forEach((card, i) => {
      card.classList.toggle("is-highlight", i === index);
    });

    index = (index + 1) % cards.length; // 0→1→2→3→4→5 반복
  }, 1200);
});
