export type SubSeccionGuiaGit =
  | "ramas-pr"
  | "commits"
  | "sincronizar"
  | "conflictos"
  | "revertir"
  | "ci";

export const subItemsGuiaGit: { id: SubSeccionGuiaGit; label: string }[] = [
  { id: "ramas-pr", label: "Ramas y Pull Requests" },
  { id: "commits", label: "Convenciones de Commits" },
  { id: "sincronizar", label: "Sincronización de Ramas" },
  { id: "conflictos", label: "Resolución de Conflictos" },
  { id: "revertir", label: "Revertir Commits" },
  { id: "ci", label: "Disparar Pipeline CI" },
];

export interface GuiaPaso {
  numero: number;
  titulo: string;
  descripcion: string;
  comando?: string;
  flags?: Array<{ flag: string; explicacion: string }>;
  tooltipExplicativo?: {
    titulo: string;
    contenido: string;
  };
  nota?: string;
}

export interface GuiaTema {
  id: SubSeccionGuiaGit;
  titulo: string;
  subtitulo: string;
  resumen: string;
  cuandoOcurre: string;
  pasos: GuiaPaso[];
  consejoPro?: {
    titulo: string;
    texto: string;
    comando?: string;
  };
  advertencia?: {
    titulo: string;
    texto: string;
  };
}

