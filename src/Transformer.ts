/// <reference path="../typings/index" />

import {SvgElement, SvgGraphicElement} from 'easyvg';
import {SquareMatrix} from 'matrix';
import {Point, Vector, Positionable, Transformation} from 'matrix2';

// A decorator class to 'transform' (resize, scale or rotate) an SVG element.
export class ElementTransformer {
  readonly target: SvgGraphicElement;
  private _container: SvgGraphicElement;

  constructor (target: SvgGraphicElement) {
    this.target = target;

    // creates the container group
    let canvas = this.target.ownerElement;
    this._container = new SvgGraphicElement('g');
    this._container.transform(this.target.transformation);
    canvas.append(this._container);

    this._createPath();
    this._createDragger();
    this._createRotateHandle();
    this._createResizeHandles();
  }

  private _createPath() {
    let box = this.target.getBoundingBox();
    let path = new _SvgPath()
      .moveTo(new Vector(box.x + box.width / 2, box.y - 30))
      .lineTo(new Vector(box.x + box.width / 2, box.y))
      .lineTo(new Vector(box.x, box.y))
      .lineTo(new Vector(box.x, box.y + box.height))
      .lineTo(new Vector(box.x + box.width, box.y + box.height))
      .lineTo(new Vector(box.x + box.width, box.y))
      .lineTo(new Vector(box.x + box.width / 2, box.y));

    this._container.append(path);
  }

  // The 'dragger' is used to move the image. It consists of a transparent
  // rectangle placed over the image.
  private _createDragger() {
    let self = this;
    let box = this.target.getBoundingBox();
    let p0: Point;
    let t0: Transformation;

    // creates a 'dragger' and places it over the image
    let dragger = new _Dragger();
    dragger.position = new Vector(box.x, box.y);
    dragger.width = box.width;
    dragger.height = box.height;
    this._container.append(dragger);

    dragger
      .onStartDragging(function (p) {
        t0 = self._container.transformation;
        p0 = p;
      })
      .onDragging(function (p1) {
        let v = p1.subtract(p0);

        self._container.transformation = t0.translate(v);
        self.target.transformation = self._container.transformation;
      });
  }

  // The 'Rotate handle' is ued to rotate the image. It is placed on the top of
  // the image.
  private _createRotateHandle() {
    let self = this;
    let box = this.target.getBoundingBox();
    let center: Point;
    let p0: Point;
    let t0: Transformation;

    // creates a handle and places it on the top of the transformation tool
    let rotateHandle = new _Handle();
    rotateHandle.position = new Vector(box.x + box.width / 2, box.y - 30);
    this._container.append(rotateHandle);

    rotateHandle
      .onStartDragging(function (p) {
        center = self._getCenter();
        t0 = self._container.transformation;
        p0 = p;
      })
      .onDragging(function (p1) {
        let angle = _getAdjacentAngle(p0, p1, center.transform(t0));

        self._container.transformation = t0.rotate(
          angle, {center: center.transform(t0)}
        );

        self.target.transformation = self._container.transformation;
      });
  }

  private _createResizeHandles() {
    let self = this;

    // calculates the handle positions
    let box = this.target.getBoundingBox();
    let positionGroups: {[key: string]: Vector[]} = {
      horizontal: [
        new Vector(box.x + box.width, box.y + box.height / 2),
        new Vector(box.x, box.y + box.height / 2)
      ],
      vertical: [
        new Vector(box.x + box.width / 2, box.y),
        new Vector(box.x + box.width / 2, box.y + box.height),
      ],
      diagonal: [
        new Vector(box.x, box.y),
        new Vector(box.x + box.width, box.y),
        new Vector(box.x, box.y + box.height),
        new Vector(box.x + box.width, box.y + box.height)
      ],
    }

    for (let orientation in positionGroups) {
      let positions = positionGroups[orientation];

      for (let position of positions) {
        let center: Point;
        let p0: Point;
        let t0: Transformation;

        // creates a handle and places it to the position
        let handle = new _Handle();
        handle.position = position;
        this._container.append(handle);

        handle
          .onStartDragging(function (p) {
            center = self._getCenter();
            t0 = self._container.transformation;
            p0 = p;
          })
          .onDragging(function (p1) {
            let c = center.transform(t0);
            let v0 = p0.subtract(c);
            let v1 = c.subtract(p1);
            let norm0 = v0.norm();
            let norm1 = v1.norm();
            let scale = norm0 > 0? norm1 / norm0: 1;
            let value = new Vector(
              orientation == 'vertical'? 1: scale,
              orientation == 'horizontal'? 1: scale
            );

            self._container.transformation = new Transformation()
              .scale(value, {center: center})
              .transform(t0);
            self.target.transformation = self._container.transformation;
          });
      }
    }
  }

