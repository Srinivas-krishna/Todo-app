import { useState, useEffect } from "react";
import API from "../api";

interface Todo{
    todoid: number;
    todoname: string;
    description: string;
    status: boolean;
}
function Dashboard(){
    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [todos,setTodos] = useState<Todo[]>([]);
    const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription,setEditDescription] = useState("");
    const fetchTodos = async()=>{
        try{
            const response = await API.get("/todos");
            setTodos(response.data.todos);
        }catch(error){
            console.log(error);
            alert("Failed to reach todos");
        }
    };
    useEffect(()=>{
        fetchTodos();
    },[]);

    const handleAddTodo = async(e: React.FormEvent) =>{
        e.preventDefault();
        try{
            const response = await API.post("/todo",{
                title,
                description,
            });
            alert(response.data.message);
            setTitle("");
            setDescription("");
            fetchTodos();
        }catch(error){
            console.log(error);
            alert("Failed to add Todo!");
        }
    };
    const handleEdit = (todo: Todo) => {
        setEditingTodoId(todo.todoid);
        setEditTitle(todo.todoname);
        setEditDescription(todo.description);
    };
    const handleUpdate = async(e: React.FormEvent) =>{
        e.preventDefault();
        try{
            await API.put(`/todo/${editingTodoId}`,{
                title:editTitle,
                description:editDescription,
                status:todos.find((todo) => todo.todoid === editingTodoId)?.status ?? false,
            });
            alert("Todo updated succesfully!");
            setEditingTodoId(null);
            fetchTodos();

        }catch(error){
            console.log(error);
            alert("Failed to Update todo");
        }
    };
    return(
        <div>
            <h1>My Todo Dashboard</h1>

            <form onSubmit={handleAddTodo}>
                <input
                type="text"
                placeholder="Enter todo title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                />

                <input
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                />

                <button type="submit">Add Todo</button>
            </form>

            <h2>Your Todos</h2>

            {todos.length === 0 ? (
                <p>No todos yet. Add your first todo!</p>
            ) : (
                todos.map((todo) => (
                <div key={todo.todoid}>
                    {editingTodoId === todo.todoid ? (
                    <form onSubmit={handleUpdate}>
                        <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                        />

                        <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        required
                        />

                        <button type="submit">Save</button>

                        <button
                        type="button"
                        onClick={() => setEditingTodoId(null)}
                        >
                        Cancel
                        </button>
                    </form>
                    ) : (
                    <>
                        <h3>{todo.todoname}</h3>
                        <p>{todo.description}</p>
                        <p>Status: {todo.status ? "Completed" : "Pending"}</p>

                        <button onClick={() => handleEdit(todo)}>
                        Edit
                        </button>
                    </>
                    )}
                </div>
                ))
            )}
        </div>
    );
}
export default Dashboard;