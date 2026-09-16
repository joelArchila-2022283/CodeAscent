import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardSection, Lesson, Quest, QuizQuestion } from './models/dashboard.models';
import { DashboardNavbarComponent } from './components/dashboard-navbar.component';
import { DashboardHomeComponent } from './components/dashboard-home.component';
import { DashboardLessonsComponent } from './components/dashboard-lessons.component';
import { DashboardQuestsComponent } from './components/dashboard-quests.component';
import { DashboardConsoleComponent } from './components/Consola/consoleTS.component';
import { DashboardQuizComponent } from './components/dashboard-quiz.component';

@Component({
  selector: 'app-html-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardNavbarComponent,
    DashboardHomeComponent,
    DashboardLessonsComponent,
    DashboardQuestsComponent,
    DashboardConsoleComponent,
    DashboardQuizComponent
  ],
  templateUrl: './TS-dashboard.component.html',
  styleUrls: ['./styles/codeascent-shared.scss']
})
export class HtmlDashboardComponent implements OnInit {
  // Navegación de secciones activas
  activeSection: DashboardSection = 'dashboard';

  // Métricas del Jugador / Gamificación
  player = {
    name: 'Cadete Bit',
    title: 'Operador de Válvulas HTML',
    level: 1,
    currentXp: 320,
    nextLevelXp: 500,
    energyWatts: 88,
    maxWatts: 100,
    vacuumTubesLit: 3,
    totalVacuumTubes: 5,
    streakDays: 4
  };

  // Estado del monitor CRT y efectos
  crtPowerOn: boolean = true;
  crtScanlinesEnabled: boolean = true;
  vintageFlicker: boolean = false;
  soundEnabled: boolean = true;

  // Feedback Rubber Hose Cartoon
  cartoonMascotState: 'idle' | 'happy' | 'thinking' | 'shocked' | 'cheering' = 'idle';
  mascotDialogue: string = '¡Saludos, camarada! La placa base necesita flujo de etiquetas HTML.';

