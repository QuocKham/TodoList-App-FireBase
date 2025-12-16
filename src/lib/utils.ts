// --- ASSETS & CONFIG ---

// Bạn thay link ảnh ở đây
export const ASSETS = {
  BACKGROUND_URL: "/img/background.jpg", 
  LOGO_URL: "/img/logo.png"
};

export const NOTE_COLORS = [
  '#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', 
  '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8'
];

export const getRandomColor = () => NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];