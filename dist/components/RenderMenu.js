"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderMenu = void 0;
const RenderMenu = (container) => {
    const buttons = container.querySelectorAll(".button");
    const underline = container.querySelector(".underline");
    const pageContainer = container.querySelector("#page-container");
    if (!buttons.length || !underline || !pageContainer)
        return;
    const moveUnderline = (el) => {
        underline.style.width = `${el.offsetWidth}px`;
        underline.style.transform = `translateX(${el.offsetLeft}px)`;
    };
    const changePage = () => {
        buttons.forEach((button, index) => {
            if (button.classList.contains("active")) {
                pageContainer.style.transform = `translateX(${index * -50}%)`;
            }
        });
    };
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            changePage();
            moveUnderline(btn);
        });
    });
    const active = container.querySelector(".button.active");
    if (active)
        moveUnderline(active);
};
exports.RenderMenu = RenderMenu;
