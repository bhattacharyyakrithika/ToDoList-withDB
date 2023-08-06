exports.getDate = function () {

    let dayAndMsg = {};
    let today = new Date();
    let curHr = today.getHours()
    let salutationMsg = "";

    if (curHr < 12) {
        salutationMsg = 'Bonjour 😃';
    } else if (curHr < 18) {
        salutationMsg = 'Bon après-midi 🍲';
    } else {
        salutationMsg = 'Bonne soirée 😌';
    }

    const options = {
        day: "numeric",
        weekday: "long",
        month: "long",
    }
    
    const day = today.toLocaleDateString("en-US", options);
    dayAndMsg = {
        "nameOfTheday": day,
        "message": salutationMsg
    }

    return(dayAndMsg);

};