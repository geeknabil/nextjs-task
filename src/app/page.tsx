'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Backend_URL } from "@/lib/Constants";

import { useSession } from 'next-auth/react';

interface Task {
  id: number;
  title: string;
  status: string;
}


const HomePage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({ title: '', status: 'Uncompleted' });
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [searchTitle, setSearchTitle] = useState('');
    const [trackingTask, setTrackingTask] = useState<Task | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0)
    const { data:session } = useSession()
    
    
    const headers = {
        authorization: `Bearer ${session?.backendTokens.accessToken}`,
        "Content-Type": "application/json",
      }
    
  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(Backend_URL + '/task', {
        headers: headers
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  
  const searchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(Backend_URL + `/task/search?title=${searchTitle}`, {
        headers: headers
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error searching tasks:', error);
    }
  };

  const createTask = async () => {
    try {
      await axios.post(Backend_URL + '/task', newTask, {
        headers: headers
      });
      setNewTask({ title: '', status: 'Uncompleted' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const editTaskHandler = (task: Task) => {
    setEditTask(task);
    setNewTask({ title: task.title, status: task.status });
  };

  const updateTask = async () => {
    try {
      if (editTask) {
        await axios.put(Backend_URL + `/task/${editTask.id}`, newTask, {
            headers: headers
          });
        setEditTask(null);
        setNewTask({ title: '', status: '' });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await axios.delete(Backend_URL + `/task/${taskId}`, {
        headers: headers
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const startTracking = async (taskId: number) => { 
    setTimeSpent(0)
    try {
      await fetch(Backend_URL + `/task/${taskId}/clock-in`, {
        method: "POST",
        headers: {
            authorization: `Bearer ${session?.backendTokens.accessToken}`,
            "Content-Type": "application/json",
          }
      });
    
      setTrackingTask(tasks.find((task) => task.id === taskId) || null);
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  };

  const stopTracking = async (taskId: number) => {
    try {
        const res = await fetch(Backend_URL + `/task/${taskId}/clock-out`, {
            method: "POST",
            headers: {
                authorization: `Bearer ${session?.backendTokens.accessToken}`,
                "Content-Type": "application/json",
              }
          });
        const taskInfo = await res.json()
        setTimeSpent(taskInfo.timeSpent)
      setTrackingTask(null);
      setElapsedTime(0);
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  };


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (trackingTask) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [trackingTask]);

  return (
    <div className="container mx-auto p-4">
      {/* task search */}
      <div className='flex justify-end'>
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            placeholder="Search by title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 flex-grow"
          />
          <button
            onClick={searchTasks}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4 text-center">Task Management</h1>
      {/* Task Creation */}
      <div className="mb-8">
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            placeholder="Enter task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 flex-grow"
          />
          {/* <input
            type="text"
            placeholder="Enter task status"
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 flex-grow"
          /> */}

            <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                <option value="Uncompleted">Uncompleted</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
          {editTask ? (
            <button
              onClick={updateTask}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Update Task
            </button>
          ) : (
            <button
              onClick={createTask}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Create Task
            </button>
          )}
        </div>
      </div>
  
      {/* Task List */}
      <div className="mb-8">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <li key={task.id} className="bg-white p-4 rounded-md shadow-md">
              <p className="text-lg font-semibold">{task.title}</p>
              <p className="text-gray-600">{task.status}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => editTaskHandler(task)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                {!trackingTask && (
                  <button
                    onClick={() => startTracking(task.id)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Start Tracking
                  </button>
                )}
                {trackingTask && trackingTask.id === task.id && (
                  <button
                    onClick={() => stopTracking(task.id)}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Stop Tracking
                  </button>
                )}
              </div>
                {/* Time Tracking */}
                {trackingTask && trackingTask.id === task.id && (
                    <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Time Tracking</h2>
                    <p className="mb-2">Tracking Task: {trackingTask.title}</p>
                    <p className="mb-2">Elapsed Time: {formatTime(elapsedTime)}</p>
                    <p>Time Spent: {formatTime(timeSpent || 0)}</p>
                    </div>
                )}

            </li>
          ))}
        </ul>
      </div>
  
    </div>
  );
  
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours}:${minutes}:${remainingSeconds}`;
};

export default HomePage;
