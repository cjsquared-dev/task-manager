'use client';

import React, { useState, useEffect } from 'react';
import TaskTable from './components/TaskTable';
import UserModal from './components/UserModal';
import UserTable from './components/VolunteerTable';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rows, setRows] = useState<string[][]>([]); // State to manage table rows
  const [volunteers, setVolunteers] = useState<{ name: string; color: string }[]>([]); // State to manage volunteers

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch rows (tasks) from the database
  const fetchRows = async () => {
    try {
      const response = await fetch('/api/tasks'); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      if (data.length > 0) {
        setRows(data.map(() => Array(10).fill(''))); // Initialize rows with empty cells
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch volunteers from the database
  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers');
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
    fetchRows();
    fetchVolunteers();
  }, []);

  // Handle deleting a volunteer
  const handleDeleteVolunteer = async (name: string) => {
    try {
      const response = await fetch(`/api/volunteers?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete volunteer');
      }

      console.log('Volunteer deleted successfully');
      setVolunteers((prevVolunteers) =>
        prevVolunteers.filter((volunteer) => volunteer.name !== name)
      );
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      if (error instanceof Error) {
        alert(error.message); // Show an alert with the error message
      } else {
        alert('An unknown error occurred'); // Fallback for non-Error types
      }
    }
  };

  const usedColors = volunteers.map((volunteer) => volunteer.color);

  const handleAddRow = () => {
    // Add a new empty row with 10 empty cells
    setRows([...rows, Array(10).fill('')]);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-container flex justify-center items-center">
        <section className="h-2/5 md:w-6/12 sm:w-screen rounded-md hero-content-container flex justify-evenly items-center flex-col p-3">
          <h1 className="text-white text-4xl text-center">Welcome to the Event Task Manager</h1>
          <h3 className="text-white text-3xl text-center">Here to make your Event Task Managing run smoothly!</h3>
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

      {/* Add Volunteer Button */}
      <button
        id="addVolunteerButton"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleToggleModal}
      >
        Add Volunteer
      </button>

      {/* User Table */}
      <UserTable volunteers={volunteers} onDelete={handleDeleteVolunteer} />

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleToggleModal}
        onSubmit={fetchVolunteers} // Pass the refresh function
        usedColors={usedColors} // Pass the list of used colors
      />
    </div>
  );
};

export default HomePage;