//返回元素e的第n层祖先元素
function parent(e, n) {
    if (n === undefined) n = 1;
    while (n-- && e) e = e.parentNode;
    if (!e || e.nodeType !== 1) return null;
    return e;
}

//返回元素e的第n个兄弟元素
function sibling(e, n) {
    while(e && n !== 0) {
        if (n > 0) {
            if (e.nextElementSibling) e = e.nextElementSibling;
            else {
                for (e=e.nextSibling; e && e.nodeType !== 1; e = nextSibling) {}
            }
            n--;
        }
        else {
            if (e.previousElementSibling) e = e.previousElementSibling;
            else {
                for (e=e.previousSibling; e && e.nodeType !== 1; e = e.previousSibling) {}
            }
            n++;
        }
    }
    return e;
}

//返回元素e的第n代子元素
function child(e, n) {
    if (e.children) {
        if (n < 0) n += e.children.length;
        if (n < 0) return null;
        return e.children[n];
    }
    if (n >= 0) {
        if (e.firstElementChild) e = e.firstElementChild;
        else {
            for (e = e.firstChild; e && e.nodeType !== 1; e = e.nextSibling) {}

        }
        return sibling(e, n);
    }
    else {
        if (e.lastElementChild) e = e.lastElementChild;
        else {
            for (e = e.lastChild; e && e.nodeType !== 1; e = e.previousSibing) {}
        }
        return sibling(e, n+1);
    }
}

//自定义Element的方法
/*Element.prototype.next = function() {
 if (this.nextElementSibling) return this.nextElementSibing;
 var sib = this.nextSibling;
 while(sib && sib.nodeType !== 1) sib = sib.nextSibing;
 return sib;
 }*/

//使用__defineGetter__自定义
if (!document.documentElement.children) {
    Element.prototype.__defineGetter__('children', function() {
        var kids = [];
        for (var c = this.firstChild; c != null; c = c.nextSibling) {
            if (c.nodeType === 1) kids.push(c);
        }
        return kids;
    });
}

//获取或者设置元素的textContent或者innerText
function textContent(element, value) {
    var content = element.textContent;
    if (value === undefined) {
        if (content !== undefined) return content;
        else return element.innerText;
    }
    else {
        if (content !== undefined) element.textContent = value;
        else element.innerText = value;
    }
}

//对html5的data-*自定义属性获取方法
//根据传入的selector选择器获取元素,如果有传入处理函数parse,则对每个attr元素进行处理
function getH5Data(selector,attr,  parse) {
    var h5Data = new Array(document.querySelectorALL(selector));
    for (var i = 0, len = h5Data.length; i < len; i++ ) {
        if (h5Data[i].dataset !== undefined) {
            var dataSet = h5Data[i].dataset;
            dataSet[attr].map(parse);
        } else {
            //不支持H5的处理
            h5Data[i].getAttribute(attr).map(parse);
        }
    }
}

//递归地将n的后代子节点中的所有Text节点内容转换为大写形式(此方法可扩展)
function upcase(n) {
    if (n.nodeType == 3 || n.nodeType == 4) {
        n.data = n.data.toUpperCase();
    }
    else {
        for (var i = 0, len = n.childNodes.length; i < len; i++){
            upcase(n.childNodes[i]);
        }
    }
}


/**
 * Document类型定义了创建Elment和Text对象的方法,Node类型定义了在节点树
 * 插入,删除和替换的方法
 */

//从指定的URL,异步加载和执行脚本
function loadasync(url) {
    var head = new Array(document.querySelector('head'));
    var s = document.createElement('script');
    s.src = url;
    head.appendChild(s);
}

//将child节点插入到parent中,使其成为第n个子节点
function insertAt(parent, child, n) {
    if (n < 0 || n > parent.childNodes.length) throw new Error('invalid index');
    else if (n == parent.childNodes.length) parent.appendChild(child);
    else parent.insertBefore(child, parent.childNodes[n]);
}

