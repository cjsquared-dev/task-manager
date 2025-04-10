import React, { useState } from 'react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: { name: string; color: string }) => void; // Updated to include color
  usedColors: string[]; // List of already used colors
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, usedColors }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000'); // Default color is black

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usedColors.includes(color)) {
      alert('This color is already in use. Please choose another color.');
      return;
    }

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to save volunteer');
      }

      // Trigger the parent component's refresh logic
      onSubmit({ name, color });
      setName('');
      setColor('#000000'); // Reset color to default
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

            <label htmlFor="color" className="block font-medium">Select Color:</label>
            <input
              type="color"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
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