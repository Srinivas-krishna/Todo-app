function Dashboard(){
    return(
        <div>
            <h1><b>My To-Do Dashboard</b></h1>
            <div>
                <input type= "text" placeholder="Enter new todo"/>
                <button>Add ToDo</button>
            </div>
            <h2>Your ToDos</h2>
            <p>No todos yet...Add your first Todo!</p>
        </div>
    );
}
export default Dashboard;