#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table3');
const inquirer = require('inquirer');

const TODOS_FILE = path.join(os.homedir(), 'todos.json');

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
 * Muestra la lista de tareas actual.
 */
function displayTodos() {
    const todos = loadTodos();
    console.clear();
    console.log(chalk.cyan.bold('--- TAREAS PENDIENTES ---'));

    if (todos.length === 0) {
        console.log(chalk.yellow(`
No hay tareas pendientes. ¡Añade una!
`));
        return;
    }

    const table = new Table({
        head: [chalk.cyan.bold('Estado'), chalk.cyan.bold('Tarea')],
        colWidths: [10, 60],
        style: { 'head': [], 'border': ['grey'] }
    });

    todos.forEach((todo) => {
        const status = todo.completed ? chalk.green('[x]') : chalk.red('[ ]');
        const taskText = todo.completed ? chalk.gray.strikethrough(todo.text) : chalk.white(todo.text);
        table.push([status, taskText]);
    });

    console.log(table.toString());
}

/**
 * Muestra el menú principal y gestiona las acciones del usuario.
 */
async function mainMenu() {
    displayTodos();

    const todos = loadTodos();
    const choices = [
        { name: 'Añadir nueva tarea', value: 'add' },
        new inquirer.Separator(),
        ...todos.map((todo, index) => ({
            name: `${todo.completed ? chalk.green('[x]') : chalk.red('[ ]')} ${todo.completed ? chalk.gray.strikethrough(todo.text) : todo.text}`,
            value: { action: 'toggle', index }
        })),
        new inquirer.Separator(),
        { name: 'Eliminar tarea', value: 'delete' },
        { name: 'Salir', value: 'exit' }
    ];

    const { selection } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selection',
            message: '¿Qué quieres hacer?',
            choices: choices,
            pageSize: 15
        }
    ]);

    if (typeof selection === 'object' && selection.action === 'toggle') {
        todos[selection.index].completed = !todos[selection.index].completed;
        saveTodos(todos);
        mainMenu();
    } else {
        switch (selection) {
            case 'add':
                await promptAddTodo();
                mainMenu();
                break;
            case 'delete':
                await promptDeleteTodo();
                mainMenu();
                break;
            case 'exit':
                console.log(chalk.blue("¡Hasta luego!"));
                process.exit(0);
                break;
        }
    }
}

/**
 * Pide al usuario el texto de la nueva tarea y la añade.
 */
async function promptAddTodo() {
    const { taskText } = await inquirer.prompt([
        {
            type: 'input',
            name: 'taskText',
            message: 'Escribe la nueva tarea:'
        }
    ]);
    if (taskText) {
        const todos = loadTodos();
        todos.push({ text: taskText, completed: false });
        saveTodos(todos);
    }
}

/**
 * Muestra un menú para seleccionar qué tarea eliminar.
 */
async function promptDeleteTodo() {
    const todos = loadTodos();
    if (todos.length === 0) {
        console.log(chalk.yellow("No hay tareas para eliminar."));
        await new Promise(resolve => setTimeout(resolve, 1500)); // Pausa para leer el mensaje
        return;
    }

    const { todoIndex } = await inquirer.prompt([
        {
            type: 'list',
            name: 'todoIndex',
            message: '¿Qué tarea quieres eliminar?',
            choices: [
                ...todos.map((todo, index) => ({ name: todo.text, value: index })),
                new inquirer.Separator(),
                { name: 'Cancelar', value: -1 }
            ]
        }
    ]);

    if (todoIndex !== -1) {
        todos.splice(todoIndex, 1);
        saveTodos(todos);
    }
}

// Iniciar la aplicación
mainMenu();