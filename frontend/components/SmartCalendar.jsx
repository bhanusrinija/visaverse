'use client';

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  Download,
  Share2,
  Bell,
  Plus,
  Trash2,
  Edit,
  Target,
  Zap,
  Flag
} from 'lucide-react';
import { getRelocationTimeline, generateCalendarEvents } from '../lib/api';

export default function SmartCalendar() {
  const [loading, setLoading] = useState(false);
  const [relocationData, setRelocationData] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', date: '', priority: 'medium' });
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('relocationData');
    if (data) {
      setRelocationData(JSON.parse(data));
    }
  }, []);

  const handleGenerateTimeline = async () => {
    if (!relocationData?.destination) {
      alert('Please complete the onboarding form first to set your destination.');
      return;
    }

    setLoading(true);
    try {
      const response = await getRelocationTimeline({
        destination: relocationData.destination,
        departureDate: relocationData.departureDate,
        visaType: relocationData.visaType,
        relocationType: relocationData.relocationType
      });

      setTimeline(response.data);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error generating timeline:', error);
      // Set fallback timeline
      const fallbackTimeline = generateFallbackTimeline(relocationData);
      setTimeline(fallbackTimeline);
      setTasks(fallbackTimeline.tasks);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.date) {
      alert('Please fill in all fields');
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title,
      date: newTask.date,
      priority: newTask.priority,
      completed: false,
      type: 'custom'
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', date: '', priority: 'medium' });
    setShowAddTask(false);
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleExportCalendar = () => {
    // Generate ICS file for calendar import
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VisaVerse//Relocation Calendar//EN\n';

    tasks.forEach(task => {
      const date = new Date(task.date);
      const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `DTSTART:${dateStr}\n`;
      icsContent += `SUMMARY:${task.title}\n`;
      icsContent += `DESCRIPTION:${task.description || 'Relocation task'}\n`;
      icsContent += `PRIORITY:${task.priority === 'high' ? '1' : task.priority === 'medium' ? '5' : '9'}\n`;
      icsContent += 'END:VEVENT\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visaverse-relocation-calendar.ics';
    a.click();
  };

  const getDaysUntil = (dateString) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTasksByPhase = () => {
    const phases = {
      immediate: [],
      thisWeek: [],
      thisMonth: [],
      later: []
    };

    tasks.forEach(task => {
      const daysUntil = getDaysUntil(task.date);
      if (daysUntil < 0) return; // Skip past tasks

      if (daysUntil <= 3) phases.immediate.push(task);
      else if (daysUntil <= 7) phases.thisWeek.push(task);
      else if (daysUntil <= 30) phases.thisMonth.push(task);
      else phases.later.push(task);
    });

    return phases;
  };

  const tasksByPhase = tasks.length > 0 ? getTasksByPhase() : null;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Smart Relocation Calendar</h2>
            <p className="text-sm text-slate-600">Your complete timeline from planning to arrival</p>
          </div>
        </div>

        {relocationData?.departureDate && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-info/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Departure Date</p>
                <p className="text-xl font-bold text-primary">
                  {new Date(relocationData.departureDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">Days Remaining</p>
                <p className="text-3xl font-bold text-accent">
                  {getDaysUntil(relocationData.departureDate)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      {timeline && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Overall Progress
            </h3>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
              <span className="text-sm text-slate-600 ml-2">
                ({completedCount}/{totalCount} tasks)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCalendar}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Calendar
            </button>
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                reminderEnabled
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bell className={`w-4 h-4 ${reminderEnabled ? 'animate-pulse' : ''}`} />
              {reminderEnabled ? 'Reminders On' : 'Enable Reminders'}
            </button>
            <button
              onClick={() => setShowAddTask(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom Task
            </button>
          </div>
        </div>
      )}

      {/* Generate Timeline Button */}
      {!timeline && (
        <div className="glass-card p-6">
          <button
            onClick={handleGenerateTimeline}
            disabled={loading || !relocationData?.destination}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Your Timeline...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Smart Timeline
              </>
            )}
          </button>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="glass-card p-6 border-2 border-primary">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Custom Task
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Book flight tickets"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddTask} className="btn-primary flex-1">
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTask({ title: '', date: '', priority: 'medium' });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks by Phase */}
      {tasksByPhase && (
        <div className="space-y-6">
          {/* Immediate Tasks */}
          {tasksByPhase.immediate.length > 0 && (
            <TaskPhaseSection
              title="Urgent - Next 3 Days"
              icon={<AlertTriangle className="w-5 h-5 text-danger" />}
              color="danger"
              tasks={tasksByPhase.immediate}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              getDaysUntil={getDaysUntil}
            />
          )}

          {/* This Week */}
          {tasksByPhase.thisWeek.length > 0 && (
            <TaskPhaseSection
              title="This Week"
              icon={<Zap className="w-5 h-5 text-warning" />}
              color="warning"
              tasks={tasksByPhase.thisWeek}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              getDaysUntil={getDaysUntil}
            />
          )}

          {/* This Month */}
          {tasksByPhase.thisMonth.length > 0 && (
            <TaskPhaseSection
              title="This Month"
              icon={<CalendarIcon className="w-5 h-5 text-info" />}
              color="info"
              tasks={tasksByPhase.thisMonth}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              getDaysUntil={getDaysUntil}
            />
          )}

          {/* Later */}
          {tasksByPhase.later.length > 0 && (
            <TaskPhaseSection
              title="Future Tasks"
              icon={<Flag className="w-5 h-5 text-primary" />}
              color="primary"
              tasks={tasksByPhase.later}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              getDaysUntil={getDaysUntil}
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {!timeline && !loading && (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-info/10 flex items-center justify-center">
            <CalendarIcon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Plan Your Journey?</h3>
          <p className="text-slate-600 mb-4">
            Generate your personalized timeline with all important dates and tasks for your relocation.
          </p>
        </div>
      )}
    </div>
  );
}

// Task Phase Section Component
function TaskPhaseSection({ title, icon, color, tasks, onToggle, onDelete, getDaysUntil }) {
  const colorClasses = {
    danger: 'border-danger bg-danger/5',
    warning: 'border-warning bg-warning/5',
    info: 'border-info bg-info/5',
    primary: 'border-primary bg-primary/5'
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>

      <div className="space-y-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border-l-4 ${colorClasses[color]} transition-all ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggle(task.id)}
                className="mt-1 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 hover:text-primary" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4
                    className={`font-semibold ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-700'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.type === 'custom' && (
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-slate-400 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {task.description && (
                  <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(task.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-4 h-4" />
                    {getDaysUntil(task.date)} days
                  </div>
                  {task.priority && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        task.priority === 'high'
                          ? 'bg-danger/10 text-danger'
                          : task.priority === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fallback timeline generator
function generateFallbackTimeline(relocationData) {
  const departureDate = new Date(relocationData?.departureDate || Date.now() + 90 * 24 * 60 * 60 * 1000);
  const today = new Date();

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  };

  const tasks = [
    // Immediate tasks
    {
      id: 1,
      title: 'Research visa requirements',
      description: 'Understand documentation and timeline for your visa application',
      date: addDays(today, 2),
      priority: 'high',
      completed: false,
      type: 'system'
    },
    {
      id: 2,
      title: 'Book flight tickets',
      description: 'Search for best deals and book your flights early',
      date: addDays(today, 5),
      priority: 'high',
      completed: false,
      type: 'system'
    },
    // This week
    {
      id: 3,
      title: 'Apply for visa',
      description: 'Submit visa application with all required documents',
      date: addDays(today, 7),
      priority: 'high',
      completed: false,
      type: 'system'
    },
    {
      id: 4,
      title: 'Get travel insurance',
      description: 'Purchase comprehensive travel and health insurance',
      date: addDays(today, 10),
      priority: 'medium',
      completed: false,
      type: 'system'
    },
    // This month
    {
      id: 5,
      title: 'Book accommodation',
      description: 'Secure temporary or permanent housing at destination',
      date: addDays(today, 14),
      priority: 'high',
      completed: false,
      type: 'system'
    },
    {
      id: 6,
      title: 'Notify bank and credit card companies',
      description: 'Inform financial institutions about your travel',
      date: addDays(today, 20),
      priority: 'medium',
      completed: false,
      type: 'system'
    },
    {
      id: 7,
      title: 'Get vaccinations',
      description: 'Complete required and recommended vaccinations',
      date: addDays(today, 25),
      priority: 'medium',
      completed: false,
      type: 'system'
    },
    // Later
    {
      id: 8,
      title: 'Create packing list',
      description: 'Prepare comprehensive list based on climate and duration',
      date: addDays(departureDate, -21),
      priority: 'medium',
      completed: false,
      type: 'system'
    },
    {
      id: 9,
      title: 'Arrange transportation from airport',
      description: 'Book taxi, shuttle, or arrange pickup at destination',
      date: addDays(departureDate, -14),
      priority: 'medium',
      completed: false,
      type: 'system'
    },
    {
      id: 10,
      title: 'Pack luggage',
      description: 'Pack according to airline weight limits and essentials list',
      date: addDays(departureDate, -3),
      priority: 'high',
      completed: false,
      type: 'system'
    },
    {
      id: 11,
      title: 'Final document check',
      description: 'Verify passport, visa, tickets, insurance, and all important documents',
      date: addDays(departureDate, -1),
      priority: 'high',
      completed: false,
      type: 'system'
    }
  ];

  return {
    tasks,
    totalDays: Math.ceil((departureDate - today) / (1000 * 60 * 60 * 24))
  };
}
