import React, { useState, useEffect } from 'react';
import VolunteerModal from './VolunteerModal';

interface TaskTableProps {
  rows: string[][];
  onAddRow: () => void;
}

interface Volunteer {
  name: string;
  color: string;
}

const TaskTable: React.FC<TaskTableProps> = ({ rows, onAddRow }) => {
  const [taskNames, setTaskNames] = useState<string[]>([]);
  const [editedTaskIndex, setEditedTaskIndex] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [volunteerAssignments, setVolunteerAssignments] = useState<{ [key: string]: Volunteer }>({});
  // Fetch tasks from the database on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTaskNames(data.map((task: { name: string }) => task.name));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskNameChange = (index: number, value: string) => {
    const updatedTaskNames = [...taskNames];
    updatedTaskNames[index] = value;
    setTaskNames(updatedTaskNames);
  };

  const handleSaveTask = async (index: number) => {
    try {
      const taskName = taskNames[index];
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: taskName }),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      console.log('Task saved successfully');
      setEditedTaskIndex(null); // Clear the edited state after saving
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (index: number) => {
    try {
      const taskName = taskNames[index];
      const response = await fetch(`/api/tasks/${taskName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      console.log('Task deleted successfully');
      const updatedTaskNames = [...taskNames];
      updatedTaskNames.splice(index, 1); // Remove the task from the list
      setTaskNames(updatedTaskNames);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleOpenModal = (rowIndex: number, cellIndex: number) => {
    setSelectedCell({ rowIndex, cellIndex });
    setIsModalOpen(true);
  };

  const handleSelectVolunteer = (volunteer: Volunteer | null) => {
  if (selectedCell) {
    const cellKey = `${selectedCell.rowIndex}-${selectedCell.cellIndex}`;
    if (volunteer) {
      // Assign the selected volunteer
      setVolunteerAssignments({
        ...volunteerAssignments,
        [cellKey]: volunteer,
      });
    } else {
      // Remove the volunteer assignment
      const updatedAssignments = { ...volunteerAssignments };
      delete updatedAssignments[cellKey];
      setVolunteerAssignments(updatedAssignments);
    }
    setIsModalOpen(false);
  }
};

  return (
    <div id="table-container" className="mt-8">
      <table id="table" className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th id="task-header" className="font-bold border border-gray-300">Tasks</th>
            <th className="border border-gray-300">Actions</th>
            {/* Generate time slots dynamically */}
            {Array.from({ length: 10 }, (_, i) => {
              const hour = 8 + i; // Start from 8 AM
              const formattedHour = hour > 12 ? hour - 12 : hour; // Convert to 12-hour format
              const period = hour >= 12 ? 'PM' : 'AM'; // Determine AM/PM
              const timeLabel = `${formattedHour}:00 ${period}`;
              return (
                <th key={i} className="border border-gray-300">
                  {timeLabel}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Render rows dynamically */}
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="border border-gray-300">
                {editedTaskIndex === rowIndex ? (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={taskNames[rowIndex] || ''}
                    onChange={(e) => handleTaskNameChange(rowIndex, e.target.value)}
                  />
                ) : (
                  taskNames[rowIndex]
                )}
              </td>
              <td className="border border-gray-300 text-center">
                {editedTaskIndex === rowIndex ? (
                  <button
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => handleSaveTask(rowIndex)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => setEditedTaskIndex(rowIndex)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => handleDeleteTask(rowIndex)}
                >
                  Delete
                </button>
              </td>
              {row.map((cell, cellIndex) => {
                const cellKey = `${rowIndex}-${cellIndex}`;
                const assignedVolunteer = volunteerAssignments[cellKey];

                return (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 text-center"
                    style={{
                      backgroundColor: assignedVolunteer?.color || 'transparent',
                    }}
                  >
                    {assignedVolunteer ? (
                      <div>
                        <span>{assignedVolunteer.name}</span>
                        <button
                          className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => handleOpenModal(rowIndex, cellIndex)}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        className="bg-gray-300 text-black px-2 py-1 rounded"
                        onClick={() => handleOpenModal(rowIndex, cellIndex)}
                      >
                        Add Volunteer
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add New Task Button */}
      <button
        id="newRowBtn"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          onAddRow();
          setTaskNames([...taskNames, '']); // Add an empty task name for the new row
        }}
      >
        Add New Task
      </button>
       {/* Volunteer Modal */}
       {isModalOpen && (
        <VolunteerModal
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectVolunteer}
        />
      )}
    </div>
  );
};

export default TaskTable;