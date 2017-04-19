var serverAddress = 'http://localhost:3000/api';
var imageAddress = 'http://localhost:3000/app/img';

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