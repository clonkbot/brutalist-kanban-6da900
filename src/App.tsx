import { useState, useCallback } from 'react';

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MED' | 'HIGH';
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'BACKLOG',
    tasks: [
      { id: '1', title: 'Design system documentation', priority: 'LOW', createdAt: '2024.01.15' },
      { id: '2', title: 'Fix mobile navigation bugs', priority: 'HIGH', createdAt: '2024.01.14' },
    ],
  },
  {
    id: 'in-progress',
    title: 'IN_PROGRESS',
    tasks: [
      { id: '3', title: 'Implement drag and drop', priority: 'MED', createdAt: '2024.01.13' },
    ],
  },
  {
    id: 'review',
    title: 'REVIEW',
    tasks: [
      { id: '4', title: 'Code review: auth module', priority: 'HIGH', createdAt: '2024.01.12' },
    ],
  },
  {
    id: 'done',
    title: 'DONE',
    tasks: [
      { id: '5', title: 'Setup project structure', priority: 'LOW', createdAt: '2024.01.10' },
    ],
  },
];

const priorityStyles = {
  LOW: 'bg-[#A3B18A] text-black',
  MED: 'bg-[#FFB703] text-black',
  HIGH: 'bg-[#E63946] text-white',
};

function App() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColumnId: string } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((task: Task, columnId: string) => {
    setDraggedTask({ task, sourceColumnId: columnId });
  }, []);

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedTask) return;

    if (draggedTask.sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setColumns(prev => prev.map(col => {
      if (col.id === draggedTask.sourceColumnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.task.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, tasks: [...col.tasks, draggedTask.task] };
      }
      return col;
    }));

    setDraggedTask(null);
  }, [draggedTask]);

  const addTask = useCallback((columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: 'MED',
      createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    };

    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ));

    setNewTaskTitle('');
    setAddingToColumn(null);
  }, [newTaskTitle]);

  const deleteTask = useCallback((columnId: string, taskId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
        : col
    ));
  }, []);

  const cyclePriority = useCallback((columnId: string, taskId: string) => {
    const priorities: Array<'LOW' | 'MED' | 'HIGH'> = ['LOW', 'MED', 'HIGH'];
    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? {
            ...col,
            tasks: col.tasks.map(t =>
              t.id === taskId
                ? { ...t, priority: priorities[(priorities.indexOf(t.priority) + 1) % 3] }
                : t
            ),
          }
        : col
    ));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* HEADER */}
      <header className="border-b-4 border-black bg-white p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none">
            KANBAN
          </h1>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs md:text-sm text-gray-500">v0.0.1</span>
            <div className="hidden sm:block w-2 h-2 bg-[#E63946] animate-pulse" />
          </div>
        </div>
        <p className="font-mono text-xs md:text-sm mt-2 text-gray-600 uppercase tracking-widest">
          // raw task management
        </p>
      </header>

      {/* MAIN BOARD */}
      <main className="flex-1 p-3 md:p-6 overflow-x-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-h-[60vh]">
          {columns.map((column, columnIndex) => (
            <div
              key={column.id}
              className="flex-1 min-w-[280px] md:min-w-[300px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column.id)}
              style={{ animationDelay: `${columnIndex * 100}ms` }}
            >
              {/* Column Header */}
              <div className="border-4 border-black bg-black text-white p-3 md:p-4 mb-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg md:text-xl font-black tracking-tight">
                    {column.title}
                  </h2>
                  <span className="font-mono text-xs border border-white px-2 py-1">
                    {String(column.tasks.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="border-4 border-t-0 border-black bg-white min-h-[200px] md:min-h-[400px] p-3 md:p-4 space-y-3">
                {column.tasks.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    className="group border-2 border-black bg-white hover:bg-[#FFFBEB] transition-colors cursor-grab active:cursor-grabbing hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] duration-150"
                    style={{ animationDelay: `${(columnIndex * 100) + (taskIndex * 50)}ms` }}
                  >
                    {/* Task Priority Bar */}
                    <div className={`h-2 ${priorityStyles[task.priority]}`} />

                    {/* Task Content */}
                    <div className="p-3">
                      <p className="font-mono text-sm md:text-base leading-tight mb-3">
                        {task.title}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-gray-500">
                          {task.createdAt}
                        </span>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => cyclePriority(column.id, task.id)}
                            className={`font-mono text-[10px] px-2 py-1 border border-black ${priorityStyles[task.priority]} hover:scale-105 transition-transform min-w-[44px] min-h-[28px]`}
                          >
                            {task.priority}
                          </button>
                          <button
                            onClick={() => deleteTask(column.id, task.id)}
                            className="font-mono text-[10px] px-2 py-1 border border-black bg-white hover:bg-[#E63946] hover:text-white transition-colors min-w-[28px] min-h-[28px]"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Task Form */}
                {addingToColumn === column.id ? (
                  <div className="border-2 border-dashed border-black p-3 animate-pulse-border">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTask(column.id)}
                      placeholder="ENTER_TASK_TITLE"
                      autoFocus
                      className="w-full font-mono text-sm bg-transparent border-b-2 border-black focus:outline-none placeholder:text-gray-400 py-2"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => addTask(column.id)}
                        className="flex-1 font-mono text-xs py-2 border-2 border-black bg-black text-white hover:bg-[#A3B18A] hover:text-black transition-colors min-h-[44px]"
                      >
                        ADD
                      </button>
                      <button
                        onClick={() => {
                          setAddingToColumn(null);
                          setNewTaskTitle('');
                        }}
                        className="flex-1 font-mono text-xs py-2 border-2 border-black bg-white hover:bg-gray-100 transition-colors min-h-[44px]"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToColumn(column.id)}
                    className="w-full font-mono text-xs py-3 border-2 border-dashed border-gray-400 text-gray-500 hover:border-black hover:text-black hover:bg-[#FFFBEB] transition-all group/add min-h-[44px]"
                  >
                    <span className="group-hover/add:tracking-wider transition-all">+ NEW_TASK</span>
                  </button>
                )}
              </div>

              {/* Column Footer */}
              <div className="border-4 border-t-0 border-black bg-[#F5F5F0] p-2">
                <div className="flex justify-between items-center font-mono text-[10px] text-gray-500">
                  <span>COL_{String(columnIndex + 1).padStart(2, '0')}</span>
                  <span>{column.id.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* INSTRUCTIONS BAR */}
      <div className="border-t-4 border-black bg-[#FFFBEB] p-3 md:p-4">
        <div className="flex flex-wrap gap-4 md:gap-8 justify-center font-mono text-[10px] md:text-xs text-gray-600">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-black text-white">DRAG</kbd>
            MOVE TASKS
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-black text-white">CLICK</kbd>
            PRIORITY
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[#E63946] text-white">X</kbd>
            DELETE
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t-2 border-gray-300 bg-white py-3 px-4">
        <p className="text-center font-mono text-[10px] md:text-xs text-gray-400 tracking-wider">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default App;
