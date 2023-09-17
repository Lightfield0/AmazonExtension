document.getElementById('activateScript').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "activateScript"}, function(response) {
        console.log(response);
    });
});
