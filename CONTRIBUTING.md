# Guía de Contribución y Estilo

Este documento establece las normas técnicas para el desarrollo del TFG, asegurando la integridad del software y la trazabilidad del progreso.

## Metodología de Ramificación (Git Flow Simplificado)

Se utiliza una estrategia de ramas efímeras para mantener la rama `main` siempre estable.

- **`main`**: Rama principal. Contiene el código en estado de producción/entrega.
- **`develop`**: Rama de integración. Las features se fusionan aquí antes de ir a `main`.
- **`feature/`**: Ramas para nuevas funcionalidades (ej. `feature/setup-yolo`).
- **`fix/`**: Ramas para corrección de errores (ej. `fix/openai-auth-error`).
- **`test/`**: Ramas para creación y edición de pruebas(ej. `test/app-unit-tests`).
- **`docs/`**: Cambios exclusivos en documentación o memoria del TFG.

> **Regla de oro:** Una vez que una rama se fusiona con `main`, se debe proceder a su borrado local y remoto para mantener la higiene del repositorio.

## Metodología de Trabajo

### El flujo de trabajo profesional cuando inicies una tarea sería este:

1. Sincronización inicial

```bash
git checkout develop
git pull origin develop
```
2. Creación de la Rama de Tarea(Branching)

```bash
git checkout -b feature/mi-tarea
```

3. Desarrollo y Commits

```bash
git add .
git commit # Aquí se abrirá la plantilla .gitmessage
```

4. Subida y Revisión

```bash
git push origin feature/mi-tarea
```

### El flujo de trabajo profesional cuando termines una tarea sería este:

1. Merge: Unes los cambios a la rama principal.

```bash
git checkout develop
git merge feature/mi-tarea
git push origin develop
```

2. Release: Cuando el conjunto de features forma una versión estable, se fusiona develop con main y se etiqueta.

```bash
git checkout main
git merge develop
git push origin main
git tag -a v0.x.0 -m "descripción de la versión"
git push origin v0.x.0
```

3. Borrado Local: Borras la rama en tu ordenador.

```bash
git branch -d feature/mi-tarea
```

4. Borrado en GitHub (Remoto): Si subiste la rama a la nube, la borras allí también.

```bash
git push origin --delete feature/mi-tarea
```

## Estándar de Commits (Conventional Commits)

Cada commit debe seguir la estructura: `<tipo>: <descripción corta en minúsculas>`

| Tipo | Descripción |
| :--- | :--- |
| **feat** | Añadir una nueva característica o funcionalidad. |
| **fix** | Corregir un error o bug. |
| **docs** | Cambios en la documentación (README, memoria, comentarios). |
| **refactor** | Cambios en el código que no añaden funciones ni corrigen errores. |
| **style** | Cambios que no afectan al significado del código (espacios, formato, etc). |
| **test** | Añadir o corregir pruebas unitarias o de integración. |

## Gestión de Dependencias

1. El uso de entornos virtuales (`venv`) es obligatorio para evitar conflictos entre bibliotecas.
2. El archivo `.env` y la carpeta `venv/` están estrictamente excluidos del control de versiones mediante `.gitignore`.
3. Tras añadir una dependencia, se debe actualizar el archivo de requisitos: `pip freeze > requirements.txt`.