# Contributing to TWIN Project

Thank you for your interest in contributing to the TWIN project! This document provides guidelines and best practices for contributing to this repository.

## Table of Contents

- [Contributing to TWIN Project](#contributing-to-twin-project)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
    - [Basic Workflow](#basic-workflow)
  - [Branch Naming Convention](#branch-naming-convention)
  - [Commit Message Convention](#commit-message-convention)
    - [Format](#format)
    - [Type](#type)
    - [Scope (Optional)](#scope-optional)
    - [Subject](#subject)
    - [Examples](#examples)
  - [Pull Request Process](#pull-request-process)
    - [Pull Request Template](#pull-request-template)
  - [Code Standards](#code-standards)
  - [Testing](#testing)
    - [Running Tests](#running-tests)
  - [Documentation](#documentation)
  - [Questions and Support](#questions-and-support)
  - [Code of Conduct](#code-of-conduct)

## Getting Started

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/Aincrad-Flux/TWIN
   cd TWIN
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your development environment according to the project documentation

## Development Workflow

This project uses Git, so it is essential to create a new branch for any project modifications. A Merge Request must then be submitted for review.

### Basic Workflow

1. Create a new branch from `main`
2. Make your changes
3. Test your changes locally
4. Commit your changes following our commit conventions
5. Push your branch to your fork
6. Create a Pull Request

## Branch Naming Convention

We follow a specific branch naming convention to maintain consistency and clarity:

- **`feature/`** - Adding a new feature
  - Example: `feature/user-authentication`
- **`bugfix/`** - Fixing a bug
  - Example: `bugfix/login-validation-error`
- **`hotfix/`** - Fixing a critical bug in production
  - Example: `hotfix/security-vulnerability`
- **`chore/`** - Code cleanup or maintenance
  - Example: `chore/update-dependencies`
- **`experiment/`** - Experimenting with new features
  - Example: `experiment/new-ui-framework`

## Commit Message Convention

We follow a standardized format for commit messages to maintain a clear and readable project history.

### Format

```
[type](scope): subject
```

### Type

Defines the type of commit. Common options include:

- **`build`** - Changes related to the build system (e.g., gulp, webpack, npm)
- **`doc`** - Documentation changes
- **`feat`** - Adding a new feature
- **`fix`** - Bug fixes
- **`perf`** - Performance improvements
- **`refactor`** - Code refactoring without functionality changes
- **`style`** - Code style changes (formatting, whitespace) without logic modifications
- **`test`** - Adding or modifying tests
- **`chore`** - Non-impactful modifications

### Scope (Optional)

Indicates which part of the program is affected by the commit (e.g., UI, backend, api, database).

### Subject

Briefly summarizes the changes made, following these rules:

- Use the imperative present tense (e.g., "add", not "added" or "adds")
- Do not start with a capital letter
- Do not end with a period (.)
- Keep it concise (50 characters or less)

### Examples

```
[feat](auth): add user login functionality
[fix](api): resolve null pointer exception in user service
[doc]: update installation instructions
[refactor](database): optimize query performance
[test](auth): add unit tests for login validation
```

## Pull Request Process

1. **Before submitting**: Ensure your code follows the project's coding standards and passes all tests
2. **Title**: Use a clear and descriptive title
3. **Description**: Provide a detailed description of your changes, including:
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Screenshots (if applicable)
4. **Testing**: Include information about how the changes were tested
5. **Review**: Be responsive to feedback and make requested changes promptly

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if necessary)
```

## Code Standards

- **Code Style**: Follow the existing code style and formatting
- **Comments**: Write clear, concise comments for complex logic
- **Error Handling**: Implement proper error handling and logging
- **Security**: Follow security best practices
- **Performance**: Consider performance implications of your changes

## Testing

- Write tests for new features and bug fixes
- Ensure all existing tests pass
- Include both unit tests and integration tests where appropriate
- Test coverage should not decrease with new changes

### Running Tests

```bash
npm test
```

## Documentation

- Update documentation for any new features or changes
- Keep README.md up to date
- Update API documentation if applicable
- Use clear and concise language

## Questions and Support

If you have questions about contributing:

1. Check existing issues and discussions
2. Create a new issue with the `question` label
3. Reach out to the maintainers

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project, you agree to abide by its terms.

---

Thank you for contributing to the TWIN project! 🚀
