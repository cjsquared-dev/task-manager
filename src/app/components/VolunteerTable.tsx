import React, {useState, useEffect} from 'react';
import { IVolunteer } from '@/lib/types/interfaces/volunteer.interface';
import VolunteerTableSkeleton from '../ui/VolunteerTableSkeleton';
import lightenColor from '@/lib/utils/colors'; // Import the color utility function


interface UserTableProps {
  volunteers: IVolunteer[];
  onDelete: (name: string) => void; // Add a prop for the delete handler
}

const UserTable: React.FC<UserTableProps> = ({ volunteers, onDelete }) => {
  // Debugging: Log the volunteers array to ensure it contains valid data
  console.log('Volunteers:', volunteers);

  const [isLoading, setIsLoading] = useState(true);
  const isDarkMode = document.body.classList.contains('dark'); // Check if dark mode is active


  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust the timeout as needed
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <VolunteerTableSkeleton />;
  }
  

  return (
    <div id="volunteerTable-container" className="mt-8">
      <h2 className="text-xl font-bold">Volunteer List</h2>
      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-1">Name</th>
            <th className="border border-gray-300 px-2 py-1">Color</th>
            <th className="border border-gray-300 px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((volunteer, index) => {
            // Debugging: Log each volunteer's name and color
            console.log(`Volunteer ${index + 1}:`, {
              name: volunteer.name,
              color: volunteer.color,
            });

            return (
              <tr key={index}
              className={`${
                index % 2 === 0 ? 'bg-gray-100 dark:bg-2a2a2a' : 'bg-white dark:bg-1e1e1e'
              } hover:bg-gray-200 dark:hover:bg-444`}
              >
                <td className="border border-gray-300 px-2 py-1">{volunteer.name}</td>
                <td className="border border-gray-300 px-2 py-1">
                  {/* Display the assigned color */}
                  <div
                    className="color-circle"
                    style={{
                      backgroundColor: isDarkMode
          ? lightenColor(volunteer.color, 0.5) // Adjust color for dark mode
          : volunteer.color,
                    }}
                    title={volunteer.color || 'No color assigned'} // Tooltip to show the color code
                  ></div>
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      console.log(`Deleting volunteer: ${volunteer.name}`); // Debugging: Log the volunteer being deleted
                      onDelete(volunteer.name);
                    }}
                    title="Delete Volunteer"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;