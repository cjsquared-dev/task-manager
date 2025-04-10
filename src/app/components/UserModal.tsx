import React, { useState } from 'react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: { name: string; color: string }) => void; // Updated to include color
  usedColors: string[]; // List of already used colors
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, usedColors }) => {
  const [name, setName] = useState('');

  // Predefined list of 20 colors
  const predefinedColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFF5', '#F5FF33',
    '#FF8C33', '#33FF8C', '#8C33FF', '#FF3333', '#33FF33', '#3333FF', '#FFAA33',
    '#33FFAA', '#AA33FF', '#FF77AA', '#77FFAA', '#AAFF77', '#FFAA77',
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
      <section className="modal-content w-4/5 bg-gray-600 p-6 rounded-md">
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