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
                    <h3>{todo.todoname}</h3>
                    <p>{todo.description}</p>
                    <p>Status: {todo.status ? "Completed" : "Pending"}</p>
                </div>
                ))
            )}
        </div>
    );
}
export default Dashboard;