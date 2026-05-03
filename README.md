# 🧠 Dotpop Trivia

> **Tap. Match. Learn. Repeat.**

A fast, interactive dot-matching trivia game powered by a simple Q/A structure. Test your knowledge across 5 categories with real-time feedback and streak tracking.

![Preview](preview.png)

## 🎮 Live Demo

https://teddyeshafer-creator.github.io/dotpop-trivia/

## ✨ Features

- **5 Categories**: Space, Animals, Food, Tech, Fun Facts
- **20 Matches Total**: 4 questions × 5 answers per category
- **Real-Time Scoring**: Track correct/incorrect answers and streaks
- **Timer-Based Gameplay**: Race against the clock
- **Best Scores Saved**: localStorage persists your best time and accuracy
- **Responsive Design**: Works on desktop and mobile
- **Zero Dependencies**: Pure vanilla JavaScript, HTML, CSS
- **Audio Feedback**: Synthesized sounds + spoken answers
- **Smooth Animations**: Pop effects, shake feedback, match lines

## 🚀 How to Run

### Option 1: Open in Browser
```bash
open index.html
```

### Option 2: Use Live Server
Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code, then:
1. Right-click `index.html`
2. Select "Open with Live Server"

## 📚 How to Play

1. **Select a Question**: Click any question dot (Q1–Q4)
2. **Read/Listen**: A modal appears with the question
3. **Choose an Answer**: Click an answer dot (A1–A4)
4. **Confirm**: Select "Choose This Answer" in the modal
5. **Match Found**: Correct answers glow green; incorrect answers shake red
6. **Repeat**: Continue until all 20 pairs are matched

### Scoring
- **Correct Match** → +1 point, +1 streak, green glow
- **Incorrect Match** → +1 incorrect count, streak resets, red shake
- **Streak**: Track consecutive correct matches with fire 🔥
- **Best Scores**: Fastest time and highest accuracy saved to localStorage

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Styling, animations, gradients, responsive layout |
| **JavaScript (Vanilla)** | Game logic, state management, UI building |
| **Web Audio API** | Synthesized sound effects |
| **SpeechSynthesis API** | Spoken question/answer feedback |
| **localStorage** | Persistent best scores |

## 🎨 Design Philosophy

**Keep it simple. Fast interactions. No bloat.**

Dotpop Trivia is designed to:
- Load instantly (no build step, no dependencies)
- Respond immediately to user input
- Provide satisfying visual and audio feedback
- Run smoothly on any device
- Be fun and engaging without distractions

## 📁 Project Structure

```
dotpop-trivia/
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── script.js           # Game logic and interactivity
├── preview.png         # Screenshot for README
├── README.md           # This file
├── LICENSE             # MIT License
└── .gitignore          # Git ignore rules
```

## 📖 Code Overview

### HTML (`index.html`)
- Game container with glass morphism styling
- HUD (Head-Up Display) showing time, score, streak
- Dynamic category columns (built by JavaScript)
- Modal system for question/answer previews

### CSS (`style.css`)
- Dark blue gradient background
- Glass morphism effects on containers
- Responsive grid layout
- CSS animations: pop, shake, fade, stagger
- Smooth transitions and hover effects

### JavaScript (`script.js`)
- **Game State**: Track scores, streaks, answered questions
- **Question Bank (BANK)**: 5 categories × 4 Q/A pairs
- **Game Logic**: Match validation, streak counting, win detection
- **Audio/TTS**: Web Audio synthesis + SpeechSynthesis fallback
- **Storage**: localStorage for best scores
- **UI Builder**: Dynamic column and dot creation

## 🎯 Key Features Explained

### Streak System
Consecutive correct answers display with 🔥. Resets on any incorrect match. Best streak saved.

### Match Line
A visual SVG line connects matched question and answer dots, then fades away.

### Best Scores
Automatically saves:
- **Best Time**: Fastest completion time
- **Best Accuracy**: Highest correct/total ratio (percentage)

Stored in browser localStorage as `dotpopBest`.

### Responsive Design
- Desktop: Full layout with side-by-side category columns
- Mobile: Stacked layout, touch-optimized dots
- Breakpoint: 600px

## 🔧 Customization

### Add More Questions
Edit the `BANK` object in `script.js`:
```javascript
const BANK = {
  YourCategory: {
    questions: [
      { id: "Q1", text: "Question text?", answerId: "A1" },
      // ... more questions
    ],
    answers: [
      { id: "A1", text: "Answer text." },
      // ... more answers
    ],
  },
};
```

### Change Colors
Modify the CSS gradient and dot colors in `style.css`:
```css
body {
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
}

.title-text {
  background: linear-gradient(90deg, #00ff99, #00d4ff);
}
```

### Adjust Timing
Change animation speeds in `style.css`:
```css
.dot {
  animation-duration: 0.3s; /* Adjust pop speed */
}
```

## 📝 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this project for personal or commercial purposes.

## 🤝 Contributing

Found a bug? Have an idea? Feel free to open an issue or submit a pull request!

## 🎓 Learning Resources

- [MDN Web Docs: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN Web Docs: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [CSS Tricks: CSS Animations](https://css-tricks.com/almanac/properties/a/animation/)

## 📊 Stats

- **Total Questions**: 20
- **Categories**: 5
- **Total Matches**: 20 (100 dots)
- **File Size**: ~15KB (HTML + CSS + JS combined)
- **Dependencies**: 0
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

**Made with ❤️ for learning and fun.**

Have feedback? [Open an issue](https://github.com/yourusername/dotpop-trivia/issues) or reach out!
