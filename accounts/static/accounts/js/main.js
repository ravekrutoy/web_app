const filters = document.querySelectorAll('.filter');
const header = document.querySelector('.main-header');
let currentFilter = "all";

filters.forEach(function(filter) {
    filter.addEventListener('click', function() {

        filters.forEach(function(f) {
            f.classList.remove('active');
        });

        filter.classList.add('active');

        const type = filter.dataset.filter;
        currentFilter = type === "done" ? "completed" : type;

        if (type === "all") {
            header.textContent = "Мои задачи";
        } else if (type === "active") {
            header.textContent = "Активные";
        } else if (type === "done") {
            header.textContent = "Выполненные";
        }

        loadTasks();
    });
});

const modal = document.querySelector('.modal-overlay');

const taskNameInput = document.querySelector('[name="taskName"]');
const taskNameError = document.querySelector('.task-name-error');
const desc = document.querySelector('[name="taskDesc"]');
const link = document.querySelector('[name="taskLink"]');
const date = document.querySelector('[name="taskDate"]');
const taskDateError = document.querySelector('.task-date-error');
const time = document.querySelector('[name="taskTime"]');

function resetTaskForm() {
    if (taskNameInput) {
        taskNameInput.value = '';
        taskNameInput.classList.remove('error');
    }
    if (taskNameError) {
        taskNameError.textContent = '';
    }
    desc.value = '';
    link.value = '';
    if (date) {
        date.value = '';
        date.classList.remove('error');
    }
    if (taskDateError) {
        taskDateError.textContent = '';
    }
    time.value = '';
}

const openButtons = document.querySelectorAll(
'.add-task-button, .add-task-button-mobile, .add-task-button-null'
);

openButtons.forEach(button => {
    button.addEventListener('click', function(){
        modal.classList.toggle('visible');
    });
});

const closeButton = document.querySelectorAll('.close-modal, .back-modal');

closeButton.forEach(button => {
    button.addEventListener('click', function() {
        modal.classList.toggle('visible');
        resetTaskForm();
    });
});

modal.addEventListener('click', function(event) {
    if (event.target === modal){
        modal.classList.remove('visible');
        resetTaskForm();
    }
});

const exit = document.querySelector('.exit-button');

function loading() {
    exit.classList.add('loading');

    setTimeout(function() {
        exit.classList.remove('loading');
    }   , 1000);
};

const submitButton = document.querySelector('.submit-task');

const tasksList = document.querySelector(".tasks-list");
const emptyTasks = document.querySelector(".if-null-tasks");

submitButton.addEventListener('click', function() {
        const title = taskNameInput.value.trim();
        const description = desc.value.trim();
        const resourceUrl = link.value.trim();
        const deadlineDate = date.value;
        const deadlineTime = time.value;
        const deadline = `${deadlineDate}T${deadlineTime || '00:00'}:00Z`;

        let hasError = false;
        let dateErrorText = '';

        if (!title) {
            if (taskNameError) {
                taskNameError.textContent = 'Обязательное поле';
            }
            taskNameInput.classList.add('error');
            hasError = true;
        } else {
            if (taskNameError) {
                taskNameError.textContent = '';
            }
            taskNameInput.classList.remove('error');
        }

        if (!deadlineDate && !deadlineTime) {
            dateErrorText = 'Обязательное поле';
        } else if (!deadlineDate) {
            dateErrorText = 'Обязательное поле';
        } else if (!deadlineTime) {
            dateErrorText = 'Обязательное поле';
        }

        if (dateErrorText) {
            if (taskDateError) {
                taskDateError.textContent = dateErrorText;
            }
            hasError = true;
        } else {
            if (taskDateError) {
                taskDateError.textContent = '';
            }
        }

        if (!deadlineDate) {
            if (date) {
                date.classList.add('error');
            }
        } else {
            if (date) {
                date.classList.remove('error');
            }
        }

        if (!deadlineTime) {
            if (time) {
                time.classList.add('error');
            }
        } else {
            if (time) {
                time.classList.remove('error');
            }
        }

        if (hasError) {
            return;
        }

        fetch("/api/tasks/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                description: description,
                resource_url: resourceUrl,
                deadline: deadline,
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка при создании задачи");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);

            modal.classList.remove('visible');
            resetTaskForm();

            loadTasks(); 
        })
        .catch(error => {
            console.error(error);
        });
});

function loadTasks() {
    fetch(`/api/tasks/?status=${currentFilter}`)
        .then(response => response.json())
        .then(tasks => {
            if (tasks.length === 0) {
                emptyTasks.style.display = "flex";
                tasksList.style.display = "none";
                return;
            }

            emptyTasks.style.display = "none";
            tasksList.style.display = "block";

            tasksList.innerHTML = "";

            tasks.forEach(task => {
                renderTask(task);
            });
        })  
        .catch(error => {
            console.error(error);
        });
}

function renderTask(task) {

    const card = document.createElement("div");
    card.classList.add("task-card");

    const left = document.createElement("div");
    left.classList.add("task-left");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");
    checkbox.checked = task.status === "completed";

    checkbox.addEventListener("change", function() {
        updateTaskStatus(task.id, checkbox.checked ? "completed" : "active");
    });

    const title = document.createElement("span");
    title.classList.add("task-title");
    title.textContent = task.title;

    left.append(checkbox, title);

    const center = document.createElement("div");
    center.classList.add("task-center");

    const deadline = new Date(task.deadline);

    const calendar = document.createElement("img");
    calendar.src = "/static/accounts/img/calendar.svg";
    calendar.classList.add("task-icon");

    const date = document.createElement("span");
    date.classList.add("task-date");
    date.textContent = deadline.toLocaleDateString("ru-RU");

    const clock = document.createElement("img");
    clock.src = "/static/accounts/img/clock.svg";
    clock.classList.add("task-icon");

    const time = document.createElement("span");
    time.classList.add("task-time");
    time.textContent = deadline.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
    });

    center.append(
        calendar,
        date,
        clock,
        time
    );

    const deleteButton = document.createElement("button");
    deleteButton.addEventListener("click", function () {

        deleteTask(task.id);

    });
    deleteButton.classList.add("delete-task");

    deleteButton.innerHTML =
        '<img src="/static/accounts/img/trash.svg">';

    card.append(
        left,
        center,
        deleteButton
    );

    tasksList.appendChild(card);
}

loadTasks();


function updateTaskStatus(taskId, status) {
    fetch(`/api/tasks/${taskId}/status/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка при обновлении статуса задачи");
        }
        return response.json();
    })  
    .then(data => {
        console.log(data);

        loadTasks();
    })
    .catch(error => {
        console.error(error);
    });

}

function deleteTask(taskId) {

    fetch(`/api/tasks/${taskId}/`, {

        method: "DELETE"

    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Ошибка удаления");
        }

        loadTasks();

    })
    .catch(error => {

        console.error(error);

    });

}