class GestureController {
  addGestureHandlers(modal, closeCallback) {
    let startY;

    modal.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    });

    modal.addEventListener("touchmove", (e) => {
      const moveY = e.touches[0].clientY;
      if (moveY - startY > 50) {
        closeCallback();
      }
    });
  }
}

export default GestureController;
