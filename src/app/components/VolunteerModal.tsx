import React, { useEffect, useState } from 'react';
import { IVolunteer } from '@/lib/types/interfaces/volunteer.interface';
import lightenColor from '@/lib/utils/colors'; // Import the color utility function


interface VolunteerModalProps {
  onClose: () => void;
  onSelect: (volunteer: IVolunteer | null) => void;
  excludedVolunteers: string[]; // List of volunteers to exclude
}

const VolunteerModal: React.FC<VolunteerModalProps> = ({ onClose, onSelect, excludedVolunteers }) => {
  const [volunteers, setVolunteers] = useState<IVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDarkMode = document.body.classList.contains('dark'); // Check if dark mode is active

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch('/api/volunteers');
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
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-md w-96 shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">Loading Volunteers...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal">
        <div className="modal-content">
          <h2 className="text-lg font-bold mb-4 text-red-500 text-center">{error}</h2>
          <button
            className="modal-close-button mt-4 bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filter out excluded volunteers
  const availableVolunteers = volunteers.filter(
    (volunteer) => !excludedVolunteers.includes(volunteer.name)
  );

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4 text-center">Select a Volunteer</h2>
        <ul className="space-y-3">
          {availableVolunteers.map((volunteer) => (
            <li
              key={volunteer.name}
              className="flex items-center justify-start bg-gray-100 text-black p-3 rounded-md shadow-md cursor-pointer hover:bg-gray-200 text-align-left" onClick={() => onSelect(volunteer)}
              style={{ listStyle: 'none' }} // Remove default bullet points
            >
              {/* Custom bullet point with volunteer color */}
              <span
                className="font-medium color-circle"

                style={{
                  display: 'inline-block',
                  marginRight: '10px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: isDarkMode
                    ? lightenColor(volunteer.color, 0.5) // Lighten color in dark mode
                    : volunteer.color,
                  borderRadius: '50%',
                }}
              ></span>
              {/* Volunteer name with hover effect */}
              <span className="hover:text-purple-500 transition duration-200 font-semibold">
                {volunteer.name}
              </span>
            </li>
          ))}
        </ul>
        <button
          className="modal-close-button mt-6 bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-600 transition duration-200" onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VolunteerModal;