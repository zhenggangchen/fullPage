/**
 * Created by czg on 2017/4/28.
 */
(function ($) {
    "use strict";
    var PageSwitch = (function () {
        function PageSwitch(element, options) {
            this.settings = $.extend(true, $.fn.PageSwitch.default, options || {});
            this.element = element;
            this.init();
        }

        PageSwitch.prototype = {
            //说明：初始化插件
            //实现：初始化dom结构，布局，分页及绑定事件
            init: function () {
                var me = this;
                me.selectors = me.settings.selectors;
                me.sections = me.element.find(me.selectors.sections);
                me.section = me.sections.find(me.selectors.section);

                me.direction = me.settings.direction == "vertical" ? true : false;
                me.pagesCount = me.pagesCount1();
                me.index = (me.settings.index >= 0 && me.settings.index < me.pagesCount) ? me.settings.index : 0;
                me.canscroll = true;
                if (!me.direction || me.index) {
                    me._initLayout();
                }
                if (me.settings.pagination) {
                    me._initPaging();
                }
                me._initEvent();
            },
            //获取滑动页面的数量
            pagesCount1: function () {
                return this.section.length;
            },
            //获取滑动的宽度（横屏滑动）或高度（竖屏滑动）
            switchLength: function () {
                return this.direction == 1 ? this.element.height() : this.element.width();
            },
            //向前滑动即上一页面
            prev: function () {
                var me = this;
                if (me.index > 0) {
                    me.index--;
                } else if (me.settings.loop) {
                    me.index = me.pagesCount - 1;
                }
                me._scrollPage();
            },
            //向后滑动即下一页面
            next: function () {
                var me = this;
                if (me.index < me.pagesCount) {
                    me.index++;
                } else if (me.settings.loop) {
                    me.index = 0;
                }
                me._scrollPage();

            },

            //下划线代表私有方法，没有则代表共有方法
            //主要针对横屏情况进行页面布局
            _initLayout: function () {
                var me = this;
                if (!me.direction) {
                    var width = (me.pagesCount * 100) + "%",
                        cellWidth = (100 / me.pagesCount).toFixed(2) + "%";
                    me.sections.width(width);
                    me.section.width(cellWidth).css("float", "left");
                }
                if (me.index) {
                    me._scrollPage(true);
                }
            },
            //实现分页的dom结构及css样式
            _initPaging: function () {
                var me = this,
                    pagesClass = me.selectors.page.substring(1);
                me.activeClass = me.selectors.active.substring(1);
                var pageHtml = "<ul class=" + pagesClass + ">";
                for (var i = 0; i < me.pagesCount; i++) {
                    pageHtml += "<li></li>";
                }
                //pageHtml += "</ul>";
                me.element.append(pageHtml);
                var pages = me.element.find(me.selectors.page);
                me.pageItem = pages.find("li");
                me.pageItem.eq(me.index).addClass(me.activeClass);
                if (me.direction) {
                    pages.addClass("vertical");
                } else {
                    pages.addClass("horizontal");
                }

                //me._initEvent();

            },
            //初始化插件事件
            _initEvent: function () {
                var me = this;

                me.element.on("mousewheel DOMMouseScroll", function (e) {
                    e.preventDefault();
                    var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                    if (me.canscroll) {
                        if (delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
                            me.prev();
                        } else if (delta < 0 && (me.index < (me.pagesCount - 1) && !me.settings.loop || me.settings.loop)) {
                            me.next();
                        }
                    }
                });

                me.element.on("click", me.selectors.page + " li", function () {
                    me.index = $(this).index();
                    me._scrollPage();
                });
                if (me.settings.keyboard) {
                    $(window).keydown(function (e) {
                        var keyCode = e.keyCode;
                        if (keyCode == 37 || keyCode == 38) {
                            me.prev();
                        } else if (keyCode == 39 || keyCode == 40) {
                            me.next();
                        }
                    });
                }
                $(window).resize(function () {
                    var currentLength = me.switchLength();
                    var offset = me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;
                    if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
                        me.index++;
                    }
                    if (me.index) {
                        me._scrollPage();
                    }
                });

                me.sections.on("transitionend webkitTransitionEnd", function () {
                    me.canscroll = true;
                    if (me.settings.callback && $.type(me.settings.callback) === "function") {
                        me.settings.callback();
                    }
                })
            },
            //滑动动画
            _scrollPage: function (init) {
                var me = this;
                var dest = me.section.eq(me.index).position();
                if (!dest)return;


                me.canscroll = false;


                var translate = me.direction ? "translateY(-" + dest.top + "px)" : "translateX(-" + dest.left + "px)";
                me.sections.css("transition", "all " + me.settings.duration + "ms " + me.settings.easing);
                me.sections.css("transform", translate);


                if (me.settings.pagination && !init) {
                    me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
                }
            }
        };
        return PageSwitch;
    })();
    $.fn.PageSwitch = function (options) {
        return this.each(function () {
            var me = $(this), instance = me.data("PageSwitch");
            if (!instance) {
                instance = new PageSwitch(me, options);
                me.data("PageSwitch", instance);
            }

            if ($.type(options) === "string")return instance[options]();
            //$("div").PageSwitch("init");

        });

    };
    $.fn.PageSwitch.default = {
        selectors: {
            sections: ".sections",
            section: ".section",
            page: ".pages",
            active: ".active"
        },
        index: 0,  //页面开始的索引
        easing: "ease",  //动画效果
        duration: 500, //动画执行时间
        loop: false,  //是否循环切换
        pagination: true,  //是否进行分页
        keyboard: true,  //是否触发键盘事件
        direction: "horizontal",//滑动方向horizontal，vertical
        callback: ""  //回调函数
    };
    $(function () {
        $("[data-PageSwitch]").PageSwitch();
    });


})(jQuery);



















