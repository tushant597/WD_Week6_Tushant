
/* =========================================
   TASKFLOW - TASK MANAGEMENT
========================================= */


/* =========================================
   TASK DATA
========================================= */

/*
    Each task is an object.

    All task objects are stored inside
    the tasks array.
*/

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [
    {
        id: 1,
        title: "Complete JavaScript assignment",
        description: "Finish the final JavaScript exercises.",
        category: "study",
        priority: "high",
        dueDate: "2026-09-12",
        completed: false
    },

    {
        id: 2,
        title: "Plan weekly schedule",
        description: "Organize tasks and priorities for the week.",
        category: "personal",
        priority: "medium",
        dueDate: "2026-09-10",
        completed: true
    }
];


/*
    Stores the ID of the task currently
    being edited.

    null means we are adding a new task.
*/

let editingTaskId = null;


/* =========================================
   DOM ELEMENTS
========================================= */

const taskForm = document.getElementById("task-form");

const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskCategory = document.getElementById("task-category");
const taskDate = document.getElementById("task-date");

const submitButton = document.getElementById("submit-task-button");

const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const taskSearch = document.getElementById("task-search");

const statusFilter = document.getElementById("status-filter");
const categoryFilter = document.getElementById("category-filter");
const priorityFilter = document.getElementById("priority-filter");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const highPriorityTasks = document.getElementById("high-priority-tasks");

const taskTitleError = document.getElementById("task-title-error");


/* =========================================
   GET SELECTED PRIORITY
========================================= */

function getSelectedPriority() {

    const selectedPriority = document.querySelector(
        'input[name="priority"]:checked'
    );

    return selectedPriority ? selectedPriority.value : "low";
}


/* =========================================
   GENERATE TASK ID
========================================= */

function generateTaskId() {

    if (tasks.length === 0) {
        return 1;
    }

    const ids = tasks.map(function (task) {
        return task.id;
    });

    return Math.max(...ids) + 1;
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "No due date";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


/* =========================================
   CAPITALIZE TEXT
========================================= */

function capitalize(text) {

    if (!text) {
        return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1);
}


/* =========================================
   ESCAPE HTML
========================================= */

/*
    This prevents user-entered text from
    being interpreted as HTML.
*/

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================
   CREATE TASK CARD
========================================= */

function createTaskCard(task) {

    const article = document.createElement("article");

    article.className = "task-card";

    if (task.completed) {
        article.classList.add("completed");
    }

    article.dataset.id = task.id;

    article.innerHTML = `
        <div class="task-card-header">

            <div>
                <span class="task-category">
                    ${escapeHTML(capitalize(task.category))}
                </span>

                <h3>
                    ${escapeHTML(task.title)}
                </h3>
            </div>

            <span class="priority priority-${escapeHTML(task.priority)}">
                ${escapeHTML(capitalize(task.priority))}
            </span>

        </div>

        <p class="task-description">
            ${task.description
            ? escapeHTML(task.description)
            : "No description provided."
        }
        </p>

        <div class="task-meta">

            <span>
                Due: ${formatDate(task.dueDate)}
            </span>

            <span>
                ${task.completed
            ? "Completed"
            : "Pending"
        }
            </span>

        </div>

        <div class="task-actions">

            <button
                type="button"
                class="complete-task-button"
                data-id="${task.id}"
            >
                ${task.completed ? "Mark Pending" : "Complete"}
            </button>

            <button
                type="button"
                class="edit-task-button"
                data-id="${task.id}"
            >
                Edit
            </button>

            <button
                type="button"
                class="delete-task-button"
                data-id="${task.id}"
            >
                Delete
            </button>

        </div>
    `;

    return article;
}


/* =========================================
   DISPLAY TASKS
========================================= */

function displayTasks(taskArray) {

    /*
        Remove all existing task cards.
    */

    const existingCards = taskList.querySelectorAll(".task-card");

    existingCards.forEach(function (card) {
        card.remove();
    });


    /*
        Display empty state when there
        are no matching tasks.
    */

    if (taskArray.length === 0) {

        emptyState.style.display = "block";

        emptyState.querySelector("h3").textContent =
            tasks.length === 0
                ? "No tasks yet"
                : "No matching tasks";

        emptyState.querySelector("p").textContent =
            tasks.length === 0
                ? "Add your first task using the form above."
                : "Try changing your search or filters.";

        return;
    }


    emptyState.style.display = "none";


    /*
        Create and display every task card.
    */

    taskArray.forEach(function (task) {

        const card = createTaskCard(task);

        taskList.appendChild(card);

    });
}


/* =========================================
   FILTER TASKS
========================================= */

function getFilteredTasks() {

    const searchValue = taskSearch.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedPriority = priorityFilter.value;


    return tasks.filter(function (task) {

        /*
            Search title and description.
        */

        const matchesSearch =
            task.title.toLowerCase().includes(searchValue) ||
            task.description.toLowerCase().includes(searchValue);


        /*
            Check status.
        */

        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "completed" && task.completed) ||
            (selectedStatus === "pending" && !task.completed);


        /*
            Check category.
        */

        const matchesCategory =
            selectedCategory === "all" ||
            task.category === selectedCategory;


        /*
            Check priority.
        */

        const matchesPriority =
            selectedPriority === "all" ||
            task.priority === selectedPriority;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory &&
            matchesPriority
        );
    });
}


