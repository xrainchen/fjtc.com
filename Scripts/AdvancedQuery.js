function SelectAllQuery() {
    $('#tbAdvancedQuery input[type="checkbox"]', navTab.getCurrentPanel()).prop('checked', 'checked');
}
function ReverseQuery() {
    $('#tbAdvancedQuery input[type="checkbox"]', navTab.getCurrentPanel()).each(function () {
        if ($(this).prop("checked")) {
            $(this).prop("checked", false);
        }
        else {
            $(this).prop("checked", true);
        }
    });
}
function ClearSdkValue() {
    $("input[name*=Game]", navTab.getCurrentPanel()).val('');
    $("input[name*=MainChannel]", navTab.getCurrentPanel()).val('');
    $("input[name*=SubChannel]", navTab.getCurrentPanel()).val('');
}
function ShowAndHide(objId) {
    if ($('#' + objId, navTab.getCurrentPanel()).hasClass('hide')) {
        $('#' + objId, navTab.getCurrentPanel()).removeClass('hide');
        $('#' + objId, navTab.getCurrentPanel()).parent().parent().removeClass('hide');
    }
    else {
        $('#' + objId, navTab.getCurrentPanel()).addClass('hide');
        $('#' + objId, navTab.getCurrentPanel()).parent().parent().addClass('hide');
    }
}