/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiEdit2, FiTrash2, FiCheckCircle, FiSearch, FiPlus } from "react-icons/fi"; 
import toast from "react-hot-toast";

const Dashboard = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // States
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({ title: "", description: "", status: "pending" });
    const [isEditing, setIsEditing] = useState(null); 
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchTasks = useCallback(async () => {
        try {
            const query = `?search=${search}&status=${filterStatus !== 'all' ? filterStatus : ''}`;
            const res = await axios.get(`http://localhost:5000/api/tasks${query}`);
            setTasks(res.data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }, [search, filterStatus]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Create / Update Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/tasks/${isEditing}`, form);
                toast.success("Task Updated!");
                setIsEditing(null);
            } else {
                await axios.post("http://localhost:5000/api/tasks", form);
                toast.success("Task Added!");
            }
            setForm({ title: "", description: "", status: "pending" });
            fetchTasks();
        } catch (err) {
             console.error(err);
            toast.error("Operation failed");
        }
    };

    // Edit Button Handler
    const handleEdit = (task) => {
        setForm({ title: task.title, description: task.description, status: task.status });
        setIsEditing(task._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete Task
    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${id}`);
            toast.success("Task Deleted");
            fetchTasks();
        } catch (err) {
             console.error(err);
            toast.error("Delete failed");
        }
    };

    // Toggle Status
    const toggleStatus = async (task) => {
        try {
            const newStatus = task.status === 'pending' ? 'completed' : 'pending';
            await axios.put(`http://localhost:5000/api/tasks/${task._id}`, { ...task, status: newStatus });
            fetchTasks();
            toast.success(`Marked as ${newStatus}`);
        } catch (err) {
             console.error(err);
            toast.error("Update failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">TaskApp Dashboard</h1>
                    <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-2 text-slate-600 hover:text-red-500 font-medium transition">
                        <FiLogOut /> Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Form & Profile */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">U</div>
                            <div>
                                <h3 className="font-bold text-slate-800">Hello, User</h3>
                                <p className="text-sm text-slate-500">Welcome back!</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">
                            {isEditing ? <FiEdit2 /> : <FiPlus />} 
                            {isEditing ? "Edit Task" : "Add New Task"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Title" 
                                value={form.title} 
                                onChange={(e) => setForm({...form, title: e.target.value})} 
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                required 
                            />
                            <textarea 
                                placeholder="Description" 
                                value={form.description} 
                                onChange={(e) => setForm({...form, description: e.target.value})} 
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" 
                            />
                            <select 
                                value={form.status} 
                                onChange={(e) => setForm({...form, status: e.target.value})}
                                className="w-full p-2 border rounded-lg bg-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                            
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                                    {isEditing ? "Update Task" : "Add Task"}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={() => { setIsEditing(null); setForm({ title: "", description: "", status: "pending" }); }} className="bg-slate-200 text-slate-700 px-4 rounded-lg hover:bg-slate-300">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: List & Filters */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="p-2 border rounded-lg bg-slate-50 focus:outline-none"
                        >
                            <option value="all">All Tasks</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Task List */}
                    <div className="grid gap-4">
                        {tasks.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">No tasks found based on your filters.</div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task._id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition duration-200 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                {task.title}
                                            </h4>
                                            <p className="text-slate-600 text-sm mt-1">{task.description}</p>
                                            
                                            <span className={`inline-block mt-3 text-xs px-2 py-1 rounded-full font-medium ${
                                                task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={() => toggleStatus(task)} title="Toggle Status" className="p-2 text-green-600 hover:bg-green-50 rounded-full transition">
                                                <FiCheckCircle />
                                            </button>
                                            <button onClick={() => handleEdit(task)} title="Edit" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(task._id)} title="Delete" className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;