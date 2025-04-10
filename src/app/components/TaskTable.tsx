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
  const [rows, setRows] = useState<string[][]>([]); // Dynamically manage rows
  const [editedTaskIndex, setEditedTaskIndex] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [volunteerAssignments, setVolunteerAssignments] = useState<{ [key: string]: Volunteer[] }>({}); // Store arrays of volunteers

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

  const handleSelectVolunteer = (volunteer: Volunteer | null) => {
    if (selectedCell) {
      const cellKey = `${selectedCell.rowIndex}-${selectedCell.cellIndex}`;
      const currentVolunteers = volunteerAssignments[cellKey] || [];

      if (volunteer) {
        // Add the new volunteer to the array
        setVolunteerAssignments({
          ...volunteerAssignments,
          [cellKey]: [...currentVolunteers, volunteer],
        });
      }

      setIsModalOpen(false);
    }
  };

  const handleRemoveVolunteer = (rowIndex: number, cellIndex: number, volunteerName: string) => {
    const cellKey = `${rowIndex}-${cellIndex}`;
    const currentVolunteers = volunteerAssignments[cellKey] || [];

    // Remove the volunteer by name
    const updatedVolunteers = currentVolunteers.filter((v) => v.name !== volunteerName);

    setVolunteerAssignments({
      ...volunteerAssignments,
      [cellKey]: updatedVolunteers,
    });
  };


  // Get a list of all volunteers assigned to the selected hour
  const getAssignedVolunteersForHour = (hourIndex: number): string[] => {
    return Object.entries(volunteerAssignments)
      .filter(([key]) => key.endsWith(`-${hourIndex}`)) // Match cells in the same hour
      .flatMap(([, volunteers]) => volunteers.map((v) => v.name)); // Extract volunteer names
  };

  return (
    <div id="table-container" className="mt-8">
      <table id="table" className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th id="task-header" className="font-bold border border-gray-300">Tasks</th>
            <th className="border border-gray-300">Actions</th>
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
                            style={{ color: volunteer.color }} // Highlight name with assigned color
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

      <button
        id="newRowBtn"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          onAddRow();
          setTaskNames([...taskNames, '']); // Add an empty task name for the new row
          setRows([...rows, Array(10).fill('')]); // Add a new empty row
        }}
      >
        Add New Task
      </button>

      {isModalOpen &&  selectedCell &&(
        <VolunteerModal
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectVolunteer}
          excludedVolunteers={getAssignedVolunteersForHour(selectedCell.cellIndex)} // Pass excluded volunteers
         
        />
      )}
    </div>
  );
};

export default TaskTable;