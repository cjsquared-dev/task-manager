import React, { useState, useEffect, useRef } from 'react';
import VolunteerModal from './AssignVolunteerModal';
import lightenColor from '@/lib/utils/colors'; // Import the color utility function
import { IVolunteer } from '@/lib/types/interfaces/volunteer.interface';
// import { ObjectId } from 'mongoose';
import TaskTableSkeleton from '../ui/TaskTableSkeleton';
import {
  fetchTasks,
  deleteTask,
  createTask,
  assignVolunteer,
  removeVolunteer,
  addHour,
  removeHour,
} from '@/lib/actions/task.actions';

interface TaskTableProps {
  rows: string[][];
  onAddRow: () => void;
  fetchVolunteers: () => Promise<void>;
  volunteers: IVolunteer[];
}


const TaskTable: React.FC<TaskTableProps> = ({ fetchVolunteers, volunteers }) => {
  const [taskNames, setTaskNames] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [editedTaskIndex, setEditedTaskIndex] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [volunteerAssignments, setVolunteerAssignments] = useState<{ [key: string]: IVolunteer[] }>({});
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const inputRef = useRef<HTMLInputElement>(null); // Ref for focusing the input field
  const [hours, setHours] = useState<number[]>(Array.from({ length: 10 }, (_, i) => 8 + i)); // Default: 8 AM to 5 PM
  const [taskIds, setTaskIds] = useState<string[]>([]);



  useEffect(() => {
    // Check if dark mode is active on the client side
    if (typeof document !== 'undefined') {
      setIsDarkMode(document.body.classList.contains('dark'));
    }
  }, []); // Run only once on mount


  useEffect(() => {
    // Update volunteerAssignments when volunteers or rows change
    const updatedAssignments: { [key: string]: IVolunteer[] } = {};

    rows.forEach((_, rowIndex) => {
      hours.forEach((_, hourIndex) => {
        const cellKey = `${rowIndex}-${hourIndex}`;
        const assignedVolunteers = volunteerAssignments[cellKey] || [];
        updatedAssignments[cellKey] = assignedVolunteers.filter((volunteer) =>
          volunteers.some((v) => v.name === volunteer.name)
        );
      });
    });

    setVolunteerAssignments(updatedAssignments);
    console.log('Updated volunteerAssignments:', updatedAssignments); // Debugging
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volunteers, rows]); // Run whenever volunteers or rows change


  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTasks();
        console.log('Fetched tasks:', data); // Debugging: Log fetched tasks

        // Offset hour indices to start at 8 AM
        const allHourIndices: number[] = data.flatMap((task: { hourIndex: { index: number }[] }) =>
          task.hourIndex.map((hour) => hour.index + 8) // Offset by 8
        );
        console.log('Extracted hour indices (offset by 8):', allHourIndices); // Debugging

        const uniqueSortedHours = Array.from(new Set(allHourIndices)).sort((a, b) => a - b);
        console.log('Unique sorted hours:', uniqueSortedHours); // Debugging: Log unique sorted hours

        setHours(uniqueSortedHours);
        setTaskNames(data.map((task: { name: string }) => task.name));
        setTaskIds(data.map((task: { _id: string }) => task._id));
        setRows(data.map(() => Array(uniqueSortedHours.length).fill('')));

        const assignments: { [key: string]: IVolunteer[] } = {};
        data.forEach((task: { _id: string; hourIndex: { index: number; volunteers: IVolunteer[] }[] }) => {
          task.hourIndex.forEach((hourSlot) => {
            const rowIndex = data.findIndex((t: { _id: string }) => t._id === task._id);
            const cellKey = `${rowIndex}-${hourSlot.index}`;
            assignments[cellKey] = hourSlot.volunteers;
          });
        });
        setVolunteerAssignments(assignments);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    // Focus the input field when a new task is added
    if (editedTaskIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editedTaskIndex]);

  console.log('Task names:', taskNames); // Log task names for debugging


  const handleSaveTaskName = async (index: number) => {
    const taskName = taskNames[index];
    if (!taskName.trim() || taskName.length > 50) {
      alert('Task name is required and must be less than 50 characters.');
      return;
    }
    try {
      const data = await createTask(taskName); // Save the task to the database
      setTaskIds((prev) => {
        const updatedTaskIds = [...prev];
        updatedTaskIds[index] = data.task._id; // Update the task ID after saving
        return updatedTaskIds;
      });
      setEditedTaskIndex(null); // Exit edit mode
    } catch (error) {
      console.error('Error saving task name:', error);
    }
  };


  const handleTaskNameChange = (index: number, value: string) => {
    const updatedTaskNames = [...taskNames];
    updatedTaskNames[index] = value;
    setTaskNames(updatedTaskNames);
  };

  const handleDeleteTask = async (index: number) => {
    const taskId = taskIds[index];
    try {
      await deleteTask(taskId);
      setTaskNames((prev) => prev.filter((_, i) => i !== index));
      setRows((prev) => prev.filter((_, i) => i !== index));
      setTaskIds((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleOpenModal = (rowIndex: number, cellIndex: number) => {
    setSelectedCell({ rowIndex, cellIndex });
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    // Add a new empty row with the same number of columns as the current header row
    setTaskNames((prev) => [...prev, '']);
    setRows((prev) => [...prev, Array(hours.length).fill('')]); // Match the number of hours in the header row
    setEditedTaskIndex(taskNames.length); // Set the new task to edit mode
  };

  const handleSelectVolunteer = async (volunteer: IVolunteer | null) => {
    if (selectedCell && volunteer) {
      const { rowIndex, cellIndex } = selectedCell;
      const taskId = taskIds[rowIndex];
      try {
        await assignVolunteer(taskId, cellIndex, volunteer);
        const cellKey = `${rowIndex}-${cellIndex}`;
        setVolunteerAssignments((prev) => ({
          ...prev,
          [cellKey]: [...(prev[cellKey] || []), volunteer],
        }));
      } catch (error) {
        console.error('Error assigning volunteer:', error);
      }
      setIsModalOpen(false);
    }
  };

  const handleRemoveVolunteer = async (rowIndex: number, cellIndex: number, volunteerName: string) => {
    const taskId = taskIds[rowIndex];
    try {
      await removeVolunteer(taskId, cellIndex, volunteerName);
      const cellKey = `${rowIndex}-${cellIndex}`;
      setVolunteerAssignments((prev) => ({
        ...prev,
        [cellKey]: (prev[cellKey] || []).filter((v) => v.name !== volunteerName),
      }));
      await fetchVolunteers();
    } catch (error) {
      console.error('Error removing volunteer:', error);
    }
  };

  const getAssignedVolunteersForHour = (hourIndex: number): string[] => {
    return Object.entries(volunteerAssignments)
      .filter(([key]) => key.endsWith(`-${hourIndex}`))
      .flatMap(([, volunteers]) => volunteers.map((v) => v.name));
  };



  const handleAddHour = async () => {
    // Determine the next hour
    const lastHour = hours[hours.length - 1];
    const nextHour = lastHour + 1;

    // Update the hours array
    setHours((prev) => [...prev, nextHour]);

    // Add a new column to each row
    setRows((prevRows) => prevRows.map((row) => [...row, '']));

    // Initialize the new hour in volunteerAssignments
    setVolunteerAssignments((prevAssignments) => {
      const updatedAssignments = { ...prevAssignments };
      rows.forEach((_, rowIndex) => {
        const cellKey = `${rowIndex}-${hours.length}`; // New hour index
        updatedAssignments[cellKey] = []; // Initialize with an empty array
      });
      return updatedAssignments;
    });

    // Update the hourIndex array for each task in the database
    try {
      await addHour(taskIds, hours.length);
      console.log('Hour added successfully');
    } catch (error) {
      console.error('Error adding hour:', error);
    }
  };

  const handleRemoveHour = async (hourIndex: number) => {
    const hourToRemove = hours[hourIndex];

    // Update the hours state
    setHours((prev) => prev.filter((_, index) => index !== hourIndex));

    // Update the rows state to remove the corresponding column
    setRows((prevRows) => prevRows.map((row) => row.filter((_, index) => index !== hourIndex)));

    // Update the volunteerAssignments state
    setVolunteerAssignments((prevAssignments) => {
      const updatedAssignments = { ...prevAssignments };
      Object.keys(updatedAssignments).forEach((key) => {
        if (key.endsWith(`-${hourIndex}`)) {
          delete updatedAssignments[key];
        }
      });
      return updatedAssignments;
    });

    // Update the database to remove the hour
    try {
      await removeHour(taskIds, hourToRemove - 8);
      console.log(`Hour ${hourToRemove} removed successfully`);
    } catch (error) {
      console.error('Error removing hour:', error);
    }
  };


  const formatHour = (hour: number): string => {
    const formattedHour = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:00 ${period}`;
  };




  if (isLoading) {
    return <TaskTableSkeleton />;
  }



  return (
    <div id="taskTable-container" className="mt-8">
      {/* Add a wrapper with overflow-x-auto */}
      <div className="overflow-x-auto">
        <table id="table" className="w-full min-w-[800px] border-collapse border border-gray-300">
          <thead>
            <tr>
              <th id="task-header" className="font-bold border border-gray-300">Tasks</th>
              <th className="border border-gray-300">Actions</th>
              {hours.map((hour, index) => (
                <th key={index} className="border border-gray-300">
                  {formatHour(hour)}
                  <br />
                  <button
                    className="absolute top-6 right-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200"
                    onClick={() => handleRemoveHour(index)}
                  >
                    ✖
                  </button>
                </th>
              ))}
              {/* Add New Hour Button in the Header */}
              <th className="border border-gray-300 text-center">
                <button
                  id="addHourBtn"
                  className="submit-btn"
                  onClick={handleAddHour}
                >
                  + Add Hour
                </button>
              </th>
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
                      ref={editedTaskIndex === rowIndex ? inputRef : null} // Attach ref to the input field
                    />
                  ) : (
                    taskNames[rowIndex]
                  )}
                </td>
                <td className="border border-gray-300 text-center">
                  {editedTaskIndex === rowIndex ? (
                    <button
                      className="submit-btn bg-green-500 text-white px-4 py-2 rounded"
                      onClick={() => handleSaveTaskName(rowIndex)}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        className="edit-btn bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-200"
                        onClick={() => setEditedTaskIndex(rowIndex)}
                      >
                        Edit
                      </button>
                      <button
                        className="cancel-btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                        onClick={() => handleDeleteTask(rowIndex)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
                {row.map((_, cellIndex) => {
                  const cellKey = `${rowIndex}-${cellIndex}`;
                  const assignedVolunteers = volunteerAssignments[cellKey] || []; // Get volunteers for the cell

                  return (
                    <td key={cellKey} className="border border-gray-300 text-center">
                      <div>
                        {assignedVolunteers.map((volunteer, index) => (
                          <div
                            key={`${volunteer.name}-${index}`} // Unique key for each volunteer
                            className="flex items-center justify-between mb-1"
                          >
                            <span
                              style={{
                                color: isDarkMode ? lightenColor(volunteer.color, 0.5) : volunteer.color, // Adjust color for dark mode
                              }} // Use the volunteer's color
                              className="font-semibold"
                            >
                              {volunteer.name}
                            </span>
                            <button
                              className=" table-delete-volunteer text-red-500 hover:text-red-700 ml-2"
                              onClick={() => handleRemoveVolunteer(rowIndex, cellIndex, volunteer.name)}
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                        <button
                          className=" assign-volunteer-btn mt-2 bg-gray-300 text-black px-2 py-1 rounded"
                          onClick={() => handleOpenModal(rowIndex, cellIndex)}
                        >
                          Assign Volunteer
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
        onClick={handleAddTask}
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