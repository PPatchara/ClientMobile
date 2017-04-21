var serverAddress = 'http://10.0.100.163:3000/api';
var imageAddress = 'http://10.0.100.163:3000/app/img';
var calendarAddress = 'http://10.0.100.163:3000/calendars';

var myApp = new Framework7({
    swipeBackPage:false,
    precompileTemplates: true,
    fastClicks:false,
    modalCloseByOutside: true,
    actionsCloseByOutside: true,
    modalActionsCloseByOutside: true,
    template7Pages: true,
});

var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    domCache: true

});

function getUid() {
    return Cookies.get('connect.sid');
}