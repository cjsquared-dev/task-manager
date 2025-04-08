'use client';

import React, { useState, useEffect } from 'react';
import TaskTable from './components/TaskTable';
import UserModal from './components/UserModal';
import UserTable from './components/UserTable';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rows, setRows] = useState<string[][]>([]); // State to manage table rows
  const [volunteers, setVolunteers] = useState<{ name: string }[]>([]); // State to manage volunteers

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api');
      if (!response.ok) {
        throw new Error('Failed to fetch volunteers');
      }
      const data = await response.json();
      setVolunteers(data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

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

      {/* Task Table */}
      <TaskTable rows={rows} onAddRow={handleAddRow} />

      {/* User Table */}
      <UserTable volunteers={volunteers} />

      {/* Add Volunteer Button */}
      <button
        id="addVolunteerButton"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleToggleModal}
      >
        Add Volunteer
      </button>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleToggleModal}
        onSubmit={fetchVolunteers} // Pass the refresh function
      />
    </div>
  );
};

export default HomePage;
