function CheckboxClick(groupName, valueCtrl, textCtrl) {
    $('input[type="checkbox"][name="' + groupName + '"]', $.pdialog.getCurrent()).each(function () {
        SetSelectValue(this, valueCtrl, textCtrl);
    });
}
function SetSelectValue(obj, valueCtrl, textCtrl) {
    var selIds = $('#' + valueCtrl, $.pdialog.getCurrent()).val();
    var selNames = $('#' + textCtrl, $.pdialog.getCurrent()).val();
    var thisVal = $(obj).attr('data-value');
    var thisText = $(obj).attr('data-text');
    if ($(obj).prop("checked")) {
        if (("," + selIds + ",").indexOf("," + thisVal + ",") == -1) {
            selIds += "," + thisVal;
            selNames += "," + thisText;
        }
    }
    else {
        selIds = ("," + selIds + ",").replace("," + thisVal + ",", "");
        selNames = ("," + selNames + ",").replace("," + thisText + ",", "");
    }
    if (selIds.substring(0, 1) == ",") {
        selIds = selIds.substr(1);
    }
    if (selIds.substr(selIds.length - 1) == ",") {
        selIds = selIds.substr(0, selIds.length - 1);
    }
    if (selNames.substring(0, 1) == ",") {
        selNames = selNames.substr(1);
    }
    if (selNames.substr(selNames.length - 1) == ",") {
        selNames = selNames.substr(0, selNames.length - 1);
    }
    $('#' + valueCtrl, $.pdialog.getCurrent()).val(selIds);
    $('#' + textCtrl, $.pdialog.getCurrent()).val(selNames);
}