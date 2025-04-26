import { IVolunteer } from '@/lib/types/interfaces/volunteer.interface';

// Fetch all volunteers
export const fetchVolunteers = async (): Promise<IVolunteer[]> => {
  const response = await fetch('/api/volunteers');
  if (!response.ok) {
    throw new Error('Failed to fetch volunteers');
  }
  return response.json();
};

// Add a new volunteer
export const addVolunteer = async (name: string, color: string): Promise<IVolunteer> => {
  const response = await fetch('/api/volunteers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, color }),
  });

  if (!response.ok) {
    throw new Error('Failed to add volunteer');
  }

  return response.json();
};

// Delete a volunteer
export const deleteVolunteer = async (name: string): Promise<void> => {
  const response = await fetch(`/api/volunteers?name=${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete volunteer');
  }
};