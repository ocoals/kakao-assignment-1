import { useState, useEffect } from "react";
import TodoForm from "./components/TodoForm";
import FilterTabs from "./components/FilterTabs";
import TodoList from "./components/TodoList";
import WeekStrip from "./components/WeekStrip";
import { useTodos } from "./hooks/useTodos";
import { formatDateKey, parseDateKey } from "./utils/date";

function App() {
  const { todos, addTodo, completeTodo, editTodo, deleteTodo } = useTodos();
  const [currentFilter, setCurrentFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem("selectedDate");
    return saved ? parseDateKey(saved) : new Date();
  });

  useEffect(() => {
    localStorage.setItem("selectedDate", formatDateKey(selectedDate));
  }, [selectedDate]);

  const handleAddTodo = (text) => addTodo(text, formatDateKey(selectedDate));

  const selectedKey = formatDateKey(selectedDate);
  const visibleTodos = todos.filter((todo) => {
    if (todo.date !== selectedKey) return false;
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <h1 className="mb-6 text-center font-lobster text-4xl text-brand">Todo List</h1>
        <WeekStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          todos={todos}
        />
        <TodoForm onAdd={handleAddTodo} />
        <FilterTabs currentFilter={currentFilter} onChange={setCurrentFilter} />
        <TodoList
          todos={visibleTodos}
          onComplete={completeTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;