//查找元素e的纯文本内容,递归进入子元素
function textContent2(e) {
    var child, type, s = '';
    for (child = e.firstChild; child != null; child = child.nextSibling) {
        type = child.nodeType;
        if (type === 3 || type === 4) { //Text,CDATASection
            s += child.nodeValue;
        }
        else if (type === 1) {        //递归Elment节点
            s += textContent2(child);
        }
    }
    return s;
}

//事件取消原生实现
function cancelHandler(event) {
    var event = event || window.event;
    if (event.preventDefault) event.preventDefault();
    if (event.returnValue) event.returnValue = false;
    return false;
}

//构造JSON编码的请求
function postJSON(url, data, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && callback) {
            cacheData = [];
            cacheData = request.response;
            callback(request.response);
        }
    };
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(data));
}

//用一个新元素<b>来替换n节点，并且使n成为该元素的子节点
function embolden(n) {
    if (typeof n == 'string') n = document.getElementById(n);
    var parent = n.parentNode;
    var b = document.createElement('b');
    parent.replaceChild(b, n);
    b.appendChild(n);
}

//使用innerHTML实现outerHTML属性
//（fireFox11已经支持该属性）
(function() {
   if (document.createElement('div').outerHTML) return;
   //通过this所引用的元素的外部HTML
   function outerHTMLGetter() {
       var container = document.createElement('div');
       //构造外部容器
       container.appendChild(this.cloneNode(true));
       return container.innerHTML;
   }

   //用指定的值设置元素的外部HTML
    function outerHTMLSetter(value) {
       var container = document.createElement('div');
       container.innerHTML = value;
       while(container.firstChild) {
           this.parentNode.insertBefore(container.firstChild, this);
       }
       this.parentNode.removeChild(this);
    }

    if (Object.defineProperty) {
       Object.defineProperty(Element.prototype,'outerHTML',{
           get: outerHTMLGetter,
           set: outerHTMLSetter,
           enumerable: false, configurable: true
       });
    } else {
        Element.prototype.__defineGetter__('outerHTML', outerHTMLGetter);
        Element.prototype.__defineSetter__('outerHTML', outerHTMLSetter);
    }
})();


//DocumentFragment作为节点的临时容器
//倒序排列节点n的子节点
function reverse(n) {
    var f = document.createDocumentFragment();
    while(n.lastChild) f.appendChild(n.lastChild);
    n.appendChild(f);
}

//使用innerHTML实现insertAdjacentHTML()
var Insert = (function() {
   if (document.createElement('div').insertAdjacentHTML) {
       return {
           before: function(e, h) {e.insertAdjacentHTML('beforebegin', h);},
           after: function(e, h) {e.insertAdjacentHTML('afterend', h);},
           atStart: function(e, h) {e.insertAdjacentHTML('afterbegin', h);},
           atEnd: function(e, h) {e.insertAdjacentHTML('beforeend', h);}
       };
   }

   //自定义实现
    function fragment(html) {
       var elt = document.createElement('div');
       var frag = document.createDocumentFragment();
       elt.innerHTML = html;
       while(elt.firstChild) {
           frag.appendChild(elt.firstChild);
       }
       return frag;
    }

    var Insert = {
       before: function(elt, html) {
           elt.parentNode.insertBefore(fragment(html), elt);
       },
       after: function(elt, html) {
           elt.parentNode.insertBefore(fragment(html), elt.nextSibling);
       },
       atStart: function(elt, html) {
           elt.insertBefore(fragment(html), elt.firstChild);
       },
       atEnd: function(elt, html) {
           elt.appendChild(fragment(html));
       }
    };

   Element.prototype.insertAdjacentHTML = function(pos, html) {
       switch(pos.toLowerCase()) {
           case 'beforebegin' : return Insert.before(this, html);
           case 'afterend' : return Insert.after(this, html);
           case 'afterbegin' : return Insert.atStart(this, html);
           case 'beforeend' : return Insert.atEnd(this, html);
       }
   };
   return Insert;
})();




















