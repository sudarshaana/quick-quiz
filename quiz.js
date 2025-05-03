class Quiz {
    constructor() {
        this.quizData = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.showAnswer = false;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.quizJson = document.getElementById('quizJson');
        this.generateBtn = document.getElementById('generateBtn');
        this.promptGeneratorBtn = document.getElementById('promptGeneratorBtn');
        this.instantAnswerCheckbox = document.getElementById('instantAnswer');
        this.overlay = document.getElementById('overlay');
        this.promptDialog = document.getElementById('promptDialog');
        this.closePromptDialogBtn = document.getElementById('closePromptDialog');
        this.cancelPromptBtn = document.getElementById('cancelPromptBtn');
        this.topicInput = document.getElementById('topic');
        this.questionCountInput = document.getElementById('questionCount');
        this.generatedPrompt = document.getElementById('generatedPrompt');
        this.copyPromptBtn = document.getElementById('copyPromptBtn');
        this.quizDialog = document.getElementById('quizDialog');
        this.closeDialog = document.getElementById('closeDialog');
        this.questionCounter = document.getElementById('questionCounter');
        this.questionText = document.getElementById('questionText');
        this.optionsContainer = document.getElementById('optionsContainer');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        // this.showAnswerBtn = document.getElementById('showAnswerBtn');
        this.resultDialog = document.getElementById('resultDialog');
        this.scoreElement = document.getElementById('score');
        this.totalQuestionsElement = document.getElementById('totalQuestions');
        this.percentageElement = document.getElementById('percentage');
        this.retryBtn = document.getElementById('retryBtn');
        this.doneBtn = document.getElementById('doneBtn');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.startQuiz());
        this.promptGeneratorBtn.addEventListener('click', () => this.openPromptDialog());
        this.closePromptDialogBtn.addEventListener('click', () => this.closePromptDialog());
        this.cancelPromptBtn.addEventListener('click', () => this.closePromptDialog());
        this.topicInput.addEventListener('input', () => this.generatePrompt());
        this.questionCountInput.addEventListener('input', () => this.generatePrompt());
        this.copyPromptBtn.addEventListener('click', () => this.copyPrompt());
        this.closeDialog.addEventListener('click', () => this.closeQuiz());
        this.prevBtn.addEventListener('click', () => this.navigateQuestion(-1));
        this.nextBtn.addEventListener('click', () => this.navigateQuestion(1));
        // this.showAnswerBtn.addEventListener('click', () => this.toggleAnswer());
        this.retryBtn.addEventListener('click', () => this.retryQuiz());
        this.doneBtn.addEventListener('click', () => this.closeQuiz());
    }

    openPromptDialog() {
        this.overlay.classList.remove('hidden');
        this.promptDialog.classList.remove('hidden');
        this.generatePrompt();
    }

    closePromptDialog() {
        this.overlay.classList.add('hidden');
        this.promptDialog.classList.add('hidden');
    }

    generatePrompt() {
        const topic = this.topicInput.value.trim();
        const questionCount = this.questionCountInput.value;

        if (!topic) {
            this.generatedPrompt.value = 'Please enter a topic to generate the prompt.';
            return;
        }

        const prompt = `Generate a quiz with ${questionCount} questions about "${topic}". The quiz should follow this JSON format:

{
    "questions": [
        {
            "question": "Question text here",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": "Correct answer text"
        }
    ],
    "instantAnswer": false
}

Requirements:
1. Each question should have exactly 4 options
2. The answer should be one of the options
3. Questions should be diverse and cover different aspects of the topic
4. Make the questions challenging but fair
5. Include a mix of factual and conceptual questions
6. Ensure the options are plausible and not obviously wrong
7. The answer should be the exact text of the correct option

Please provide the complete JSON for the quiz.`;

        this.generatedPrompt.value = prompt;
    }

    copyPrompt() {
        this.generatedPrompt.select();
        document.execCommand('copy');
        this.copyPromptBtn.textContent = 'Copied!';
        setTimeout(() => {
            this.copyPromptBtn.textContent = 'Copy Prompt';
        }, 2000);
    }

    startQuiz() {
        try {
            // Clean the JSON input
            let cleanedJson = this.quizJson.value
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
                .replace(/[\r\n\t]/g, '') // Remove line breaks and tabs
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Add quotes around keys
                .replace(/:\s*'([^']*)'/g, ':"$1"') // Replace single quotes with double quotes
                .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes
                .replace(/\\"/g, '"') // Unescape quotes
                .trim(); // Remove leading/trailing whitespace

            // Try to parse the cleaned JSON
            this.quizData = JSON.parse(cleanedJson);

            if (!this.validateQuizData()) {
                alert('Invalid quiz data format. Please check that your JSON has the correct structure with questions, options, and answers.');
                return;
            }
            this.quizData.instantAnswer = this.instantAnswerCheckbox.checked;
            this.currentQuestionIndex = 0;
            this.userAnswers = new Array(this.quizData.questions.length).fill(null);
            this.showAnswer = false;
            this.overlay.classList.remove('hidden');
            this.quizDialog.classList.remove('hidden');
            this.loadQuestion();
        } catch (error) {
            console.error('JSON Parse Error:', error);
            console.error('Cleaned JSON:', this.quizJson.value
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace(/[\r\n\t]/g, '')
                .replace(/\s+/g, ' ')
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:\s*'([^']*)'/g, ':"$1"')
                .replace(/([^\\])"/g, '$1\\"')
                .replace(/\\"/g, '"')
                .trim());
            alert('Invalid JSON format. Please check your input and try again. Make sure to use proper JSON syntax with double quotes for keys and strings.', error);
        }
    }

    validateQuizData() {
        if (!this.quizData || !Array.isArray(this.quizData.questions)) {
            return false;
        }

        return this.quizData.questions.every(question => {
            return question &&
                   typeof question.question === 'string' &&
                   Array.isArray(question.options) &&
                   question.options.length > 0 &&
                   typeof question.answer === 'string' &&
                   question.options.includes(question.answer);
        });
    }

    loadQuestion() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        this.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.quizData.questions.length}`;
        this.questionText.textContent = question.question;

        this.optionsContainer.innerHTML = '';
        question.options.forEach((option) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            if (this.userAnswers[this.currentQuestionIndex] === option) {
                optionElement.classList.add('selected');
            }
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.selectAnswer(option));
            this.optionsContainer.appendChild(optionElement);
        });

        this.updateNavigationButtons();
        // this.showAnswerBtn.style.display = this.quizData.instantAnswer ? 'none' : 'block';

        // Reset answer visibility when loading a new question
        this.showAnswer = false;
        this.toggleAnswer();
    }

    selectAnswer(answer) {
        this.userAnswers[this.currentQuestionIndex] = answer;
        if (this.quizData.instantAnswer) {
            this.showAnswer = true;
        }
        this.toggleAnswer();
    }

    navigateQuestion(direction) {
        this.currentQuestionIndex += direction;
        if (this.currentQuestionIndex < 0) {
            this.currentQuestionIndex = 0;
        } else if (this.currentQuestionIndex >= this.quizData.questions.length) {
            this.showResults();
            return;
        }
        this.loadQuestion();
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        this.nextBtn.textContent = this.currentQuestionIndex === this.quizData.questions.length - 1 ? 'Finish' : 'Next';
    }

    toggleAnswer() {
        const options = this.optionsContainer.querySelectorAll('.option');
        const correctAnswer = this.quizData.questions[this.currentQuestionIndex].answer;

        options.forEach((option) => {
            if (this.showAnswer && option.textContent === correctAnswer) {
                option.style.backgroundColor = '#27ae60';
                option.style.color = 'white';
            } else if (option.textContent === this.userAnswers[this.currentQuestionIndex]) {
                option.style.backgroundColor = '#3498db';
                option.style.color = 'white';
            } else {
                option.style.backgroundColor = '';
                option.style.color = '';
            }
        });
    }

    showResults() {
        const correctAnswers = this.userAnswers.reduce((count, answer, index) => {
            return count + (answer === this.quizData.questions[index].answer ? 1 : 0);
        }, 0);

        const percentage = Math.round((correctAnswers / this.quizData.questions.length) * 100);

        this.scoreElement.textContent = correctAnswers;
        this.totalQuestionsElement.textContent = this.quizData.questions.length;
        this.percentageElement.textContent = percentage;

        this.quizDialog.classList.add('hidden');
        this.resultDialog.classList.remove('hidden');
    }

    retryQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.quizData.questions.length).fill(null);
        this.resultDialog.classList.add('hidden');
        this.quizDialog.classList.remove('hidden');
        this.loadQuestion();
    }

    closeQuiz() {
        this.overlay.classList.add('hidden');
        this.quizDialog.classList.add('hidden');
        this.resultDialog.classList.add('hidden');
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});