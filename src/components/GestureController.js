export default class GestureController {
  constructor() {}

  addGestureHandlers(modal, closeModalCallback) {
    let startY;
    let initialTransform = 0;

    modal.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      initialTransform =
        parseFloat(getComputedStyle(modal).transform.split(",")[5]) || 0;
    });

    modal.addEventListener("touchmove", (e) => {
      const moveY = e.touches[0].clientY;
      const deltaY = moveY - startY;
      if (deltaY > 0) {
        modal.style.transform = `translateY(${deltaY + initialTransform}px)`;
      }
    });

    modal.addEventListener("touchend", (e) => {
      const moveY = e.changedTouches[0].clientY;
      const deltaY = moveY - startY;
      if (deltaY > 100) {
        closeModalCallback();
      } else {
        modal.style.transition = "transform 0.3s ease";
        modal.style.transform = `translateY(0)`;
      }
    });
  }
}
