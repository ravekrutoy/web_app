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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return '';
}

submitButton.addEventListener('click', async () => {
    const deadlineDate = taskDate.value;
    const deadlineTime = taskTime.value || '00:00';
    const deadline = deadlineDate ? `${deadlineDate}T${deadlineTime}:00` : '';

    const payload = {
        title: taskName.value,
        description: taskDesc.value,
        resource_url: taskLink.value,
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
            alert(`Ошибка сохранения: ${JSON.stringify(data)}`);
            return;
        }

        modal.style.display = 'none';
        console.log('Задача сохранена в БД:', data);
    } catch (error) {
        alert('Сервер недоступен или произошла ошибка сети.');
        return;
    }

    taskName.value = '';
    taskDesc.value = '';
    taskLink.value = '';
    taskDate.value = '';
    taskTime.value = '';

});