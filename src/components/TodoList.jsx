import TodoItem from "./TodoItem";

function TodoList({ todos, onComplete, onEdit, onDelete }) {
  if (todos.length === 0) {
    return <p className="text-center text-gray-400">할 일이 없어요</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TodoList;
