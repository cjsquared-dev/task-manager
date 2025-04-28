import { IVolunteer } from '@/lib/types/interfaces/volunteer.interface';

export const fetchTasks = async () => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export const updateTaskName = async (taskId: string, taskName: string) => {
  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ taskId, name: taskName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update task name');
  }

  return response.json();
};

export const deleteTask = async (taskId: string) => {
  const response = await fetch(`/api/tasks?id=${taskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete task');
  }

  return response.json();
};

export const createTask = async (taskName: string) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: taskName }),
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
  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId,
      hourIndex,
      volunteer,
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
  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId,
      hourIndex,
      volunteer: { name: volunteerName },
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
  for (const taskId of taskIds) {
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        action: 'addHour',
        hourIndex,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add hour to the database');
    }
  }
};

export const removeHour = async (taskIds: string[], hourIndex: number) => {
  for (const taskId of taskIds) {
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        action: 'removeHour',
        hourIndex,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove hour from the database');
    }
  }
};