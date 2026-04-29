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
        resetTaskForm();
        modal.style.display = 'flex';
    });
});

closeButton.addEventListener('click', () => {
    resetTaskForm();
    modal.style.display = 'none';
});

backButton.addEventListener('click', () => {
    resetTaskForm();
    modal.style.display = 'none';
});

modal.addEventListener('click', (event) => {
    
    if (event.target === modal) {
        resetTaskForm();
        modal.style.display = 'none';
    }

});

const submitButton = document.querySelector('.submit-task');

const taskName = document.querySelector('[name="taskName"]');
const taskDesc = document.querySelector('[name="taskDesc"]');
const taskLink = document.querySelector('[name="taskLink"]');
const taskDate = document.querySelector('[name="taskDate"]');
const taskTime = document.querySelector('[name="taskTime"]');

function resetTaskForm() {
    taskName.value = '';
    taskDesc.value = '';
    taskLink.value = '';
    taskDate.value = '';
    taskTime.value = '';
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return '';
}

function formatApiErrors(errors) {
    const messages = [];

    if (errors.title) {
        messages.push('Название задачи обязательно.');
    }
    if (errors.description) {
        messages.push('Описание задачи заполнено некорректно.');
    }
    if (errors.resource_url) {
        messages.push('Ссылка на ресурс должна быть корректным URL (https://...).');
    }
    if (errors.deadline) {
        messages.push('Укажите корректный дедлайн.');
    }
    if (errors.status) {
        messages.push('Статус должен быть active или completed.');
    }

    if (!messages.length) {
        return 'Проверьте заполнение полей.';
    }

    return messages.join('\n');
}

submitButton.addEventListener('click', async () => {
    const deadlineDate = taskDate.value;
    const deadlineTime = taskTime.value || '00:00';
    const title = taskName.value.trim();
    const description = taskDesc.value.trim();
    const resourceUrl = taskLink.value.trim();

    if (!title) {
        alert('Введите название задачи.');
        return;
    }

    if (!resourceUrl) {
        alert('Введите ссылку на ресурс.');
        return;
    }

    if (!deadlineDate) {
        alert('Укажите дедлайн.');
        return;
    }

    const deadline = `${deadlineDate}T${deadlineTime}:00Z`;

    const payload = {
        title: title,
        description: description,
        resource_url: resourceUrl,
        deadline: deadline,
        status: 'active'
    };

    try {
        const response = await fetch('/api/tasks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Ошибка сохранения:\n${formatApiErrors(data)}`);
            return;
        }

        modal.style.display = 'none';
        console.log('Задача сохранена в БД:', data);
    } catch (error) {
        alert('Сервер недоступен или произошла ошибка сети.');
        return;
    }

    resetTaskForm();

});