  // Lecciones (Manual Técnico Vintage)
  selectedLessonIndex: number = 0;
  lessons: Lesson[] = [
    {
      id: 'lesson-1',
      badgeNumber: 'DOC-01',
      title: 'Anatomía de una Etiqueta HTML',
      subtitle: 'Los bloques elementales del circuito web',
      category: 'Estructura Básica',
      difficulty: 'Básico',
      summary: 'Descubre cómo los delimitadores angulares envuelven el contenido y forman elementos del DOM.',
      content: {
        heading: '1. El Conducto Elemental: <tag>contenido</tag>',
        explanation: 'En la gran tarjeta madre del navegador, cada elemento HTML funciona como un conector polarizado: tiene una etiqueta de apertura (<>), atributos que configuran su resistencia o canal (id, class), el contenido del filamento y una etiqueta de cierre (</>).',
        codeSample: `<button class="valvula-retro" id="btn-ignicion">
  ⚡ ¡Encender Filamento!
</button>`,
        keyPoints: [
          'Etiqueta de Apertura: Inicia el ámbito del elemento.',
          'Atributos: Pares clave-valor que añaden propiedades (ej. href, src).',
          'Etiqueta de Cierre: Lleva barra inclinada diagonal </tag>.',
          'Elementos Vacíos (Void): No tienen cierre ni hijos directos (ej. <img />, <input />, <hr />).'
        ],
        technicalTip: '¡Cuidado con no cerrar las válvulas! Un tag sin cerrar sobrecalienta el parser del navegador.'
      }
    },
    {
      id: 'lesson-2',
      badgeNumber: 'DOC-02',
      title: 'El Esqueleto de la Tarjeta Madre',
      subtitle: 'Estructura raíz <!DOCTYPE html>, <html>, <head> y <body>',
      category: 'Arquitectura DOM',
      difficulty: 'Básico',
      summary: 'La jerarquía fundamental requerida por todo motor de renderizado desde 1993.',
      content: {
        heading: '2. Jerarquía del Chasis',
        explanation: 'Antes de inyectar corriente viva en la página, debemos definir las placas del chasis. El <head> almacena metadatos y osciladores de estilo sin dibujarse directamente. El <body> es la superficie viva donde se renderizan todos los componentes.',
        codeSample: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Transmisor CodeAscent</title>
  </head>
  <body>
    <h1>¡Sistema En Línea!</h1>
  </body>
</html>`,
        keyPoints: [
          '<!DOCTYPE html>: Instrucción preliminar al navegador.',
          '<head>: Bobina de metadatos, fuentes, scripts y títulos.',
          '<body>: El plano visible donde ocurre toda la acción gráfica.'
        ],
        technicalTip: 'El DOCTYPE no es una etiqueta HTML, es un preámbulo para evitar el "Quirks Mode" retro.'
      }
    },
    {
      id: 'lesson-3',
      badgeNumber: 'DOC-03',
      title: 'El Árbol del DOM y la Semántica',
      subtitle: 'Organizando mangueras con propósito estructural',
      category: 'Semántica Web',
      difficulty: 'Intermedio',
      summary: 'Por qué usar <main>, <article>, <nav> y <section> en lugar de solo cajas <div> genéricas.',
      content: {
        heading: '3. Bobinas Semánticas vs. Latas Vacías',
        explanation: 'En las radios de tubos de vacío, cada conductor tenía un color y propósito asignado. Del mismo modo, el HTML semántico comunica a los lectores de pantalla y a los motores de búsqueda exactamente qué función cumple cada módulo.',
        codeSample: `<header>
  <nav><a href="#circuito">Canal 01</a></nav>
</header>
<main>
  <article>
    <h2>Válvula de Salida</h2>
    <p>Flujo constante a 60 hercios.</p>
  </article>
</main>`,
        keyPoints: [
          '<header>, <footer>: Terminales de entrada y salida de página.',
          '<nav>: Puente de canalización y navegación de enlaces.',
          '<article> vs <section>: Módulos autónomos vs agrupaciones temáticas.'
        ],
        technicalTip: 'Un DOM semántico mejora la accesibilidad (a11y) y hace que los motores indexen tu tarjeta a la perfección.'
      }
    }
  ];

  // Misiones del Nivel (Gamificación CodeAscent)
  quests: Quest[] = [
    {
      id: 'q-1',
      code: 'M-01',
      title: 'Conectar el Filamento Principal',
      description: 'Examina la teoría de apertura y cierre de etiquetas en el Manual Técnico.',
      xpReward: 50,
      status: 'completed',
      targetSection: 'lessons',
      icon: 'zap',
      requirement: 'Leer Lección DOC-01'
    },
    {
      id: 'q-2',
      code: 'M-02',
      title: 'Inyectar Código en el Monitor CRT',
      description: 'Escribe una etiqueta <h1> con un saludo en la consola retro y compílala.',
      xpReward: 80,
      status: 'in-progress',
      targetSection: 'console',
      icon: 'terminal',
      requirement: 'Ejecutar código válido en el terminal'
    },
    {
      id: 'q-3',
      code: 'M-03',
      title: 'El Examen del Maestro Bobina',
      description: 'Responde correctamente al menos 3 preguntas de la prueba de diagnóstico.',
      xpReward: 100,
      status: 'in-progress',
      targetSection: 'quiz',
      icon: 'help-circle',
      requirement: 'Obtener puntaje perfecto en el Quiz'
    },
    {
      id: 'q-4',
      code: 'M-04',
      title: 'Armar una Tarjeta Semántica',
      description: 'Construye un contenedor con <header>, <main> y <footer> en el playground.',
      xpReward: 150,
      status: 'locked',
      targetSection: 'console',
      icon: 'layers',
      requirement: 'Desbloquear tras completar M-02 y M-03'
    }
  ];

  // Consola / Terminal CRT
  terminalInput: string = `<div class="reactor-card">
  <h2>⚡ Válvula HTML Activada</h2>
  <p>El flujo catódico recorre las tuberías del circuito.</p>
  <button onclick="alert('¡Circuito cargado!')">Pulsar Interruptor</button>
</div>`;
  terminalOutput: string = '';
  terminalLogs: string[] = [
    '[SYS_INIT] Frecuencia de barrido fijada a 15.75 kHz...',
    '[CRT_READY] Tubo de rayos catódicos precalentado.',
    '[CIRCUIT] Conexión establecida con la placa base CodeAscent.'
  ];
  terminalCompilationTime: string = '0.04s';
  terminalCodeValid: boolean = true;

  // Cuestionario (Quiz)
  currentQuestionIndex: number = 0;
  selectedAnswerIndex: number | null = null;
  quizSubmitted: boolean = false;
  quizScore: number = 0;
  quizCompleted: boolean = false;
  quizFeedbackState: 'idle' | 'correct' | 'incorrect' = 'idle';

  quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: '¿Cuál es la etiqueta canónica para definir el contenedor de mayor jerarquía visual visible para el usuario?',
      codeSnippet: '<html>\n  <head>...</head>\n  <...>\n    <!-- Contenido visual aquí -->\n  </...>\n</html>',
      options: ['<main>', '<body>', '<section>', '<canvas>'],
      correctIndex: 1,
      explanation: '¡Exacto! El elemento <body> encierra todo el contenido interactivo y visual que dibuja el motor de render.'
    },
    {
      id: 2,
      question: '¿Cuál de las siguientes etiquetas corresponde a un "Elemento Vacío" (Void Element) que NO requiere cierre formal en HTML5?',
      options: ['<p>', '<div>', '<img>', '<span>'],
      correctIndex: 2,
      explanation: '¡Así es! <img> no tiene etiqueta de cierre ni hijos de texto internos en HTML5 estándar.'
    },
    {
      id: 3,
      question: '¿Qué atributo es indispensable en una etiqueta de anclaje (<a>) para designar el destino de la tubería de navegación?',
      codeSnippet: '<a ...="https://codeascent.dev">Ir a CodeAscent</a>',
      options: ['src', 'link', 'href', 'target-url'],
      correctIndex: 2,
      explanation: '¡Brillante! El atributo "href" (Hypertext Reference) establece la dirección a la que apunta el enlace.'
    },
    {
      id: 4,
      question: '¿Cuál es la función primordial de la etiqueta <title> alojada en la bobina <head>?',
      options: [
        'Crear el encabezado H1 más grande en la pantalla',
        'Establecer el nombre que aparece en la pestaña del navegador y marcadores',
        'Cargar el logotipo animado del sitio',
        'Dar estilos CSS a los botones'
      ],
      correctIndex: 1,
      explanation: '<title> define el título del documento en la barra de pestañas y en los resultados de motores de búsqueda.'
    }
  ];

  ngOnInit(): void {
    this.executeTerminalCode();
  }

  // Navegación entre vistas
  navigateTo(section: DashboardSection): void {
    this.activeSection = section;
    this.playBleepSound(440, 0.08);

    if (section === 'lessons') {
      this.setMascot('thinking', '¡Abre bien los ojos! El manual guarda los secretos del silicio.');
    } else if (section === 'quests') {
      this.setMascot('happy', '¡Misiones en curso! Reclama tus puntos de experiencia.');
    } else if (section === 'console') {
      this.setMascot('idle', 'Monitores verdes listos. Inyecta tus etiquetas sin miedo al corto.');
    } else if (section === 'quiz') {
      this.setMascot('thinking', '¡Momento de calibración! Demuestra tu conocimiento de tubos.');
    } else {
      this.setMascot('cheering', '¡Bienvenido de vuelta al puente central de la placa base!');
    }
  }

  // Selección de lección
  selectLesson(index: number): void {
    this.selectedLessonIndex = index;
    this.playBleepSound(520, 0.06);
    this.setMascot('happy', `Estudiando: ${this.lessons[index].title}.`);
  }

  // Ejecución de código en el Terminal CRT
  executeTerminalCode(): void {
    try {
      this.terminalOutput = this.terminalInput;
      this.terminalCodeValid = true;
      const timestamp = new Date().toLocaleTimeString();
      this.terminalLogs.push(`[${timestamp}] Compilación satisfactoria. DOM inyectado en CRT.`);
      this.playBleepSound(880, 0.12);
      this.setMascot('happy', '¡La pantalla de fósforo verde cobró vida con tu código!');

      // Actualizar misión si estaba en progreso
      const quest = this.quests.find(q => q.id === 'q-2');
      if (quest && quest.status === 'in-progress') {
        quest.status = 'completed';
        this.addXp(quest.xpReward);
      }
    } catch {
      this.terminalCodeValid = false;
      this.terminalLogs.push(`[ERR] Falla en la bobina de parsing HTML.`);
      this.playBleepSound(180, 0.25);
      this.setMascot('shocked', '¡Fritura en el condensador! Revisa la sintaxis de tus etiquetas.');
    }
  }

  // Limpiar terminal
  clearTerminal(): void {
    this.terminalInput = '';
    this.terminalOutput = '';
    this.playBleepSound(300, 0.05);
  }

  // Restaurar código de muestra
  resetTerminalSnippet(): void {
    this.terminalInput = `<section class="panel-retro">
  <h1>📟 Sistema Vintage</h1>
  <p>Tubos de vacío calibrados al 100%.</p>
  <ul>
    <li>Etiqueta &lt;ul&gt; para listas desordenadas</li>
    <li>Etiqueta &lt;li&gt; para cada borne o elemento</li>
  </ul>
</section>`;
    this.executeTerminalCode();
  }

  // Interacción en Quiz
  selectQuizOption(index: number): void {
    if (this.quizSubmitted) return;
    this.selectedAnswerIndex = index;
    this.playBleepSound(600, 0.04);
  }

  submitQuizAnswer(): void {
    if (this.selectedAnswerIndex === null || this.quizSubmitted) return;
    
    this.quizSubmitted = true;
    const currentQ = this.quizQuestions[this.currentQuestionIndex];
    const isCorrect = this.selectedAnswerIndex === currentQ.correctIndex;

    if (isCorrect) {
      this.quizScore++;
      this.quizFeedbackState = 'correct';
      this.playBleepSound(980, 0.18);
      this.setMascot('cheering', '¡Chispas de victoria! ¡Respuesta completamente exacta!');
    } else {
      this.quizFeedbackState = 'incorrect';
      this.playBleepSound(220, 0.3);
      this.setMascot('shocked', '¡Gong! La resistencia no aguantó el voltaje. ¡Aprende del error!');
    }
  }

  nextQuizQuestion(): void {
    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswerIndex = null;
      this.quizSubmitted = false;
      this.quizFeedbackState = 'idle';
      this.playBleepSound(520, 0.05);
    } else {
      this.quizCompleted = true;
      this.playBleepSound(1200, 0.3);
      this.setMascot('cheering', `¡Diagnóstico finalizado con éxito! Puntuación: ${this.quizScore}/${this.quizQuestions.length}`);
      
      const q3 = this.quests.find(q => q.id === 'q-3');
      if (q3 && q3.status === 'in-progress' && this.quizScore >= 3) {
        q3.status = 'completed';
        this.addXp(q3.xpReward);
      }
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswerIndex = null;
    this.quizSubmitted = false;
    this.quizScore = 0;
    this.quizCompleted = false;
    this.quizFeedbackState = 'idle';
    this.playBleepSound(440, 0.1);
  }

  // Métodos de Gamificación
  addXp(points: number): void {
    this.player.currentXp += points;
    if (this.player.currentXp >= this.player.nextLevelXp) {
      this.player.level++;
      this.player.currentXp = this.player.currentXp - this.player.nextLevelXp;
      this.player.nextLevelXp = Math.round(this.player.nextLevelXp * 1.5);
      this.player.energyWatts = Math.min(100, this.player.energyWatts + 15);
      this.setMascot('cheering', `¡SUBIDA DE NIVEL! Ahora eres Nivel ${this.player.level}.`);
    }
  }

  toggleCrtFlicker(): void {
    this.vintageFlicker = !this.vintageFlicker;
    this.playBleepSound(660, 0.05);
  }

  toggleScanlines(): void {
    this.crtScanlinesEnabled = !this.crtScanlinesEnabled;
    this.playBleepSound(750, 0.05);
  }

  setMascot(state: 'idle' | 'happy' | 'thinking' | 'shocked' | 'cheering', dialogue: string): void {
    this.cartoonMascotState = state;
    this.mascotDialogue = dialogue;
  }

  // Sintetizador de audio retro sin dependencias externas (Web Audio API)
  private playBleepSound(freq: number, duration: number): void {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio silenciado sin interrumpir la app
    }
  }
}
