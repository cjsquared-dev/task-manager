import React, { useEffect, useState } from 'react';

// Define the Volunteer type
interface Volunteer {
  name: string;
  color: string;
}

interface VolunteerModalProps {
  onClose: () => void;
  onSelect: (volunteer: Volunteer) => void;
}

const VolunteerModal: React.FC<VolunteerModalProps> = ({ onClose, onSelect }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch volunteers from the backend
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch('/api/volunteers'); // Ensure this API route fetches volunteers
        if (!response.ok) {
          throw new Error('Failed to fetch volunteers');
        }
        const data = await response.json();
        setVolunteers(data);
      } catch (err) {
        setError('Failed to load volunteers. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-md w-96">
          <h2 className="text-lg font-bold mb-4">Loading Volunteers...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-md w-96">
          <h2 className="text-lg font-bold mb-4 text-red-500">{error}</h2>
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md w-96">
        <h2 className="text-lg font-bold mb-4">Select a Volunteer</h2>
        <ul>
          {volunteers.map((volunteer, index) => (
            <li
              key={index}
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => onSelect(volunteer)}
            >
              <span>{volunteer.name}</span>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: volunteer.color }}
              ></div>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VolunteerModal;