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
            each: function(obj, fn) {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) fn.apply(obj[p], [obj[p], p]);
                }
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
            this.each(function() {
                arr = arr.concat([].slice.call(this.querySelectorAll(sel)));
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
                            el.addEventListener(e, function(e) { fn.call(el, e || w.event); }, false);
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
                            el.attachEvent('on' + e, function(e) { fn.call(el, e || w.event); }, false);
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
                    this.each(function() {
                        if (this.classList.contains(cls)) return;
                        this.classList.add(cls);
                    });
                    return this;
                };
            } else {
                return function(cls) {
                    var regex = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                    this.each(function() {
                        if (this.className.match(regex)) return;
                        this.className += ' ' + cls;
                        this.className = this.className.replace(/(^\s*)|(\s*$)/g, '');
                    });
                    return this;
                };
            }
        })()
    }));

    Object.defineProperty(ElementCollection.prototype, 'removeClass', _utils.extend(_defaults, {
        value: (function() {
            if (_support.classList) {
                return function(cls) {
                    this.each(function() {
                        if (!this.classList.contains(cls)) return;
                        this.classList.remove(cls);
                    });
                    return this;
                };
            } else {
                return function(cls) {
                    var regex = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                    this.each(function() {
                        this.className = this.className.replace(regex, ' ').replace(/(^\s*)|(\s*$)/g, '');
                    });
                    return this;
                };
            }
        })()
    }));

    Object.defineProperty(ElementCollection.prototype, 'hasClass', _utils.extend(_defaults, {
        value: (function() {
            if (_support.classList) {
                return function(cls) {
                    return this[0].classList.contains(cls);
                };
            } else {
                return function(cls) {
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

    Object.defineProperty(ElementCollection.prototype, 'append', _utils.extend(_defaults, {
        value: function() {
            var args = [].slice.call(arguments);
            var frag = d.createDocumentFragment();
            for (var i = 0, len = args.length; i < len; i++) {
                var obj = args[i];
                if ('nodeType' in obj && obj.nodeType === 1) {
                   frag.appendChild(obj.cloneNode(true));
                }
            }
            this.each(function() {
                this.appendChild(frag);
            });
            return this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'prepend', _utils.extend(_defaults, {
        value: function() {
            var args = [].slice.call(arguments);
            var frag = d.createDocumentFragment();
            for (var i = 0, len = args.length; i < len; i++) {
                var obj = args[i];
                if ('nodeType' in obj && obj.nodeType === 1) {
                    frag.appendChild(obj.cloneNode(true));
                }
            }
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
        value: function(w) {
            var val;
            this.each(function() {
                if (typeof w === 'undefined') {
                    val = parseInt(this.style.width, 10);
                    if (isNaN(val)) {
                        var rect = this.getBoundingClientRect();
                        val = rect.right - rect.left;
                    }
                } else {
                    this.style.width = w + 'px';
                }
            });
            return val || this;
        }
    }));

    Object.defineProperty(ElementCollection.prototype, 'height', _utils.extend(_defaults, {
        value: function(h) {
            var val;
            this.each(function() {
                if (typeof h === 'undefined') {
                    val = parseInt(this.style.height, 10);
                    if (isNaN(val)) {
                        var rect = this.getBoundingClientRect();
                        val = rect.bottom - rect.top;
                    }
                } else {
                    this.style.height = h + 'px';
                }
            });
            return val || this;
        }
    }));

    var hDOM = function(sel) {
        if (typeof sel === 'string') {
            var els = Object(d.querySelectorAll(sel));
            var arr = [];
            for (var prop in els) {
                arr[prop] = els[prop];
            }
            return new ElementCollection(arr);
        } else if ('nodeType' in sel || sel === w) {
            return new ElementCollection([sel]);
        } else if (typeof sel === 'function') {
            hDOM.ready(sel);
        }
    };

    hDOM.ready = (function() {
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
    })();

    hDOM.each = _utils.each;
    hDOM.extend = _utils.extend;
    hDOM.ajax = _utils.ajax;

    w.$ = w.$ || hDOM;
    w.hDOM = hDOM;

})(window, document);