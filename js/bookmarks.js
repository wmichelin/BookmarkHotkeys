//fix everything here
var bookmarks = getBookmarks();
var hotkeys = getHotkeys();
//will have to change
var pageSize = 10;
var startIndex = 0;

var backKeyHotkeyCode = 27;
var enterKeyKeyCode = 13;
var nextKeyCode = 88;
var backKeyCode = 90;

var bookmarkSelector = ".bookmark";
var bookmarksContainerSelector = ".bookmarks-wrapper";

var backButtonSelector = ".back-button";
var nextButtonSelector = ".next-button";
var lastButtonSelector = ".last-button";
var pageNumberSelector = ".page-number";
var numPagesSelector = ".num-pages";

var rootId = "1";
var currentId = rootId;
var lastId = rootId;


// //later
// chrome.storage.onChanged.addListener(function(changes, namespace) {
//   console.log('updated');
// });

function setBookmarkRoot(id) {
  $(pageNumberSelector).text((startIndex / pageSize) + 1);


  if (id === rootId) {
    $(backButtonSelector).addClass('hidden');
  } else {
    $(backButtonSelector).removeClass('hidden');
  }

  chrome.bookmarks.getChildren(id, function(bookmarksArray) {
    lastId = currentId;
    currentId = id;

    bookmarks = bookmarksArray;
    var numPages = Math.ceil((bookmarks.length / pageSize));
    $(numPagesSelector).text(numPages);

    setIfCanNextPage();
    setIfCanLastPage();
    updateBookmarkElements();
  });
}


//set data
document.addEventListener("DOMContentLoaded", function() {
  window.focus();
  activateToolTips();
  setBookmarkRoot(rootId);
});

document.addEventListener('click', function(evt) {
  evt.preventDefault();
});

function renderBookmarksPage() {
  $(bookmarksContainerSelector).html('');

  for (var i = startIndex; i < startIndex + pageSize; i++) {
    var newBookmark = renderSingleBookmark(i);
    if (!newBookmark) {
      break;
    }
    $(bookmarksContainerSelector).append(newBookmark);
  }
}

function renderSingleBookmark(index) {
  // <div class="a-wrapper" index="0">
  //   <div class="inline-block hotkey">0</div>
  //   <a class="inline-block" href="http://google.com">First Link</a>
  // </div>
  if (!bookmarks[index]) {
    return false;
  }
  var bookmarkWrapper = $("<div class='a-wrapper bookmark' index='" + index + "'></div>");
  var hotkey = $("<div class='inline-block hotkey'>" + hotkeys[index - startIndex] + ".</div>");

  var title = bookmarks[index].title || bookmarks[index].url;

  //assume blank URL bookmark is folder
  var isFolder = !bookmarks[index].url;

  var link = $("<a class='inline-block' href='" + bookmarks[index].url + "'>" + title + "</a>");
  link.attr('isFolder', isFolder);

  var icon = $("<i></i>");
  if (isFolder) {
    icon.addClass('fa fa-folder')
  }


  bookmarkWrapper.append(hotkey)
    .append(icon)
    .append(link);


  return bookmarkWrapper;

}




function updateBookmarkElements() {
  renderBookmarksPage();
}

// var theValue = [1, 2, 3];
// chrome.storage.sync.set({
//   'bookmarks': theValue
// }, function() {
//   // Notify that we saved.
//
// });
$(document).keydown(deletegateKeyPress);


function deletegateKeyPress(e) {
  if (e.keyCode === enterKeyKeyCode) {
    checkIfFolder();
    e.preventDefault();
    return false;
  }

  if (e.keyCode === nextKeyCode) {
    nextPage();
    return;
  }

  if (e.keyCode === backKeyCode) {
    lastPage();
    return;
  }


  handleHotkeyPress(e);
  changeFocusOnArrowKeys(e);
}

function checkIfFolder() {
  if ($('a:focus')) {
    triggerBookmarkSelectionFromDomElement($("a:focus"))
  }
  return false;
}

function handleHotkeyPress(e) {
  var matchedOnce = false;
  hotkeys.forEach(function(value, index) {
    valueString = "" + value;
    if (e.keyCode === valueString.charCodeAt(0)) {
      matchedOnce = true;
      triggerBookmarkSelection(index);
    }
  });

  if (!matchedOnce && e.keyCode === backKeyHotkeyCode) {
    navigateToPrevious();
  }
}

function triggerBookmarkSelectionFromDomElement(element) {
  triggerBookmarkSelection(element.parent().index());
}

function triggerBookmarkSelection(index) {
  bookmarkElements = $(bookmarkSelector);
  if (bookmarkElements.eq(index).length > 0) {
    var linkElement = bookmarkElements.eq(index).find('a');

    if (linkElement.attr('href') !== "undefined") {
      window.location = linkElement.attr('href');
    } else {
      setBookmarkRoot(bookmarks[startIndex + index].id);
    }
  }
}




function changeFocusOnArrowKeys(e) {
  var anchorArray = $("a");
  var focusedKey = $("a:focus");
  var currentIndex = anchorArray.index(focusedKey);

  var modificationVal = 0;
  if (e.keyCode === 40 || e.keyCode === 39) {
    modificationVal++;
  } else if (e.keyCode === 37 || e.keyCode === 38) {
    modificationVal--;
  } else {
    return false;
  }

  if (focusedKey.length > 0) {

    currentIndex += modificationVal;

    //check for edges and loop around
    if (currentIndex < 0) {
      currentIndex = anchorArray.length - 1;
    }

    if (currentIndex >= anchorArray.length) {
      currentIndex = 0;
    }


    focusedKey = anchorArray[currentIndex];
    focusedKey.focus();

  } else {
    $("a")[0].focus();
  }
}

function navigateToPrevious() {
  chrome.bookmarks.get(currentId, function(bookmark) {
    var current = bookmark[0];
    if (bookmark[0].parentId !== "0") {
      setBookmarkRoot(bookmark[0].parentId);
    }
  });
}



function getBookmarks() {
  return bookmarkList;
}

function getHotkeys() {
  return hotkeyMap;
}

function nextPage() {
  if (startIndex + pageSize < bookmarks.length) {
    startIndex += pageSize;
  } else {
    return;
  }

  setBookmarkRoot(currentId);
}

function lastPage() {
  if (startIndex - pageSize >= 0) {
    startIndex -= pageSize;
  } else {
    return;
  }
  setBookmarkRoot(currentId);
}

function setIfCanNextPage() {
  if (startIndex + pageSize < bookmarks.length) {
    $(nextButtonSelector).show();
  } else {
    $(nextButtonSelector).hide();
  }

}

function setIfCanLastPage() {
  if (startIndex - pageSize >= 0) {
    $(lastButtonSelector).show();
  } else {
    $(lastButtonSelector).hide();
  }
}

function activateToolTips() {
  console.log('activated tipsy');
  $('.help').tipsy({
    gravity: 'nw'
  });
}
