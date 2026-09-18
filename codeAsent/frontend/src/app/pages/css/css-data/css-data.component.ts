import { Component, EventEmitter, Output, signal } from '@angular/core';

type Topic = 'selectores' | 'colores' | 'box' | 'tipografia';

interface CssTopic {
  title: string;
  objective: string;
  description: string;
  keyPoints: string[];
  code: string;
  explanation: string;
  hint: string;
  challenge: string;
}

@Component({
  selector: 'app-css-data',
  standalone: true,
  templateUrl: './css-data.component.html',
  styleUrl: './css-data.component.scss'
})
export class CssDataComponent {
  @Output() back = new EventEmitter<void>();
  @Output() practice = new EventEmitter<void>();
  activeTopic = signal<Topic>('selectores');

  topics: Record<Topic, CssTopic> = {
    selectores: {
      title: 'SELECTORES',
      objective: 'Elegir con precisión qué elemento HTML quieres modificar.',
      description: 'Un selector es la parte de una regla CSS que apunta al elemento que recibirá los estilos. Puedes seleccionar por etiqueta, clase o ID según qué tan específico necesites ser.',
      keyPoints: ['Etiqueta: p, h1, button → afecta elementos de ese tipo.', 'Clase: .tarjeta → reutilizable en varios elementos.', 'ID: #principal → identifica un elemento concreto.'],
      code: `.tarjeta {\n  color: rebeccapurple;\n}`,
      explanation: 'Aquí .tarjeta busca cualquier elemento cuya clase sea "tarjeta" y cambia el color de su texto.',
      hint: 'PISTA: observa el primer carácter del selector. El punto indica clase y # indica ID.',
      challenge: 'En Terminal tendrás que aplicar estilos a una tarjeta usando un selector de clase.'
    },
    colores: {
      title: 'COLORES Y FONDOS',
      objective: 'Diferenciar el color del contenido del color de la superficie.',
      description: 'color modifica principalmente el texto. background-color modifica el fondo del elemento. Los colores pueden escribirse con nombres, HEX, RGB o HSL.',
      keyPoints: ['color controla el color del texto.', 'background-color pinta el fondo.', 'HEX usa valores como #663399; RGB usa rgb(102, 51, 153).'],
      code: `.panel {\n  color: white;\n  background-color: rebeccapurple;\n}`,
      explanation: 'El texto será blanco y la superficie del panel será morada. Son dos propiedades distintas.',
      hint: 'PISTA: pregúntate si quieres cambiar las letras o la superficie que está detrás de ellas.',
      challenge: 'En Terminal tendrás que conseguir contraste entre texto y fondo.'
    },
    box: {
      title: 'BOX MODEL',
      objective: 'Controlar el espacio interior, el borde y el espacio exterior de una caja.',
      description: 'Todo elemento HTML se comporta como una caja. Desde adentro hacia afuera encontramos content, padding, border y margin.',
      keyPoints: ['padding crea espacio entre contenido y borde.', 'border rodea el padding y el contenido.', 'margin separa el elemento de los elementos vecinos.'],
      code: `.caja {\n  padding: 20px;\n  border: 2px solid #8b704d;\n  margin: 10px;\n}`,
      explanation: 'El contenido obtiene 20px de aire interno, un borde visible de 2px y 10px de separación exterior.',
      hint: 'PISTA: si el texto está pegado al borde, piensa en el espacio que está DENTRO de la caja.',
      challenge: 'En Terminal tendrás que dar espacio interior y borde a la tarjeta.'
    },
    tipografia: {
      title: 'TIPOGRAFÍA',
      objective: 'Crear jerarquía visual modificando tamaño, peso y alineación del texto.',
      description: 'Las propiedades tipográficas permiten controlar cómo se lee un texto. No solo decoran: ayudan a distinguir títulos, contenido y acciones.',
      keyPoints: ['font-size controla el tamaño.', 'font-weight controla el grosor.', 'text-align controla la alineación horizontal del texto.'],
      code: `h3 {\n  font-size: 28px;\n  font-weight: 700;\n  text-align: center;\n}`,
      explanation: 'El título se hace más grande, más grueso y queda centrado dentro de su contenedor.',
      hint: 'PISTA: para centrar texto no necesitas mover la caja completa; existe una propiedad específica de alineación.',
      challenge: 'En Terminal tendrás que mejorar la jerarquía del título de la tarjeta.'
    }
  };

  select(topic: Topic): void { this.activeTopic.set(topic); }
  current(): CssTopic { return this.topics[this.activeTopic()]; }
}
