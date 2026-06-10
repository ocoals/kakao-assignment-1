import TodoItem from "./TodoItem";

function TodoList({ todos, onComplete, onEdit, onDelete }) {
  if (todos.length === 0) {
    return <p className="mt-5 text-center text-subtle">할 일이 없어요</p>;
  }

  return (
    <ul className="mt-5 flex flex-col gap-2.5">
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
