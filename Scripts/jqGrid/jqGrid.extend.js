//配置参考文档 http://blog.csdn.net/yangbobo1992/article/details/7930040
var jqGridDefaultConfig = {
    prmNames: {
        page: "Page",    // 表示请求页码的参数名称  
        rows: "PageSize",    // 表示请求行数的参数名称  
        sort: "sidx", // 表示用于排序的列名的参数名称  
        order: "OrderBy", // 表示采用的排序方式的参数名称
        search: "_search", // 表示是否是搜索请求的参数名称  
        nd: "nd", // 表示已经发送请求的次数的参数名称  
        id: "id", // 表示当在编辑数据模块中发送数据时，使用的id的名称  
        oper: "oper",    // operation参数名称（我暂时还没用到）  
        editoper: "edit", // 当在edit模式中提交数据时，操作的名称  
        addoper: "add", // 当在add模式中提交数据时，操作的名称  
        deloper: "del", // 当在delete模式中提交数据时，操作的名称  
        subgridid: "id", // 当点击以载入数据到子表时，传递的数据名称  
        npage: null,
        totalrows: "totalrows" // 表示需从Server得到总共多少行数据的参数名称，参见jqGrid选项中的rowTotal  
    },//请求参数配置
    jsonReader: {
        root: "ReturnList",   // json中代表实际模型数据的入口  
        page: "Page",   // json中代表当前页码的数据  
        total: "TotalPage", // json中代表页码总数的数据  
        records: "Count", // json中代表数据行总数的数据  
        repeatitems: false, // 如果设为false，则jqGrid在解析json时，会根据name来搜索对应的数据元素（即可以json中元素可以不按顺序）；而所使用的name是来自于colModel中的name设定。  
        cell: "cell",
        id: "id",
        userdata: "userdata",
        subgrid: {
            root: "ReturnList",
            repeatitems: false,
            cell: "cell"
        }
    }//返回参数配置
}
function FormToJson(pin) {
    var jsonObj = {};
    $($("#" + pin.formId).serializeArray()).each(function (i, o) {
        if (jsonObj[o.name]) {
            jsonObj[o.name] = jsonObj[o.name] + ',' + o.value;
        }
        else { jsonObj[o.name] = o.value; }
    });
    return jsonObj;
}//form表单内带有attribute-search=true的标签数据组合成json对象
