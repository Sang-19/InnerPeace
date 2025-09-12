'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminTask } from '@/lib/types';
import { Plus } from 'lucide-react';

const initialTasks: AdminTask[] = [
    { id: '1', task: 'Check 5 random student journals', status: 'pending' },
    { id: '2', task: 'Review flagged community reports', status: 'completed' },
    { id: '3', task: 'Send a motivational message to students', status: 'pending' },
];

export function AdminTodoList() {
    const [tasks, setTasks] = useState<AdminTask[]>(initialTasks);
    const [newTask, setNewTask] = useState('');

    const handleAddTask = () => {
        if (newTask.trim() === '') return;
        const newTaskItem: AdminTask = {
            id: (tasks.length + 1).toString(),
            task: newTask,
            status: 'pending',
        };
        setTasks([...tasks, newTaskItem]);
        setNewTask('');
    };
    
    const toggleTaskStatus = (taskId: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
                : task
        ));
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Button onClick={handleAddTask}><Plus className="mr-2 h-4 w-4" />Add Task</Button>
            </div>
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg bg-background p-3">
                        <Checkbox 
                            id={`task-${task.id}`} 
                            checked={task.status === 'completed'}
                            onCheckedChange={() => toggleTaskStatus(task.id)}
                        />
                        <label 
                            htmlFor={`task-${task.id}`}
                            className={`flex-1 text-sm ${task.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                        >
                            {task.task}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
