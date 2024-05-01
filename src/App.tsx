import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>("");

  useEffect(() => {
    axios
      .get<Todo[]>("http://localhost:5000/todos")
      .then((response) => setTodos(response.data));
  }, []);

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      axios
        .post<Todo>("http://localhost:5000/todos", {
          title: newTodo,
          completed: false,
        })
        .then((response) => {
          setTodos([...todos, response.data]);
          setNewTodo("");
        });
    }
  };

  const deleteTodo = (id: number) => {
    axios.delete(`http://localhost:5000/todos/${id}`).then(() => {
      setTodos(todos.filter((todo) => todo.id !== id));
    });
  };

  const toggleTodo = (id: number) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
        };
      }
      return todo;
    });

    axios
      .put(
        `http://localhost:5000/todos/${id}`,
        updatedTodos.find((todo) => todo.id === id)
      )
      .then(() => {
        setTodos(updatedTodos);
      });
  };

  const startEditingTodo = (id: number, title: string) => {
    setEditingTodoId(id);
    setEditingTodoText(title);
  };

  const finishEditingTodo = (id: number) => {
    if (editingTodoText.trim() !== "") {
      const updatedTodos = todos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            title: editingTodoText,
          };
        }
        return todo;
      });

      axios
        .put(
          `http://localhost:5000/todos/${id}`,
          updatedTodos.find((todo) => todo.id === id)
        )
        .then(() => {
          setTodos(updatedTodos);
          setEditingTodoId(null);
          setEditingTodoText("");
        });
    }
  };

  return (
    <div className="container">
      <h1>Todo App</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
      />
      <button className="add" onClick={addTodo}>
        Add Todo
      </button>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            className="todo-item"
            key={todo.id}
            style={{ textDecoration: todo.completed ? "line-through" : "none" }}
          >
            {editingTodoId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editingTodoText}
                  onChange={(e) => setEditingTodoText(e.target.value)}
                />
                <button
                  className="add"
                  onClick={() => finishEditingTodo(todo.id)}
                >
                  Done
                </button>
              </>
            ) : (
              <div>
                <div onClick={() => toggleTodo(todo.id)}>{todo.title} </div>
              </div>
            )}
            <div>
              <button
                className="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditingTodo(todo.id, todo.title);
                }}
              >
                Edit
              </button>
              <button
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
