"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = undefined;

exports.default = function ($config, $app) {
    if (!$config) {
        return null;
    }
    var ret = [];
    _lodash2.default.forIn($config, function (path, url) {
        var router = { url: url };
        var ctrlFile = _path2.default.join("modules", path);
        var ctrl = $app.import(ctrlFile);
        if (!_lodash2.default.isFunction(ctrl)) {
            return;
        }
        var ctrlObject = new ctrl();

        ctrlObject.$server = function (sFile) {
            sFile = sFile ? _path2.default.join("server", sFile) : _path2.default.join("server", path);
            var serverFile = $app.import(sFile);
            if (!serverFile) {
                return null;
            }
            var serverObject = new serverFile();
            serverObject.$store = ctrlObject.$store;
            return serverObject;
        }(ctrlObject.$server);

        _lodash2.default.isFunction(ctrlObject.created) && ctrlObject.created();
        var $method = ctrlObject.$method,
            $middleware = ctrlObject.$middleware;

        router.method = $method || $app.config("app.pages_allow_methods");
        router.method = _lodash2.default.isString(router.method) ? [router.method] : router.method;
        router.middleware = function (mdl) {
            mdl = _lodash2.default.isString(mdl) ? [mdl] : mdl;
            if (!Array.isArray(mdl)) {
                return null;
            }
            var ret = [];
            mdl.forEach(function (m) {
                var middlewareFile = _path2.default.join("middleware", m);
                var middleware = $app.import(middlewareFile);
                if (!_lodash2.default.isFunction(middleware)) {
                    return;
                }
                //warn
                middleware && ret.push(function ($request, $response, next) {
                    var middlewareObject = new middleware();
                    middlewareObject = _lodash2.default.assign(middleware, { $response: $response, $request: $request });
                    _lodash2.default.isFunction(middlewareObject.next) && middlewareObject.next(next);
                    // && co(middlewareObject.next).then(status => status === true?next():null).catch(e => next())
                });
            });
            return ret.length === 0 ? null : ret;
        }($middleware);

        router.ctrl = parse(ctrlObject);
        ret.push(router);
    });
    return ret;
};

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parse = exports.parse = function parse(ctrlObject) {
    return function ($request, $response) {
        ctrlObject = _lodash2.default.assign(ctrlObject, { $response: $response, $request: $request });
        _lodash2.default.isFunction(ctrlObject.beforeMount) && ctrlObject.beforeMount($request.params);
        (0, _co2.default)(ctrlObject.render).then(function (html) {
            var LAYOUT = ctrlObject.layout;
            var renderData = _lodash2.default.assign(ctrlObject.$data, { html: html, LAYOUT: LAYOUT });
            undefined.$response.render(ctrlObject.$rootTemplate, renderData);
        }).catch(function (e) {
            throw new Error(e);
        });
    };
};
/**
* @param $config : pages的pages配置项
* @param $app:use -> return app对象
* @return Array
* waite for parsing object
* {
    route:String,
    ctrl:Function,
    method:[String,String,...],
    middleware:[Function,Function,...]
* }
* 说明：以上 空值 = null
*/