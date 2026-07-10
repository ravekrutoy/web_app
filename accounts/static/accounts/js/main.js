const filters = document.querySelectorAll('.filter');
const header = document.querySelector('.main-header');
let currentFilter = "all";
const filterCounts = {
    all: document.getElementById('count-all'),
    active: document.getElementById('count-active'),
    completed: document.getElementById('count-completed'),
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
}

function csrfFetch(url, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    const token = getCookie('csrftoken');

    if (token) {
        headers['X-CSRFToken'] = token;
    }

    return fetch(url, { ...options, headers });
}

function setFilter(filterType) {
    filters.forEach(function(f) {
        f.classList.toggle('active', f.dataset.filter === filterType);
    });

    currentFilter = filterType === "done" ? "completed" : filterType;
    localStorage.setItem('taskFilter', filterType);

    if (filterType === "all") {
        header.textContent = "Мои задачи";
    } else if (filterType === "active") {
        header.textContent = "Активные";
    } else if (filterType === "done") {
        header.textContent = "Выполненные";
    }
}

function updateFilterCounts(counts) {
    if (!counts) return;
    if (filterCounts.all) {
        filterCounts.all.textContent = `(${counts.all})`;
    }
    if (filterCounts.active) {
        filterCounts.active.textContent = `(${counts.active})`;
    }
    if (filterCounts.completed) {
        filterCounts.completed.textContent = `(${counts.completed})`;
    }
}

filters.forEach(function(filter) {
    filter.addEventListener('click', function() {
        setFilter(filter.dataset.filter);
        loadTasks();
    });
});

const savedFilter = localStorage.getItem('taskFilter');
if (savedFilter) {
    setFilter(savedFilter);
}

const modal = document.querySelector('.modal-overlay');

const taskNameInput = document.querySelector('[name="taskName"]');
const taskNameError = document.querySelector('.task-name-error');
const desc = document.querySelector('[name="taskDesc"]');
const link = document.querySelector('[name="taskLink"]');
const taskLinkError = document.querySelector('.task-link-error');
const date = document.querySelector('[name="taskDate"]');
const taskDateError = document.querySelector('.task-date-error');
const time = document.querySelector('[name="taskTime"]');
const tasksLoader = document.querySelector('.tasks-loader');

function setLoading(isLoading) {
    if (tasksLoader) {
        tasksLoader.classList.toggle('visible', isLoading);
    }

    if (isLoading) {
        if (tasksList) {
            tasksList.style.display = 'none';
        }
        if (emptyTasks) {
            emptyTasks.style.display = 'none';
        }
    }
}

function resetTaskForm() {
    if (taskNameInput) {
        taskNameInput.value = '';
        taskNameInput.classList.remove('error');
    }
    if (taskNameError) {
        taskNameError.textContent = '';
    }
    desc.value = '';
    if (link) {
        link.value = '';
        link.classList.remove('error');
    }
    if (taskLinkError) {
        taskLinkError.textContent = '';
    }
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
const emptyTitle = document.querySelector('.empty-title');
const emptySubtitle = document.querySelector('.empty-subtitle');

function setEmptyStateText(filterType) {
    if (!emptyTitle || !emptySubtitle) return;

    if (filterType === 'active') {
        emptyTitle.textContent = 'Активных задач нет';
        emptySubtitle.innerHTML = 'Добавьте новую задачу или снимите отметку с выполненной.';
    } else if (filterType === 'completed') {
        emptyTitle.textContent = 'Здесь ещё нет выполненных задач';
        emptySubtitle.innerHTML = 'Отметьте задачу как выполненную или создайте новую.';
    } else {
        emptyTitle.textContent = 'Здесь пока пусто';
        emptySubtitle.innerHTML = 'Добавьте первую задачу —<br> и она появится в этом списке';
    }
}

submitButton.addEventListener('click', function() {
        const title = taskNameInput.value.trim();
        const description = desc.value.trim();
        const resourceUrl = link.value.trim();
        const deadlineDate = date.value;
        const deadlineTime = time.value;
        const deadline = `${deadlineDate}T${deadlineTime || '00:00'}:00`;

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

        if (resourceUrl) {
            try {
                new URL(resourceUrl);
                if (taskLinkError) {
                    taskLinkError.textContent = '';
                }
                link.classList.remove('error');
            } catch (error) {
                if (taskLinkError) {
                    taskLinkError.textContent = 'Введите корректную ссылку';
                }
                link.classList.add('error');
                hasError = true;
            }
        } else {
            if (taskLinkError) {
                taskLinkError.textContent = '';
            }
            if (link) {
                link.classList.remove('error');
            }
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

        csrfFetch("/api/tasks/", {
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

function loadTasks(showLoader = true) {
    if (showLoader) {
        setLoading(true);
    }

    csrfFetch(`/api/tasks/?status=${currentFilter}`)
        .then(response => response.json())
        .then(data => {
            const tasks = data.tasks || data;
            const counts = data.counts || null;
            updateFilterCounts(counts);

            if (!tasks || tasks.length === 0) {
                setEmptyStateText(currentFilter);
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
        })
        .finally(() => {
            setLoading(false);
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
        const newStatus = checkbox.checked ? "completed" : "active";
        const shouldAnimateRemoval =
            (currentFilter === "active" && newStatus === "completed") ||
            (currentFilter === "completed" && newStatus === "active");

        if (shouldAnimateRemoval) {
            card.classList.add("task-removing");
            title.classList.add("task-title-completed");
            updateTaskStatus(task.id, newStatus).then(() => {
                loadTasks(false);
            });
        } else {
            updateTaskStatus(task.id, newStatus).then(() => {
                loadTasks(false);
            });
        }
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

        deleteTask(task.id, false);

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
    return csrfFetch(`/api/tasks/${taskId}/status/`, {
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
        return data;
    })
    .catch(error => {
        console.error(error);
        throw error;
    });
}

function deleteTask(taskId, showLoader = true) {

    csrfFetch(`/api/tasks/${taskId}/`, {

        method: "DELETE"

    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Ошибка удаления");
        }

        loadTasks(showLoader);

    })
    .catch(error => {

        console.error(error);

    });

}
