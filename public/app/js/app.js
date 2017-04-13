var serverAddress = 'http://localhost:3000/api';

var myApp = new Framework7({
    swipeBackPage:false,
    precompileTemplates: true,
    fastClicks:false,
    modalCloseByOutside: true,
    actionsCloseByOutside: true,
    modalActionsCloseByOutside: true,
});

var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    domCache: true

});