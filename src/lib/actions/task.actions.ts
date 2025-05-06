import { IVolunteer } from '@/lib/types/interfaces/volunteer.interface';
import sanitize from 'mongo-sanitize';

export const fetchTasks = async () => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export const updateTaskName = async (taskId: string, taskName: string) => {
  const sanitizedTaskId = sanitize(taskId);
  const sanitizedTaskName = sanitize(taskName);
  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sanitizedTaskId, name: sanitizedTaskName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update task name');
  }

  return response.json();
};

export const deleteTask = async (taskId: string) => {
  const sanitizedTaskId = sanitize(taskId);
  const response = await fetch(`/api/tasks?id=${sanitizedTaskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete task');
  }

  return response.json();
};

export const createTask = async (taskName: string) => {
  const sanitizedTaskName = sanitize(taskName);
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: sanitizedTaskName }),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
};

export const assignVolunteer = async (
  taskId: string,
  hourIndex: number,
  volunteer: IVolunteer
) => {

  const sanitizedTaskId = sanitize(taskId);
  const sanitizedHourIndex = sanitize(hourIndex);
  const sanitizedVolunteer = sanitize(volunteer);

  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId: sanitizedTaskId,
      hourIndex: sanitizedHourIndex,
      volunteer: sanitizedVolunteer,
      action: 'add',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to assign volunteer');
  }

  return response.json();
};

export const removeVolunteer = async (
  taskId: string,
  hourIndex: number,
  volunteerName: string
) => {

  const sanitizedTaskId = sanitize(taskId);
  const sanitizedHourIndex = sanitize(hourIndex);
  const sanitizedVolunteerName = sanitize(volunteerName);

  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId: sanitizedTaskId,
      hourIndex: sanitizedHourIndex,
      volunteer: { name: sanitizedVolunteerName },
      action: 'remove',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to remove volunteer');
  }

  return response.json();
};

export const addHour = async (taskIds: string[], hourIndex: number) => {
  const sanitizedHourIndex = sanitize(hourIndex);
  for (const taskId of taskIds) {
    const sanitizedTaskId = sanitize(taskId);
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId: sanitizedTaskId,
        action: 'addHour',
        hourIndex: sanitizedHourIndex,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add hour to the database');
    }
  }
};

export const removeHour = async (taskIds: string[], hourIndex: number) => {
  const sanitizedHourIndex = sanitize(hourIndex);
  for (const taskId of taskIds) {
    const sanitizedTaskId = sanitize(taskId);
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId: sanitizedTaskId,
        action: 'removeHour',
        hourIndex: sanitizedHourIndex,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove hour from the database');
    }
  }
};