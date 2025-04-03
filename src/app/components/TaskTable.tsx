import React from 'react';

interface TaskTableProps {
  rows: string[][];
  onAddRow: () => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ rows, onAddRow }) => {
  return (
    <div id="table-container" className="mt-8">
      <table id="table" className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th id="task-header" className="font-bold border border-gray-300">Tasks</th>
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
              <td className="border border-gray-300">Task {rowIndex + 1}</td>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 text-center">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add New Task Button */}
      <button
        id="newRowBtn"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={onAddRow}
      >
        Add New Task
      </button>
    </div>
  );
};

export default TaskTable;