/* =========================================
   REFRESH TASK DISPLAY
========================================= */

function refreshTasks() {

    const filteredTasks = getFilteredTasks();

    displayTasks(filteredTasks);

    updateStatistics();
}


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateStatistics() {

    const total = tasks.length;


    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;


    const pending = tasks.filter(function (task) {
        return !task.completed;
    }).length;


    const highPriority = tasks.filter(function (task) {
        return task.priority === "high" && !task.completed;
    }).length;


    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    highPriorityTasks.textContent = highPriority;
}


/* =========================================
   VALIDATE FORM
========================================= */

/* =========================================
   VALIDATE FORM
========================================= */

function validateForm() {

    let isValid = true;

    taskTitleError.textContent = "";


    /* Check title */

    const title = taskTitle.value.trim();

    if (title === "") {

        taskTitleError.textContent =
            "Please enter a task title.";

        taskTitle.focus();

        return false;
    }


    if (title.length < 3) {

        taskTitleError.textContent =
            "Task title must contain at least 3 characters.";

        taskTitle.focus();

        return false;
    }


    /* Check category */

    if (taskCategory.value === "") {

        alert("Please select a task category.");

        taskCategory.focus();

        isValid = false;
    }


    /* Check due date */

    if (taskDate.value === "") {

        alert("Please select a due date.");

        taskDate.focus();

        isValid = false;

    } else {

        const selectedDate = new Date(
            taskDate.value + "T00:00:00"
        );

        const today = new Date();

        today.setHours(0, 0, 0, 0);


        if (selectedDate < today) {

            alert("Due date cannot be in the past.");

            taskDate.focus();

            isValid = false;
        }
    }


    return isValid;
}


/* =========================================
   RESET FORM
========================================= */

function resetTaskForm() {

    taskForm.reset();

    taskTitleError.textContent = "";

    editingTaskId = null;

    submitButton.textContent = "Add Task";
}


/* =========================================
   ADD OR EDIT TASK
========================================= */

