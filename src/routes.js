import { randomUUID } from 'node:crypto';

import { Database } from './database.js';
import { buildRoutePath } from './utils/buildRoutePath.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search, isCompleted } = request.query;

      const tasks = database.select('tasks', (row) => {
        return row.title.toLowerCase().includes(search?.toLowerCase() ?? '')
          || row.description.toLowerCase().includes(search?.toLowerCase() ?? '')
          || (isCompleted === null || isCompleted === undefined || (Boolean(isCompleted) === !!row.completed_at));
      });

      return response.end(JSON.stringify(tasks));
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null
      };

      database.insert('tasks', task);

      return response.writeHead(201).end(JSON.stringify(task));
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description, completed_at } = request.body;

      const dbTask = database.find('tasks', id);

      if (dbTask === null) {
        return response.writeHead(404).end('Registro não encontrado');
      }

      database.update('tasks', id, { title, description, completed_at });

      return response.writeHead(204).end();
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params;

      const dbTask = database.find('tasks', id);

      if (dbTask === null) {
        return response.writeHead(404).end('Registro não encontrado');
      }

      database.update('tasks', id, { 
        completed_at: dbTask.completed_at ? null : new Date()
      });

      return response.writeHead(204).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;

      const dbTask = database.find('tasks', id);

      if (dbTask === null) {
        return response.writeHead(404).end('Registro não encontrado');
      }

      database.delete('tasks', id);

      return response.writeHead(204).end();
    }
  }
]