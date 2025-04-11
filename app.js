// Sample vocabulary data with simple words and easy image names
const vocabularyData = [
    {
        image: 'images/cat.png',
        english: 'Cat',
        chinese: '猫'
    },
    {
        image: 'images/dog.png',
        english: 'Dog',
        chinese: '狗'
    },
    {
        image: 'images/book.png',
        english: 'Book',
        chinese: '书'
    },
    {
        image: 'images/tree.png',
        english: 'Tree',
        chinese: '树'
    },
    {
        image: 'images/sun.png',
        english: 'Sun',
        chinese: '太阳'
    }
];

class VocabApp {
    constructor() {
        this.currentIndex = 0;
        this.isAutoMode = false;
        this.revealDelay = 4000; // 4 seconds delay
        this.countdownInterval = null;
        this.hasUserInteracted = false;
        
        // DOM elements
        this.imageElement = document.getElementById('vocab-image');
        this.englishWord = document.getElementById('english-word');
        this.chineseWord = document.getElementById('chinese-word');
        this.nextButton = document.getElementById('next-btn');
        this.progressBar = document.getElementById('progress-bar');
        
        // Initialize TTS manager
        this.ttsManager = new GoogleTTSManager();
        
        // Initialize
        this.initializeApp();
    }
    
    initializeApp() {
        this.loadCurrentItem();
        this.setupEventListeners();
    }
    
    loadCurrentItem() {
        const item = vocabularyData[this.currentIndex];
        if (!item) return;
        
        // Reset state - ensure words are hidden
        this.englishWord.classList.add('hidden');
        this.englishWord.classList.remove('visible');
        this.chineseWord.classList.add('hidden');
        this.chineseWord.classList.remove('visible');
        this.nextButton.classList.add('hidden');
        
        // Reset progress bar to full width
        this.progressBar.style.transition = 'none';
        this.progressBar.style.transform = 'scaleX(1)';
        
        // Force a reflow to ensure the transition reset takes effect
        void this.progressBar.offsetWidth;
        
        // Re-enable transitions
        this.progressBar.style.transition = 'transform 0.1s linear';
        
        // Load image
        this.imageElement.src = item.image;
        
        // Set words - but don't show them yet
        this.englishWord.textContent = item.english;
        this.chineseWord.textContent = item.chinese;
        
        // Start countdown
        this.startCountdown();
    }
    
    startCountdown() {
        const startTime = Date.now();
        const duration = this.revealDelay;
        
        this.countdownInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update progress bar
            this.progressBar.style.transform = `scaleX(${1 - progress})`;
            
            if (progress >= 1) {
                clearInterval(this.countdownInterval);
                this.revealWords();
            }
        }, 16); // Update roughly 60 times per second for smooth animation
    }
    
    revealWords() {
        // First remove hidden class
        this.englishWord.classList.remove('hidden');
        this.chineseWord.classList.remove('hidden');
        
        // Then add visible class after a small delay to ensure DOM updates
        setTimeout(() => {
            this.englishWord.classList.add('visible');
            this.chineseWord.classList.add('visible');
            
            // Show next button in manual mode
            if (!this.isAutoMode) {
                this.nextButton.classList.remove('hidden');
            } else {
                // Auto advance after showing words
                setTimeout(() => this.nextItem(), 2000);
            }
            
            // Only speak if user has interacted with the page
            if (this.hasUserInteracted) {
                this.speakWord(this.englishWord.textContent);
            }
        }, 50);
    }
    
    speakWord(text) {
        // Use Google TTS with fallback to browser TTS
        this.ttsManager.speak(text, 'en-US', 'en-US-Neural2-D');
    }
    
    nextItem() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Complete the progress bar animation before transitioning
        this.progressBar.style.transform = 'scaleX(0)';
        
        // Wait for the animation to complete before loading the next item
        setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % vocabularyData.length;
            this.loadCurrentItem();
        }, 300);
    }
    
    setupEventListeners() {
        // Handle user interaction
        const handleUserInteraction = () => {
            if (!this.hasUserInteracted) {
                this.hasUserInteracted = true;
                // If words are already visible, speak them
                if (this.englishWord.classList.contains('visible')) {
                    this.speakWord(this.englishWord.textContent);
                }
            }
        };

        // Add interaction listeners
        this.nextButton.addEventListener('click', () => {
            handleUserInteraction();
            this.nextItem();
        });

        // Add click listener to the entire container for first interaction
        document.querySelector('.container').addEventListener('click', handleUserInteraction);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VocabApp();
}); 