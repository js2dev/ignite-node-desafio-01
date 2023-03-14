import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  find(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);
    
    if (rowIndex < 0) {
      return null;
    }

    return this.#database[table][rowIndex];
  }

  select(table, expression) {
    let data = this.#database[table] ?? [];

    if (expression) {
      data = data.filter(expression);
    }

    return data;
  }

  insert(table, data) {
    data.created_at = new Date();
    data.updated_at = new Date();

    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();;

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { 
        ...this.#database[table][rowIndex],
        ...data
      };

      data.updated_at = new Date();

      this.#persist();
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);

      this.#persist();
    }
  }
}