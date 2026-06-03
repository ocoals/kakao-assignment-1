/* ===== DOM 요소 가져오기 ===== */
const todoInput = document.getElementById("todoInput");
const addButton = document.getElementById("addButton");
const messageElement = document.getElementById("message");
const todoListElement = document.getElementById("todoList");
const emptyMessageElement = document.getElementById("emptyMessage");

// 필터 탭 버튼들 가져오기
const filterAllButton = document.getElementById("filterAll");
const filterActiveButton = document.getElementById("filterActive");
const filterCompletedButton = document.getElementById("filterCompleted");

// 날짜 이동 관련 요소들 가져오기
const dateDisplayElement = document.getElementById("dateDisplay");
const prevDayButton = document.getElementById("prevDayButton");
const nextDayButton = document.getElementById("nextDayButton");

/* ===== 상태를 기억하는 변수들 ===== */
let currentFilter = "all"; //"all"(전체) | "active"(진행중) | "completed"(완료) 중 하나가 들어간다. 시작할 때는 "전체"가 선택된 상태.
let selectedDate = new Date(); // 현재 보고 있는 날짜 (처음엔 오늘)

/* ===== 날짜 관련 도우미 함수들 ===== */

// Date를 "2026-6-3" 같은 문자열로 만든다. (항목에 저장하고, 같은 날인지 비교하는 용도)
function formatDateKey(date) {
  const year = date.getFullYear();
  // getMonth()는 0부터 시작(1월=0)하므로 +1
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year + "-" + month + "-" + day;
}

function formatDateDisplay(date) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = dayNames[date.getDay()]; // getDay(): 0=일요일 ~ 6=토요일
  return year + "년 " + month + "월 " + day + "일 (" + dayName + ")";
}

// 화면 상단의 날짜 표시를 현재 selectedDate 기준으로 갱신
function updateDateDisplay() {
  dateDisplayElement.textContent = formatDateDisplay(selectedDate);
}

// 날짜를 dayOffset일 만큼 이동한다 (-1: 이전 날, +1: 다음 날)
function changeDate(dayOffset) {
  // 현재 '일'에 이동값을 더해 setDate에 넣으면 월/년 경계도 자동으로 처리된다
  selectedDate.setDate(selectedDate.getDate() + dayOffset);
  updateDateDisplay(); // 바뀐 날짜를 화면에 표시
  applyFilter();       // 그 날짜에 맞는 Todo만 보이도록 갱신
}

/* ===== 안내 메시지 표시 함수 ===== */
function showMessage(text) {
  messageElement.textContent = text;
}

/* ===== 로컬스토리지에 저장하는 함수 =====
   화면의 모든 Todo를 읽어서 배열로 만든 뒤, 문자열로 바꿔 저장한다. */
function saveTodos() {
  const allItems = todoListElement.querySelectorAll(".todo-item");
  const todos = []; // 저장할 Todo들을 담을 빈 배열

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];

    // 항목 하나에서 저장에 필요한 정보 3가지를 꺼낸다
    const text = item.querySelector(".todo-text").textContent;
    const completed = item.classList.contains("completed");
    const date = item.dataset.date;

    // 꺼낸 정보를 객체 하나로 묶어 배열 맨 뒤에 추가한다 (push)
    // { 속성이름: 값 } 형태 — 왼쪽이 이름, 오른쪽이 그 값
    todos.push({ text: text, completed: completed, date: date });
  }

  // 배열은 그대로 저장할 수 없으므로 JSON 문자열로 바꿔서 저장한다
  localStorage.setItem("todos", JSON.stringify(todos));
}

/* ===== 로컬스토리지에서 불러오는 함수 =====
   저장해 둔 문자열을 다시 배열로 되돌려 항목을 복원한다. */
function loadTodos() {
  const saved = localStorage.getItem("todos"); // 저장된 문자열 꺼내기

  // 저장된 게 없으면(처음 방문) null이 온다 -> 아무것도 하지 않고 끝낸다
  if (saved === null) {
    return;
  }

  // 문자열을 다시 배열로 되돌린다
  const todos = JSON.parse(saved);

  // 배열을 하나씩 돌면서 항목을 화면에 다시 만든다
  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    createTodoElement(todo.text, todo.completed, todo.date);
  }
}

/* ===== 날짜 + 상태 필터에 맞는 항목만 보이는 함수 ===== */
function applyFilter() {
  // 목록 안의 모든 todo 항목(li)을 한꺼번에 가져온다
  const allItems = todoListElement.querySelectorAll(".todo-item");
  const selectedDateKey = formatDateKey(selectedDate); // 지금 보고 있는 날자 키
  let itemCounter = 0;

  // 항목을 하나씩 돌면서 보일지 숨길지 결정
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    // 이 항목이 완료 상태인지 확인 (completed 클래스가 있으면 완료)
    const isCompleted = item.classList.contains("completed");
    const itemDate = item.dataset.date; // 이 항목에 저장해 둔 날짜

    // 조건 1) 날짜: 선택한 날짜와 같은가 검사
    const matchesDate = itemDate === selectedDateKey;

    // 조건 2) 상태: 현재 탭(전체/진행 중/완료)에 맞는 항목만
    let matchesStatus = true;
    if (currentFilter === "active") {
      matchesStatus = !isCompleted;
    } else if (currentFilter === "completed") {
      matchesStatus = isCompleted;
    }

    // 두 조건을 모두 만족하면 보여준다 -> 최종 결정을 shouldShow에 담는다
    const shouldShow = matchesDate && matchesStatus;

    // shouldShow 값에 따라 화면에 반영 (보일 땐 flex, 숨길 땐 none)
    if (shouldShow) {
      item.style.display = "flex";
      itemCounter++; // 보이는 항목이 하나 늘었으니 카운터도 1 증가
    } else {
      item.style.display = "none";
    }
  }

  if (itemCounter === 0) {
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
}

