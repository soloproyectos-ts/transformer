/// <reference path="../typings/index" />

import {Point} from 'matrix2';

export namespace svg {
  const namespace = 'http://www.w3.org/2000/svg';

  export class Element {
    protected target: SVGElement;

    constructor(target: string | SVGElement) {
      if ( typeof target == 'string' ) {
        this.target = document.createElementNS(namespace, target);
      } else {
        this.target = target;
      }
    }

    get nativeElement(): SVGElement {
      return this.target;
    }

    get ownerSvgElement(): SvgElement {
      return new SvgElement(this.nativeElement.ownerSVGElement);
    }

    getAttribute(name: string): string {
      return this.target.getAttributeNS(null, name);
    }

    setAttribute(name: string, value: any): void {
      this.target.setAttributeNS(null, name, '' + value);
    }

    appendChild(element: Element): void {
      this.nativeElement.appendChild(element.nativeElement);
    }
  }

  export class GraphicElement extends Element {

    constructor(target: string | SVGGraphicsElement) {
      super(target);

      if ( !(this.nativeElement instanceof SVGGraphicsElement) ) {
        throw 'Argument error: invalid target';
      }
    }

    get nativeElement(): SVGGraphicsElement {
      return <SVGGraphicsElement> this.target;
    }

    getBoundingBox(): {x: number, y: number, width: number, height: number} {
      let box = this.nativeElement.getBBox();
      return {x: box.x, y: box.y, width: box.width, height: box.height};
    }
  }

  export class SvgElement extends GraphicElement {
    constructor(target: string | SVGSVGElement) {
      super(target);

      if ( !(this.nativeElement instanceof SVGSVGElement) ) {
        throw 'Argument error: invalid target';
      }
    }

    get nativeElement(): SVGSVGElement {
      return <SVGSVGElement> this.target;
    }
  }
}

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: svg.GraphicElement;
  private _container: svg.GraphicElement;

  constructor (target: SVGGraphicsElement) {
    this.target = new svg.GraphicElement(target);

    // creates the container group
    let canvas = this.target.ownerSvgElement;
    this._container = new svg.GraphicElement('g');
    canvas.appendChild(this._container);

    /*
    this._container.setAttribute('transform', 'rotate(15) translate(100)');
    let ctm = this._container.nativeElement.getCTM();
    console.log(this._container.getBoundingBox());*/

    this._createPath();
    this._createRotateHandle();
    this._createResizeHandles();
    this._createScaleHandles();
  }

  private _createPath() {
    let box = this.target.getBoundingBox();
    let path = new Path();

    path
      .moveTo(new Point(box.x + box.width / 2, box.y - 30))
      .lineTo(new Point(box.x + box.width / 2, box.y))
      .lineTo(new Point(box.x, box.y))
      .lineTo(new Point(box.x, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y))
      .lineTo(new Point(box.x + box.width / 2, box.y));
    this._container.appendChild(path);
  }

  private _createRotateHandle() {
    let box = this.target.getBoundingBox();
    let rotateHandle = new Handle();

    rotateHandle.position = new Point(box.x + box.width / 2, box.y - 30);
    this._container.appendChild(rotateHandle);
  }

  private _createResizeHandles() {
    let box = this.target.getBoundingBox();

    let topLeftHandle = new Handle();
    topLeftHandle.position = new Point(box.x, box.y);
    this._container.appendChild(topLeftHandle);

    let topRightHandle = new Handle();
    topRightHandle = new Handle();
    topRightHandle.position = new Point(box.x + box.width, box.y);
    this._container.appendChild(topRightHandle);

    let bottomLeftHandle = new Handle();
    bottomLeftHandle.position = new Point(box.x, box.y + box.height);
    this._container.appendChild(bottomLeftHandle);

    let bottomRightHandle = new Handle();
    bottomRightHandle.position = new Point(
      box.x + box.width, box.y + box.height
    );
    this._container.appendChild(bottomRightHandle);
  }

  private _createScaleHandles() {
    let box = this.target.getBoundingBox();

    let topMiddleHandle = new Handle();
    topMiddleHandle.position = new Point(box.x + box.width / 2, box.y);
    this._container.appendChild(topMiddleHandle);

    let middleRightHandle = new Handle();
    middleRightHandle.position = new Point(
      box.x + box.width, box.y + box.height / 2
    );
    this._container.appendChild(middleRightHandle);

    let bottomMiddleHandle = new Handle();
    bottomMiddleHandle.position = new Point(
      box.x + box.width / 2, box.y + box.height
    );
    this._container.appendChild(bottomMiddleHandle);

    let middleLeftHandle = new Handle();
    middleLeftHandle.position = new Point(box.x, box.y + box.height / 2);
    this._container.appendChild(middleLeftHandle);
  }
}

class Handle extends svg.GraphicElement {
  private _radius = 10;
  private _strokeColor = 'black';
  private _strokeWidth = 2;
  private _fillColor = 'transparent';

  constructor() {
    super('circle');

    let self = this;
    this.nativeElement.addEventListener('mousedown', function (event: MouseEvent) {
      let canvas = self.ownerSvgElement;
      let pos = canvas.nativeElement.createSVGPoint();
      pos.x = event.clientX;
      pos.y = event.clientY;

      let p = pos.matrixTransform(canvas.nativeElement.getScreenCTM().inverse());
      console.log(p);
    });

    this.setAttribute('r', this._radius);
    this.setAttribute('stroke', this._strokeColor);
    this.setAttribute('stroke-width', this._strokeWidth);
    this.setAttribute('fill', this._fillColor);
  }

  get position(): Point {
    let x = parseInt(this.getAttribute('cx'), 10);
    let y = parseInt(this.getAttribute('cy'), 10);
    return new Point(x, y);
  }

  set position(value: Point) {
    this.setAttribute('cx', value.x);
    this.setAttribute('cy', value.y);
  }
}

class Path extends svg.GraphicElement {
  private _strokeColor = 'black';
  private _strokeWidth = 2;

  constructor() {
    super('path');

    this.setAttribute('stroke', this._strokeColor);
    this.setAttribute('stroke-width', this._strokeWidth);
    this.setAttribute('fill', 'transparent');
  }

  moveTo(value: Point): Path {
    this.setAttribute(
      'd', [this.getAttribute('d') || '', `M${value.x} ${value.y}`].join(' ')
    );

    return this;
  }

  lineTo(value: Point): Path {
    this.setAttribute(
      'd', [this.getAttribute('d') || '', `L${value.x} ${value.y}`].join(' ')
    );

    return this;
  }
}
