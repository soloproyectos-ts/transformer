/// <reference path="../typings/index" />

import {SvgElement, SvgGraphicElement, SvgPath} from 'easyvg';
import {Point, Vector, Transformation} from 'matrix2';

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: SvgGraphicElement;
  private _container: SvgGraphicElement;

  constructor (target: SVGGraphicsElement) {
    this.target = new SvgGraphicElement(target);

    // creates the container group
    let canvas = new SvgElement(this.target.nativeElement.ownerSVGElement);
    this._container = new SvgGraphicElement(
      'g', {transform: this.target.getAttr('transform')}
    );
    canvas.append(this._container);

    this._createPath();
    this._createDragger();
    this._createRotateHandle();
    this._createResizeHandles();
    this._createScaleHandles();
  }

  private _createPath() {
    let box = this.target.nativeElement.getBBox();
    let path = new SvgPath()
      .moveTo(new Point(box.x + box.width / 2, box.y - 30))
      .lineTo(new Point(box.x + box.width / 2, box.y))
      .lineTo(new Point(box.x, box.y))
      .lineTo(new Point(box.x, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y + box.height))
      .lineTo(new Point(box.x + box.width, box.y))
      .lineTo(new Point(box.x + box.width / 2, box.y));

    this._container.append(path);
  }

  private _createDragger() {
    let box = this.target.nativeElement.getBBox();
    let rect = new SvgElement(
      'rect',
      {
        x: box.x,
        y: box.y,
        fill: '000',
        opacity: .5,
        width: box.width,
        height: box.height
      }
    );

    this._container.append(rect);

    /*
    rect.nativeElement.addEventListener('mousedown', function (event: MouseEvent) {
        console.log(rect.getLocalPosition(new Point(event.clientX, event.clientY)));
      });*/
  }

  private _createRotateHandle() {
    let self = this;
    let box = this.target.nativeElement.getBBox();
    let rotateHandle = new Handle();

    rotateHandle.position = new Point(box.x + box.width / 2, box.y - 30);
    this._container.append(rotateHandle);

    rotateHandle.nativeElement.addEventListener('mousedown', function (event) {
      let p = new Point(event.offsetX, event.offsetY);
      let t = self._container.transformation;
      let q = p.transform(t.inverse());

      console.log(q.toString());
    });
  }

  private _createResizeHandles() {
    let box = this.target.nativeElement.getBBox();

    let topLeftHandle = new Handle();
    topLeftHandle.position = new Point(box.x, box.y);
    this._container.append(topLeftHandle);

    let topRightHandle = new Handle();
    topRightHandle = new Handle();
    topRightHandle.position = new Point(box.x + box.width, box.y);
    this._container.append(topRightHandle);

    let bottomLeftHandle = new Handle();
    bottomLeftHandle.position = new Point(box.x, box.y + box.height);
    this._container.append(bottomLeftHandle);

    let bottomRightHandle = new Handle();
    bottomRightHandle.position = new Point(
      box.x + box.width, box.y + box.height
    );
    this._container.append(bottomRightHandle);
  }

  private _createScaleHandles() {
    let box = this.target.nativeElement.getBBox();

    let topMiddleHandle = new Handle();
    topMiddleHandle.position = new Point(box.x + box.width / 2, box.y);
    this._container.append(topMiddleHandle);

    let self = this;
    topMiddleHandle.nativeElement.addEventListener('mousedown', function (event) {
      let p = new Point(event.clientX, event.clientY);
      let t = self._container.transformation;
      let q = p.transform(t.inverse());

      console.log(q.toString());
    });

    let middleRightHandle = new Handle();
    middleRightHandle.position = new Point(
      box.x + box.width, box.y + box.height / 2
    );
    this._container.append(middleRightHandle);

    let bottomMiddleHandle = new Handle();
    bottomMiddleHandle.position = new Point(
      box.x + box.width / 2, box.y + box.height
    );
    this._container.append(bottomMiddleHandle);

    let middleLeftHandle = new Handle();
    middleLeftHandle.position = new Point(box.x, box.y + box.height / 2);
    this._container.append(middleLeftHandle);
  }
}

class Handle extends SvgGraphicElement {
  private _radius = 10;
  private _strokeColor = 'black';
  private _strokeWidth = 2;
  private _fillColor = 'transparent';

  constructor() {
    super('circle');

    this
      .setAttr('r', this._radius)
      .setAttr('stroke', this._strokeColor)
      .setAttr('stroke-width', this._strokeWidth)
      .setAttr('fill', this._fillColor);
  }

  get position(): Point {
    let x = parseInt(this.getAttr('cx'), 10);
    let y = parseInt(this.getAttr('cy'), 10);
    return new Point(x, y);
  }

  set position(value: Point) {
    this
      .setAttr('cx', value.x)
      .setAttr('cy', value.y);
  }
}
