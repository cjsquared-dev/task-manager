import React, { useState } from 'react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: { name: string; color: string }) => void; // Updated to include color
  usedColors: string[]; // List of already used colors
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, usedColors }) => {
  const [name, setName] = useState('');

  // Predefined list of 25 distinct colors
  const predefinedColors = [
    '#8B0000', // Dark Red
    '#006400', // Dark Green
    '#00008B', // Dark Blue
    '#4B0082', // Indigo
    '#2F4F4F', // Dark Slate Gray
    '#8B4513', // Saddle Brown
    '#800000', // Maroon
    '#2E8B57', // Sea Green
    '#4682B4', // Steel Blue
    '#5F9EA0', // Cadet Blue
    '#6A5ACD', // Slate Blue
    '#483D8B', // Dark Slate Blue
    '#556B2F', // Dark Olive Green
    '#8B008B', // Dark Magenta
    '#9932CC', // Dark Orchid
    '#8B0000', // Crimson
    '#B22222', // Firebrick
    '#A52A2A', // Brown
    '#696969', // Dim Gray
    '#708090', // Slate Gray
    '#778899', // Light Slate Gray
    '#2C3E50', // Midnight Blue
    '#34495E', // Wet Asphalt
    '#1C2833', // Dark Midnight Blue
  ];

  // Function to get a random unused color
  const getRandomColor = (): string => {
    const unusedColors = predefinedColors.filter(color => !usedColors.includes(color));
    return unusedColors[Math.floor(Math.random() * unusedColors.length)] || '#000000'; // Default to black if no colors are left
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const randomColor = getRandomColor();

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color: randomColor }),
      });

      if (!response.ok) {
        throw new Error('Failed to save volunteer');
      }

      // Trigger the parent component's refresh logic
      onSubmit({ name, color: randomColor });
      setName('');
      onClose();
    } catch (error) {
      console.error('Error saving volunteer:', error);
      alert('Failed to save volunteer. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <section id="modal" className="overlay modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <section className="modal-content w-4/5 bg-gray-600 p-6 rounded-md text-white">
        <section>
          <p className="pb-1 text-lg font-bold">Volunteer Info</p>
          <form className="w-96" onSubmit={handleSubmit}>
            <label htmlFor="name" className="block font-medium">Name:</label>
            <input
              type="text"
              className="input w-full p-2 border border-gray-300 rounded mb-4"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                Submit
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </section>
    </section>
  );
};

export default UserModal;