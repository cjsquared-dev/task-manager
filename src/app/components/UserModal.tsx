import React, { useState } from 'react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: { name: string }) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to save volunteer');
      }

      onSubmit({ name });
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
      <section className="modal-content w-4/5 bg-white p-6 rounded-md">
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