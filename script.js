class PerfectPitchTest {
  constructor() {
    this.synth = new Tone.Synth().toDestination();
    this.currentNote = null;
    this.currentOctave = null;
    this.correctCount = 0;
    this.currentStreak = 0;
    this.notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    this.initializeElements();
    this.addEventListeners();
    this.initializeStreak();
  }

  initializeElements() {
    this.playButton = document.getElementById('playNote');
    this.correctDisplay = document.getElementById('correct');
    this.streakDisplay = document.getElementById('streak');
    this.feedbackElement = document.getElementById('feedback');
    this.noteButtons = document.querySelectorAll('.note-buttons button');
    this.octaveCheckboxes = document.querySelectorAll('.octave-controls input[type="checkbox"]');
    this.dailyStreakDisplay = document.getElementById('dailyStreak');
  }

  addEventListeners() {
    this.playButton.addEventListener('click', () => this.playNewNote());
    this.noteButtons.forEach(button => {
      button.addEventListener('click', (e) => this.checkAnswer(e.target.dataset.note));
    });
  }

  getSelectedOctaves() {
    const selectedOctaves = Array.from(this.octaveCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => parseInt(checkbox.value));
    
    if (selectedOctaves.length === 0) {
      // If no octaves selected, default to octave 4
      this.octaveCheckboxes[2].checked = true;
      return [4];
    }
    return selectedOctaves;
  }

  getRandomNote() {
    const randomNoteIndex = Math.floor(Math.random() * this.notes.length);
    const selectedOctaves = this.getSelectedOctaves();
    const randomOctaveIndex = Math.floor(Math.random() * selectedOctaves.length);
    
    this.currentOctave = selectedOctaves[randomOctaveIndex];
    return this.notes[randomNoteIndex];
  }

  async playNewNote() {
    await Tone.start();
    this.currentNote = this.getRandomNote();
    this.synth.triggerAttackRelease(this.currentNote + this.currentOctave, '1n');
  }

  checkAnswer(selectedNote) {
    if (!this.currentNote) {
      this.feedbackElement.textContent = 'Please play a note first!';
      return;
    }

    if (selectedNote === this.currentNote) {
      this.correctCount++;
      this.currentStreak++;
      this.feedbackElement.textContent = `Correct! (${this.currentNote}${this.currentOctave})`;
      this.feedbackElement.className = 'feedback correct';
    } else {
      this.currentStreak = 0;
      this.feedbackElement.textContent = `Incorrect! The note was ${this.currentNote}${this.currentOctave}`;
      this.feedbackElement.className = 'feedback incorrect';
    }

    this.updateDisplays();

    if (this.correctCount >= 30) {
      this.gameComplete();
    } else {
      setTimeout(() => this.playNewNote(), 1500);
    }
  }

  updateDisplays() {
    this.correctDisplay.textContent = this.correctCount;
    this.streakDisplay.textContent = this.currentStreak;
  }

  initializeStreak() {
    this.lastCompletionDate = localStorage.getItem('lastCompletionDate');
    this.dailyStreak = parseInt(localStorage.getItem('dailyStreak')) || 0;
    
    // Check if streak should be reset
    if (this.lastCompletionDate) {
      const lastDate = new Date(this.lastCompletionDate);
      const today = new Date();
      
      // Set both dates to midnight for proper comparison
      lastDate.setHours(0, 0, 0, 0);
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((todayMidnight - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        this.dailyStreak = 0;
        localStorage.setItem('dailyStreak', '0');
      }
    }
    
    this.updateDailyStreakDisplay();
  }

  updateDailyStreakDisplay() {
    this.dailyStreakDisplay.textContent = this.dailyStreak;
  }

  gameComplete() {
    alert('Congratulations! You\'ve completed the Perfect Pitch Test!');
    
    // Update daily streak using midnight-to-midnight comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    if (this.lastCompletionDate !== today) {
      this.dailyStreak++;
      localStorage.setItem('dailyStreak', this.dailyStreak.toString());
      localStorage.setItem('lastCompletionDate', today);
      this.updateDailyStreakDisplay();
    }
    
    this.correctCount = 0;
    this.currentStreak = 0;
    this.updateDisplays();
    this.feedbackElement.textContent = 'Game complete! Click "Play Note" to start a new game.';
    this.currentNote = null;
    this.currentOctave = null;
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new PerfectPitchTest();
});