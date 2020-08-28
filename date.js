//jshint esversion:6

exports.getDate = function(){
    const dateOptions = { weekday: "long", day: "numeric", month: "long" };
    const currentDate = new Date();
    return currentDate.toLocaleDateString("en-US", dateOptions);;
}

exports.getDay = function(){
    const dateOptions = { weekday: "long"};
    const currentDate = new Date();
    return currentDate.toLocaleDateString("en-US", dateOptions);;
}