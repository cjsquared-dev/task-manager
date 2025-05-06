import { IVolunteer } from '@/lib/types/interfaces/volunteer.interface';
import sanitize from 'mongo-sanitize';

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
  const sanitizedName = sanitize(name);
  const sanitizedColor = sanitize(color);
  const response = await fetch('/api/volunteers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name:sanitizedName , color:sanitizedColor }),
  });

  if (!response.ok) {
    throw new Error('Failed to add volunteer');
  }

  return response.json();
};

// Delete a volunteer
export const deleteVolunteer = async (name: string): Promise<void> => {
  const sanitizedName = sanitize(name);
  const response = await fetch(`/api/volunteers?name=${encodeURIComponent(sanitizedName)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete volunteer');
  }
};