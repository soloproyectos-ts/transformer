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
define(["require", "exports", "easyvg", "matrix", "matrix2"], function (require, exports, easyvg_1, matrix_1, matrix2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ElementTransformer = (function () {
        function ElementTransformer(target) {
            this.target = target;
            var canvas = this.target.ownerElement;
            this._container = new easyvg_1.SvgGraphicElement('g');
            this._container.transform(this.target.transformation);
            canvas.append(this._container);
            this._createPath();
            this._createDragger();
            this._createRotateHandle();
            this._createResizeHandles();
        }
        ElementTransformer.prototype._createPath = function () {
            var box = this.target.getBoundingBox();
            var path = new _SvgPath()
                .moveTo(new matrix2_1.Vector(box.x + box.width / 2, box.y - 30))
                .lineTo(new matrix2_1.Vector(box.x + box.width / 2, box.y))
                .lineTo(new matrix2_1.Vector(box.x, box.y))
                .lineTo(new matrix2_1.Vector(box.x, box.y + box.height))
                .lineTo(new matrix2_1.Vector(box.x + box.width, box.y + box.height))
                .lineTo(new matrix2_1.Vector(box.x + box.width, box.y))
                .lineTo(new matrix2_1.Vector(box.x + box.width / 2, box.y));
            this._container.append(path);
        };
        ElementTransformer.prototype._createDragger = function () {
            var self = this;
            var box = this.target.getBoundingBox();
            var p0;
            var t0;
            var dragger = new _Dragger();
            dragger.position = new matrix2_1.Vector(box.x, box.y);
            dragger.width = box.width;
            dragger.height = box.height;
            this._container.append(dragger);
            dragger
                .onStartDragging(function (p) {
                t0 = self._container.transformation;
                p0 = p;
            })
                .onDragging(function (p1) {
                var v = p1.subtract(p0);
                self._container.transformation = t0.translate(v);
                self.target.transformation = self._container.transformation;
            });
        };
        ElementTransformer.prototype._createRotateHandle = function () {
            var self = this;
            var box = this.target.getBoundingBox();
            var center;
            var p0;
            var t0;
            var rotateHandle = new _Handle();
            rotateHandle.position = new matrix2_1.Vector(box.x + box.width / 2, box.y - 30);
            this._container.append(rotateHandle);
            rotateHandle
                .onStartDragging(function (p) {
                center = self._getCenter();
                t0 = self._container.transformation;
                p0 = p;
            })
                .onDragging(function (p1) {
                var angle = _getAdjacentAngle(p0, p1, center.transform(t0));
                self._container.transformation = t0.rotate(angle, { center: center.transform(t0) });
                self.target.transformation = self._container.transformation;
            });
        };
        ElementTransformer.prototype._createResizeHandles = function () {
            var self = this;
            var box = this.target.getBoundingBox();
            var positionGroups = {
                horizontal: [
                    new matrix2_1.Vector(box.x + box.width, box.y + box.height / 2),
                    new matrix2_1.Vector(box.x, box.y + box.height / 2)
                ],
                vertical: [
                    new matrix2_1.Vector(box.x + box.width / 2, box.y),
                    new matrix2_1.Vector(box.x + box.width / 2, box.y + box.height),
                ],
                diagonal: [
                    new matrix2_1.Vector(box.x, box.y),
                    new matrix2_1.Vector(box.x + box.width, box.y),
                    new matrix2_1.Vector(box.x, box.y + box.height),
                    new matrix2_1.Vector(box.x + box.width, box.y + box.height)
                ],
            };
            var _loop_1 = function (orientation_1) {
                var positions = positionGroups[orientation_1];
                var _loop_2 = function (position) {
                    var center;
                    var p0;
                    var t0;
                    var handle = new _Handle();
                    handle.position = position;
                    this_1._container.append(handle);
                    handle
                        .onStartDragging(function (p) {
                        center = self._getCenter();
                        t0 = self._container.transformation;
                        p0 = p;
                    })
                        .onDragging(function (p1) {
                        var c = center.transform(t0);
                        var v0 = p0.subtract(c);
                        var v1 = c.subtract(p1);
                        var norm0 = v0.norm();
                        var norm1 = v1.norm();
                        var scale = norm0 > 0 ? norm1 / norm0 : 1;
                        var value = new matrix2_1.Vector(orientation_1 == 'vertical' ? 1 : scale, orientation_1 == 'horizontal' ? 1 : scale);
                        self._container.transformation = new matrix2_1.Transformation()
                            .scale(value, { center: center })
                            .transform(t0);
                        self.target.transformation = self._container.transformation;
                    });
                };
                for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
                    var position = positions_1[_i];
                    _loop_2(position);
                }
            };
            var this_1 = this;
            for (var orientation_1 in positionGroups) {
                _loop_1(orientation_1);
            }
        };
        ElementTransformer.prototype._getCenter = function () {
            var box = this.target.getBoundingBox();
            return new matrix2_1.Vector(box.x + box.width / 2, box.y + box.width / 2);
        };
        return ElementTransformer;
    }());
    exports.ElementTransformer = ElementTransformer;
    var _Handle = (function (_super) {
        __extends(_Handle, _super);
        function _Handle() {
            var _this = _super.call(this, 'circle') || this;
            _this._radius = 10;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this._fillColor = 'transparent';
            _this
                .setAttr('r', _this._radius)
                .setAttr('stroke', _this._strokeColor)
                .setAttr('stroke-width', _this._strokeWidth)
                .setAttr('fill', _this._fillColor);
            return _this;
        }
        Object.defineProperty(_Handle.prototype, "position", {
            get: function () {
                var x = parseInt(this.getAttr('cx'), 10);
                var y = parseInt(this.getAttr('cy'), 10);
                return new matrix2_1.Vector(x, y);
            },
            set: function (value) {
                this
                    .setAttr('cx', value.x)
                    .setAttr('cy', value.y);
            },
            enumerable: true,
            configurable: true
        });
        return _Handle;
    }(easyvg_1.SvgGraphicElement));
    var _Dragger = (function (_super) {
        __extends(_Dragger, _super);
        function _Dragger() {
            var _this = _super.call(this, 'rect') || this;
            _this
                .setAttr('fill', '000')
                .setAttr('opacity', 0);
            return _this;
        }
        Object.defineProperty(_Dragger.prototype, "position", {
            get: function () {
                var x = parseInt(this.getAttr('x'), 10);
                var y = parseInt(this.getAttr('y'), 10);
                return new matrix2_1.Vector(x, y);
            },
            set: function (value) {
                this
                    .setAttr('x', value.x)
                    .setAttr('y', value.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Dragger.prototype, "width", {
            get: function () {
                return parseInt(this.getAttr('width'), 10);
            },
            set: function (value) {
                this.setAttr('width', value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Dragger.prototype, "height", {
            get: function () {
                return parseInt(this.getAttr('height'), 10);
            },
            set: function (value) {
                this.setAttr('height', value);
            },
            enumerable: true,
            configurable: true
        });
        return _Dragger;
    }(easyvg_1.SvgGraphicElement));
    var _SvgPath = (function (_super) {
        __extends(_SvgPath, _super);
        function _SvgPath() {
            var _this = _super.call(this, 'path') || this;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this
                .setAttr('stroke', _this._strokeColor)
                .setAttr('stroke-width', _this._strokeWidth)
                .setAttr('fill', 'transparent');
            return _this;
        }
        _SvgPath.prototype.moveTo = function (value) {
            this.setAttr('d', [this.getAttr('d') || '', "M" + value.x + " " + value.y].join(' '));
            return this;
        };
        _SvgPath.prototype.lineTo = function (value) {
            this.setAttr('d', [this.getAttr('d') || '', "L" + value.x + " " + value.y].join(' '));
            return this;
        };
        _SvgPath.prototype.close = function () {
            this.setAttr('d', [this.getAttr('d') || '', 'Z'].join(' '));
            return this;
        };
        return _SvgPath;
    }(easyvg_1.SvgGraphicElement));
    function _getAdjacentAngle(p0, p1, p2) {
        var u = p1.subtract(p2);
        var u0 = u.unit();
        var u1 = new matrix2_1.Vector(u0.y, -u0.x);
        var v = p0.subtract(p2);
        var m = new matrix_1.SquareMatrix(u0, u1);
        var w = v.multiply(m.inverse());
        return _getAngle(w);
    }
    function _getAngle(p) {
        var ret = NaN;
        var _a = [p.x, p.y], x = _a[0], y = _a[1];
        if (x > 0 && !(y < 0)) {
            ret = Math.atan(y / x);
        }
        else if (!(x > 0) && y > 0) {
            ret = x < 0
                ? Math.atan(y / x) + Math.PI
                : Math.PI / 2;
        }
        else if (x < 0 && !(y > 0)) {
            ret = Math.atan(y / x) + Math.PI;
        }
        else if (!(x < 0) && y < 0) {
            ret = x > 0
                ? Math.atan(y / x) + 2 * Math.PI
                : 3 * Math.PI / 2;
        }
        return ret;
    }
});
