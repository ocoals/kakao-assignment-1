import { useState, useEffect } from "react";
import TodoForm from "./components/TodoForm";
import FilterTabs from "./components/FilterTabs";
import TodoList from "./components/TodoList";
import WeekStrip from "./components/WeekStrip";
import { formatDateKey, parseDateKey } from "./utils/date";

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem("selectedDate");
    return saved ? parseDateKey(saved) : new Date();
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("selectedDate", formatDateKey(selectedDate));
  }, [selectedDate]);

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      date: formatDateKey(selectedDate),
    };
    setTodos([...todos, newTodo]);
  };

  const completeTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const editTodo = (id, newText) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const selectedKey = formatDateKey(selectedDate);
  const visibleTodos = todos.filter((todo) => {
    if (todo.date !== selectedKey) return false;
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">할 일 목록</h1>
      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        todos={todos}
      />
      <TodoForm onAdd={addTodo} />
      <FilterTabs currentFilter={currentFilter} onChange={setCurrentFilter} />
      <TodoList
        todos={visibleTodos}
        onComplete={completeTodo}
        onEdit={editTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
}

export default App;
