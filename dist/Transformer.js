var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "matrix2"], function (require, exports, matrix2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var svg;
    (function (svg) {
        var namespace = 'http://www.w3.org/2000/svg';
        var Element = (function () {
            function Element(target) {
                if (typeof target == 'string') {
                    this.target = document.createElementNS(namespace, target);
                }
                else {
                    this.target = target;
                }
            }
            Object.defineProperty(Element.prototype, "nativeElement", {
                get: function () {
                    return this.target;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Element.prototype, "ownerSvgElement", {
                get: function () {
                    return new GraphicElement(this.nativeElement.ownerSVGElement);
                },
                enumerable: true,
                configurable: true
            });
            Element.prototype.getAttribute = function (name) {
                return this.target.getAttributeNS(null, name);
            };
            Element.prototype.setAttribute = function (name, value) {
                this.target.setAttributeNS(null, name, '' + value);
            };
            Element.prototype.appendChild = function (element) {
                this.nativeElement.appendChild(element.nativeElement);
            };
            return Element;
        }());
        svg.Element = Element;
        var GraphicElement = (function (_super) {
            __extends(GraphicElement, _super);
            function GraphicElement(target) {
                var _this = _super.call(this, target) || this;
                if (!(_this.nativeElement instanceof SVGGraphicsElement)) {
                    throw 'ArgumentError: invalid target';
                }
                return _this;
            }
            Object.defineProperty(GraphicElement.prototype, "nativeElement", {
                get: function () {
                    return this.target;
                },
                enumerable: true,
                configurable: true
            });
            GraphicElement.prototype.getBox = function () {
                var box = this.nativeElement.getBBox();
                return { x: box.x, y: box.y, width: box.width, height: box.height };
            };
            return GraphicElement;
        }(Element));
        svg.GraphicElement = GraphicElement;
    })(svg = exports.svg || (exports.svg = {}));
    var Handle = (function (_super) {
        __extends(Handle, _super);
        function Handle() {
            var _this = _super.call(this, 'circle') || this;
            _this._radius = 10;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this._fillColor = 'transparent';
            _this.setAttribute('r', _this._radius);
            _this.setAttribute('stroke', _this._strokeColor);
            _this.setAttribute('stroke-width', _this._strokeWidth);
            _this.setAttribute('fill', _this._fillColor);
            return _this;
        }
        Object.defineProperty(Handle.prototype, "position", {
            get: function () {
                var x = parseInt(this.getAttribute('cx'), 10);
                var y = parseInt(this.getAttribute('cy'), 10);
                return new matrix2_1.Point(x, y);
            },
            set: function (value) {
                this.setAttribute('cx', value.x);
                this.setAttribute('cy', value.y);
            },
            enumerable: true,
            configurable: true
        });
        return Handle;
    }(svg.GraphicElement));
    var ElementTransformer = (function () {
        function ElementTransformer(target) {
            this.target = new svg.GraphicElement(target);
            var box = this.target.getBox();
            var canvas = this.target.ownerSvgElement;
            var group = new svg.GraphicElement('g');
            canvas.appendChild(group);
            var rotateHandle = new Handle();
            rotateHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y - 30);
            group.appendChild(rotateHandle);
            var topLeftHandle = new Handle();
            topLeftHandle.position = new matrix2_1.Point(box.x, box.y);
            group.appendChild(topLeftHandle);
            var topRightHandle = new Handle();
            topRightHandle = new Handle();
            topRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y);
            group.appendChild(topRightHandle);
            var bottomLeftHandle = new Handle();
            bottomLeftHandle.position = new matrix2_1.Point(box.x, box.y + box.height);
            group.appendChild(bottomLeftHandle);
            var bottomRightHandle = new Handle();
            bottomRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y + box.height);
            group.appendChild(bottomRightHandle);
            var topMiddleHandle = new Handle();
            topMiddleHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y);
            group.appendChild(topMiddleHandle);
            var middleRightHandle = new Handle();
            middleRightHandle.position = new matrix2_1.Point(box.x + box.width, box.y + box.height / 2);
            group.appendChild(middleRightHandle);
            var bottomMiddleHandle = new Handle();
            bottomMiddleHandle.position = new matrix2_1.Point(box.x + box.width / 2, box.y + box.height);
            group.appendChild(bottomMiddleHandle);
            var middleLeftHandle = new Handle();
            middleLeftHandle.position = new matrix2_1.Point(box.x, box.y + box.height / 2);
            group.appendChild(middleLeftHandle);
        }
        return ElementTransformer;
    }());
    exports.ElementTransformer = ElementTransformer;
});
