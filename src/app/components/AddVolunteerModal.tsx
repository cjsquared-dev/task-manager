import React, { useState, useRef, useEffect } from 'react';
import { addVolunteer } from '@/lib/actions/volunteer.actions';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: { name: string; color: string }) => void;
  usedColors: string[]; // List of already used colors
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, usedColors }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null); // Create a ref for the input field

  const predefinedColors = [
    '#8B0000', '#006400', '#00008B', '#4B0082', '#2F4F4F', '#8B4513', '#800000', '#2E8B57',
    '#4682B4', '#5F9EA0', '#6A5ACD', '#483D8B', '#556B2F', '#8B008B', '#9932CC', '#B22222',
    '#A52A2A', '#696969', '#708090', '#778899', '#2C3E50', '#34495E', '#1C2833',
  ];

  const getRandomColor = (): string => {
    const unusedColors = predefinedColors.filter((color) => !usedColors.includes(color));
    return unusedColors[Math.floor(Math.random() * unusedColors.length)] || '#000000';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const randomColor = getRandomColor();

    try {
      const newVolunteer = await addVolunteer(name, randomColor); // Use the action
      onSubmit(newVolunteer);
      setName('');
      onClose();
    } catch (error) {
      console.error('Error saving volunteer:', error);
      alert('Failed to save volunteer. Please try again.');
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus(); // Automatically focus the input field when the modal is opened
    }
  }, [isOpen]); // Run this effect whenever `isOpen` changes

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
              ref={inputRef} // Attach the ref to the input field
              required
            />
            <div className="mt-4">
              <button type="submit" className="submit-btn bg-green-500 text-white px-4 py-2 rounded mr-2">
                Submit
              </button>
              <button type="button" className="cancel-btn bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
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