/* ===== 필터를 선택하는 함수 =====
   탭을 누르면 호출되며, 선택 상태 기억 + 탭 스타일 변경 + 화면 갱신을 한다. */
function setFilter(filterName) {
  currentFilter = filterName; // 어떤 필터가 선택됐는지 기억

  // 일단 모든 탭에서 active 클래스를 떼어낸다
  filterAllButton.classList.remove("active");
  filterActiveButton.classList.remove("active");
  filterCompletedButton.classList.remove("active");

  // 선택된 탭에만 active 클래스를 다시 붙인다
  if (filterName === "all") {
    filterAllButton.classList.add("active");
  } else if (filterName === "active") {
    filterActiveButton.classList.add("active");
  } else if (filterName === "completed") {
    filterCompletedButton.classList.add("active");
  }

  // 바뀐 필터 기준으로 항목들을 다시 보이거나 숨긴다
  applyFilter();
}

/* ===== Todo 항목(li) 하나를 만들어 화면에 추가하는 함수 =====
   '새로 추가할 때'와 '저장된 걸 복원할 때' 둘 다 이 함수를 사용한다.
   그래서 text, completed, date를 인자로 받아온다. */
function createTodoElement(text, completed, date) {
  // 1) li 요소 만들기
  const listItem = document.createElement("li");
  listItem.className = "todo-item";
  listItem.dataset.date = date; // 날짜 저장

  // 완료된 상태로 복원되는 경우 completed 클래스를 미리 붙인다
  if (completed) {
    listItem.classList.add("completed");
  }

  // 2) 할 일 텍스트
  const todoText = document.createElement("span");
  todoText.className = "todo-text";
  todoText.textContent = text;

  // 3) 버튼 그룹
  const buttonGroup = document.createElement("div");
  buttonGroup.className = "button-group";

  // 4) 수정 버튼
  const editButton = document.createElement("button");
  editButton.className = "item-button edit-button";
  editButton.textContent = "수정";
  editButton.addEventListener("click", function () {
    const newText = prompt("수정할 내용을 입력하세요.", todoText.textContent);
    if (newText !== null && newText.trim() !== "") {
      todoText.textContent = newText.trim();
      saveTodos(); // 수정했으니 저장
    }
  });

  // 5) 완료 버튼 (완료 상태에 맞게 글자 결정)
  const completeButton = document.createElement("button");
  completeButton.className = "item-button complete-button";
  if (completed) {
    completeButton.textContent = "취소";
  } else {
    completeButton.textContent = "완료";
  }
  completeButton.addEventListener("click", function () {
    listItem.classList.toggle("completed");
    if (listItem.classList.contains("completed")) {
      completeButton.textContent = "취소";
    } else {
      completeButton.textContent = "완료";
    }
    applyFilter();
    saveTodos(); // 완료 상태가 바뀌었으니 저장
  });

  // 6) 삭제 버튼
  const deleteButton = document.createElement("button");
  deleteButton.className = "item-button delete-button";
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", function () {
    listItem.remove();
    saveTodos(); // 삭제했으니 저장
  });

  // 7) 버튼들을 그룹에 넣기
  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(completeButton);
  buttonGroup.appendChild(deleteButton);

  // 8) li 조립 후 목록에 추가
  listItem.appendChild(todoText);
  listItem.appendChild(buttonGroup);
  todoListElement.appendChild(listItem);
}

/* ===== 추가 버튼을 눌렀을 때 실행되는 함수 ===== */
function addTodo() {
  // 입력값을 가져오고 앞뒤 공백을 제거한다
  const inputValue = todoInput.value.trim();

  // 입력값이 비어있으면 안내 메시지를 띄우고 함수 종료
  if (inputValue === "") {
    showMessage("할 일을 입력해주세요");
    return;
  }

  // 정상 입력이면 안내 메시지를 비운다
  showMessage("");

  // 새 항목 만들기: 아직 완료 안 됨(false), 날짜는 현재 선택된 날짜
  createTodoElement(inputValue, false, formatDateKey(selectedDate));

  todoInput.value = ""; // 입력창 비우기
  applyFilter(); // 새 항목이 현재 필터에 맞는지 확인해 보이기/숨기기
  saveTodos(); // 변경된 목록을 저장한다
}

/* ===== 이벤트 등록 ===== */
// 추가 버튼을 클릭하면 addTodo 실행
addButton.addEventListener("click", addTodo);

// 입력창에서 Enter 키를 누르면 addTodo 실행
todoInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.isComposing) {
    addTodo();
  }
});

// 각 필터 탭을 누르면 해당 필터를 적용
filterAllButton.addEventListener("click", function () {
  setFilter("all");
});
filterActiveButton.addEventListener("click", function () {
  setFilter("active");
});
filterCompletedButton.addEventListener("click", function () {
  setFilter("completed");
});

// 날짜 이동 버튼 클릭
prevDayButton.addEventListener("click", function () {
  changeDate(-1); // 하루 전으로
});
nextDayButton.addEventListener("click", function () {
  changeDate(1); // 하루 후로
});

/* ===== 시작할 때 실행 =====
   1) 저장된 Todo 불러와 복원 → 2) 오늘 날짜 표시 → 3) 현재 날짜/필터에 맞게 정리 */
loadTodos();
updateDateDisplay();
applyFilter();