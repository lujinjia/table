var cacheData = [];

//文档加载完成
function initTable(data, tableId, tbodyId, keywordId, renderFun) {
    cacheData = [];
    cacheData= data;
    renderFun(data);
    //排序
    makeSortable(document.querySelector('#'+tableId), tbodyId, renderFun);
    bindEvent(tableId, tbodyId, keywordId);
};


//事件绑定原生实现
function addEvent(target,type, handler) {
    var types = type.split(',');
    for (var i = 0; i < types.length; i++) {
        if (target.addEventListener) {
            target.addEventListener(types[i].trim(),handler,false);
        }  else {
            //兼容IE8
            target.attachEvent('on'+types[i].trim(), function(event) {
                return handler.call(target, event);
            });
        }
    }

}


//事件绑定
function bindEvent(tableId, tbodyId, keywordId) {
    addEvent(document.getElementById(tableId),'click', function(){
        if(event.target.getAttribute('name') == 'checkItem') {
            //单选,所以单选都选中时，勾中全选
            if (event.target.checked) {
                var inputs = document.getElementById(tbodyId).getElementsByTagName('input');
                if (setElementAttr('#'+tbodyId+' input', 'checked', true)) {
                    document.getElementById('checkAll').checked = true;
                }
            } else {
                document.getElementById('checkAll').checked = false;
            }
        }
        else if (event.target.getAttribute('name') == 'checkAll') {
            //全选
            if (event.target.checked) {
                setElementAttr('#'+tbodyId+' input', 'checked', '', true);
            } else {
                setElementAttr('#'+tbodyId+' input', 'checked', '', false);
            }
        }
        else { return false;}
    });

    addEvent(document.getElementById(keywordId), 'keyup, enter', function(){
        var ths = document.querySelectorAll('#'+tableId+' th');
        //keyword
        var keyword = event.target.value || '';
        var searchThs = [];
        var tbody = document.getElementById(tbodyId);
        var rows = tbody.getElementsByTagName('tr');
        for (var i = 0, len = ths.length; i < len; i++) {
            if (ths[i].hasAttribute('data-search')) {
                searchThs.push(i);
            }
        }

        for (var m = 0, len1 = rows.length; m  < len1; m++) {
            for (var j = 0, len2 = searchThs.length; j < len2; j++) {
                rows[m].style.display = 'table-row';
                if (rows[m].childNodes[searchThs[j]].textContent.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1) {
                    rows[m].style.display = 'table-row';
                    break;
                } else {
                    rows[m].style.display = 'none';
                }
            }
        }
    });

}

//排序功能
function sortrows(table, n, comparator, tbodyId) {
    var x = 1;
    var tbody = document.getElementById(tbodyId);
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

//下拉搜索功能
function sortrowsSel(table, n, tbodyId, renderFun) {
    var tbody = document.getElementById(tbodyId);
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
        //回复到初始状态(使用缓存下来的数据重新渲染表格)
        renderFun(cacheData);
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
function makeSortable(table, tbodyId, renderFun) {
    var headers = table.getElementsByTagName('th');
    for (var i = 0, len = headers.length; i < len; i++) {
        (function(n) {
            if (headers[n].hasAttribute('data-sort')) {
                headers[n].onclick = function() {
                    sortrows(table, n, '',tbodyId);
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
                        sortrowsSel(table, n, tbodyId, renderFun);
                    };
                }
            }
        }(i));
    }
}

//批量对节点属性进行判定或者获取属性值
function setElementAttr(selector, attr, value1, value2) {
    var elements = document.querySelectorAll(selector);
    var result = false;
    for (var i = 0, len = elements.length; i < len; i++) {
        if (value1 && elements[i][attr] == value1) {
            result = true;
        } else {
            elements[i][attr] = value2;
            result = false;
        }
    }
    return result;
}
