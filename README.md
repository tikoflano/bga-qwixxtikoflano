# Qwixx Tikoflano - BGA Studio Game

A Board Game Arena (BGA) implementation of Qwixx, built using the BGA Studio Game Dev Template.

## Project Overview

This is a TypeScript-based implementation of Qwixx for Board Game Arena. The project uses modern development tools and follows BGA's development guidelines.

## Prerequisites

- [VSCode](https://code.visualstudio.com/) (latest version recommended)
- [Docker](https://www.docker.com/products/docker-desktop/) (latest version)
- [Git](https://git-scm.com/) (latest version)
- A Board Game Arena Studio account

## Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/tikoflano/bga-qwixxtikoflano
   cd bga-qwixxtikoflano
   ```

2. **Environment Configuration**

   - Make a copy of `.devcontainer/devcontainer.env.example`
   - Rename it to `.devcontainer/devcontainer.env`
   - Fill in the required environment variables:
     - `BGA_PROJECT_NAME`: Your BGA project name
     - `BGA_USERNAME`: Your BGA Studio username
     - Other required variables as specified in the example file

3. **VSCode Setup**

   - Install the following VSCode extensions:
     - "Remote - Containers"
     - "SFTP" (for syncing with BGA Studio)
   - Open the project in VSCode
   - Run the command `Dev Containers: Reopen in Container` (Docker must be running)

4. **Project Initialization**
   - Run `SFTP: Download Project` to sync with BGA Studio
   - Run `Tasks: Run Build Task` to start the development server
   - Run `Tasks: Run Test Task` to open your game in BGA Studio

## Development Workflow

### Building and Watching

- The build task runs in the background and automatically generates:
  - JavaScript files (`.js`)
  - CSS files (`.css`)
  - TypeScript compilation
  - SCSS compilation

### Testing

- Use `Tasks: Run Test Task` to open your game in BGA Studio

### Project Structure

```
├── .devcontainer/     # Development container configuration
├── .vscode/          # VSCode settings and tasks
├── img/              # Game images and assets
├── modules/          # Game modules and components
├── misc/             # Miscellaneous files
├── qwixxtikoflano.js # Main game logic
├── qwixxtikoflano.css# Game styles
└── states.inc.php    # Game states definition
```

## Documentation

### Official BGA Documentation

- [BGA Studio Documentation](https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js)
- [TypeScript Template Documentation](https://github.com/NevinAF/bga-ts-template/blob/main/docs/typescript/index.md)

### Game-Specific Documentation

- Game states are defined in `states.inc.php`
- Database schema is defined in `dbmodel.sql`

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the BGA Studio License. See the `LICENCE_BGA` file for details.

## Support

For issues and support:

1. Check the [BGA Studio Documentation](https://en.doc.boardgamearena.com/)
2. Review the [TypeScript Template Documentation](https://github.com/NevinAF/bga-ts-template/blob/main/docs/typescript/index.md)
3. Open an issue in this repository

## Additional Resources

- [BGA Studio Forum](https://boardgamearena.com/forum/viewforum.php?f=12)
- [BGA Studio Discord](https://discord.gg/5N9ZwM2)
