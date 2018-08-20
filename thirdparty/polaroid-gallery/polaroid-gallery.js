var polaroidGallery = (function () {
    var dataSize = {};
    var dataLength = 0;
    var currentItem = null;
    var navbarHeight = 60;
    var resizeTimeout = null;
    var xmlhttp = new XMLHttpRequest();
    var url = "data/data.json";
    var galleryId = 'gallery';
    var navId = 'nav';
    var nextId = 'next';
    var previewId = 'preview';
    var observeObj = null;

    function polaroidGallery(xgalleryId, xnavId, xnextId, xpreviewId, dataUrl) {

        dataSize = {};
        dataLength = 0;
        currentItem = null;
        navbarHeight = 60;
        resizeTimeout = null;
        xmlhttp = new XMLHttpRequest();

        if (dataUrl && dataUrl.length > 0) {
            url = dataUrl;
        }

        if (xgalleryId && xgalleryId.length > 0) {
            galleryId = xgalleryId;
        }

        if (xnavId && xnavId.length > 0) {
            navId = xnavId;
        }

        if (xnextId && xnextId.length > 0) {
            nextId = xnextId;
        }

        if (xpreviewId && xpreviewId.length > 0) {
            previewId = xpreviewId;
        }

        observe();
        xmlhttp.onreadystatechange = function () {

            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var myArr = JSON.parse(xmlhttp.responseText);
                setGallery(myArr);

                init();
            }
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    function setGallery(arr) {
        var out = "";
        var i;
        for (i = 0; i < arr.length; i++) {

            var index = arr[i].name.indexOf("http");

            if (index != 0) {
                out += '<figure id="' + i + '">' +
                    '<img src="img/' + arr[i].name + '" alt="' + arr[i].name + '"/>' +
                    '<figcaption>' + arr[i].caption + '</figcaption>' +
                    '</figure>';
            }else {
                out += '<figure id="' + i + '">' +
                    '<img src="' + arr[i].name + '" alt="' + arr[i].name + '"/>' +
                    '<figcaption>' + arr[i].caption + '</figcaption>' +
                    '</figure>';
            }

        }
        document.getElementById(galleryId).innerHTML = out;
    }

    function observe() {
        var observeDOM = (function () {
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                eventListenerSupported = window.addEventListener;

            return function (obj, callback) {
                if (MutationObserver) {

                    if (observeObj) {
                        observeObj.disconnect();
                    }

                    var obs = new MutationObserver(function (mutations, observer) {
                        if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                        callback(mutations);
                    });

                    obs.observe(obj, { childList: true, subtree: false });
                    observeObj = obs;
                }
                else if (eventListenerSupported) {

                    if (observeObj) {
                        observeObj.removeEventListener("DOMNodeInserted",observeDOMCallback);
                    }
                    obj.addEventListener('DOMNodeInserted', callback, false);
                    observeObj = obj;
                }
            }
        })();

        observeDOM(document.getElementById(galleryId), observeDOMCallback);
    }

    function observeDOMCallback(mutations) {
        var gallery = [].slice.call(mutations[0].addedNodes);
        var zIndex = 1;
        gallery.forEach(function (item) {
            var img = item.getElementsByTagName('img')[0];
            var first = true;
            img.addEventListener('load', function () {
                if (first) {
                    currentItem = item;
                    first = false;
                }
                dataSize[item.id] = {item: item, width: item.offsetWidth, height: item.offsetHeight};

                dataLength++;

                item.addEventListener('click', function () {
                    select(item);
                    shuffleAll();
                });

                shuffle(item, zIndex++);
            })
        });
    }

    function init() {
        navbarHeight = document.getElementById(navId).offsetHeight;
        navigation();

        window.removeEventListener("resize",nextCallback);

        window.addEventListener('resize', resizeCallback);
    }

    function resizeCallback() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(function () {
            shuffleAll();
            if (currentItem) {
                select(currentItem);
            }
        }, 100);
    }

    function select(item) {
        var scale = 1.8;
        var rotRandomD = 0;

        var initWidth = dataSize[item.id].width;
        var initHeight = dataSize[item.id].height;

        var newWidth = (initWidth * scale);
        var newHeight = initHeight * (newWidth / initWidth);

        var x = (window.innerWidth - newWidth) / 2;
        var y = (window.innerHeight - navbarHeight - newHeight) / 2;

        item.style.transformOrigin = '0 0';
        item.style.WebkitTransform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rotRandomD + 'deg) scale(' + scale + ',' + scale + ')';
        item.style.msTransform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rotRandomD + 'deg) scale(' + scale + ',' + scale + ')';
        item.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rotRandomD + 'deg) scale(' + scale + ',' + scale + ')';
        item.style.zIndex = 999;

        currentItem = item;
    }

    function shuffle(item, zIndex) {
        var randomX = Math.random();
        var randomY = Math.random();
        var maxR = 45;
        var minR = -45;
        var rotRandomD = Math.random() * (maxR - minR) + minR;
        var rotRandomR = rotRandomD * Math.PI / 180;

        var rotatedW = Math.abs(item.offsetWidth * Math.cos(rotRandomR)) + Math.abs(item.offsetHeight * Math.sin(rotRandomR));
        var rotatedH = Math.abs(item.offsetWidth * Math.sin(rotRandomR)) + Math.abs(item.offsetHeight * Math.cos(rotRandomR));

        var x = Math.floor((window.innerWidth - rotatedW) * randomX);
        var y = Math.floor((window.innerHeight - rotatedH) * randomY);

        item.style.transformOrigin = '0 0';
        item.style.WebkitTransform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rotRandomD + 'deg) scale(1)';
        item.style.msTransform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rotRandomD + 'deg) scale(1)';
        item.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rotRandomD + 'deg) scale(1)';
        item.style.zIndex = zIndex;
    }

    function shuffleAll() {
        var zIndex = 0;
        for (var id in dataSize) {
            if (id != currentItem.id) {
                shuffle(dataSize[id].item, zIndex++);
            }
        }
    }

    function navigation() {

        var next = document.getElementById(nextId);
        var preview = document.getElementById(previewId);

        next.removeEventListener("click",nextCallback);

        next.addEventListener('click', nextCallback);

        next.removeEventListener("click",previewCallback);

        preview.addEventListener('click', previewCallback)
    }

    function nextCallback() {
        var currentIndex = Number(currentItem.id) + 1;
        if (currentIndex >= dataLength) {
            currentIndex = 0
        }
        select(dataSize[currentIndex].item);
        shuffleAll();
    }

    function previewCallback() {
        var currentIndex = Number(currentItem.id) - 1;
        if (currentIndex < 0) {
            currentIndex = dataLength - 1
        }
        select(dataSize[currentIndex].item);
        shuffleAll();
    }

    return polaroidGallery;
})();