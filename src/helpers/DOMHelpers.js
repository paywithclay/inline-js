export function addStyles() {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Fredoka&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.innerHTML = `
    /* Modal Styles */
    .clay-modal { 
      background-color: #fefefe; 
      z-index: 1001; 
      opacity: 0; 
      transition: transform 0.3s ease, opacity 0.3s ease;
      font-family: 'Fredoka', sans-serif;
    }
    .clay-modal.mobile { ... }
    .clay-modal.desktop { ... }
    .clay-modal.show { ... }
    /* Additional styles here */
  `;
  document.head.appendChild(style);
}
