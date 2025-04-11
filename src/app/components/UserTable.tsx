import React from 'react';

interface Volunteer {
  name: string;
  color: string; // Assuming color is a valid CSS color string
}

interface UserTableProps {
  volunteers: Volunteer[];
  onDelete: (name: string) => void; // Add a prop for the delete handler
}

const UserTable: React.FC<UserTableProps> = ({ volunteers, onDelete }) => {
  // Debugging: Log the volunteers array to ensure it contains valid data
  console.log('Volunteers:', volunteers);

  return (
    <div id="user-table-container" className="mt-8">
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
          {volunteers.map((volunteer, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-2 py-1">{volunteer.name}</td>
              <td className="border border-gray-300 px-2 py-1">
                {/* Display the assigned color */}
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{
                    backgroundColor: volunteer.color || '#ffffff', // Fallback to white if color is undefined
                  }}
                  title={volunteer.color || 'No color assigned'} // Tooltip to show the color code
                ></div>
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center">
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDelete(volunteer.name)} // Call the delete handler
                  title="Delete Volunteer"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;