/* ===== DOM 요소 ===== */

const todoInput = document.getElementById("todoInput");
const todoForm = document.getElementById("todoForm");
const messageElement = document.getElementById("message");
const todoListElement = document.getElementById("todoList");
const emptyMessageElement = document.getElementById("emptyMessage");

const filterAllButton = document.getElementById("filterAll");
const filterActiveButton = document.getElementById("filterActive");
const filterCompletedButton = document.getElementById("filterCompleted");

const monthLabelElement = document.getElementById("monthLabel");
const weekStripElement = document.getElementById("weekStrip");
const prevWeekButton = document.getElementById("prevWeekButton");
const nextWeekButton = document.getElementById("nextWeekButton");

/* ===== 상태 ===== */
let currentFilter = "all"; // "all" | "active" | "completed"
let selectedDate = new Date();

// getDay()는 0=일 ~ 6=토 순서로 반환하므로 그에 맞춰 둔다
const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

/* ===== 날짜 도우미 ===== */

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth()는 0부터 시작
  const day = date.getDate();
  return year + "-" + month + "-" + day; // 예: "2026-6-3" (월·일에 0을 붙이지 않음)
};

const getMonday = (date) => {
  const result = new Date(date); // 원본 날짜를 바꾸지 않도록 복사
  const day = result.getDay();
  const offsetToMonday = (day === 0) ? 6 : day - 1; // 일요일(0)은 6일 전이 월요일
  result.setDate(result.getDate() - offsetToMonday);
  return result;
};

const countTodosForDate = (dateKey) => {
  const allItems = todoListElement.querySelectorAll(".todo-item");
  let count = 0;
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].dataset.date === dateKey) {
      count++;
    }
  }
  return count;
};

/* ===== 주간 뷰 ===== */

const renderWeek = () => {
  weekStripElement.innerHTML = "";

  const monday = getMonday(selectedDate);
  const selectedKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());

  monthLabelElement.textContent =
    selectedDate.getFullYear() + "년 " + (selectedDate.getMonth() + 1) + "월";

  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(monday);
    cellDate.setDate(monday.getDate() + i);
    const cellKey = formatDateKey(cellDate);

    const dayCell = document.createElement("button");
    dayCell.className = "day-cell";
    if (cellKey === selectedKey) dayCell.classList.add("selected");
    if (cellKey === todayKey) dayCell.classList.add("today");

    const dayName = document.createElement("span");
    dayName.className = "day-name";
    dayName.textContent = dayNames[cellDate.getDay()];

    const dayNumber = document.createElement("span");
    dayNumber.className = "day-number";
    dayNumber.textContent = cellDate.getDate();

    const dayCount = document.createElement("span");
    dayCount.className = "day-count";
    dayCount.textContent = countTodosForDate(cellKey) + "개";

    dayCell.appendChild(dayName);
    dayCell.appendChild(dayNumber);
    dayCell.appendChild(dayCount);

    dayCell.addEventListener("click", () => {
      selectedDate = new Date(cellDate);
      renderWeek();
      applyFilter();
    });

    weekStripElement.appendChild(dayCell);
  }
};

// weekOffset: -1 이전 주, +1 다음 주
const changeWeek = (weekOffset) => {
  selectedDate.setDate(selectedDate.getDate() + weekOffset * 7);
  renderWeek();
  applyFilter();
};

const showMessage = (text) => {
  messageElement.textContent = text;
};

const updateCompleteLabel = (button, isCompleted) => {
  button.textContent = isCompleted ? "취소" : "완료";
};

/* ===== 저장 / 불러오기 (localStorage) ===== */

const saveTodos = () => {
  const allItems = todoListElement.querySelectorAll(".todo-item");
  const todos = [];

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const text = item.querySelector(".todo-text").textContent;
    const completed = item.classList.contains("completed");
    const date = item.dataset.date;
    todos.push({ text, completed, date });
  }

  localStorage.setItem("todos", JSON.stringify(todos));
};

const loadTodos = () => {
  const saved = localStorage.getItem("todos");
  if (saved === null) {
    return;
  }

  const todos = JSON.parse(saved);
  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    createTodoElement(todo.text, todo.completed, todo.date);
  }
};

