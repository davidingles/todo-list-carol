#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TODOS_FILE = path.join(process.cwd(), 'todos.json');

/**
 * Carga las tareas desde todos.json.
 * @returns {Array<Object>}
 */
function loadTodos() {
    try {
        if (fs.existsSync(TODOS_FILE)) {
            const data = fs.readFileSync(TODOS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error al cargar las tareas:", error);
    }
    return [];
}

/**
 * Guarda las tareas en todos.json.
 * @param {Array<Object>} todos
 */
function saveTodos(todos) {
    try {
        fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
    } catch (error) {
        console.error("Error al guardar las tareas:", error);
    }
}

/**
 * Añade una nueva tarea.
 * @param {string} taskText
 */
function addTodo(taskText) {
    if (!taskText) {
        console.log("No se puede añadir una tarea vacía.");
        return;
    }
    const todos = loadTodos();
    const newTodo = { text: taskText, completed: false };
    todos.push(newTodo);
    saveTodos(todos);
    console.log(`Tarea añadida: "${taskText}"`);
}

/**
 * Lista todas las tareas.
 */
function listTodos() {
    const todos = loadTodos();
    if (todos.length === 0) {
        console.log("No hay tareas pendientes. ¡Añade una!");
        return;
    }
    console.log("--- Lista de Tareas ---");
    todos.forEach((todo, index) => {
        const status = todo.completed ? '[x]' : '[ ]';
        console.log(`${index + 1}. ${status} ${todo.text}`);
    });
    console.log("-----------------------");
}

/**
 * Marca una tarea como completada.
 * @param {number} index - El índice 1-based de la tarea.
 */
function completeTodo(index) {
    const todos = loadTodos();
    if (isNaN(index) || index <= 0 || index > todos.length) {
        console.log("Índice inválido. Por favor, proporciona un número de la lista.");
        return;
    }
    todos[index - 1].completed = true;
    saveTodos(todos);
    console.log(`Tarea "${todos[index - 1].text}" marcada como completada.`);
}

/**
 * Elimina una tarea.
 * @param {number} index - El índice 1-based de la tarea.
 */
function deleteTodo(index) {
    const todos = loadTodos();
    if (isNaN(index) || index <= 0 || index > todos.length) {
        console.log("Índice inválido. Por favor, proporciona un número de la lista.");
        return;
    }
    const deletedTodo = todos.splice(index - 1, 1);
    saveTodos(todos);
    console.log(`Tarea "${deletedTodo[0].text}" eliminada.`);
}

/**
 * Muestra el menú de ayuda.
 */
function showHelp() {
    console.log(`
Uso: node index.js <comando> [argumentos]

Comandos:
  add <texto>    Añade una nueva tarea.
  list           Muestra la lista de tareas.
  done <índice>  Marca una tarea como completada.
  delete <índice>  Elimina una tarea.
  help           Muestra esta ayuda.
    `);
}

// --- Lógica Principal ---
const [,, command, ...args] = process.argv;
const argument = args.join(' ');

switch (command) {
    case 'add':
        addTodo(argument);
        break;
    case 'list':
        listTodos();
        break;
    case 'done':
        completeTodo(parseInt(argument, 10));
        break;
    case 'delete':
        deleteTodo(parseInt(argument, 10));
        break;
    case 'help':
    default:
        showHelp();
        break;
}
