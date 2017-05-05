/// <reference path="../typings/index" />

import {Point} from 'matrix2';

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: Element<SVGGraphicsElement>;
  private _container: Element<SVGGraphicsElement>;

  constructor (target: SVGGraphicsElement) {
    this.target = new Element(target);

    // creates the container group
    let canvas = new Element(this.target.nativeElement.ownerSVGElement);
    this._container = new Element<SVGGraphicsElement>('g').appendTo(canvas);
    this._container.setAttribute(
      'transform', this.target.getAttribute('transform')
    );

    this._createPath();
    this._createDragger();
    this._createRotateHandle();
    this._createResizeHandles();
    this._createScaleHandles();
  }

  private _createPath() {
    let box = this.target.nativeElement.getBBox();

    new Path()
      .moveTo(new Point(box.x + box.width / 2, box.y - 30))
      .lineTo(new Point(box.x + box.width / 2, box.y))
      .lineTo(new Point(box.x, box.y))
      .lineTo(new Point(box.x, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y))
      .lineTo(new Point(box.x + box.width / 2, box.y))
      .appendTo(this._container);
  }

  private _createDragger() {
    let box = this.target.nativeElement.getBBox();

    let rect = new Element('rect')
      .setAttribute('x', box.x)
      .setAttribute('x', box.x)
      .setAttribute('y', box.y)
      .setAttribute('fill', '000')
      .setAttribute('opacity', '.5')
      .setAttribute('width', box.width)
      .setAttribute('height', box.height)
      .appendTo(this._container);

    /*
    rect.nativeElement.addEventListener('mousedown', function (event: MouseEvent) {
        console.log(rect.getLocalPosition(new Point(event.clientX, event.clientY)));
      });*/
  }

  private _createRotateHandle() {
    let box = this.target.nativeElement.getBBox();
    let rotateHandle = new Handle();

    rotateHandle.position = new Point(box.x + box.width / 2, box.y - 30);
    rotateHandle.appendTo(this._container);
  }

  private _createResizeHandles() {
    let box = this.target.nativeElement.getBBox();

    let topLeftHandle = new Handle();
    topLeftHandle.position = new Point(box.x, box.y);
    topLeftHandle.appendTo(this._container);

    let topRightHandle = new Handle();
    topRightHandle = new Handle();
    topRightHandle.position = new Point(box.x + box.width, box.y);
    topRightHandle.appendTo(this._container);

    let bottomLeftHandle = new Handle();
    bottomLeftHandle.position = new Point(box.x, box.y + box.height);
    bottomLeftHandle.appendTo(this._container);

    let bottomRightHandle = new Handle();
    bottomRightHandle.position = new Point(
      box.x + box.width, box.y + box.height
    );
    bottomRightHandle.appendTo(this._container);
  }

  private _createScaleHandles() {
    let box = this.target.nativeElement.getBBox();

    let topMiddleHandle = new Handle();
    topMiddleHandle.position = new Point(box.x + box.width / 2, box.y);
    topMiddleHandle.appendTo(this._container);

    let middleRightHandle = new Handle();
    middleRightHandle.position = new Point(
      box.x + box.width, box.y + box.height / 2
    );
    middleRightHandle.appendTo(this._container);

    let bottomMiddleHandle = new Handle();
    bottomMiddleHandle.position = new Point(
      box.x + box.width / 2, box.y + box.height
    );
    bottomMiddleHandle.appendTo(this._container);

    let middleLeftHandle = new Handle();
    middleLeftHandle.position = new Point(box.x, box.y + box.height / 2);
    middleLeftHandle.appendTo(this._container);
  }
}

class Element<Type extends SVGElement> {
  readonly nativeElement: Type;

  constructor (target: string | Type) {
    if ( typeof target == 'string' ) {
      this.nativeElement = <Type> document.createElementNS(
        'http://www.w3.org/2000/svg', target
      );
    } else {
      this.nativeElement = target;
    }
  }

  getAttribute(name: string): string {
    return this.nativeElement.getAttributeNS(null, name);
  }

  setAttribute(name: string, value: any): Element<Type> {
    this.nativeElement.setAttributeNS(null, name, '' + value);

    return this;
  }

  appendTo(element: Element<Type>): Element<Type> {
    element.nativeElement.appendChild(this.nativeElement);

    return this;
  }
}

class Handle extends Element<SVGGraphicsElement> {
  private _radius = 10;
  private _strokeColor = 'black';
  private _strokeWidth = 2;
  private _fillColor = 'transparent';

  constructor() {
    super('circle');

    this
      .setAttribute('r', this._radius)
      .setAttribute('stroke', this._strokeColor)
      .setAttribute('stroke-width', this._strokeWidth)
      .setAttribute('fill', this._fillColor);
  }

  get position(): Point {
    let x = parseInt(this.getAttribute('cx'), 10);
    let y = parseInt(this.getAttribute('cy'), 10);
    return new Point(x, y);
  }

  set position(value: Point) {
    this
      .setAttribute('cx', value.x)
      .setAttribute('cy', value.y);
  }
}

class Path extends Element<SVGGraphicsElement> {
  private _strokeColor = 'black';
  private _strokeWidth = 2;

  constructor() {
    super('path');

    this
      .setAttribute('stroke', this._strokeColor)
      .setAttribute('stroke-width', this._strokeWidth)
      .setAttribute('fill', 'transparent');
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
