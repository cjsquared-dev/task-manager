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

const TaskTable: React.FC<TaskTableProps> = ({ onAddRow }) => {
  const [taskNames, setTaskNames] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [editedTaskIndex, setEditedTaskIndex] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [volunteerAssignments, setVolunteerAssignments] = useState<{ [key: string]: Volunteer[] }>({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        if (data.length > 0) {
          setTaskNames(data.map((task: { name: string }) => task.name));
          setRows(data.map(() => Array(10).fill(''))); // Create rows dynamically based on tasks
        }
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

  const handleDeleteTask = (index: number) => {
    const updatedTaskNames = [...taskNames];
    updatedTaskNames.splice(index, 1); // Remove the task name
    setTaskNames(updatedTaskNames);

    const updatedRows = [...rows];
    updatedRows.splice(index, 1); // Remove the corresponding row
    setRows(updatedRows);

    // Remove all volunteer assignments for the deleted row
    const updatedVolunteerAssignments = { ...volunteerAssignments };
    Object.keys(updatedVolunteerAssignments).forEach((key) => {
      if (key.startsWith(`${index}-`)) {
        delete updatedVolunteerAssignments[key];
      }
    });
    setVolunteerAssignments(updatedVolunteerAssignments);
  };

  const handleOpenModal = (rowIndex: number, cellIndex: number) => {
    setSelectedCell({ rowIndex, cellIndex });
    setIsModalOpen(true);
  };

  const handleSelectVolunteer = async (volunteer: Volunteer | null) => {
    if (selectedCell) {
      const { rowIndex, cellIndex } = selectedCell;
  
      if (volunteer) {
        const taskName = taskNames[rowIndex]; // Use the task name as the identifier
        const hourIndex = cellIndex;
  
        try {
          console.log('Sending payload:', { taskName, hourIndex, volunteer, action: 'add' }); // Log the payload
          const response = await fetch('/api/tasks', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskName,
              hourIndex,
              volunteer,
              action: 'add',
            }),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Backend error:', errorData); // Log the backend error
            throw new Error('Failed to save volunteer assignment');
          }
  
          // Update the local state
          const cellKey = `${rowIndex}-${cellIndex}`;
          const currentVolunteers = volunteerAssignments[cellKey] || [];
          setVolunteerAssignments({
            ...volunteerAssignments,
            [cellKey]: [...currentVolunteers, volunteer],
          });
        } catch (error) {
          console.error('Error saving volunteer assignment:', error);
        }
      }
  
      setIsModalOpen(false);
    }
  };

  const handleRemoveVolunteer = async (rowIndex: number, cellIndex: number, volunteerName: string) => {
    const taskName = taskNames[rowIndex]; // Use the actual task ID
    const hourIndex = cellIndex;
  
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskName,
          hourIndex,
          volunteer: { name: volunteerName },
          action: 'remove',
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove volunteer assignment');
      }
  
      // Update the local state
      const cellKey = `${rowIndex}-${cellIndex}`;
      const currentVolunteers = volunteerAssignments[cellKey] || [];
      const updatedVolunteers = currentVolunteers.filter((v) => v.name !== volunteerName);
  
      setVolunteerAssignments({
        ...volunteerAssignments,
        [cellKey]: updatedVolunteers,
      });
    } catch (error) {
      console.error('Error removing volunteer assignment:', error);
    }
  };

  const getAssignedVolunteersForHour = (hourIndex: number): string[] => {
    return Object.entries(volunteerAssignments)
      .filter(([key]) => key.endsWith(`-${hourIndex}`))
      .flatMap(([, volunteers]) => volunteers.map((v) => v.name));
  };

  return (
    <div id="table-container" className="mt-8">
      {/* Add a wrapper with overflow-x-auto */}
      <div className="overflow-x-auto">
        <table id="table" className="w-full min-w-[800px] border-collapse border border-gray-300">
          <thead>
            <tr>
              <th id="task-header" className="font-bold border border-gray-300">Tasks</th>
              <th className="border border-gray-300">Actions</th>
              {Array.from({ length: 10 }, (_, i) => {
                const hour = 8 + i;
                const formattedHour = hour > 12 ? hour - 12 : hour;
                const period = hour >= 12 ? 'PM' : 'AM';
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
                      onClick={() => setEditedTaskIndex(null)}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2"
                        onClick={() => setEditedTaskIndex(rowIndex)}
                      >
                        Edit
                      </button>
                      <button
                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => handleDeleteTask(rowIndex)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
                {row.map((_, cellIndex) => {
                  const cellKey = `${rowIndex}-${cellIndex}`;
                  const assignedVolunteers = volunteerAssignments[cellKey] || [];

                  return (
                    <td key={cellIndex} className="border border-gray-300 text-center">
                      <div>
                        {assignedVolunteers.map((volunteer) => (
                          <div
                            key={volunteer.name}
                            className="flex items-center justify-between mb-1"
                          >
                            <span
                              style={{ color: volunteer.color }}
                              className="font-semibold"
                            >
                              {volunteer.name}
                            </span>
                            <button
                              className="text-red-500 hover:text-red-700 ml-2"
                              onClick={() => handleRemoveVolunteer(rowIndex, cellIndex, volunteer.name)}
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                        <button
                          className="mt-2 bg-gray-300 text-black px-2 py-1 rounded"
                          onClick={() => handleOpenModal(rowIndex, cellIndex)}
                        >
                          Add Volunteer
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        id="newRowBtn"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          onAddRow();
          setTaskNames([...taskNames, '']);
          setRows([...rows, Array(10).fill('')]);
        }}
      >
        Add New Task
      </button>

      {isModalOpen && selectedCell && (
        <VolunteerModal
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectVolunteer}
          excludedVolunteers={getAssignedVolunteersForHour(selectedCell.cellIndex)}
        />
      )}
    </div>
  );
};

export default TaskTable;