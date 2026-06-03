/* ===== DOM 요소 가져오기 =====
   HTML에 있는 요소들을 id로 찾아서 변수에 담아둔다. */
const todoInput = document.getElementById("todoInput");
const addButton = document.getElementById("addButton");
const messageElement = document.getElementById("message");
const todoListElement = document.getElementById("todoList");

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
// 화면에 보여주는 값이 아니라 '비교'만 할 거라서, 앞에 0을 채우지 않아도 문제없다.
function formatDateKey(date) {
  const year = date.getFullYear();
  // getMonth()는 0부터 시작(1월=0)하므로 +1
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year + "-" + month + "-" + day;
}

// Date 객체를 "2026년 6월 3일 (화)" 형태의 보기 좋은 문자열로 변환 (화면 표시용)
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

/* ===== 안내 메시지 표시 함수 =====
   빈 입력 등 사용자에게 보여줄 글을 message 영역에 출력한다. */
function showMessage(text) {
  messageElement.textContent = text;
}

/* ===== 날짜 + 상태 필터에 맞는 항목만 보이는 함수 ===== */
function applyFilter() {
  // 목록 안의 모든 todo 항목(li)을 한꺼번에 가져온다
  const allItems = todoListElement.querySelectorAll(".todo-item");
  const selectedDateKey = formatDateKey(selectedDate); // 지금 보고 있는 날자 키

  // 항목을 하나씩 돌면서 보일지 숨길지 결정
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    // 이 항목이 완료 상태인지 확인 (completed 클래스가 있으면 완료)
    const isCompleted = item.classList.contains("completed");
    const itemDate = item.dataset.date; // 이 항목에 저장해 둔 날짜

    // 조건 1) 날짜: 선택한 날짜와 같은가?
    const matchesDate = itemDate === selectedDateKey;

    // 조건 2) 상태: 현재 탭(전체/진행 중/완료)에 맞는 항목만
    let matchesStatus = true;
    if (currentFilter === "active") {
      matchesStatus = !isCompleted;
    } else if (currentFilter === "completed") {
      matchesStatus = isCompleted;
    }

    // 두 조건을 모두 만족하면 보여준다 → 최종 결정을 shouldShow에 담는다
    const shouldShow = matchesDate && matchesStatus;

    // shouldShow 값에 따라 화면에 반영 (보일 땐 flex, 숨길 땐 none)
    if (shouldShow) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
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

  // 선택된 탭에만 active 클래스를 다시 붙인다 (강조 스타일 적용)
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

/* ===== Todo 하나를 만들어 목록에 추가하는 함수 ===== */
function addTodo() {
  // 입력값을 가져오고 앞뒤 공백을 제거한다
  const inputValue = todoInput.value.trim();

  // 입력값이 비어있으면 안내 메시지를 띄우고 함수 종료
  if (inputValue === "") {
    showMessage("할 일을 입력해주세요.");
    return;
  }

  // 정상 입력이면 안내 메시지를 비운다
  showMessage("");

  // 1) 항목 전체를 담을 li 요소 만들기
  const listItem = document.createElement("li");
  listItem.className = "todo-item";
  // 현재 선택된 날짜를 이 항목에 저장해 둔다 (나중에 날짜별로 거를 때 사용)
  listItem.dataset.date = formatDateKey(selectedDate);

  // 2) 할 일 텍스트를 담을 span 만들기
  const todoText = document.createElement("span");
  todoText.className = "todo-text";
  todoText.textContent = inputValue;

  // 3) 버튼들을 담을 그룹 만들기
  const buttonGroup = document.createElement("div");
  buttonGroup.className = "button-group";

  // 4) 수정 버튼 만들기
  const editButton = document.createElement("button");
  editButton.className = "item-button edit-button";
  editButton.textContent = "수정";
  // 수정 버튼을 누르면 prompt 창으로 새 내용을 입력받는다
  editButton.addEventListener("click", function () {
    const newText = prompt("수정할 내용을 입력하세요.", todoText.textContent);
    // '취소'를 누르면 newText는 null이 된다. null이 아니고 빈 값도 아닐 때만 교체
    if (newText !== null && newText.trim() !== "") {
      todoText.textContent = newText.trim();
    }
  });

  // 5) 완료 버튼 만들기
  const completeButton = document.createElement("button");
  completeButton.className = "item-button complete-button";
  completeButton.textContent = "완료";
  // 완료 버튼을 누르면 completed 클래스를 켜거나 끈다
  completeButton.addEventListener("click", function () {
    // toggle: 클래스가 없으면 추가, 있으면 제거
    listItem.classList.toggle("completed");

    // 현재 완료 상태인지 확인해서 버튼 글자를 바꾼다
    if (listItem.classList.contains("completed")) {
      completeButton.textContent = "취소";
    } else {
      completeButton.textContent = "완료";
    }

    // 완료 상태가 바뀌었으니 현재 필터 기준으로 다시 보이기/숨기기
    applyFilter();
  });

  // 6) 삭제 버튼 만들기
  const deleteButton = document.createElement("button");
  deleteButton.className = "item-button delete-button";
  deleteButton.textContent = "삭제";
  // 삭제 버튼을 누르면 이 항목(li)을 화면에서 제거한다
  deleteButton.addEventListener("click", function () {
    listItem.remove();
  });

  // 7) 버튼 3개를 버튼 그룹 안에 넣기
  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(completeButton);
  buttonGroup.appendChild(deleteButton);

  // 8) li 안에 텍스트와 버튼 그룹을 넣어 조립하기
  listItem.appendChild(todoText);
  listItem.appendChild(buttonGroup);

  // 9) 완성된 항목을 목록(ul)에 추가하기
  todoListElement.appendChild(listItem);

  // 10) 다음 입력을 위해 입력창 비우기
  todoInput.value = "";

  // 11) 새 항목이 현재 필터에 맞는지 확인해 보이기/숨기기
  applyFilter();
}

/* ===== 이벤트 등록 ===== */
// 추가 버튼을 클릭하면 addTodo 실행
addButton.addEventListener("click", addTodo);

// 입력창에서 Enter 키를 누르면 addTodo 실행
todoInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
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

/* ===== 시작할 때 오늘 날짜를 화면에 표시 ===== */
updateDateDisplay();