import { useState } from "react";

export function useFilteredTodos(todos, dateKey) {
  const [currentFilter, setCurrentFilter] = useState("all");

  const visibleTodos = todos.filter((todo) => {
    if (todo.date !== dateKey) return false;
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  return { currentFilter, setCurrentFilter, visibleTodos };
}
