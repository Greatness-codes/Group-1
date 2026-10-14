const STORAGE_KEY = "todo-done-figma-tasks";

const starterTasks = [
  { id: 1, label: "Text", completed: false },
  { id: 2, label: "Text", completed: false },
  { id: 3, label: "Text", completed: true },
  { id: 4, label: "Text", completed: true },
  { id: 5, label: "Text", completed: true },
  { id: 6, label: "Text", completed: false },
  { id: 7, label: "Text", completed: true },
  { id: 8, label: "Text", completed: true }
];

let tasks = readTasks();
let toastTimer;

const list = document.querySelector("#taskList");
const template = document.querySelector("#taskTemplate");
const form = document.querySelector("#addTaskForm");
const input = document.querySelector("#newTask");
const completedTotal = document.querySelector("#completedTotal");
const taskTotal = document.querySelector("#taskTotal");
const footerStatus = document.querySelector("#footerStatus");
const emptyMessage = document.querySelector("#emptyMessage");
const toast = document.querySelector("#toast");

function readTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : starterTasks;
  } catch {
    return starterTasks;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function completedCount() {
  return tasks.filter(task => task.completed).length;
}

function render() {
  list.innerHTML = "";
  tasks.forEach(task => {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = String(task.id);
    item.classList.toggle("completed", task.completed);
    item.querySelector(".task-text").textContent = task.label;
    item.querySelector(".check-button").setAttribute("aria-label", task.completed ? "Mark task incomplete" : "Mark task complete");
    list.append(item);
  });

  const done = completedCount();
  completedTotal.textContent = String(done);
  taskTotal.textContent = String(tasks.length);
  footerStatus.textContent = `${done} completed`;
  emptyMessage.classList.toggle("hidden", tasks.length !== 0);
  document.querySelector(".progress-badge").setAttribute("aria-label", `${done} of ${tasks.length} tasks complete`);
}

function message(text) {
  toast.textContent = text;
  toast.classList.remove("hidden");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.add("hidden"), 2200);
}

function closeMenus(except) {
  document.querySelectorAll(".task-menu").forEach(menu => {
    if (menu !== except) menu.classList.add("hidden");
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const label = input.value.trim();
  if (!label) {
    input.focus();
    return;
  }
  tasks.push({ id: Date.now(), label, completed: false });
  persist();
  input.value = "";
  render();
  message("Task added");
});

list.addEventListener("click", event => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const row = actionElement.closest(".task-row");
  const task = tasks.find(item => item.id === Number(row.dataset.id));
  if (!task) return;

  switch (actionElement.dataset.action) {
    case "toggle":
      task.completed = !task.completed;
      persist();
      render();
      message(task.completed ? "Task complete" : "Task reopened");
      break;
    case "menu": {
      const menu = row.querySelector(".task-menu");
      const wasHidden = menu.classList.contains("hidden");
      closeMenus(menu);
      menu.classList.toggle("hidden", !wasHidden);
      break;
    }
    case "edit": {
      const nextLabel = window.prompt("Rename task", task.label);
      if (nextLabel && nextLabel.trim()) {
        task.label = nextLabel.trim().slice(0, 70);
        persist();
        render();
        message("Task renamed");
      }
      break;
    }
    case "delete":
      tasks = tasks.filter(item => item.id !== task.id);
      persist();
      render();
      message("Task deleted");
      break;
  }
});

document.querySelector("#clearCompleted").addEventListener("click", () => {
  const done = completedCount();
  if (!done) return message("There are no completed tasks to clear");
  tasks = tasks.filter(task => !task.completed);
  persist();
  render();
  message(`${done} completed ${done === 1 ? "task" : "tasks"} cleared`);
});

document.addEventListener("click", event => {
  if (!event.target.closest(".task-actions")) closeMenus();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenus();
});

render();
