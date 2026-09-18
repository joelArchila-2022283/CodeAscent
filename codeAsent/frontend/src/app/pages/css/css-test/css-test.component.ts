import { Component, EventEmitter, Output, signal } from '@angular/core';
interface Question { topic:string; text:string; options:string[]; correct:string; hint:string; explanation:string; }
@Component({selector:'app-css-test',standalone:true,templateUrl:'./css-test.component.html',styleUrl:'./css-test.component.scss'})
export class CssTestComponent {
 @Output() back=new EventEmitter<void>(); index=signal(0); selected=signal<string|null>(null); showHint=signal(false); score=signal(0); finished=signal(false);
 questions:Question[]=[
  {topic:'SELECTORES',text:'¿Qué selector usarías para aplicar un estilo a todos los elementos con la clase "tarjeta"?',options:['#tarjeta','.tarjeta','tarjeta()','@tarjeta'],correct:'.tarjeta',hint:'Recuerda el símbolo que identifica una clase.',explanation:'El punto (.) identifica un selector de clase.'},
  {topic:'COLORES',text:'Quieres cambiar solamente el fondo de un panel. ¿Qué propiedad corresponde?',options:['color','background-color','font-color','text-align'],correct:'background-color',hint:'No quieres cambiar las letras, sino la superficie detrás de ellas.',explanation:'background-color modifica el color de fondo del elemento.'},
  {topic:'BOX MODEL',text:'El texto está demasiado pegado al borde de una tarjeta. ¿Qué propiedad crea espacio interior?',options:['margin','padding','display','position'],correct:'padding',hint:'Piensa en la capa que está entre el contenido y el borde.',explanation:'padding crea espacio dentro de la caja, entre contenido y borde.'},
  {topic:'TIPOGRAFÍA',text:'¿Qué propiedad permite centrar horizontalmente el texto dentro de su caja?',options:['font-weight','text-align','margin','font-size'],correct:'text-align',hint:'La propiedad contiene una palabra relacionada con alineación.',explanation:'text-align controla la alineación horizontal del contenido de texto.'},
  {topic:'INTEGRACIÓN',text:'¿Cuál regla combina correctamente selector de clase, color de texto y espacio interior?',options:['#card { text: white; margin-inside: 20px; }','.card { color: white; padding: 20px; }','card() { font-color: white; space: 20px; }','@card { color: white; inside: 20px; }'],correct:'.card { color: white; padding: 20px; }',hint:'Busca una clase válida y propiedades que sí aparecieron en DATA.',explanation:'La regla usa selector de clase, color para texto y padding para espacio interior.'}
 ];
 current(){return this.questions[this.index()]}
 answer(v:string){if(this.selected())return;this.selected.set(v);if(v===this.current().correct)this.score.update(s=>s+1)}
 next(){if(this.index()<this.questions.length-1){this.index.update(i=>i+1);this.selected.set(null);this.showHint.set(false)}else this.finished.set(true)}
 restart(){this.index.set(0);this.selected.set(null);this.showHint.set(false);this.score.set(0);this.finished.set(false)}
}
