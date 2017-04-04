(function ($) {
    //定义一个控件对象
    $.doublemultiple = $.doublemultiple || {};
    //合并对象
    $.extend($.doublemultiple, {
        version: "1.0.0",
        getAccessor: function (obj, expr) {//get存取器--类似反射
            var ret, p, prm = [], i;
            if (typeof expr === 'function') { return expr(obj); }
            ret = obj[expr];
            if (ret === undefined) {
                try {
                    if (typeof expr === 'string') {
                        prm = expr.split('.');
                    }
                    i = prm.length;
                    if (i) {
                        ret = obj;
                        while (ret && i--) {
                            p = prm.shift();
                            ret = ret[p];
                        }
                    }
                } catch (e) { }
            }
            return ret;
        },
        getMethod: function (name) {//获取方法
            return this.getAccessor($.fn.doubleMultiple, name);
        },
        getGuid: function () {
            return "static" + Math.round(Math.random() * 10000);
        },
        extend: function (methods) {//$.doublemultiple扩展方法
            $.extend($.fn.doubleMultiple, methods);//将函数合并到$.doublemultiple 
            if (!this.no_legacy_api) {
                $.fn.extend(methods);
            }
        }
    });
    //原型对象扩展
    $.fn.doubleMultiple = function (pin) {
        //this=$.fn对象原型
        if (typeof pin === 'string') {
            var fn = $.doublemultiple.getMethod(pin);
            if (!fn) {
                throw ("doubleMultiple - No such method: " + pin);
            }
            //arguments doubleMultiple函数传入的所有参数集合
            var args = $.makeArray(arguments).slice(1);//移掉第一个参数，即这里的pin
            return fn.apply(this, args);//执行fn函数
        }
        return this.each(function () {//链式扩展
            if (this.doublemultiple) {
                return;
            }
            var p = $.extend(true, //定义属性
            {
                name: '',//名称
                searchFieldName: '',//搜索字段 以,进行多字段分割  支持多个字段匹配搜索
                colModel: [],
                container: $('<div/>', { 'attribute-control-type': "container", 'style': 'width:100%' }),
                selectableContainer: $('<div/>', { 'attribute-control-type': 'search', 'style': 'width:47%;float:left;' }),
                selectionContainer: $('<div/>', { 'attribute-control-type': 'result', 'style': 'width:47%;float:right;' }),
                sourceDataId: '', //数据源
                sltDataIds: {value:'',field:''},//选中数据源
                incrementName: 'doublemultipleIncrementId'
            },
            $.doublemultiple.defaults, pin || {});
            p.incrementName = $.doublemultiple.getGuid();
            var ts = this,//ts this的临时变量
                doublemultiple = {
                    dbMultiData: [],//原始数据
                    searchData: [],//搜索到数据
                    selectData: [],//选中数据
                    parm: p,//参数
                    Search: function (searchText, searchField) {
                        var $t = this;
                        var searchResultData = [];
                        if ($t.dbMultiData.length > 0) {
                            var source = $t.dbMultiData;
                            //数据源中包含该对象
                            if (searchText !== "") {
                                searchText = searchText.toLowerCase();
                                source = Enumerable.From(source).Where(function (x) {
                                    var fields = searchField.split(',');
                                    var result = false;
                                    for (var i = 0; i < fields.length; i++) {
                                        result = x[fields[i]].toLowerCase().indexOf(searchText) > -1;
                                        if (result === true) {
                                            break;
                                        }
                                    }
                                    return result;
                                    //return x[searchField].indexOf(searchText) > -1;
                                }).Select(function (x) { return x }).ToArray();
                            }
                            searchResultData = Enumerable.From(source)
                                .Where(function (x) { /*过滤已选中的数据*/
                                    return !($t.selectData.length > 0 &&
                                        Enumerable.From($t.selectData)
                                        .Any(function (sltData) { return sltData[p.incrementName] === x[p.incrementName]; }));
                                })
                                .Select(function (x) { return x }).ToArray();
                        }
                        return searchResultData;
                    },//搜索未选中数据
                    SearchFromSltData: function (searchText, searchField) {
                        var $t = this;
                        var searchResultData = [];
                        if (searchText === "") {
                            searchResultData = $t.selectData;
                        } else {
                            searchText = searchText.toLowerCase();
                            if ($t.selectData.length > 0) {
                                searchResultData = Enumerable.From($t.selectData)
                                    .Where(function (x) {
                                        var fields = searchField.split(',');
                                        var result = false;
                                        for (var i = 0; i < fields.length; i++) {
                                            result = x[fields[i]].toLowerCase().indexOf(searchText) > -1;
                                            if (result === true) {
                                                break;
                                            }
                                        }
                                        return result;
                                    })
                                    .Select(function (x) { return x }).ToArray();
                            }
                        }
                        return searchResultData;
                    },//从选中值中搜索 
                    GetRowDataById: function (id) {
                        var $t = this;
                        var row = null;
                        if ($t.dbMultiData.length > 0) {
                            row = Enumerable.From($t.dbMultiData)
                                .Where(function (x) {
                                    return x[p.incrementName] === parseInt(id);
                                })
                                .FirstOrDefault();
                        }
                        return row;
                    }, //根据Id查找
                    SetSltData: function (id) {
                        var $t = this;
                        var row = null;
                        if ($t.dbMultiData.length > 0) {
                            row = $t.GetRowDataById(id);
                        }
                        if (row != null) {
                            $t.selectData.push(row);
                        }
                    }, //设置选中数据
                    ClearAllSltData: function () {
                        this.selectData = [];
                    },//清除所有选中值
                    GetSelectFields: function (getFieldFunc) {
                        var $t = this;
                        return (Enumerable.From($t.selectData).Select(function (x) { return getFieldFunc(x); }).ToArray() || []);//.join(',');
                    }, //获取选中值某个字段集合
                    RemoveSltData: function (id) {
                        var $t = this;
                        if ($t.selectData.length > 0) {
                            var intId = parseInt(id);
                            for (var i = 0; i < $t.selectData.length; i++) {
                                if ($t.selectData[i][p.incrementName] === intId) {
                                    $t.selectData.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    },//移除选中数据
                    InitMulti: function (tsObj) {
                        //初始化下拉框
                        var theadText = '<thead><tr>';
                        for (var col = 0; col < p.colModel.length; col++) {
                            var tdstyle = 'style="';
                            if (p.colModel[col].width) {
                                tdstyle += "width:" + p.colModel[col].width + ";";
                            }
                            if (p.colModel[col].hidden) {
                                tdstyle += "display:" + ((p.colModel[col].hidden === true) ? "none" : " " + ";");
                            }
                            tdstyle += '"';
                            theadText += '<th ' + tdstyle + '>' + p.colModel[col].name + '</th>';
                        }
                        theadText += '</tr></thead>';
                        
                        var sourceTable = $("<div/>", { 'style': 'overflow-y: auto; height: 243px;' })
                            .append($('<table/>', { 'class': 'dbmultitable' }).append(theadText).append($("<tbody/>", { "attribute-control-type": "tbody", "attribute-control-name": "search-tbody" })));//搜索 

                        var sltTable = $("<div/>", { 'style': 'overflow-y: auto; height: 243px;' })
                            .append($('<table/>', { 'class': 'dbmultitable' }).append(theadText).append($("<tbody/>", { "attribute-control-type": "tbody", "attribute-control-name": "result-tbody" })));//结果
                        tsObj.append(
                            p.container
                            .append(p.selectableContainer.append("<div class='custom-header' style='margin-bottom: 8px;'>可选" + p.name + "</div><div>搜索：<input type='text' attribute-control-type='search' attribute-control-name='source' autocomplete='off' placeholder=''></div>").append(sourceTable))//左侧
                            .append(p.selectionContainer.append("<div class='custom-header' style='margin-bottom: 8px;'>已选" + p.name + "</div><div>搜索：<input type='text' attribute-control-type='search'  attribute-control-name='result' autocomplete='off' placeholder=''></div>").append(sltTable))//右侧
                            [0]);
                    }//初始化下拉框
                };

            /*----------------start-初始化数据源---------*/

            var data = [];
            if (p.colModel.length < 1) {
                throw new error("colModel is null");
            }
            $.each($("#" + p.sourceDataId).find("tr"), function (i, o) {
                var tds = $(o).find("td");
                var row = {};
                row[p.incrementName] = i;
                for (var col = 0; col < p.colModel.length; col++) {
                    row[p.colModel[col].field] = tds.eq(col).text();
                }
                data.push(row);
            });
            doublemultiple.dbMultiData = data;
            /*----------------end-初始化数据源---------*/

            /*---------------start 初始化选中数据-------*/
            var ids = p.sltDataIds["value"].split(","); //字符分割
            var sltResultData = [];
            if (p.sltDataIds["field"] === '') {
                throw new Error("sltDataIdField cannot be empty");
            }
            if (data.length > 0 && ids.length > 0) {
                sltResultData = Enumerable.From(data)
                    .Where(function (x) { /*过滤已选中的数据*/
                        return Enumerable.From(ids).Any(function (id) {
                            return id === x[p.sltDataIds["field"]];
                        });
                    })
                    .Select(function (x) { return x }).ToArray();
            }
            doublemultiple.selectData = sltResultData;
            /*---------------end 初始化选中数据-------*/
            this.doublemultiple = doublemultiple;
            ts.doublemultiple.InitMulti(this);
            $(ts).on("click", ".trItem", function (e) {
                $(ts).RowClick(this);
            }).on("keyup", "input[attribute-control-type='search']", function (e) {
                $(ts).InitSerachData(this, p.searchFieldName);
            });
        });
    };
    //扩展机制
    $.doublemultiple.extend({
        Search: function (text, searchFunc) {
            return this[0].doublemultiple.Search(text, searchFunc);
        },
        SearchFromSltData: function (text, searchFunc) {
            return this[0].doublemultiple.SearchFromSltData(text, searchFunc);
        },
        GetRowDataById: function (id) {
            return this[0].doublemultiple.GetRowDataById(id);
        },
        SetSltData: function (id) {
            this[0].doublemultiple.SetSltData(id);
        },
        ClearAllSltData: function () {
            this[0].doublemultiple.ClearAllSltData();
        },
        GetSelectFields: function (getIdFunc) {
            return this[0].doublemultiple.GetSelectFields(getIdFunc);
        },
        RemoveSltData: function (id) {
            this[0].doublemultiple.RemoveSltData(id);
        },
        RowClick: function (row) {
            var $t = this;//当前控件对象
            var tbody = $(row).parent();
            var $row = $(row);
            $(row).remove();
            var addTableBody;
            if (tbody.attr("attribute-control-name") === "search-tbody") { //搜索部分 添加
                $t.SetSltData($row.attr("data-value"));
                addTableBody = $t.find("tbody[attribute-control-name='result-tbody']").eq(0);
            } else if (tbody.attr("attribute-control-name") === "result-tbody") { //选中部分 删除
                $t.RemoveSltData($row.attr("data-value"));
                addTableBody = $t.find("tbody[attribute-control-name='search-tbody']").eq(0);
            }
            var trs = addTableBody.find("tr");
            var indexTr = null;
            var thisTrDataValue = parseInt($row.attr("data-value"));
            var isAdd = true;
            for (var i = 0; i < trs.length; i++) {
                var id = parseInt($(trs[i]).attr("data-value"));
                if (id > thisTrDataValue) {//找到大于当前id的第一个位置，然后再这个位置前面插入
                    indexTr = $(trs[i]);
                    break;
                }
                if (id === thisTrDataValue) {
                    isAdd = false;
                    break;
                }
            }
            if (isAdd) {//执行添加操作
                if (null == indexTr) {
                    addTableBody.append($row);
                } else {
                    indexTr.before($row);
                }
            }
        },//行点击事件
        SetList: function (result, body) {
            var $t = this[0];
            body.find("tr").remove();
            $(result).each(function (i, o) {
                var tr = "<tr class='trItem' data-value='" + o[$t.doublemultiple.parm.incrementName] + "'>";
                var colModel = $t.doublemultiple.parm.colModel;
                for (var col = 0; col < colModel.length; col++) {
                    //有hidden字段配置，则hidden=false时处理
                    if (colModel[col].hidden) {
                        if (colModel[col].hidden === false) {
                            tr += "<td>" + o[colModel[col].field] + "</td>";
                        }
                    } else {//无hidden配置，说明可见
                        tr += "<td>" + o[colModel[col].field] + "</td>";
                    }
                }
                tr += "</tr>";
                $(body).append(tr);
            });
        },//设置指定body下的下拉框
        SetSourceList: function (result) {
            this.SetList(result, this.find("tbody[attribute-control-name='search-tbody']").eq(0));
        },//初始化数据源下拉框
        SetResultList: function (result) {
            this.SetList(result, this.find("tbody[attribute-control-name='result-tbody']").eq(0));
        },//初始化结果集下拉框
        TrItemCheckAll: function () {
            var $this = this;//当前控件对象
            $($this.find("tbody[attribute-control-name='search-tbody']").eq(0).find("tr")).each(function (i, o) {
                $this.RowClick(this);
            });
        },//全选
        TrItemInvertCheck: function () {
            var $this = this;//当前控件对象
            var sourceLeft = $("tbody[attribute-control-name='search-tbody']").find("tr");
            $($("tbody[attribute-control-name='result-tbody']").find("tr")).each(function (i, o) {
                $this.RowClick(this);
            });
            $(sourceLeft).each(function (i, o) {
                $this.RowClick(this);
            });
        },//反选  左右结果对调
        ClearAll: function () {
            this.ClearAllSltData();
            this.SetResultList([]);
            var $ts = this[0];
            this.SetSourceList($ts.doublemultiple.dbMultiData);
        },//清空
        InitSerachData: function (element, searchField) {
            var $this = this;
            if ($(element).attr("attribute-control-name") === "result") { //右侧搜索
                $this.SetResultList($this.SearchFromSltData($(element).val(), searchField));
            } else { //左侧搜索
                $this.SetSourceList($this.Search($(element).val(), searchField));
            }
        },//初始化搜索数据
        InitSerach: function () {
            var $this = this; var $t = this[0];
            $("input[attribute-control-type='search']").each(function (i, o) {
                $this.InitSerachData(o, $t.doublemultiple.parm.searchFieldName);
            });
        }//初始化左右搜索框数据
    });
})(jQuery);