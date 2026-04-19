const filters = document.querySelectorAll('.filter');
const header = document.querySelector('.main-header');

filters.forEach(filter => {
    filter.addEventListener('click', () => {

        filters.forEach(f => f.classList.remove('active'));

        filter.classList.add('active');

        const type = filter.dataset.filter;

        if (type === "all") {
            header.textContent = "Мои задачи";
        } else if (type === "active") {
            header.textContent = "Активные";
        } else if (type === "done") {
            header.textContent = "Выполненные";
        }

    });
});

const modal = document.querySelector('.modal-overlay');
const openButtons = document.querySelectorAll(
'.add-task-button, .add-task-button-mobile, .add-task-button-null'
);
const closeButton = document.querySelector('.close-modal');
const backButton = document.querySelector('.back-modal');

openButtons.forEach(button => {
    button.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

backButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (event) => {
    
    if (event.target === modal) {
        modal.style.display = 'none';
    }

});

const submitButton = document.querySelector('.submit-task');

const taskName = document.querySelector('[name="taskName"]');
const taskDesc = document.querySelector('[name="taskDesc"]');
const taskLink = document.querySelector('[name="taskLink"]');
const taskDate = document.querySelector('[name="taskDate"]');
const taskTime = document.querySelector('[name="taskTime"]');

submitButton.addEventListener('click', () => {

    console.log({
    Название: taskName.value,
    Описание: taskDesc.value,
    Ссылка: taskLink.value,
    Дедлайн: `${taskDate.value} ${taskTime.value}`
    });

    // modal.style.display = 'none';

    taskName.value = '';
    taskDesc.value = '';
    taskLink.value = '';
    taskDate.value = '';
    taskTime.value = '';

});