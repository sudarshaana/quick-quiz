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
        this.instantAnswerCheckbox = document.getElementById('instantAnswer');
        this.overlay = document.getElementById('overlay');
        this.quizDialog = document.getElementById('quizDialog');
        this.closeDialog = document.getElementById('closeDialog');
        this.questionCounter = document.getElementById('questionCounter');
        this.questionText = document.getElementById('questionText');
        this.optionsContainer = document.getElementById('optionsContainer');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.showAnswerBtn = document.getElementById('showAnswerBtn');
        this.resultDialog = document.getElementById('resultDialog');
        this.scoreElement = document.getElementById('score');
        this.totalQuestionsElement = document.getElementById('totalQuestions');
        this.percentageElement = document.getElementById('percentage');
        this.retryBtn = document.getElementById('retryBtn');
        this.doneBtn = document.getElementById('doneBtn');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.startQuiz());
        this.closeDialog.addEventListener('click', () => this.closeQuiz());
        this.prevBtn.addEventListener('click', () => this.navigateQuestion(-1));
        this.nextBtn.addEventListener('click', () => this.navigateQuestion(1));
        this.showAnswerBtn.addEventListener('click', () => this.toggleAnswer());
        this.retryBtn.addEventListener('click', () => this.retryQuiz());
        this.doneBtn.addEventListener('click', () => this.closeQuiz());
    }

    startQuiz() {
        try {
            this.quizData = JSON.parse(this.quizJson.value);
            if (!this.validateQuizData()) {
                alert('Invalid quiz data format');
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
            alert('Invalid JSON format');
        }
    }

    validateQuizData() {
        return this.quizData &&
               Array.isArray(this.quizData.questions) &&
               this.quizData.questions.length > 0 &&
               this.quizData.questions.every(q => q.question && q.options && q.answer);
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
        this.showAnswerBtn.style.display = this.quizData.instantAnswer ? 'none' : 'block';

        if (this.quizData.instantAnswer) {
            this.toggleAnswer();
        }
    }

    selectAnswer(answer) {
        this.userAnswers[this.currentQuestionIndex] = answer;
        this.loadQuestion();
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
        this.showAnswer = !this.showAnswer;
        const options = this.optionsContainer.querySelectorAll('.option');
        options.forEach((option) => {
            if (this.showAnswer && option.textContent === this.quizData.questions[this.currentQuestionIndex].answer) {
                option.style.backgroundColor = '#27ae60';
                option.style.color = 'white';
            } else if (!this.showAnswer) {
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