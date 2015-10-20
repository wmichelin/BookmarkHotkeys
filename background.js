chrome.browserAction.onClicked.addListener(openExtension);
chrome.commands.onCommand.addListener(openExtension);

function openExtension() {
  chrome.tabs.query({
    active: true
  }, function(tab) {
    if (!tab || tab.length === 0) {
      return;
    }

    if (tab[0].url === "chrome://newtab/") {
      chrome.tabs.create({
        url: chrome.extension.getURL("bookmarks.html")
      });
      chrome.tabs.remove(tab[0].id);



    } else if (tab[0].url.match('chrome-extension:\/\/.*\/bookmarks.html')) {
      return;
    } else {
      chrome.tabs.create({
        url: 'bookmarks.html',
        active: true
      });
    }
  });
}
