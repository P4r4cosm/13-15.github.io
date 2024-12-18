// Захардкоженные пользователи и данные
const defaultUsers = [
    { username: 'teacher', password: '1234', role: 'teacher' },
    { username: 'student1', password: 'abcd', role: 'student', personalInfo: { name: 'Иван Иванов', group: 'А-101', id: 'S101' }, grades: [] },
    { username: 'student2', password: 'efgh', role: 'student', personalInfo: { name: 'Петр Петров', group: 'Б-102', id: 'S102' }, grades: [] },
];

class UserManager {
    constructor() {
        this.users = this.loadUsers();
    }

    loadUsers() {
        const savedUsers = localStorage.getItem('users');
        return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            alert('Неверные данные для входа');
            return null;
        }
        return user;
    }

    addGrade(studentUsername, session, subject, grade) {
        const student = this.users.find(user => user.username === studentUsername);
        if (student && !isNaN(grade)) {
            student.grades.push({ session, subject, grade });
            this.saveUsers();
            alert(`Оценка добавлена для ${student.personalInfo.name}`);
        } else {
            alert('Введите корректные данные');
        }
    }

    resetGrades() {
        this.users.filter(user => user.role === 'student').forEach(student => {
            student.grades = [];
        });
        this.saveUsers();
        alert('Оценки всех студентов сброшены');
    }
}

const userManager = new UserManager();

function renderInterface(user) {
    document.body.innerHTML = '';

    if (user.role === 'teacher') {
        renderTeacherInterface();
    } else if (user.role === 'student') {
        renderStudentInterface(user);
    }
}

function renderTeacherInterface() {
    const container = document.createElement('div');
    container.classList.add('container');

    const title = document.createElement('h1');
    title.innerText = 'Интерфейс преподавателя';
    container.appendChild(title);

    const studentSelector = document.createElement('select');
    userManager.users.filter(user => user.role === 'student').forEach(student => {
        const option = document.createElement('option');
        option.value = student.username;
        option.innerText = student.personalInfo.name;
        studentSelector.appendChild(option);
    });
    container.appendChild(studentSelector);

    const sessionSelector = document.createElement('select');
    for (let i = 1; i <= 6; i++) {
        const option = document.createElement('option');
        option.value = `session${i}`;
        option.innerText = `Сессия ${i}`;
        sessionSelector.appendChild(option);
    }
    container.appendChild(sessionSelector);

    const subjectInput = document.createElement('input');
    subjectInput.placeholder = 'Название предмета';
    container.appendChild(subjectInput);

    const gradeInput = document.createElement('input');
    gradeInput.placeholder = 'Оценка';
    gradeInput.type = 'number';
    container.appendChild(gradeInput);

    const gradesDisplay = document.createElement('div');
    gradesDisplay.id = 'gradesDisplay';
    container.appendChild(gradesDisplay);

    const addGradeButton = document.createElement('button');
    addGradeButton.innerText = 'Добавить оценку';
    addGradeButton.onclick = () => {
        const selectedStudent = studentSelector.value;
        const session = sessionSelector.value;
        const subject = subjectInput.value;
        const grade = parseInt(gradeInput.value);

        userManager.addGrade(selectedStudent, session, subject, grade);
        subjectInput.value = '';
        gradeInput.value = '';
        updateGradesDisplay(userManager.users.find(user => user.username === selectedStudent));
    };
    container.appendChild(addGradeButton);

    const resetButton = document.createElement('button');
    resetButton.innerText = 'Сбросить оценки всех студентов';
    resetButton.onclick = () => {
        userManager.resetGrades();
        updateGradesDisplay(null);
    };
    container.appendChild(resetButton);

    studentSelector.onchange = () => {
        const selectedStudent = userManager.users.find(user => user.username === studentSelector.value);
        updateGradesDisplay(selectedStudent);
    };

    document.body.appendChild(container);

    if (studentSelector.value) {
        updateGradesDisplay(userManager.users.find(user => user.username === studentSelector.value));
    }
}

function updateGradesDisplay(student) {
    const gradesDisplay = document.getElementById('gradesDisplay');
    if (!student) {
        gradesDisplay.innerHTML = '<p>Оценки отсутствуют</p>';
        return;
    }
    const sessionGrades = {};
    student.grades.forEach(grade => {
        if (!sessionGrades[grade.session]) {
            sessionGrades[grade.session] = [];
        }
        sessionGrades[grade.session].push(grade);
    });

    let displayHTML = '';
    for (const session in sessionGrades) {
        displayHTML += `<h3>${session}</h3>`;
        displayHTML += sessionGrades[session].map(grade => `<p>${grade.subject}: ${grade.grade}</p>`).join('');
    }
    gradesDisplay.innerHTML = displayHTML || '<p>Оценки отсутствуют</p>';
}

function renderStudentInterface(user) {
    const container = document.createElement('div');
    container.classList.add('container');

    const title = document.createElement('h1');
    title.innerText = `Интерфейс студента - ${user.personalInfo.name}`;
    container.appendChild(title);

    const personalCard = document.createElement('div');
    personalCard.innerHTML = `
        <p>ФИО: ${user.personalInfo.name}</p>
        <p>Группа: ${user.personalInfo.group}</p>
        <p>Шифр: ${user.personalInfo.id}</p>
        <p>Средний балл: ${calculateAverageGrade(user)}</p>
    `;
    container.appendChild(personalCard);

    const gradesList = document.createElement('div');
    const sessionGrades = {};
    user.grades.forEach(grade => {
        if (!sessionGrades[grade.session]) {
            sessionGrades[grade.session] = [];
        }
        sessionGrades[grade.session].push(grade);
    });

    let displayHTML = '';
    for (const session in sessionGrades) {
        displayHTML += `<h3>${session}</h3>`;
        displayHTML += sessionGrades[session].map(grade => `<p>${grade.subject}: ${grade.grade}</p>`).join('');
    }
    gradesList.innerHTML = displayHTML || '<p>Оценки отсутствуют</p>';
    container.appendChild(gradesList);

    document.body.appendChild(container);
}

function calculateAverageGrade(user) {
    if (user.grades.length === 0) return 'Н/Д';
    const sum = user.grades.reduce((total, grade) => total + grade.grade, 0);
    return (sum / user.grades.length).toFixed(2);
}

function renderLogin() {
    const container = document.createElement('div');
    container.classList.add('container');

    const title = document.createElement('h1');
    title.innerText = 'Вход';
    container.appendChild(title);

    const usernameInput = document.createElement('input');
    usernameInput.placeholder = 'Имя пользователя';
    container.appendChild(usernameInput);

    const passwordInput = document.createElement('input');
    passwordInput.placeholder = 'Пароль';
    passwordInput.type = 'password';
    container.appendChild(passwordInput);

    const loginButton = document.createElement('button');
    loginButton.innerText = 'Войти';
    loginButton.onclick = () => {
        const user = userManager.login(usernameInput.value, passwordInput.value);
        if (user) renderInterface(user);
    };
    container.appendChild(loginButton);

    document.body.appendChild(container);
}

renderLogin();
