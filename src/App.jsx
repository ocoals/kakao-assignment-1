
import { useTodos } from "./hooks/useTodos";
import { useSelectedDate } from "./hooks/useSelectedDate";
import { useFilteredTodos } from "./hooks/useFilteredTodos";
import { formatDateKey } from "./utils/date";
import { FilterTabs, TodoForm, TodoList, WeekStrip } from "./components";

function App() {
  const { todos, addTodo, completeTodo, editTodo, deleteTodo } = useTodos();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const selectedKey = formatDateKey(selectedDate);
  const { currentFilter, setCurrentFilter, visibleTodos } = useFilteredTodos(
    todos,
    selectedKey
  );

  const handleAddTodo = (text) => addTodo(text, selectedKey);

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
