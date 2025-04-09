import React from 'react';

interface Volunteer {
  name: string;
  color: string; // Assuming color is a string
}

interface UserTableProps {
  volunteers: Volunteer[];
}

const UserTable: React.FC<UserTableProps> = ({ volunteers }) => {
  return (
    <div id="user-table-container" className="mt-8">
      <h2 className="text-xl font-bold">Volunteer List</h2>
      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Color</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((volunteer, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{volunteer.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: volunteer.color }}
                  title={volunteer.color} // Tooltip to show the color code
                ></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;