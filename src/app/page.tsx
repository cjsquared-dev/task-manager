'use client';

import React, { useState } from 'react';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rows, setRows] = useState<string[][]>([]); // State to manage table rows

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleAddRow = () => {
    // Add a new empty row with 10 empty cells
    setRows([...rows, Array(10).fill('')]);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-container flex justify-center items-center">
        <section className="h-2/5 md:w-6/12 sm:w-screen rounded-md hero-content-container flex justify-evenly items-center flex-col p-3">
          <h1 className="text-white text-4xl text-center">Welcome to the Event Scheduler</h1>
          <h3 className="text-white text-3xl text-center">Here to make your scheduling needs a breeze!</h3>
        </section>
      </section>

      {/* Toggle Button */}
      <button
        id="toggleButton"
        className="mt-4 bg-gray-200 px-4 py-2 rounded"
        onClick={() => alert('Toggle functionality not implemented yet!')}
      >
        ☀
      </button>

      {/* Table Section */}
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
          onClick={handleAddRow}
        >
          Add New Task
        </button>
      </div>

      {/* Modal Section */}
      {isModalOpen && (
        <section id="modal" className="overlay modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <section className="modal-content-hidden w-4/5 bg-white p-6 rounded-md">
            <section>
              <p className="pb-1 text-lg font-bold">Volunteer Info</p>
              <form className="w-96">
                <label htmlFor="name" className="block font-medium">Name:</label>
                <input type="text" className="input w-full p-2 border border-gray-300 rounded mb-4" id="name" />
                <label htmlFor="number" className="block font-medium">Number:</label>
                <input type="text" className="input w-full p-2 border border-gray-300 rounded mb-4" id="number" />
                <label htmlFor="email" className="block font-medium">Email:</label>
                <input type="text" className="input w-full p-2 border border-gray-300 rounded mb-4" id="email" />
              </form>
            </section>

            <section id="right-column" className="mt-4">
              <p className="font-medium">Color</p>
              <section id="button-container" className="flex flex-wrap gap-2 mt-2">
                {/* Dynamically add color buttons here */}
              </section>
              <div className="mt-4">
                <button
                  id="submit-button"
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => alert('Submit functionality not implemented yet!')}
                >
                  Submit
                </button>
                <button
                  id="cancel-button"
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleToggleModal}
                >
                  Cancel
                </button>
              </div>
            </section>
          </section>
        </section>
      )}
    </div>
  );
};

export default HomePage;