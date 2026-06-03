/* ===== DOM 요소 가져오기 =====
   HTML에 있는 요소들을 id로 찾아서 변수에 담아둔다. */
const todoInput = document.getElementById("todoInput");
const addButton = document.getElementById("addButton");
const messageElement = document.getElementById("message");
const todoListElement = document.getElementById("todoList");

/* ===== 안내 메시지 표시 함수 =====
   빈 입력 등 사용자에게 보여줄 글을 message 영역에 출력한다. */
function showMessage(text) {
  messageElement.textContent = text;
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
  editButton.onclick = function () {
    const newText = prompt("수정할 내용을 입력하세요.", todoText.textContent);
    // '취소'를 누르면 newText는 null이 된다. null이 아니고 빈 값도 아닐 때만 교체
    if (newText !== null && newText.trim() !== "") {
      todoText.textContent = newText.trim();
    }
  };

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