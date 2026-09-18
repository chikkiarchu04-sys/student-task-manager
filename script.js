const input = document.querySelector('input[placeholder="Enter your task"]');
const button = document.querySelector("button");
const list = document.querySelector("ul");
const priority = document.querySelector("#priority");
const dueDate = document.querySelector("#dueDate");
const taskCount = document.querySelector("#taskCount");

const searchTask = document.querySelector("#searchTask");
const filterPriority = document.querySelector("#filterPriority");


// Dashboard
const dashboard = document.createElement("div");

dashboard.innerHTML = `
    <div>
        <strong id="totalNumber">0</strong>
        <span>Total</span>
    </div>

    <div>
        <strong id="completedNumber">0</strong>
        <span>Completed</span>
    </div>

    <div>
        <strong id="pendingNumber">0</strong>
        <span>Pending</span>
    </div>

    <div>
        <strong id="overdueNumber">0</strong>
        <span>Overdue</span>
    </div>

    <p>Progress</p>

    <progress id="progressBar" value="0" max="100"></progress>

    <span id="progressText">0%</span>
`;

dashboard.style.padding = "15px";
dashboard.style.margin = "15px 0";
dashboard.style.borderRadius = "12px";
dashboard.style.background = "#ffffff";
dashboard.style.textAlign = "center";
dashboard.style.lineHeight = "2";

taskCount.after(dashboard);


let savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];


// Today's Date
function getTodayString() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Overdue Status
function updateOverdueStatus(task, taskDueDate) {

    let overdueText = task.querySelector(".overdue");

    const isOverdue =
        taskDueDate !== "" &&
        taskDueDate < getTodayString() &&
        task.dataset.completed !== "true";


    if (isOverdue && !overdueText) {

        overdueText = document.createElement("span");

        overdueText.className = "overdue";

        overdueText.textContent = "⚠ Overdue";

        overdueText.style.color = "red";

        overdueText.style.fontWeight = "bold";

        task.appendChild(overdueText);
    }


    if (!isOverdue && overdueText) {

        overdueText.remove();

    }
}


// Update Dashboard and Task Count
function updateTaskCount() {

    const tasks = list.querySelectorAll("li");

    let completed = 0;
    let overdue = 0;


    tasks.forEach(function(task) {

        if (task.dataset.completed === "true") {
            completed++;
        }

        const due = task.querySelector(".due-date");

        if (
            due &&
            task.dataset.completed !== "true" &&
            due.textContent.replace("Due: ", "") < getTodayString()
        ) {
            overdue++;
        }

    });


    const total = tasks.length;
    const pending = total - completed;

    let progress = 0;

    if (total > 0) {
        progress = Math.round((completed / total) * 100);
    }


    taskCount.textContent =
        "Total Tasks: " + total +
        " | Completed: " + completed +
        " | Pending: " + pending;


    document.querySelector("#totalNumber").textContent = total;

    document.querySelector("#completedNumber").textContent = completed;

    document.querySelector("#pendingNumber").textContent = pending;

    document.querySelector("#overdueNumber").textContent = overdue;

    document.querySelector("#progressBar").value = progress;

    document.querySelector("#progressText").textContent =
        progress + "%";

}


// Save Tasks
function saveTasks() {

    const tasks = [];


    list.querySelectorAll("li").forEach(function(task) {

        tasks.push({

            text: task.querySelector(".task-text").textContent,

            priority: task.querySelector(".priority").textContent,

            dueDate: task.querySelector(".due-date")
                ? task.querySelector(".due-date").textContent.replace("Due: ", "")
                : "",

            completed: task.dataset.completed === "true"

        });

    });


    localStorage.setItem("tasks", JSON.stringify(tasks));

}


// Search and Filter
function filterTasks() {

    const searchValue =
        searchTask.value.toLowerCase().trim();

    const selectedPriority =
        filterPriority.value;


    list.querySelectorAll("li").forEach(function(task) {

        const taskText =
            task.querySelector(".task-text")
            .textContent
            .toLowerCase();


        const taskPriority =
            task.querySelector(".priority")
            .textContent;


        const matchesSearch =
            taskText.includes(searchValue);


        const matchesPriority =
            selectedPriority === "All" ||
            taskPriority === selectedPriority;


        if (matchesSearch && matchesPriority) {

            task.style.display = "";

        } else {

            task.style.display = "none";

        }

    });

}


// Create Task
function createTask(taskData) {

    const task = document.createElement("li");

    const isCompleted =
        taskData.completed === true;


    task.dataset.completed = isCompleted;


    // Task Text
    const taskText = document.createElement("span");

    taskText.textContent = taskData.text;

    taskText.className = "task-text";


    if (isCompleted) {

        taskText.style.textDecoration =
            "line-through";

    }


    task.appendChild(taskText);


    // Priority
    const priorityText = document.createElement("span");

    priorityText.textContent =
        taskData.priority;

    priorityText.className =
        "priority " +
        taskData.priority.toLowerCase();


    task.appendChild(priorityText);


    // Due Date
    if (taskData.dueDate !== "") {

        const dueDateText =
            document.createElement("span");

        dueDateText.textContent =
            "Due: " + taskData.dueDate;

        dueDateText.className =
            "due-date";

        task.appendChild(dueDateText);

    }


    // Complete Button
    const completeButton =
        document.createElement("button");

    completeButton.textContent =
        "Complete";

    completeButton.type = "button";


    completeButton.addEventListener(
        "click",
        function() {

            if (task.dataset.completed === "false") {

                task.dataset.completed = "true";

                taskText.style.textDecoration =
                    "line-through";

            } else {

                task.dataset.completed = "false";

                taskText.style.textDecoration =
                    "none";

            }


            updateOverdueStatus(
                task,
                taskData.dueDate
            );

            saveTasks();

            updateTaskCount();

        }
    );


    task.appendChild(completeButton);


    // Edit Button
    const editButton =
        document.createElement("button");

    editButton.textContent = "Edit";

    editButton.type = "button";


    editButton.addEventListener(
        "click",
        function() {

            const newTask =
                window.prompt(
                    "Edit your task:",
                    taskText.textContent
                );


            if (
                newTask !== null &&
                newTask.trim() !== ""
            ) {

                taskText.textContent =
                    newTask.trim();

                saveTasks();

                updateTaskCount();

                filterTasks();

            }

        }
    );


    task.appendChild(editButton);


    // Delete Button
    const deleteButton =
        document.createElement("button");

    deleteButton.textContent =
        "Delete";

    deleteButton.type = "button";


    deleteButton.addEventListener(
        "click",
        function() {

            task.remove();

            saveTasks();

            updateTaskCount();

            filterTasks();

        }
    );


    task.appendChild(deleteButton);


    // Add Task
    list.appendChild(task);


    // Check Overdue
    updateOverdueStatus(
        task,
        taskData.dueDate
    );

}


// Add Task
button.addEventListener(
    "click",
    function() {

        if (input.value.trim() !== "") {

            const taskData = {

                text: input.value.trim(),

                priority: priority.value,

                dueDate: dueDate.value,

                completed: false

            };


            createTask(taskData);

            saveTasks();

            updateTaskCount();

            filterTasks();


            input.value = "";

            dueDate.value = "";

        }

    }
);


// Search
searchTask.addEventListener(
    "input",
    function() {

        filterTasks();

    }
);


// Priority Filter
filterPriority.addEventListener(
    "change",
    function() {

        filterTasks();

    }
);


// Load Saved Tasks
savedTasks.forEach(
    function(taskData) {

        createTask(taskData);

    }
);


// Initial Update
updateTaskCount();

filterTasks();