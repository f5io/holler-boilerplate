(function(w, d) {
    
    'use strict';

    var _defaults = {
            configurable: false,
            enumerable: false,
            writable: false
        },
        _support = {
            classList: 'classList' in d.documentElement,
            addEventListener: w.addEventListener,
            attachEvent: w.attachEvent
        },
        _utils = {
            extend: function() {
                var args = [].slice.call(arguments),
                    ret = args[0];
                for (var i = 1, len = args.length; i < len; i++) {
                    var obj = args[i];
                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) ret[prop] = obj[prop];
                    }
                }
                return ret;
            },
            each: function(obj, fn, context) {
                for (var p in obj) {
                    if (!('hasOwnProperty' in obj) || obj.hasOwnProperty(p)) fn.apply(context || obj[p], [obj[p], p]);
                }
            },
            emitter: (function() {
                var _listeners = {};
    
                function on() {
                    var args = [].slice.call(arguments);
                    var ev = args[0],
                        fn = args[1],
                        scope = args[2] || hDOM;
                 
                    _listeners[ev] = _listeners[ev] || [];
                    _listeners[ev].push({ fn : fn, scope : scope });
                }
                 
                function emit() {
                    var args = [].slice.call(arguments);
                    var ev = args[0],
                        props = args.slice(1);
                 
                    if (!(ev in _listeners)) return;

                    _utils.each(_listeners[ev], function(listener) {
                        listener.fn.apply(listener.scope, props);
                    });
                }
                 
                return {
                    on: on,
                    emit: emit
                };
            })(),
            format: function(str, obj) {
                return str.toString().replace(/\{([^}]+)\}/g, function(match, group) {
                    return obj[group];
                });
            },
            ajax: function(opts) {
                var args = _utils.extend({
                    url : undefined,
                    dataType : 'text',
                    data : '',
                    cache : true,
                    success : function(r) {},
                    error : function(r) {},
                    method : 'GET',
                    async : true
                }, opts);

                if (!args.url) return;
                if (args.method === 'GET' && !args.cache) args.data += '_=' + new Date().getTime();

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    var rs = xhr.readyState;
                    if (rs < 4) return;
                    if (rs === 4) {
                        if (xhr.status !== 200 && xhr.status !== 0) {
                            args.error.call(this, xhr.responseText);
                            return;
                        }
                        switch (args.dataType)
                        {
                            case 'text':
                            case 'html':
                            case 'script':
                                args.success.call(this, xhr.responseText);
                            break;
                            case 'json':
                                args.success.call(this, JSON.parse(xhr.responseText));
                            break;
                            case 'xml':
                                args.success.call(this, xhr.responseXML);
                            break;
                        }
                    }
                };
                xhr.onerror = function() {
                    args.error.call(this, xhr.responseText);
                };
                xhr.open(args.method, args.url, args.async);
                if (args.method === 'POST') xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.send(args.data);
            },
            wrapEvent: function(e) {
                if (e.preventDefault) return e;
                _utils.extend(e, {
                    preventDefault: function() {
                        e.returnValue = false;
                    }
                });
                return e;
            },
            ready: (function() {
                if (w.addEventListener) {
                    return function(fn) {
                        d.addEventListener('DOMContentLoaded', function rdy(ev) {
                            d.removeEventListener('DOMContentLoaded', rdy);
                            fn.call(hDOM, ev);
                        }, false);
                    };
                } else if (w.attachEvent) {
                    return function(fn) {
                        d.attachEvent('onreadystatechange', function rdy(ev) {
                            if (d.readyState === 'complete') {
                                d.detachEvent('onreadystatechange', rdy);
                                fn.call(hDOM, ev);
                            }
                        });
                    };
                }
            })(),
            scrollTop: (function() {
                if (typeof w.pageYOffset !== 'undefined') {
                    return function(val) {
                        if (val && !isNaN(val)) {
                            var b = ('clientHeight' in d.documentElement) ? d.documentElement : d.body;
                            b.scrollTop = val;
                        }
                        return w.pageYOffset;
                    };
                } else {
                    var b = ('clientHeight' in d.documentElement) ? d.documentElement : d.body;
                    return function(val) {
                        if (val && !isNaN(val)) b.scrollTop = val;
                        return b.scrollTop;
                    };
                }
            })(),
            windowHeight: (function() {
                if (typeof w.innerHeight !== 'undefined') {
                    return function() {
                        return w.innerHeight;
                    };
                } else {
                    var b = ('clientHeight' in d.documentElement) ? d.documentElement : d.body;
                    return function() {
                        return b.clientHeight;
                    };
                }
            })(),
            windowWidth: (function() {
                if (typeof w.innerWidth !== 'undefined') {
                    return function() {
                        return w.innerWidth;
                    };
                } else {
                    var b = ('clientWidth' in d.documentElement) ? d.documentElement : d.body;
                    return function() {
                        return b.clientWidth;
                    };
                }
            })(),
            documentHeight: function() {
                return Math.max(
                    Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
                    Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
                    Math.max(d.body.clientHeight, d.documentElement.clientHeight)
                );
            },
            documentWidth: function() {
                return Math.max(
                    Math.max(d.body.scrollWidth, d.documentElement.scrollWidth),
                    Math.max(d.body.offsetWidth, d.documentElement.offsetWidth),
                    Math.max(d.body.clientWidth, d.documentElement.clientWidth)
                );
            }
        };

    if (!Object.defineProperty || !(function() { try { Object.defineProperty({}, 'x', {}); return true; } catch(e) { return false; }})()) {
        var orig = Object.defineProperty;
        Object.defineProperty = function(o, prop, desc) {
            if (orig) {
                try {
                    return orig(o, prop, desc);
                } catch(e) {}
            }

            if (Object.prototype.__defineSetter__ && ('set' in desc)) {
                Object.prototype.__defineSetter__.call(o, prop, desc.set);
            }

            if (Object.prototype.__defineGetter__ && ('get' in desc)) {
                Object.prototype.__defineGetter__.call(o, prop, desc.get);
            }

            if ('value' in desc) {
                o[prop] = desc.value;
            }

        };
    }

    var ElementCollection = function(arr) {
        _utils.extend(this, arr);
        this.length = arr.length;
        return this;
    };

    Object.defineProperty(ElementCollection.prototype, 'each', _utils.extend(_defaults, {
        value: function(fn) {
            for (var i = 0, len = this.length; i < len; i++) {
                fn.apply(this[i], [this[i], i]);
            }
            return this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'find', _utils.extend(_defaults, {
        value: function(sel) {
            var arr = [];
            var last = /:last\-child/.test(sel);
            if (last) {
                sel = sel.split(':last-child').join('');
            }
            this.each(function() {
                var _self = this;
                var tmp = [];
                var query = !last ? _self.querySelectorAll(sel) : [_self.querySelector(sel).parentNode.lastChild];
                _utils.each(query, function(val, prop) {
                    tmp[prop] = val;
                });
                arr = arr.concat(tmp);
            });
            return new ElementCollection(arr);
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'bind', _utils.extend(_defaults, {
        value: (function() {
            if (_support.addEventListener) {
                return function(ev, fn) {
                    var evs = ev.split(' ');
                    var loopFn = function(e) {
                        return function(el) {
                            el.addEventListener(e, fn, false);
                        };
                    };
                    for (var i = 0, len = evs.length; i < len; i++) {
                        this.each(loopFn(evs[i]));
                    }
                    return this;
                };
            } else if (_support.attachEvent) {
                return function(ev, fn) {
                    var evs = ev.split(' ');
                    var loopFn = function(e) {
                        return function(el) {
                            el['hEvRaw' + ev + fn] = fn;
                            el['hEv' + ev + fn] = function(e) { fn.call(el, _utils.wrapEvent(e || w.event)); };
                            el.attachEvent('on' + e, el['hEv' + ev + fn], false);
                        };
                    };
                    for (var i = 0, len = evs.length; i < len; i++) {
                        this.each(loopFn(evs[i]));
                    }
                    return this;
                };
            }
        })()
    }));

    Object.defineProperty(ElementCollection.prototype, 'unbind', _utils.extend(_defaults, {
        value: (function() {
            if (_support.addEventListener) {
                return function(ev, fn) {
                    var evs = ev.split(' ');
                    var loopFn = function(e) {
                        return function(el) {
                            el.removeEventListener(e, fn, false);
                        };
                    };
                    for (var i = 0, len = evs.length; i < len; i++) {
                        this.each(loopFn(evs[i]));
                    }
                    return this;
                };
            } else if (_support.attachEvent) {
                return function(ev, fn) {
                    var evs = ev.split(' ');
                    var loopFn = function(e) {
                        return function(el) {
                            var func = el['hEv' + ev + fn] || function() {};
                            el.detachEvent('on' + e, func, false);
                            el['hEvRaw' + ev + fn] = el['hEv' + ev + fn] = null;
                        };
                    };
                    for (var i = 0, len = evs.length; i < len; i++) {
                        this.each(loopFn(evs[i]));
                    }
                    return this;
                };
            }
        })()
    }));

    Object.defineProperty(ElementCollection.prototype, 'addClass', _utils.extend(_defaults, {
        value: (function() {
            if (_support.classList) {
                return function(cls) {
                    if (!cls) return this;
                    _utils.each(cls.split(' '), function(value, i) {
                        this.each(function() {
                            if (this.classList.contains(value)) return;
                            this.classList.add(value);
                        });
                    }, this);
                    return this;
                };
            } else {
                return function(cls) {
                    if (!cls) return this;
                    _utils.each(cls.split(' '), function(value, i) {
                        var regex = new RegExp('(\\s|^)' + value + '(\\s|$)');
                        this.each(function() {
                            if (this.className.match(regex)) return;
                            this.className += ' ' + value;
                            this.className = this.className.replace(/(^\s*)|(\s*$)/g, '');
                        });
                    }, this);
                    return this;
                };
            }
        })()
    }));

    Object.defineProperty(ElementCollection.prototype, 'removeClass', _utils.extend(_defaults, {
        value: (function() {
            if (_support.classList) {
                return function(cls) {
                    if (!cls) return this;
                    _utils.each(cls.split(' '), function(value, i) {
                        this.each(function() {
                            if (!this.classList.contains(value)) return;
                            this.classList.remove(value);
                        });
                    }, this);
                    return this;
                };
            } else {
                return function(cls) {
                    if (!cls) return this;
                    _utils.each(cls.split(' '), function(value, i) {
                        var regex = new RegExp('(\\s|^)' + value + '(\\s|$)');
                        this.each(function() {
                            this.className = this.className.replace(regex, ' ').replace(/(^\s*)|(\s*$)/g, '');
                        });
                    }, this);
                    return this;
                };
            }
        })()
    }));

    Object.defineProperty(ElementCollection.prototype, 'hasClass', _utils.extend(_defaults, {
        value: (function() {
            if (_support.classList) {
                return function(cls) {
                    if (cls.constructor.name === 'RegExp') return cls.test(this[0].className);
                    return this[0].classList.contains(cls);
                };
            } else {
                return function(cls) {
                    if (cls.constructor.name === 'RegExp') return cls.test(this[0].className);
                    return new RegExp('(\\s|^)' + cls + '(\\s|$)').test(this[0].className);
                };
            }
        })()
    }));

    Object.defineProperty(ElementCollection.prototype, 'toggleClass', _utils.extend(_defaults, {
        value: function(cls) {
            var fn = this.hasClass(cls) ? 'removeClass' : 'addClass';
            return this[fn](cls);
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'attr', _utils.extend(_defaults, {
        value: function(name, val) {
            if (val) {
                this.each(function() {
                    this.setAttribute(name, val);
                });
                return this;
            } else {
                var ret;
                this.each(function() {
                    ret = this.getAttribute(name);
                });
                return ret;
            }
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'offset', _utils.extend(_defaults, {
        value: function() {
            return this[0].getBoundingClientRect() || undefined;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'clone', _utils.extend(_defaults, {
        value: function(deep) {
            deep = typeof deep === 'undefined' ? true : deep;
            var arr = [];
            this.each(function() {
                arr.push(this.cloneNode(deep));
            });
            return new ElementCollection(arr);
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'append', _utils.extend(_defaults, {
        value: function(el) {
            var args = el.__proto__ === ElementCollection.prototype ? el : [].slice.call(arguments);
            var frag = d.createDocumentFragment();
            _utils.each(args, function(value, i) {
                if (isNaN(value) && 'nodeType' in value && value.nodeType === 1) {
                    frag.appendChild(value.cloneNode(true));
                }
            });
            this.each(function() {
                this.appendChild(frag);
            });
            return this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'prepend', _utils.extend(_defaults, {
        value: function(el) {
            var args = el.__proto__ === ElementCollection.prototype ? el : [].slice.call(arguments);
            var frag = d.createDocumentFragment();
            _utils.each(args, function(value, i) {
                if (isNaN(value) && 'nodeType' in value && value.nodeType === 1) {
                    frag.appendChild(value.cloneNode(true));
                }
            });
            this.each(function() {
                this.insertBefore(frag, this.childNodes[0]);
            });
            return this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'remove', _utils.extend(_defaults, {
        value: function() {
            this.each(function() {
                this.parentNode.removeChild(this);
            });
            return this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'html', _utils.extend(_defaults, {
        value: function(h) {
            var val;
            if (h) {
                this.each(function() {
                    this.innerHTML = h;
                });
            } else {
                val = this[0].innerHTML;
            }
            return val || this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'width', _utils.extend(_defaults, {
        value: function(width) {
            var val;
            if (this[0] === w) return _utils.windowWidth();
            if (this[0] === d) return _utils.documentWidth();
            this.each(function() {
                if (typeof width === 'undefined') {
                    val = parseInt(this.style.width, 10);
                    if (isNaN(val)) {
                        var rect = this.getBoundingClientRect();
                        val = rect.right - rect.left;
                    }
                } else {
                    this.style.width = width + 'px';
                }
            });
            return val || this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'height', _utils.extend(_defaults, {
        value: function(height) {
            var val;
            if (this[0] === w) return _utils.windowHeight();
            if (this[0] === d) return _utils.documentHeight();
            this.each(function() {
                if (typeof height === 'undefined') {
                    val = parseInt(this.style.height, 10);
                    if (isNaN(val)) {
                        var rect = this.getBoundingClientRect();
                        val = rect.bottom - rect.top;
                    }
                } else {
                    this.style.height = height + 'px';
                }
            });
            return val || this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'index', _utils.extend(_defaults, {
        value: function() {
            function prevElSib(el) {
                if ('previousElementSibling' in el) {
                    return el.previousElementSibling;
                } else {
                    while ((el = el.previousSibling))  {
                        if (el.nodeType === 1) return el;
                    }
                    return null;
                }
            }
            var val, child = this[0], i = 0;
            while ((child = prevElSib(child)) !== null) i++;
            return i;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'click', _utils.extend(_defaults, {
        value: function() {
            var e = d.createEvent ? d.createEvent('MouseEvent') : d.createEventObject();
            this.each(function() {
                if (this.click) {
                    this.click();
                    return;
                }
                if (d.createEvent) {
                    e.initEvent('click', true, true);
                    this.dispatchEvent(e);
                } else {
                    this.fireEvent('onclick', e);
                }
            });
            return this;
        }
    }));

    var hDOM = function(sel) {
        if (typeof sel === 'string') {
            var arr = [];
            _utils.each(d.querySelectorAll(sel), function(val, prop) {
                arr[prop] = val;
            });
            return new ElementCollection(arr);
        } else if ('nodeType' in sel || sel === w) {
            return new ElementCollection([sel]);
        } else if (typeof sel === 'function') {
            hDOM.ready(sel);
        }
    };

    (function() {

        if (!_support.addEventListener) return;
        
        var createEvent = function(el, name) {
            var e = d.createEvent('CustomEvent');
            e.initCustomEvent(name, true, true, el.target);
            el.target.dispatchEvent(e);
            e = null;
            return false;
        };

        var notMoved = true,
            startPos = { x: 0, y: 0 },
            endPos = { x: 0, y: 0},
            evs = {
                touchstart: function(e) {
                    startPos.x = e.touches[0].pageX;
                    startPos.y = e.touches[0].pageY;
                },
                touchmove: function(e) {
                    notMoved = false;
                    endPos.x = e.touches[0].pageX;
                    endPos.y = e.touches[0].pageY;
                },
                touchend: function(e) {
                    if (notMoved) {
                        createEvent(e, 'fastclick');
                        createEvent(e, 'tap');
                    } else {
                        var x = endPos.x - startPos.x,
                            xr = Math.abs(x),
                            y = endPos.y - startPos.y,
                            yr = Math.abs(y);

                        if (Math.max(xr, yr) > 20) {
                            createEvent(e, xr > yr ? (x < 0 ? 'swipeleft' : 'swiperight') : (y < 0 ? 'swipeup' : 'swipedown'));
                            notMoved = true;
                        }
                    }
                },
                touchcancel: function(e) {
                    notMoved = false;
                }
            };

        for (var e in evs) {
            hDOM(d).bind(e, evs[e]);
        }

    })();

    hDOM.ready = _utils.ready;
    hDOM.each = _utils.each;
    hDOM.extend = _utils.extend;
    hDOM.format = _utils.format;
    hDOM.ajax = _utils.ajax;
    hDOM.emitter = _utils.emitter;
    hDOM.scrollTop = _utils.scrollTop;

    w.$ = w.$ || hDOM;
    w.hDOM = hDOM;

})(window, document);