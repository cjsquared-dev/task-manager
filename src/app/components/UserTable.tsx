import React, { useEffect, useState } from 'react';

interface Volunteer {
  name: string;
}

const UserTable: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch volunteers from the API
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch('/api');
        if (!response.ok) {
          throw new Error('Failed to fetch volunteers');
        }
        const data: Volunteer[] = await response.json();
        setVolunteers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  return (
    <div id="user-table-container" className="mt-8">
      <h2 className="text-xl font-bold">Volunteer List</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((volunteer, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{volunteer.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;