/*
 **	This plugin is inspired from  jQuery Scroll pagination plugin
 ** I have updated it to suit my requirements.
 ** Amit Jain
 ** amitjain1982@gmail.com
 */

(function ($) {
    var SCROLL_INITIALIZED = 'remote-pagination-initialized';
    var UPDATED_OPTIONS = 'remote-pagination-updatedOptions';
    var SCROLLING = 'remote-pagination';
    var STATUS = 'data-remote-pagination-status';
    var LOAD_SEMAPHORE = 'remote-pagination-semaphore';

    $.fn.remoteNonStopPageScroll = function (options) {
        var container = $(this);
        if (container.data(SCROLL_INITIALIZED)!=true) {
            container.data(SCROLL_INITIALIZED,true);
            var opts = $.extend($.fn.remoteNonStopPageScroll.defaults, options);
            var target = opts.scrollTarget;
            if (target == null) {
                target = container;
            }
            opts.scrollTarget = target;

            return container.each(function () {
                $.fn.remoteNonStopPageScroll.init(container, opts);
            });
        }
    };

    $.fn.stopRemotePaginateOnScroll = function () {
        return this.each(function () {
            $(this).data(SCROLLING, 'disabled');
        });
    };

    $.fn.remoteNonStopPageScroll.loadContent = function (container, opts) {
        opts = $.extend(opts, container.data(UPDATED_OPTIONS) || {});
        var target = $(opts.scrollTarget);
        var mayLoadContent = (target.scrollTop() + opts.heightOffset) >= ($(document).height() - target.height());
        if (mayLoadContent && container.data(LOAD_SEMAPHORE)) {

            if (opts.onLoading != null) {
                opts.onLoading();
            }

            container.children().attr(STATUS, 'loaded');
            $.fn.remoteNonStopPageScroll.setSemaphore(container,false);
            $.ajax({
                type:'POST',
                url:opts.url,
                data:{},
                success:function (data) {
                    container.append(data);
                    var objectsRendered = container.children('['+STATUS+'!=loaded]');
                    if (opts.onSuccess != null) {
                        opts.onSuccess(objectsRendered);
                    }
                    $.fn.remoteNonStopPageScroll.setSemaphore(container,true);
                }, failure:function (data) {
                    if (opts.onFailure != null) {
                        opts.onFailure();
                    }
                    $.fn.remoteNonStopPageScroll.setSemaphore(container,true);
                }, complete:function (data) {
                    if (opts.onComplete != null) {
                        opts.onComplete();
                    }
                },
                dataType:'html'
            });
        }

    };

    $.fn.remoteNonStopPageScroll.init = function (container, opts) {
        opts = $.extend(opts, container.data(UPDATED_OPTIONS) || {});
        var target = opts.scrollTarget;
        container.data(SCROLLING, 'enabled').data(LOAD_SEMAPHORE, true);

        $(target).scroll(function (event) {
            if (container.data(SCROLLING) == 'enabled') {
                $.fn.remoteNonStopPageScroll.loadContent(container, opts);
            }
            else {
                event.stopPropagation();
            }
        });

        $.fn.remoteNonStopPageScroll.loadContent(container, opts);
    };

    $.fn.remoteNonStopPageScroll.setSemaphore = function(container, value){
        container.data(LOAD_SEMAPHORE,value);
    }

    $.fn.remoteNonStopPageScroll.defaults = {
        'url':null,
        'onLoading':null,
        'onSuccess':null,
        'onFailure':null,
        'onComplete':null,
        'scrollTarget':null,
        'heightOffset':0
    };
})(jQuery);