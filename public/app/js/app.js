// var serverAddress = 'http://172.20.10.2:3000/api';
// var imageAddress = 'http://172.20.10.2:3000/app/img';
// var calendarAddress = 'http://1172.20.10.2:3000/calendars';
var serverAddress = 'http://10.50.8.13:3000/api';
var imageAddress = 'http://10.50.8.13:3000/app/img';
var calendarAddress = 'http://10.50.8.13:3000/calendars';

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

var mySwiper = myApp.swiper('.swiper-container', {
    pagination:'.swiper-pagination'
  });

function getUid() {
    return Cookies.get('connect.sid');
}