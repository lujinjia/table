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

//根据指定表格每行的第n个单元格的值,对第一个<tbody>中的行进行排序
//如果存在comparator函数则使用它,否则按字母表进行排序
function sortrows(table, n, comparator) {
    var x = 1;
    var tbody = table.tBodies[0];
    var rows = tbody.getElementsByTagName('tr');
    var th = table.getElementsByTagName('th')[n];

    if (th.getAttribute('data-sort') == '1') {
        th.setAttribute('data-sort', '0');
        x = -1;
    }
    else { th.setAttribute('data-sort', '1');}

    rows = Array.prototype.slice.call(rows, 0);
    rows.sort(function(row1, row2) {
        var cell1 = row1.getElementsByTagName('td')[n];
        var cell2 = row2.getElementsByTagName('td')[n];
        var val1 = cell1.textContent || cell1.innerText;
        var val2 = cell2.textContent || cell2.innerText;

        if (comparator) return comparator(val1, val2);

        if (val1 < val2) return x *(-1);
        else if (val1 > val2) return x * 1;
        else return 0;
    });

    for (var i = 0, len = rows.length; i < len; i++) {
        tbody.appendChild(rows[i]);
    }
}


function sortrowsSel(table, n) {
    var tbody = table.tBodies[0];
    var rows = tbody.getElementsByTagName('tr');

    var th = table.getElementsByTagName('th')[n];
    var optionSel = th.getElementsByTagName('select')[0].selectedOptions[0];
    rows = Array.prototype.slice.call(rows,0);
    for (var i = 0, len = rows.length; i < len; i++) {
        rows[i].style.display = 'table-row';
        var td = rows[i].getElementsByTagName('td')[n];
        var text = td.textContent || td.innerText;
        if (text === optionSel.text){
            rows[i].style.display = 'table-row';
        } else {
            rows[i].style.display = 'none';
        }
        tbody.appendChild(rows[i]);
    }

     if (optionSel.value === '1000'){
        //rows[i].style.display = 'table-row';
        //回复到初始状态(使用缓存下来的数据重新渲染表格)
        callback(cacheData);
        return;
    }

    for (var i = 0, len = rows.length; i < len; i++) {
        if (rows[i].style.display == 'none') {
            rows[i].style.display = 'table-row';
            tbody.appendChild(rows[i]);
        }
    }
}

//查找表格中的<th>元素(假设只有一行),让它们可单击
//以便单击列标题,按该列对行排序
function makeSortable(table) {
    var headers = table.getElementsByTagName('th');
    for (var i = 0, len = headers.length; i < len; i++) {
        (function(n) {
            if (headers[n].hasAttribute('data-sort')) {
                headers[n].onclick = function() {
                    sortrows(table, n);
                };
            }
            else if (headers[n].hasAttribute('data-select')) {
                //构造下拉选择
                var selectObj = JSON.parse(headers[n].getAttribute('data-select'));
                var selectLis = '';
                var optionLis = '';
                for (var i in selectObj) {
                    optionLis += '<option value='+i+'>'+selectObj[i]+'</option>';
                }
                selectLis = '<select class="selectLis" ><option value="1000">全部</option>'+optionLis+'</select>';
                //对每个option进行事件绑定
                headers[n].innerHTML = selectLis;
                var selectHtml = headers[n].getElementsByClassName('selectLis');
                for (var j = 0; j < selectHtml.length; j++) {
                    selectHtml[j].onchange = function() {
                        sortrowsSel(table, n);
                    };
                }
            }
        }(i));
    }
}
var cacheData = [];
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

//文档加载完成
window.onload =  function() {
    var sparklines = new Array(document.querySelector('.sparkline'));
    for (var i = 0, len = sparklines.length; i < len; i++) {
        var dataset = sparklines[i].dataset;
        var ymin = parseFloat(dataset.ymin);
        var ymax = parseFloat(dataset.ymax);
        var data = sparklines[i].textContent.split(',').map(parseFloat);
    }
    postJSON('table.json', {}, callback);
    //对全选按钮进行事件绑定
    makeSortable(document.querySelector('#sortTable'));

};


function callback(data) {
    //渲染表格
    var data = JSON.parse(data).data;
    var tbody = document.getElementById('sort_tbody');
    while(tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild);
    }

    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        var zt = data[i].zt == '1' ? '启用' : '停用';
        html += '<tr id='+data[i].id+'>';
        html += '<td><input type="checkbox" name="checkItem"></td></td><td>'+data[i].chBm+'</td><td>'+data[i].chMc+'</td><td>'+data[i].sl+'</td><td>'+data[i].zsl+'</td><td>'+zt+'</td>';
        html += renderActions(data);
        html += '</tr>';
    }
    tbody.innerHTML = html;
    addEvent(document.getElementById('sortTable'),'click', function(){
        if(event.target.getAttribute('name') == 'checkItem') {
            //单选,所以单选都选中时，勾中全选
            if (event.target.checked) {
                var inputs = document.getElementById('sort_tbody').getElementsByTagName('input');
                if (setElementAttr('#sort_tbody input', checked, true)) {
                    document.getElementById('checkAll').checked = true;
                }
            } else {
                document.getElementById('checkAll').checked = false;
            }
        }
        else if (event.target.getAttribute('name') == 'checkAll') {
            //全选
            if (event.target.checked) {
                setElementAttr('#sort_tbody input', 'checked', '', true);
            } else {
                setElementAttr('#sort_tbody input', 'checked', '', false);
            }
        }
        else { return false;}
    })
}

//批量对节点属性进行判定或者获取属性值
function setElementAttr(selector, attr, value1, value2) {
    var elements = document.querySelectorAll(selector);
    var result = false;
    for (var i = 0, len = elements.length; i < len; i++) {
        if (value1 && elements[i].getAttribute(attr) == value1) {
            return true;
        } else {
            elements[i][attr] = value2;
        }
    }
    return result;
}


//渲染操作栏
function renderActions(data) {
    //删除,编辑,查看
    var actionHtml = '';
    actionHtml = '<td><a onclick="viewChxx()">查看</a><a onclick="editChxx()">编辑</a><a onclick="deleteChxx()">删除</a></td>';
    return actionHtml;
}

//事件绑定原生实现
function addEvent(target,type, handler) {
    if (target.addEventListener) {
        target.addEventListener(type,handler,false);
    }
    else {
        target.attachEvent('on'+type, function(event) {
            return handler.call(target, event);
        });
    }
}

//事件取消原生实现
function cancelHandler(event) {
    var event = event || window.event;
    if (event.preventDefault) event.preventDefault();
    if (event.returnValue) event.returnValue = false;
    return false;
}

//业务处理代码
function viewChxx() {
    alert('viewChxx');
}

function editChxx() {
    alert('editChxx');
}

function deleteChxx() {
    alert('deleteChxx');
}