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
            //˵������ʼ�����
            //ʵ�֣���ʼ��dom�ṹ�����֣���ҳ�����¼�
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
            //��ȡ����ҳ�������
            pagesCount1: function () {
                return this.section.length;
            },
            //��ȡ�����Ŀ�ȣ�������������߶ȣ�����������
            switchLength: function () {
                return this.direction == 1 ? this.element.height() : this.element.width();
            },
            //��ǰ��������һҳ��
            prev: function () {
                var me = this;
                if (me.index > 0) {
                    me.index--;
                } else if (me.settings.loop) {
                    me.index = me.pagesCount - 1;
                }
                me._scrollPage();
            },
            //��󻬶�����һҳ��
            next: function () {
                var me = this;
                if (me.index < me.pagesCount) {
                    me.index++;
                } else if (me.settings.loop) {
                    me.index = 0;
                }
                me._scrollPage();

            },

            //�»��ߴ���˽�з�����û��������з���
            //��Ҫ��Ժ����������ҳ�沼��
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
            //ʵ�ַ�ҳ��dom�ṹ��css��ʽ
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
            //��ʼ������¼�
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
            //��������
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
        index: 0,  //ҳ�濪ʼ������
        easing: "ease",  //����Ч��
        duration: 500, //����ִ��ʱ��
        loop: false,  //�Ƿ�ѭ���л�
        pagination: true,  //�Ƿ���з�ҳ
        keyboard: true,  //�Ƿ񴥷������¼�
        direction: "horizontal",//��������horizontal��vertical
        callback: ""  //�ص�����
    };
    $(function () {
        $("[data-PageSwitch]").PageSwitch();
    });


})(jQuery);



















