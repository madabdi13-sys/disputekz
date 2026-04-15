/* DisputeKZ — shared app-shell JS (popover + toasts + user menu) */
(function () {
  // Toast
  const container = document.getElementById("toasts");
  function toast(msg) {
    if (!container) return;
    const el = document.createElement("div");
    el.className = "dk-toast";
    el.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span></span>';
    el.querySelector("span").textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.classList.add("removing"); setTimeout(() => el.remove(), 220); }, 2400);
  }
  window.dkToast = toast;

  // Popover
  document.querySelectorAll("[data-popover-trigger]").forEach((trigger) => {
    const wrap = trigger.closest(".dk-popover-wrap");
    const pop = wrap && wrap.querySelector(".dk-popover");
    if (!pop) return;
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".dk-popover.open").forEach((p) => { if (p !== pop) p.classList.remove("open"); });
      pop.classList.toggle("open");
    });
    pop.addEventListener("click", (e) => e.stopPropagation());
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".dk-popover.open").forEach((p) => p.classList.remove("open"));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".dk-popover.open").forEach((p) => p.classList.remove("open"));
  });

  // User menu actions
  document.querySelectorAll("[data-action]").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".dk-popover.open").forEach((p) => p.classList.remove("open"));
      const map = { profile: "Профиль пользователя", settings: "Настройки", help: "Помощь", logout: "Выход из системы" };
      toast(map[opt.dataset.action] || opt.dataset.action);
      if (opt.dataset.action === "logout") setTimeout(() => (window.location.href = "login.html"), 700);
    });
  });
})();
