define(['visibleinviewport', 'imageFetcher', 'layoutManager', 'events', 'browser'], function (visibleinviewport, imageFetcher, layoutManager, events, browser) {

    var thresholdX;
    var thresholdY;
    var windowSize;

    function resetThresholds() {

        var x = screen.availWidth;
        var y = screen.availHeight;

        if (layoutManager.mobile) {
            x *= 2;
            y *= 2;
        }

        thresholdX = x;
        thresholdY = y;
        resetWindowSize();
    }

    window.addEventListener("orientationchange", resetThresholds);
    window.addEventListener('resize', resetThresholds);
    events.on(layoutManager, 'modechange', resetThresholds);

    var wheelEvent = (document.implementation.hasFeature('Event.wheel', '3.0') ? 'wheel' : 'mousewheel');

    function resetWindowSize() {
        windowSize = {
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth
        };
    }
    resetThresholds();

    function isVisible(elem) {
        return visibleinviewport(elem, true, thresholdX, thresholdY, windowSize);
    }

    var self = {};

    function fillImage(elem, source, enableEffects) {

        if (!source) {
            source = elem.getAttribute('data-src');
        }
        if (source) {
            if (self.enableFade && enableEffects !== false) {
                imageFetcher.loadImage(elem, source).then(fadeIn);
            } else {
                imageFetcher.loadImage(elem, source);
            }
            elem.setAttribute("data-src", '');
        }
    }

    function fadeIn(elem) {

        var keyframes = [
          { opacity: '0', offset: 0 },
          { opacity: '1', offset: 1 }];
        var timing = { duration: 300, iterations: 1 };
        elem.animate(keyframes, timing);
    }

    function cancelAll(tokens) {
        for (var i = 0, length = tokens.length; i < length; i++) {

            tokens[i] = true;
        }
    }

    var supportsCaptureOption = false;
    try {
        var opts = Object.defineProperty({}, 'capture', {
            get: function () {
                supportsCaptureOption = true;
            }
        });
        window.addEventListener("test", null, opts);
    } catch (e) { }

    function addEventListenerWithOptions(target, type, handler, options) {
        var optionsOrCapture = options;
        if (!supportsCaptureOption) {
            optionsOrCapture = options.capture;
        }
        target.addEventListener(type, handler, optionsOrCapture);
    }

    function unveilWithIntersection(images) {

        var filledCount = 0;

        var observer = new IntersectionObserver(function (entries) {
            for (var j = 0, length2 = entries.length; j < length2; j++) {
                var entry = entries[j];
                var intersectionRatio = entry.intersectionRatio;
                if (intersectionRatio) {

                    var target = entry.target;
                    observer.unobserve(target);
                    fillImage(target);
                    filledCount++;
                }
            }

            if (filledCount >= images.length) {
                //observer.disconnect();
            }
        },
        {
            /* Using default options. Details below */
        }
        );
        // Start observing an element
        for (var i = 0, length = images.length; i < length; i++) {
            observer.observe(images[i]);
        }
    }

    var supportsIntersectionObserver = function () {

        if (window.IntersectionObserver) {

            // The api exists in chrome 50 but doesn't work
            if (browser.chrome) {

                var version = parseInt(browser.version.split('.')[0]);
                return version >= 51;
            }
            return true;
        }

        return false;
    }();

    function unveilElements(images) {

        if (!images.length) {
            return;
        }

        if (supportsIntersectionObserver) {
            unveilWithIntersection(images);
            return;
        }

        var filledImages = [];
        var cancellationTokens = [];

        function unveilInternal(tokenIndex) {

            var anyFound = false;
            var out = false;

            // TODO: This out construct assumes left to right, top to bottom

            for (var i = 0, length = images.length; i < length; i++) {

                if (cancellationTokens[tokenIndex]) {
                    return;
                }
                if (filledImages[i]) {
                    continue;
                }
                var img = images[i];
                if (!out && isVisible(img)) {
                    anyFound = true;
                    filledImages[i] = true;
                    fillImage(img);
                } else {

                    if (anyFound) {
                        out = true;
                    }
                }
            }

            if (!images.length) {
                document.removeEventListener('focus', unveil, true);
                document.removeEventListener('scroll', unveil, true);
                document.removeEventListener(wheelEvent, unveil, true);
                window.removeEventListener('resize', unveil, true);
            }
        }

        function unveil() {

            cancelAll(cancellationTokens);

            var index = cancellationTokens.length;
            cancellationTokens.length++;

            setTimeout(function () {
                unveilInternal(index);
            }, 1);
        }

        addEventListenerWithOptions(document, 'scroll', unveil, {
            capture: true,
            passive: true
        });
        document.addEventListener('focus', unveil, true);
        addEventListenerWithOptions(document, wheelEvent, unveil, {
            capture: true,
            passive: true
        });
        addEventListenerWithOptions(window, 'resize', unveil, {
            capture: true,
            passive: true
        });

        unveil();
    }

    function lazyChildren(elem) {

        unveilElements(elem.getElementsByClassName('lazy'));
    }

    function getPrimaryImageAspectRatio(items) {

        var values = [];

        for (var i = 0, length = items.length; i < length; i++) {

            var ratio = items[i].PrimaryImageAspectRatio || 0;

            if (!ratio) {
                continue;
            }

            values[values.length] = ratio;
        }

        if (!values.length) {
            return null;
        }

        // Use the median
        values.sort(function (a, b) { return a - b; });

        var half = Math.floor(values.length / 2);

        var result;

        if (values.length % 2)
            result = values[half];
        else
            result = (values[half - 1] + values[half]) / 2.0;

        // If really close to 2:3 (poster image), just return 2:3
        var aspect2x3 = 2 / 3;
        if (Math.abs(aspect2x3 - result) <= .15) {
            return aspect2x3;
        }

        // If really close to 16:9 (episode image), just return 16:9
        var aspect16x9 = 16 / 9;
        if (Math.abs(aspect16x9 - result) <= .2) {
            return aspect16x9;
        }

        // If really close to 1 (square image), just return 1
        if (Math.abs(1 - result) <= .15) {
            return 1;
        }

        // If really close to 4:3 (poster image), just return 2:3
        var aspect4x3 = 4 / 3;
        if (Math.abs(aspect4x3 - result) <= .15) {
            return aspect4x3;
        }

        return result;
    }

    function fillImages(elems) {

        for (var i = 0, length = elems.length; i < length; i++) {
            var elem = elems[0];
            fillImage(elem);
        }
    }

    self.fillImages = fillImages;
    self.lazyImage = fillImage;
    self.lazyChildren = lazyChildren;
    self.getPrimaryImageAspectRatio = getPrimaryImageAspectRatio;

    return self;
});