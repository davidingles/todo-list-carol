#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Table = require('cli-table3');

const TODOS_FILE = path.join(os.homedir(), 'todos.json');

function loadTodos() {
    try {
        if (fs.existsSync(TODOS_FILE)) {
            const data = fs.readFileSync(TODOS_FILE, 'utf8');
            const todos = JSON.parse(data);
            // Migrate old format tasks
            return todos.map(todo => {
                if (typeof todo.text === 'string' && typeof todo.title === 'undefined') {
                    return { title: todo.text, description: '', completed: todo.completed };
                }
                return todo;
            });
        }
    } catch (error) {
        console.error("Error al cargar las tareas:", error);
    }
    return [];
}

function saveTodos(todos) {
    try {
        fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
    } catch (error) {
        console.error("Error al guardar las tareas:", error);
    }
}

function displayTodos() {
    console.log(chalk.cyan.bold('--- TAREAS PENDIENTES ---'));
    const todos = loadTodos();

    if (todos.length === 0) {
        console.log(chalk.yellow('No hay tareas pendientes.\n'));
        return;
    }

    const table = new Table({
        head: [chalk.cyan.bold('#'), chalk.cyan.bold('Estado'), chalk.cyan.bold('Título')],
        colWidths: [5, 10, 60],
        style: { 'head': [], 'border': ['grey'] }
    });

    const reversedTodos = [...todos].reverse();

    reversedTodos.forEach((todo, index) => {
        const status = chalk.magenta(todo.completed ? '[✔]' : '[ ]');
        const taskText = todo.completed ? chalk.gray.strikethrough(todo.title) : chalk.yellow(todo.title);
        const displayIndex = index + 2;
        table.push([displayIndex, status, taskText]);
    });

    console.log(table.toString() + '\n');
}

async function promptEditField(index, fieldToEdit) {
    const todos = loadTodos();
    const todo = todos[index];
    const currentText = todo[fieldToEdit];

    const { newText } = await inquirer.prompt([
        {
            type: 'input',
            name: 'newText',
            message: `Edita el ${fieldToEdit}:
`,
            default: currentText
        }
    ]);

    if (newText && newText.trim() !== '' && newText !== currentText) {
        todos[index][fieldToEdit] = fieldToEdit === 'title' ? newText.toUpperCase() : newText;
        saveTodos(todos);
        console.log(chalk.green('Campo actualizado.'));
    } else {
        console.log(chalk.yellow('No se realizaron cambios.'));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
}

async function promptEditMenu(index) {
    console.clear();
    const todo = loadTodos()[index];
    console.log(`Editando: ${chalk.yellow(todo.title)}`);

    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: '¿Qué quieres editar?',
            choices: [
                { name: '1. Editar Título', value: 'title' },
                { name: '2. Editar Descripción', value: 'description' },
                new inquirer.Separator(),
                { name: '3. Volver', value: 'back' }
            ]
        }
    ]);

    if (choice !== 'back') {
        await promptEditField(index, choice);
    }
}

async function promptTaskActions(index) {
    const todos = loadTodos();
    const todo = todos[index];

    console.clear();
    console.log(chalk.cyan.bold('--- TAREA SELECCIONADA ---'));

    const table = new Table({
        colWidths: [15, 60],
        style: { 'head': [], 'border': ['grey'] }
    });

    table.push(
        [chalk.cyan.bold('Título'), chalk.yellow(todo.title)],
        [chalk.cyan.bold('Descripción'), chalk.greenBright(todo.description || '(Sin descripción)')]
    );

    console.log(table.toString() + '\n');

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: '¿Qué quieres hacer con esta tarea?',
            choices: [
                { name: `1. Marcar como ${todo.completed ? 'pendiente' : 'completada'}`, value: 'toggle' },
                { name: '2. Editar', value: 'edit' },
                { name: '3. Eliminar', value: 'delete' },
                new inquirer.Separator(),
                { name: '4. Volver', value: 'back' }
            ]
        }
    ]);

    if (action === 'toggle') {
        todos[index].completed = !todos[index].completed;
        saveTodos(todos);
    } else if (action === 'edit') {
        await promptEditMenu(index);
    } else if (action === 'delete') {
        todos.splice(index, 1);
        saveTodos(todos);
        console.log(chalk.green('Tarea eliminada.'));
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

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
            const taskText = todo.completed ? chalk.gray.strikethrough(todo.title) : chalk.yellow(todo.title);
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
        const { title } = await inquirer.prompt([{
            type: 'input',
            name: 'title',
            message: 'Escribe el TÍTULO de la nueva tarea:',
        }]);

        if (title && title.trim() !== '') {
            const { description } = await inquirer.prompt([{
                type: 'input',
                name: 'description',
                message: 'Añade una DESCRIPCIÓN a la tarea:',
            }]);
            const currentTodos = loadTodos();
            currentTodos.push({ title: title.toUpperCase(), description: description || '', completed: false });
            saveTodos(currentTodos);
        }
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

mainMenu();