  private _getCenter():Point {
    let box = this.target.getBoundingBox();

    return new Vector(box.x + box.width / 2, box.y + box.width / 2);
  }
}

class _Handle extends SvgGraphicElement {
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

    return new Vector(x, y);
  }

  set position(value: Point) {
    this
      .setAttr('cx', value.x)
      .setAttr('cy', value.y);
  }
}

class _Dragger extends SvgGraphicElement {
  constructor() {
    super('rect');

    this
      .setAttr('fill', '000')
      .setAttr('opacity', 0);
  }

  get position(): Point {
    let x = parseInt(this.getAttr('x'), 10);
    let y = parseInt(this.getAttr('y'), 10);

    return new Vector(x, y);
  }

  set position(value: Point) {
    this
      .setAttr('x', value.x)
      .setAttr('y', value.y);
  }

  get width(): number {
    return parseInt(this.getAttr('width'), 10);
  }

  set width(value: number) {
    this.setAttr('width', value)
  }

  get height(): number {
    return parseInt(this.getAttr('height'), 10);
  }

  set height(value: number) {
    this.setAttr('height', value)
  }
}

class _SvgPath extends SvgGraphicElement {
  private _strokeColor = 'black';
  private _strokeWidth = 2;

  constructor() {
    super('path');

    this
      .setAttr('stroke', this._strokeColor)
      .setAttr('stroke-width', this._strokeWidth)
      .setAttr('fill', 'transparent');
  }

  moveTo(value: Point): _SvgPath {
    this.setAttr(
      'd', [this.getAttr('d') || '', `M${value.x} ${value.y}`].join(' ')
    );

    return this;
  }

  lineTo(value: Point): _SvgPath {
    this.setAttr(
      'd', [this.getAttr('d') || '', `L${value.x} ${value.y}`].join(' ')
    );

    return this;
  }

  close(): _SvgPath {
    this.setAttr(
      'd', [this.getAttr('d') || '', 'Z'].join(' ')
    );

    return this;
  }
}

// Gets the angle adjacent to [p2] of the triangle defined by
// [p0], [p1] and [p2] in the direction of the hands of a clock.
//
// Just imagine that the segment [p0, p2] is the hour hand and
// the segment [p1, p2] is the minute hand. This function calculates the
// angle enclosed between those two hands in the direction of the hands
// of a clock.
function _getAdjacentAngle(p0: Point, p1: Point, p2: Point): number {
  // creates an orthonormal reference system
  let u = p1.subtract(p2);
  let u0 = u.unit();
  let u1 = new Vector(u0.y, -u0.x);

  // expresses the vector [p2, p0] from the orthonormal reference system
  let v = p0.subtract(p2);
  let m = new SquareMatrix(u0, u1);
  let w = v.multiply(m.inverse());

  return _getAngle(w);
}

// Gets the angle of a 'positionable' object.
function _getAngle(p: Positionable): number {
  let ret = NaN;
  let [x, y] = [p.x, p.y];

  if (x > 0 && !(y < 0)) {
    // first quadrant
    ret = Math.atan(y / x);
  } else if (!(x > 0) && y > 0) {
    // second quadrant
    ret = x < 0
      ? Math.atan(y / x) + Math.PI
      : Math.PI / 2;
  } else if (x < 0 && !(y > 0)) {
    // third quadrant
    ret = Math.atan(y / x) + Math.PI;
  } else if (!(x < 0) && y < 0) {
    // fourth quadrant
    ret = x > 0
      ? Math.atan(y / x) + 2 * Math.PI
      : 3 * Math.PI / 2;
  }

  return ret;
}
