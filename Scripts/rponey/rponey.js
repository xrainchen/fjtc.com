var rponey = {
    version: '1.1.1',
    regPlugins: [], // [function($parent){} ...] 
    // sbar: show sidebar
    keyCode: {
        ENTER: 13, ESC: 27, END: 35, HOME: 36,
        SHIFT: 16, TAB: 9,
        LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40,
        DELETE: 46, BACKSPACE: 8
    },
    eventType: {
        pageClear: "pageClear",	// 用于重新ajaxLoad、关闭nabTab, 关闭dialog时，去除xheditor等需要特殊处理的资源
        resizeGrid: "resizeGrid",	// 用于窗口或dialog大小调整
        initEnvAfter: "initEnvAfter" // initEnv完成出发
    },
    isOverAxis: function (x, reference, size) {
        //Determines when x coordinate is over "b" element axis
        return (x > reference) && (x < (reference + size));
    },
    isOver: function (y, x, top, left, height, width) {
        //Determines when x, y coordinates is over "b" element
        return this.isOverAxis(y, top, height) && this.isOverAxis(x, left, width);
    },
    pageInfo: { pageNum: "pageNum", numPerPage: "numPerPage", orderField: "orderField", orderDirection: "orderDirection" },
    statusCode: { ok: 200, error: 300, timeout: 301 },
    keys: { statusCode: "ReturnCode", message: "Message" },
    ui: {
        sbar: true,
        hideMode: 'display' //navTab组件切换的隐藏方式，支持的值有’display’，’offsets’负数偏移位置的值，默认值为’display’
    },
    frag: {}, //page fragment
    _msg: {}, //alert message
    _set: {
        loginUrl: "", //session timeout
        loginTitle: "", //if loginTitle open a login dialog
        debug: false
    },
    msg: function (key, args) {
        var _format = function (str, args) {
            args = args || [];
            var result = str || "";
            for (var i = 0; i < args.length; i++) {
                result = result.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
            }
            return result;
        }
        return _format(this._msg[key], args);
    },
    debug: function (msg) {
        if (this._set.debug) {
            if (typeof (console) != "undefined") console.log(msg);
            else alert(msg);
        }
    },
    loadLogin: function () {
        if ($.pdialog && rponey._set.loginTitle) {
            $.pdialog.open(rponey._set.loginUrl, "login", rponey._set.loginTitle, { mask: true, width: 520, height: 260 });
        } else {
            window.location = rponey._set.loginUrl;
        }
    },

    /*
	 * json to string
	 */
    obj2str: function (o) {
        var r = [];
        if (typeof o == "string") return "\"" + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
        if (typeof o == "object") {
            if (!o.sort) {
                for (var i in o)
                    r.push(i + ":" + rponey.obj2str(o[i]));
                if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
                    r.push("toString:" + o.toString.toString());
                }
                r = "{" + r.join() + "}"
            } else {
                for (var i = 0; i < o.length; i++) {
                    r.push(rponey.obj2str(o[i]));
                }
                r = "[" + r.join() + "]"
            }
            return r;
        }
        return o.toString();
    },
    jsonEval: function (data) {
        try {
            if ($.type(data) == 'string')
                return eval('(' + data + ')');
            else return data;
        } catch (e) {
            return {};
        }
    },
    ajaxError: function (xhr, ajaxOptions, thrownError) {
        if (alertMsg) {
            alertMsg.error("<div>Http status: " + xhr.status + " " + xhr.statusText + "</div>"
				+ "<div>ajaxOptions: " + ajaxOptions + "</div>"
				+ "<div>thrownError: " + thrownError + "</div>"
				+ "<div>" + xhr.responseText + "</div>");
        } else {
            alert("Http status: " + xhr.status + " " + xhr.statusText + "\najaxOptions: " + ajaxOptions + "\nthrownError:" + thrownError + "\n" + xhr.responseText);
        }
    },
    ajaxDone: function (json) {
        if (json[rponey.keys.statusCode] === rponey.statusCode.error) {
            if (json[rponey.keys.message] && alertMsg) alertMsg.error(json[rponey.keys.message]);
        } else if (json[rponey.keys.statusCode] === rponey.statusCode.timeout) {
            if (alertMsg) alertMsg.error(json[rponey.keys.message] || rponey.msg("sessionTimout"), { okCall: rponey.loadLogin });
            else rponey.loadLogin();
        } else if (json[rponey.keys.statusCode] == rponey.statusCode.ok) {
            if (json[rponey.keys.message] && alertMsg) alertMsg.correct(json[rponey.keys.message]);
        };
    },

};
function validateCallback(form, callback, confirmMsg) {
    var $form = $(form);
    if (!$form.valid()) {
        return false;
    }
    var _submitFn = function () {
        $form.find(':focus').blur();
        $.ajax({
            type: form.method || 'POST',
            url: $form.attr("action"),
            data: $form.serializeArray(),
            dataType: "json",
            cache: false,
            success: callback || rponey.ajaxDone,
            error: rponey.ajaxError
        });
    }
    if (confirmMsg) {
        alertMsg.confirm(confirmMsg, { okCall: _submitFn });
    } else {
        _submitFn();
    }
    return false;
}
function navTabAjaxDone(json) {
    rponey.ajaxDone(json);
    if (json[rponey.keys.statusCode] === rponey.statusCode.ok) {
       if ("forward" === json.callbackType) {
            navTab.reload(json.forwardUrl);
        } else if ("redirect" === json.CallBackType) {//如果callbackType是redirect  
            window.location.replace(json.RedirectUrl);
        } else if ("forwardConfirm" === json.CallBackType) {
            alertMsg.confirm(json.confirmMsg || rponey.msg("forwardConfirmMsg"), {
                okCall: function () {
                    navTab.reload(json.forwardUrl);
                }
            });
        } else {
            navTab.getCurrentPanel().find(":input[initValue]").each(function () {
                var initVal = $(this).attr("initValue");
                $(this).val(initVal);
            });
        }
    }
}

(function($) {
    // DWZ set regional
    $.setRegional = function(key, value) {
        if (!$.regional) $.regional = {};
        $.regional[key] = value;
    };
})(jQuery);