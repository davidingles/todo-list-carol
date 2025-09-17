# Todo List CLI (`todo-list-carol`)

Una simple pero elegante CLI de tareas pendientes para gestionar tus quehaceres directamente desde la terminal.

## ✨ Características

- **Interfaz Interactiva**: Menú fácil de usar basado en [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/).
- **Visualización Clara**: Tareas mostradas en una tabla limpia y organizada.
- **Gestión Completa**: Añade, elimina y marca tareas como completadas.
- **Persistencia**: Tus tareas se guardan en un archivo `todos.json` en tu directorio de usuario, para que no pierdas tu progreso.
- **Estilo Moderno**: Uso de `chalk` para una experiencia de usuario más agradable.

## 🚀 Instalación

Para usar esta herramienta, necesitas tener [Node.js](https://nodejs.org/) instalado.

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/davidingles/todo-list-carol.git
    ```

2.  **Navega al directorio del proyecto:**
    ```bash
    cd todo-list-carol
    ```

3.  **Instala las dependencias:**
    ```bash
    npm install
    ```

4.  **Haz que el comando esté disponible globalmente:**
    Para poder ejecutar `todo` desde cualquier lugar de tu terminal, ejecuta el siguiente comando. Esto crea un enlace simbólico al ejecutable.
    ```bash
    npm link
    ```

## Usage

Una vez instalado, simplemente ejecuta el siguiente comando en tu terminal para lanzar la aplicación:

```bash
todo
```

Se presentará un menú interactivo que te permitirá gestionar tus tareas.

### Menú de Opciones

- **Añadir nueva tarea**: Te pedirá que escribas el texto de una nueva tarea.
- **Seleccionar una tarea**: Al seleccionar una tarea existente, cambiarás su estado entre completada e incompleta.
- **Eliminar tarea**: Abrirá un submenú para que elijas qué tarea deseas eliminar.
- **Salir**: Cierra la aplicación.

## 📄 Licencia

Este proyecto está bajo la licencia ISC.