function handleFormSubmit(event) {

    event.preventDefault();


    /*
        Stop if validation fails.
    */

    if (!validateForm()) {
        return;
    }


    const title = taskTitle.value.trim();

    const description = taskDescription.value.trim();

    const category = taskCategory.value;

    const priority = getSelectedPriority();

    const dueDate = taskDate.value;


    /*
        EDIT EXISTING TASK
    */

    if (editingTaskId !== null) {

        const task = tasks.find(function (item) {
            return item.id === editingTaskId;
        });


        if (task) {

            task.title = title;
            task.description = description;
            task.category = category;
            task.priority = priority;
            task.dueDate = dueDate;
        }


        submitButton.textContent = "Add Task";

        editingTaskId = null;

    } else {

        /*
            ADD NEW TASK
        */

        const newTask = {
            id: generateTaskId(),
            title: title,
            description: description,
            category: category,
            priority: priority,
            dueDate: dueDate,
            completed: false
        };


        tasks.push(newTask);
    }


    /*
        Clear form and refresh UI.
    */

    resetTaskForm();

    saveTasks();

    refreshTasks();
}


/* =========================================
   EDIT TASK
========================================= */

function editTask(taskId) {

    const task = tasks.find(function (item) {
        return item.id === taskId;
    });


    if (!task) {
        return;
    }


    taskTitle.value = task.title;

    taskDescription.value = task.description;

    taskCategory.value = task.category;

    taskDate.value = task.dueDate;


    /*
        Select the task's priority.
    */

    const priorityRadio = document.querySelector(
        `input[name="priority"][value="${task.priority}"]`
    );


    if (priorityRadio) {
        priorityRadio.checked = true;
    }


    editingTaskId = task.id;

    submitButton.textContent = "Update Task";


    /*
        Scroll back to the form.
    */

    document.getElementById("add-task").scrollIntoView({
        behavior: "smooth"
    });


    taskTitle.focus();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(taskId) {

    const task = tasks.find(function (item) {
        return item.id === taskId;
    });


    if (!task) {
        return;
    }


    const shouldDelete = confirm(
        `Delete "${task.title}"?`
    );


    if (!shouldDelete) {
        return;
    }


    tasks = tasks.filter(function (item) {
        return item.id !== taskId;
    });

    saveTasks();

    refreshTasks();
}


/* =========================================
   TOGGLE TASK STATUS
========================================= */

function toggleTaskStatus(taskId) {

    const task = tasks.find(function (item) {
        return item.id === taskId;
    });


    if (!task) {
        return;
    }


    task.completed = !task.completed;

    saveTasks();

    refreshTasks();
}


/* =========================================
   TASK BUTTON EVENTS
========================================= */

/*
    Event delegation is used here.

    Instead of creating separate event listeners
    for every task button, we listen on the
    task list and identify which button was clicked.
*/

taskList.addEventListener("click", function (event) {

    const button = event.target.closest("button");


    if (!button) {
        return;
    }


    const taskId = Number(button.dataset.id);


    if (button.classList.contains("complete-task-button")) {

        toggleTaskStatus(taskId);

    } else if (button.classList.contains("edit-task-button")) {

        editTask(taskId);

    } else if (button.classList.contains("delete-task-button")) {

        deleteTask(taskId);
    }
});


/* =========================================
   SEARCH EVENT
========================================= */

taskSearch.addEventListener("input", function () {

    refreshTasks();
});


/* =========================================
   FILTER EVENTS
========================================= */

statusFilter.addEventListener("change", function () {

    refreshTasks();
});


categoryFilter.addEventListener("change", function () {

    refreshTasks();
});


priorityFilter.addEventListener("change", function () {

    refreshTasks();
});


/* =========================================
   FORM SUBMIT EVENT
========================================= */

taskForm.addEventListener("submit", handleFormSubmit);


/* =========================================
   FORM RESET EVENT
========================================= */

taskForm.addEventListener("reset", function () {

    setTimeout(function () {

        editingTaskId = null;

        submitButton.textContent = "Add Task";

        taskTitleError.textContent = "";

    }, 0);
});

/* =========================================
   SAVE TASKS
========================================= */

function saveTasks() {
    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}

/* =========================================
   INITIAL DISPLAY
========================================= */

refreshTasks();

