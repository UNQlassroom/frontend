export type SubSeccionGuiaGit = "conflictos" | "revertir" | "sincronizar" | "ci";

export const subItemsGuiaGit: { id: SubSeccionGuiaGit; label: string }[] = [
  { id: "conflictos", label: "Resolución de Conflictos" },
  { id: "revertir", label: "Revertir Commits" },
  { id: "sincronizar", label: "Sincronizar Ramas" },
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
    id: "conflictos",
    titulo: "Resolución de Conflictos",
    subtitulo: "Cómo solucionar divergencias entre tu código y el repositorio remoto",
    resumen:
      "Un conflicto de Git ocurre cuando dos personas (o vos en dos computadoras distintas) modificaron las mismas líneas en un archivo y Git no puede decidir automáticamente qué cambio conservar.",
    cuandoOcurre:
      "Aparece comúnmente al ejecutar 'git pull' o 'git merge' y Git te indica: 'CONFLICT (content): Merge conflict in...'.",
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
      "Dependiendo de si tu commit ya fue enviado a GitHub (push) o si todavía está solo en tu máquina, la estrategia para deshacerlo es diferente.",
    cuandoOcurre:
      "Cuando hiciste un commit con un bug, olvidaste incluir un archivo o querés volver atrás una funcionalidad.",
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
    id: "sincronizar",
    titulo: "Sincronizar Ramas",
    subtitulo: "Mantener tu rama al día con el trabajo del equipo sin commits basura",
    resumen:
      "Al trabajar en grupo o en múltiples dispositivos, sincronizar con frecuencia evita dolores de cabeza y conflictos gigantes acumulados al final de la entrega.",
    cuandoOcurre:
      "Antes de comenzar a programar tu parte, y justo antes de hacer un 'git push' para subir tus avances.",
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
    id: "ci",
    titulo: "Disparar Pipeline CI",
    subtitulo: "Cómo forzar la reejecución de las pruebas y build de GitHub Actions",
    resumen:
      "A veces las pruebas en GitHub Actions fallan por causas ajenas al código (un timeout transitorio en la descarga de dependencias o un runner ocupado) o necesitás verificar el estado tras reconfigurar el repositorio.",
    cuandoOcurre:
      "Cuando querés volver a correr el pipeline de CI sin tener que inventar cambios falsos en tus archivos fuente.",
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
