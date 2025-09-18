#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const chalk = require('chalk');
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
    if (taskText && taskText.trim() !== '') {
        const todos = loadTodos();
        todos.push({ text: taskText, completed: false });
        saveTodos(todos);
    }
}

/**
 * Pide al usuario que edite el texto de una tarea existente.
 * @param {number} index
 */
async function promptEditTodo(index) {
    const todos = loadTodos();
    const todo = todos[index];

    const { newText } = await inquirer.prompt([
        {
            type: 'input',
            name: 'newText',
            message: 'Edita el texto de la tarea:',
            default: todo.text
        }
    ]);

    if (newText && newText.trim() !== '' && newText !== todo.text) {
        todos[index].text = newText;
        saveTodos(todos);
        console.log(chalk.green('Tarea actualizada.'));
    } else {
        console.log(chalk.yellow('No se realizaron cambios.'));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Muestra un menú de acciones para una tarea seleccionada.
 * @param {number} index
 */
async function promptTaskActions(index) {
    const todos = loadTodos();
    const todo = todos[index];

    console.clear();
    console.log(chalk.cyan.bold('--- TAREA SELECCIONADA ---'));
    console.log(`Tarea: ${chalk.yellow(todo.text)}
`);

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: '¿Qué quieres hacer con esta tarea?',
            choices: [
                { name: `Marcar como ${todo.completed ? 'pendiente' : 'completada'}`, value: 'toggle' },
                { name: 'Editar', value: 'edit' },
                { name: 'Eliminar', value: 'delete' },
                new inquirer.Separator(),
                { name: 'Volver al menú principal', value: 'back' }
            ]
        }
    ]);

    const currentTodos = loadTodos();

    switch (action) {
        case 'toggle':
            currentTodos[index].completed = !currentTodos[index].completed;
            saveTodos(currentTodos);
            break;
        case 'edit':
            await promptEditTodo(index);
            break;
        case 'delete':
            currentTodos.splice(index, 1);
            saveTodos(currentTodos);
            console.log(chalk.green('Tarea eliminada.'));
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
        case 'back':
            break;
    }
}


/**
 * Muestra el menú principal y gestiona las acciones del usuario.
 */
async function mainMenu() {
    console.clear();
    console.log(chalk.cyan.bold('--- GESTOR DE TAREAS ---'));

    const todos = loadTodos();
    const originalTodosCount = todos.length;
    todos.reverse(); // Reverse the array for display

    const choices = [
        { name: chalk.greenBright.bold('1. ') + chalk.blue.bold('AÑADIR NUEVA TAREA'), value: 'add' },
        new inquirer.Separator('─'.repeat(70)),
    ];

    if (todos.length > 0) {
        todos.forEach((todo, index) => { // index is from the reversed array
            const status = chalk.magenta(todo.completed ? '[✔]' : '[ ]');
            const taskText = todo.completed ? chalk.gray.strikethrough(todo.text) : chalk.yellow(todo.text);
            choices.push({
                name: `${chalk.greenBright.bold((index + 2) + '.')} ${status} ${taskText}`,
                value: { action: 'select_task', index: (originalTodosCount - 1) - index }
            });
        });
    } else {
        choices.push({ name: chalk.gray('No hay tareas pendientes. ¡Añade una!'), disabled: true });
    }

    choices.push(new inquirer.Separator('─'.repeat(70)));
    choices.push({ name: 'Salir', value: 'exit' });

    const { selection } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selection',
            message: 'Selecciona una opción o una tarea:',
            choices: choices,
            pageSize: 20,
            loop: false
        }
    ]);

    if (selection === 'add') {
        await promptAddTodo();
        mainMenu();
    } else if (selection === 'exit') {
        console.log(chalk.blue("¡Hasta luego!"));
        process.exit(0);
    } else if (selection && typeof selection === 'object' && selection.action === 'select_task') {
        await promptTaskActions(selection.index);
        mainMenu();
    } else {
        mainMenu();
    }
}

// Iniciar la aplicación
mainMenu();
