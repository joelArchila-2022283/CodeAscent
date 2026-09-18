import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface PracticeTask { title: string; instruction: string; hint: string; starter: string; }
@Component({ selector:'app-css-terminal', standalone:true, imports:[FormsModule], templateUrl:'./css-terminal.component.html', styleUrl:'./css-terminal.component.scss' })
export class CssTerminalComponent {
  @Output() back = new EventEmitter<void>();
  taskIndex = signal(0);
  showHint = signal(false);
  consoleText = signal('> Terminal CSS lista.\n> Lee el objetivo y modifica el código.');
  tasks: PracticeTask[] = [
    { title:'01 · SELECTOR DE CLASE', instruction:'Aplica la regla a la tarjeta de práctica usando el selector de clase correcto.', hint:'En DATA aprendiste que las clases empiezan con un símbolo específico.', starter:`/* Apunta a la clase demo */\n.demo {\n  color: white;\n}` },
    { title:'02 · COLOR Y FONDO', instruction:'Haz que la tarjeta tenga texto claro sobre un fondo morado.', hint:'Una propiedad controla las letras y otra la superficie.', starter:`.demo {\n  /* agrega color y background-color */\n}` },
    { title:'03 · BOX MODEL', instruction:'Agrega 24px de espacio interior y un borde sólido de 3px a la tarjeta.', hint:'El espacio entre contenido y borde no es margin.', starter:`.demo {\n  /* agrega padding y border */\n}` },
    { title:'04 · TIPOGRAFÍA', instruction:'Haz que el título h3 mida 28px, tenga peso 700 y quede centrado.', hint:'Necesitarás tres propiedades de Tipografía vistas en DATA.', starter:`.demo h3 {\n  /* font-size, font-weight y alineación */\n}` }
  ];
  code = this.tasks[0].starter;
  currentTask(){ return this.tasks[this.taskIndex()]; }
  chooseTask(i:number){ this.taskIndex.set(i); this.code=this.tasks[i].starter; this.showHint.set(false); this.consoleText.set('> Ejercicio cargado.\n> Modifica el código y ejecútalo.'); }
  run(): void { const id='codeascent-css-live-style'; document.getElementById(id)?.remove(); const style=document.createElement('style'); style.id=id; style.textContent=this.code.replace(/\.demo/g,'.css-live-demo'); document.head.appendChild(style); this.consoleText.set('> CSS procesado.\n> Observa la previsualización y compárala con el objetivo.'); }
  reset(): void { document.getElementById('codeascent-css-live-style')?.remove(); this.code=this.currentTask().starter; this.consoleText.set('> Ejercicio reiniciado.'); }
}