/* ===== 필터 ===== */

const applyFilter = () => {
  const allItems = todoListElement.querySelectorAll(".todo-item");
  const selectedDateKey = formatDateKey(selectedDate);
  let visibleCount = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const isCompleted = item.classList.contains("completed");
    const matchesDate = item.dataset.date === selectedDateKey;

    let matchesStatus = true;
    if (currentFilter === "active") {
      matchesStatus = !isCompleted;
    } else if (currentFilter === "completed") {
      matchesStatus = isCompleted;
    }

    const shouldShow = matchesDate && matchesStatus;
    if (shouldShow) {
      item.style.display = "flex";
      visibleCount++;
    } else {
      item.style.display = "none";
    }
  }

  if (visibleCount === 0) {
    emptyMessageElement.style.display = "block";
    if (currentFilter === "active") {
      emptyMessageElement.textContent = "진행중 0개";
    } else if (currentFilter === "completed") {
      emptyMessageElement.textContent = "완료 0개";
    } else {
      emptyMessageElement.textContent = "할 일 0개";
    }
  } else {
    emptyMessageElement.style.display = "none";
  }
};

const setFilter = (filterName) => {
  currentFilter = filterName;

  filterAllButton.classList.remove("active");
  filterActiveButton.classList.remove("active");
  filterCompletedButton.classList.remove("active");

  if (filterName === "all") {
    filterAllButton.classList.add("active");
  } else if (filterName === "active") {
    filterActiveButton.classList.add("active");
  } else if (filterName === "completed") {
    filterCompletedButton.classList.add("active");
  }

  applyFilter();
};

/* ===== Todo 항목 생성 =====
   추가할 때와 저장된 항목을 복원할 때 모두 사용한다. */
const createTodoElement = (text, completed, date) => {
  const listItem = document.createElement("li");
  listItem.className = "todo-item";
  listItem.dataset.date = date;
  if (completed) {
    listItem.classList.add("completed");
  }

  const todoText = document.createElement("span");
  todoText.className = "todo-text";
  todoText.textContent = text;

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "button-group";

  const editButton = document.createElement("button");
  editButton.className = "item-button edit-button";
  editButton.textContent = "수정";
  editButton.addEventListener("click", () => {
    const newText = prompt("수정할 내용을 입력하세요.", todoText.textContent);
    if (newText !== null && newText.trim() !== "") {
      todoText.textContent = newText.trim();
      saveTodos();
    }
  });

  const completeButton = document.createElement("button");
  completeButton.className = "item-button complete-button";
  updateCompleteLabel(completeButton, completed);
  completeButton.addEventListener("click", () => {
    listItem.classList.toggle("completed");
    updateCompleteLabel(completeButton, listItem.classList.contains("completed"));
    applyFilter();
    saveTodos();
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "item-button delete-button";
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", () => {
    listItem.remove();
    applyFilter();
    renderWeek();
    saveTodos();
  });

  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(completeButton);
  buttonGroup.appendChild(deleteButton);

  listItem.appendChild(todoText);
  listItem.appendChild(buttonGroup);
  todoListElement.appendChild(listItem);
};

/* ===== 추가 ===== */
const addTodo = () => {
  const inputValue = todoInput.value.trim();
  if (inputValue === "") {
    showMessage("할 일을 입력해주세요");
    return;
  }
  showMessage("");

  createTodoElement(inputValue, false, formatDateKey(selectedDate));
  todoInput.value = "";
  applyFilter();
  renderWeek();
  saveTodos();
};

/* ===== 이벤트 등록 ===== */

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo();
});

filterAllButton.addEventListener("click", () => {
  setFilter("all");
});
filterActiveButton.addEventListener("click", () => {
  setFilter("active");
});
filterCompletedButton.addEventListener("click", () => {
  setFilter("completed");
});

prevWeekButton.addEventListener("click", () => {
  changeWeek(-1);
});
nextWeekButton.addEventListener("click", () => {
  changeWeek(1);
});

/* ===== 초기 실행 ===== */
loadTodos();
renderWeek();
applyFilter();