export const GUIA_GIT_TEMAS: GuiaTema[] = [
  {
    id: "ramas-pr",
    titulo: "Ramas y Pull Requests",
    subtitulo: "Flujo colaborativo: creación de ramas aisladas, prefijos y apertura de PRs",
    resumen:
      "Es la metodología de trabajo en Git donde cada funcionalidad o corrección se desarrolla en una rama independiente para no comprometer la rama principal (main) hasta ser revisada y testeada.",
    cuandoOcurre:
      "Cada vez que comenzás una nueva tarea, feature o corrección de bugs en un trabajo práctico, ya sea individual o en equipo.",
    pasos: [
      {
        numero: 1,
        titulo: "Crear una nueva rama con prefijo estándar",
        descripcion:
          "Nunca programes directamente sobre 'main'. Desde tu rama 'main' actualizada, creá una rama usando prefijos descriptivos (como feature/, fix/ o chore/):",
        comando: "git switch -c feature/login-usuario",
        flags: [
          {
            flag: "switch -c",
            explicacion:
              "Crea una rama nueva con el nombre indicado y te posiciona en ella inmediatamente (equivalente a git checkout -b).",
          },
          {
            flag: "feature/",
            explicacion:
              "Prefijo que indica el desarrollo de una nueva funcionalidad.",
          },
        ],
        tooltipExplicativo: {
          titulo: "Prefijos de rama recomendados",
          contenido:
            "• feature/ o feat/: Nueva funcionalidad (ej: feature/calculo-promedio).\n• fix/: Corrección de un bug (ej: fix/division-por-cero).\n• chore/: Configuración, dependencias o herramientas (ej: chore/eslint-setup).\n• docs/: Documentación o enunciados (ej: docs/actualizar-readme).\n• refactor/: Reestructuración de código sin cambiar funcionalidad externa.",
        },
      },
      {
        numero: 2,
        titulo: "Publicar tu rama en GitHub con upstream",
        descripcion:
          "Luego de hacer tus commits en la rama, subila al repositorio remoto configurando el rastreo con el flag -u:",
        comando: "git push -u origin feature/login-usuario",
        flags: [
          {
            flag: "-u",
            explicacion:
              "Establece la rama remota como upstream. Las próximas veces que subas cambios en esta rama, solo hará falta escribir 'git push'.",
          },
          {
            flag: "origin",
            explicacion: "Nombre estándar del repositorio remoto en GitHub.",
          },
        ],
        tooltipExplicativo: {
          titulo: "¿Por qué configurar upstream (-u)?",
          contenido:
            "Vincula de forma permanente tu rama local con la de GitHub, permitiéndote usar 'git push' y 'git pull' directos y consultar qué tan adelantada o atrasada está tu rama respecto al remoto.",
        },
      },
      {
        numero: 3,
        titulo: "Abrir el Pull Request en GitHub",
        descripcion:
          "Entrá a la página de tu repositorio en GitHub. Vas a ver una notificación amarilla 'Compare & pull request'. Hacé clic allí para solicitar fusionar tu rama en 'main'.",
        tooltipExplicativo: {
          titulo: "¿Qué debe incluir el Pull Request?",
          contenido:
            "1. Título conciso con prefijo (ej: 'feat: implementar login de alumno').\n2. Descripción breve de qué cambios introduce y cómo probarlos.\n3. Asegurate de que la rama base de destino sea 'main'.",
        },
      },
      {
        numero: 4,
        titulo: "Esperar el CI, solicitar revisión y fusionar (Merge)",
        descripcion:
          "Verificá que las pruebas automatizadas de GitHub Actions pasen en verde. Pedile a tus compañeros de grupo que revisen tus cambios ('Reviewers'). Una vez aprobado, fusioná el PR con 'Merge pull request'.",
      },
    ],
    consejoPro: {
      titulo: "¿'main' avanzó mientras trabajabas en tu rama?",
      texto:
        "Para evitar conflictos al momento de abrir o fusionar el PR, integrá los últimos cambios de main en tu rama usando rebase antes de pushear:",
      comando: "git pull --rebase origin main",
    },
  },
  {
    id: "commits",
    titulo: "Convenciones de Commits",
    subtitulo: "Estándar Conventional Commits y buenas prácticas de historial limpio",
    resumen:
      "Es el estándar formal para redactar mensajes de commit claros, estructurados y atómicos, permitiendo entender el propósito exacto de cada cambio a primera vista.",
    cuandoOcurre:
      "Cada vez que guardás código con 'git commit' y querés evitar advertencias de 'Mensaje inadecuado' o 'Commit con muchos cambios' en las revisiones automáticas de la plataforma.",
    pasos: [
      {
        numero: 1,
        titulo: "Estructura del mensaje: tipo: descripción",
        descripcion:
          "Escribí el mensaje comenzando con el tipo de cambio en minúscula seguido de dos puntos y un espacio. Mantenelo conciso (menos de 72 caracteres):",
        nota: "<tipo>: <descripción concisa en imperativo o presente>\n\nEjemplos válidos:\nfeat: agregar validacion de nota minima en examen\nfix: corregir excepcion null pointer al cargar alumno\ntest: agregar tests unitarios para inscripcion\nchore: actualizar dependencias en package.json\ndocs: completar instrucciones de instalacion en README",
        tooltipExplicativo: {
          titulo: "Tipos estándar reconocidos por el linter",
          contenido:
            "• feat: Nueva característica o funcionalidad.\n• fix: Arreglo de un bug o error en el sistema.\n• docs: Cambios únicamente en archivos de documentación.\n• test: Incorporación o ajuste de pruebas unitarias.\n• refactor: Mejora del código sin cambiar comportamiento.\n• chore: Tareas de mantenimiento, dependencias o configuración de build.",
        },
      },
      {
        numero: 2,
        titulo: "Crear commits pequeños y atómicos",
        descripcion:
          "Evitá 'megacommits' de 30 archivos que mezclan diferentes tareas. Seleccioná con 'git add' únicamente los archivos que pertenecen a una misma unidad lógica:",
        comando: "git add src/models/alumno.ts src/models/alumno.test.ts",
        tooltipExplicativo: {
          titulo: "¿Qué es un commit atómico?",
          contenido:
            "Es un commit que resuelve una sola tarea puntual. Si un commit atómico introduce un error, revertirlo o aislar el bug es sencillo y seguro, sin arriesgar código de otras funcionalidades.",
        },
      },
      {
        numero: 3,
        titulo: "Confirmar con el mensaje estandarizado",
        descripcion:
          "Usá el comando 'git commit -m' indicando el prefijo y mensaje. Evitá textos genéricos como 'cambios', 'asdf', 'fix' o 'subiendo tp':",
        comando: 'git commit -m "feat: agregar validacion de correlatividades"',
        flags: [
          {
            flag: "-m",
            explicacion:
              "Permite especificar el mensaje de commit directamente entre comillas desde la terminal.",
          },
        ],
      },
      {
        numero: 4,
        titulo: "Verificar tu historial local",
        descripcion:
          "Revisá los últimos commits en tu terminal para corroborar que los mensajes sean claros y sigan el formato:",
        comando: "git log --oneline -n 5",
        flags: [
          {
            flag: "--oneline",
            explicacion:
              "Muestra cada commit condensado en una sola línea (hash abreviado + mensaje).",
          },
          {
            flag: "-n 5",
            explicacion: "Limita la salida a los últimos 5 commits realizados.",
          },
        ],
      },
    ],
    advertencia: {
      titulo: "Sugerencia automática de UNQlassroom",
      texto:
        "El sistema analiza continuamente tu historial de Git. Si tus commits no usan prefijos convencionales o agrupan demasiados archivos juntos, verás advertencias en la pestaña 'Estado Técnico > Buenas Prácticas'.",
    },
  },
  {
    id: "sincronizar",
    titulo: "Sincronizar Ramas",
    subtitulo: "Mantener tu rama al día con el trabajo del equipo sin commits basura",
    resumen:
      "Es el proceso de actualizar tu rama local con los últimos commits subidos al repositorio remoto (y publicar los tuyos), asegurando que todo el equipo trabaje alineado sobre la misma base de código.",
    cuandoOcurre:
      "Al inicio de cada jornada antes de programar tu parte, y justo antes de hacer un 'git push' para integrar tus avances con los de tus compañeros.",
    pasos: [
      {
        numero: 1,
        titulo: "Guardar o commitear tus cambios locales",
        descripcion:
          "Antes de sincronizar con el remoto, asegurate de tener un commit local o guardar tus cambios temporales en el stash:",
        comando: "git stash",
        tooltipExplicativo: {
          titulo: "¿Qué es el stash?",
          contenido:
            "El stash es como un bolsillo temporal donde Git guarda tus cambios sin commitear, dejando tu copia de trabajo limpia para poder sincronizar sin trabas.",
        },
      },
      {
        numero: 2,
        titulo: "Descargar los cambios más recientes con rebase",
        descripcion:
          "Usá 'git pull --rebase' para colocar tus commits locales en la punta de la rama sobre los cambios nuevos que subieron tus compañeros, evitando commits de merge automáticos innecesarios.",
        comando: "git pull --rebase origin main",
        flags: [
          {
            flag: "--rebase",
            explicacion:
              "Aplica tus commits locales uno a uno encima de lo último descargado de GitHub, manteniendo un árbol de commits lineal y prolijo.",
          },
          {
            flag: "origin",
            explicacion: "Nombre estándar del repositorio remoto en GitHub.",
          },
        ],
        tooltipExplicativo: {
          titulo: "¿Por qué rebase y no pull común?",
          contenido:
            "El 'git pull' tradicional crea commits con mensajes genéricos tipo 'Merge branch main into main'. El flag '--rebase' evita esos commits basura y te ayuda a cumplir con las métricas de buenas prácticas de Git.",
        },
      },
      {
        numero: 3,
        titulo: "Recuperar tus cambios del stash (si lo usaste)",
        descripcion: "Si usaste 'git stash' en el paso 1, recuperá tus cambios guardados:",
        comando: "git stash pop",
      },
      {
        numero: 4,
        titulo: "Publicar tus cambios en GitHub",
        descripcion:
          "Una vez sincronizado y testeado en local, subí tus commits al repositorio remoto:",
        comando: "git push origin <tu-rama>",
        flags: [
          {
            flag: "-u",
            explicacion:
              "Configura el rastreo ('upstream') para que las próximas veces baste con escribir simplemente 'git push'.",
          },
        ],
      },
    ],
  },
  {
    id: "conflictos",
    titulo: "Resolución de Conflictos",
    subtitulo: "Cómo solucionar divergencias entre tu código y el repositorio remoto",
    resumen:
      "Es el proceso de conciliar y decidir manualmente qué código conservar cuando dos personas (o vos en dos ramas distintas) modificaron las mismas líneas de un archivo y Git no puede combinarlas de forma automática.",
    cuandoOcurre:
      "Aparece al hacer 'git pull' o 'git merge' si alguien más subió cambios que tocan las mismas partes del código en las que estuviste trabajando, marcando el archivo como 'CONFLICT'.",
    pasos: [
      {
        numero: 1,
        titulo: "Identificar los archivos en conflicto",
        descripcion:
          "Ejecutá 'git status' para ver la lista exacta de archivos marcados como 'both modified'.",
        comando: "git status",
        tooltipExplicativo: {
          titulo: "Archivos en conflicto",
          contenido:
            "Los archivos que digan 'both modified' contienen marcadores de conflicto que tenés que revisar y editar manualmente antes de poder continuar.",
        },
      },
      {
        numero: 2,
        titulo: "Entender los marcadores de conflicto",
        descripcion:
          "Abrí el archivo en tu editor (VS Code, IntelliJ, etc.). Vas a ver secciones delimitadas por marcadores de Git:",
        tooltipExplicativo: {
          titulo: "Anatomía de los marcadores",
          contenido:
            "Entre '<<<<<<< HEAD' y '=======' están tus cambios locales. Entre '=======' y '>>>>>>>' están los cambios remotos que intentás traer. Tu trabajo es elegir la combinación correcta y borrar los marcadores.",
        },
        nota: "<<<<<<< HEAD\n// Tu código local actual\n=======\n// Código que viene del repositorio remoto\n>>>>>>> rama-o-commit",
      },
      {
        numero: 3,
        titulo: "Editar el código y eliminar los marcadores",
        descripcion:
          "Modificá el archivo dejando el código final deseado. Asegurate de borrar por completo las líneas '<<<<<<<', '=======', y '>>>>>>>'. Probá que el código compile y los tests sigan funcionando.",
      },
      {
        numero: 4,
        titulo: "Marcar como resuelto y confirmar",
        descripcion:
          "Agregá el archivo resuelto al área de preparación con 'git add' y confirmá con 'git commit' (o si estabas en un rebase, continuá con 'git rebase --continue').",
        comando: "git add . && git commit -m \"fix: resolver conflictos de integracion\"",
        tooltipExplicativo: {
          titulo: "¿Por qué git add?",
          contenido:
            "Hacer 'git add' sobre un archivo en conflicto le avisa a Git que ya resolviste manualmente las discrepancias de ese archivo.",
        },
      },
    ],
    consejoPro: {
      titulo: "¿Algo salió mal y querés volver atrás?",
      texto:
        "Si te equivocaste al resolver y querés abortar el merge o rebase volviendo al estado exacto previo al conflicto sin perder tus cambios locales iniciales, ejecutá:",
      comando: "git merge --abort",
    },
  },
  {
    id: "revertir",
    titulo: "Revertir Commits",
    subtitulo: "Deshacer cambios de manera segura sin romper el historial del equipo",
    resumen:
      "Es la operación de dar marcha atrás a uno o más commits para devolver el código a un estado previo, ya sea descartando cambios locales o creando un commit inverso seguro para no alterar el historial del equipo.",
    cuandoOcurre:
      "Cuando confirmaste código con errores o bugs, te olvidaste de incluir archivos necesarios, o necesitás deshacer una funcionalidad que rompió las pruebas del proyecto.",
    pasos: [
      {
        numero: 1,
        titulo: "Deshacer el último commit local (Aún no subido a GitHub)",
        descripcion:
          "Si hiciste un commit pero todavía NO hiciste 'git push', podés deshacer el commit manteniendo todos tus archivos editados intactos en el editor.",
        comando: "git reset --soft HEAD~1",
        flags: [
          {
            flag: "--soft",
            explicacion:
              "Deshace el commit pero deja todas tus modificaciones intactas en el área de preparación (stage), listas para re-commitear.",
          },
          {
            flag: "HEAD~1",
            explicacion:
              "Indica 'un commit antes del actual'. Podés cambiar 1 por el número de commits que quieras retroceder.",
          },
        ],
        tooltipExplicativo: {
          titulo: "--soft vs --hard",
          contenido:
            "NUNCA uses '--hard' salvo que realmente quieras borrar de forma definitiva e irrecuperable tus cambios. Con '--soft' no perdés ni una sola línea de código escrita.",
        },
      },
      {
        numero: 2,
        titulo: "Revertir un commit que YA fue subido a GitHub",
        descripcion:
          "Si el commit ya está en el repositorio remoto (rama compartida con tus compañeros), NO debes reescribir la historia. Usá 'git revert', que genera un commit nuevo que desace exactamente los cambios del commit indicado.",
        comando: "git revert <hash-del-commit>",
        tooltipExplicativo: {
          titulo: "¿Por qué 'git revert' es la opción segura?",
          contenido:
            "'git revert' no borra el commit problemático; crea un nuevo commit encima que invierte exactamente las modificaciones. Así tus compañeros no tendrán conflictos de historia desincronizada.",
        },
      },
      {
        numero: 3,
        titulo: "Descartar cambios no guardados en un archivo puntual",
        descripcion:
          "Si modificaste un archivo por error y querés que vuelva a estar exactamente como en el último commit sin tocar los demás archivos:",
        comando: "git restore <ruta/al/archivo>",
        tooltipExplicativo: {
          titulo: "Restauración selectiva",
          contenido:
            "Reemplaza el archivo de tu directorio de trabajo con la versión limpia registrada en HEAD.",
        },
      },
    ],
    advertencia: {
      titulo: "Evitá git push --force en ramas compartidas",
      texto:
        "Forzar el push con '--force' reescribe la historia del repositorio en GitHub y puede borrar commits de tus compañeros de grupo. Si necesitás deshacer cambios ya subidos, usá siempre 'git revert'.",
    },
  },
  {
    id: "ci",
    titulo: "Disparar Pipeline CI",
    subtitulo: "Cómo forzar la reejecución de las pruebas y build de GitHub Actions",
    resumen:
      "Es la acción de provocar una reejecución manual del flujo automatizado de pruebas, análisis de linter y compilación en GitHub Actions sin necesidad de modificar el código de la aplicación.",
    cuandoOcurre:
      "Cuando el pipeline falló por un problema transitorio ajeno a tu código (como un timeout de red al descargar dependencias) o necesitás revalidar el estado tras ajustar configuraciones del repositorio.",
    pasos: [
      {
        numero: 1,
        titulo: "Opción A: Disparar con un commit vacío (Recomendado por terminal)",
        descripcion:
          "Git permite crear un commit que no modifica ningún archivo pero que al ser subido a GitHub dispara automáticamente el webhook de GitHub Actions:",
        comando: "git commit --allow-empty -m \"ci: re-run pipeline\" && git push",
        flags: [
          {
            flag: "--allow-empty",
            explicacion:
              "Permite crear un commit válido sin ningún cambio en el código fuente ni en el árbol de archivos.",
          },
          {
            flag: "-m",
            explicacion: "Mensaje explicativo del commit; se recomienda usar prefijos como 'ci:'.",
          },
        ],
        tooltipExplicativo: {
          titulo: "¿Es seguro usar commits vacíos?",
          contenido:
            "Sí, es una práctica estándar en la industria. No modifica tu código, no genera conflictos con tus compañeros y queda explícito en el historial que se disparó una verificación.",
        },
      },
      {
        numero: 2,
        titulo: "Opción B: Reejecutar desde la web de GitHub Actions",
        descripcion:
          "Si tenés permisos de escritura en el repositorio, podés re-ejecutar el workflow directamente desde la interfaz web de GitHub.",
        tooltipExplicativo: {
          titulo: "¿Cómo hacerlo en GitHub?",
          contenido:
            "1. Ingresá a la pestaña 'Actions' de tu repositorio.\n2. Hacé clic en la última ejecución fallida.\n3. Arriba a la derecha hacé clic en el botón 'Re-run all jobs' (o 'Re-run failed jobs').",
        },
      },
      {
        numero: 3,
        titulo: "Consultar el diagnóstico en esta plataforma",
        descripcion:
          "Una vez que el pipeline finalice, volvé a la pestaña 'Estado Técnico > CI/CD' para ver el resultado de las pruebas, los tests pasados y, si hubo fallos, el fragmento exacto del log de compilación.",
      },
    ],
  },
];
