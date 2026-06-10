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
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <h1 className="mb-6 text-center font-lobster text-4xl text-brand">Todo List</h1>
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
    </div>
  );
}

export default App;
