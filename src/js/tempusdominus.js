import jQuery from 'jquery';
import moment from 'moment';

// ReSharper disable once InconsistentNaming
const DateTimePicker = (($, moment) => {
    function escapeRegExp(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    function isValidDate(date) {
        return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
    }

    function isValidDateTimeStr(str) {
        return isValidDate(new Date(str));
    }

    // ReSharper disable InconsistentNaming
    const trim = str => str.replace(/(^\s+)|(\s+$)/g, ''),
        NAME = 'datetimepicker',
        DATA_KEY = `${NAME}`,
        EVENT_KEY = `.${DATA_KEY}`,
        DATA_API_KEY = '.data-api',
        Selector = {
            DATA_TOGGLE: `[data-toggle="${DATA_KEY}"]`
        },
        ClassName = {
            INPUT: `${NAME}-input`
        },
        Event = {
            CHANGE: `change${EVENT_KEY}`,
            BLUR: `blur${EVENT_KEY}`,
            KEYUP: `keyup${EVENT_KEY}`,
            KEYDOWN: `keydown${EVENT_KEY}`,
            FOCUS: `focus${EVENT_KEY}`,
            CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
            //emitted
            UPDATE: `update${EVENT_KEY}`,
            ERROR: `error${EVENT_KEY}`,
            HIDE: `hide${EVENT_KEY}`,
            SHOW: `show${EVENT_KEY}`
        },
        DatePickerModes = [{
            CLASS_NAME: 'days',
            NAV_FUNCTION: 'M',
            NAV_STEP: 1
        }, {
            CLASS_NAME: 'months',
            NAV_FUNCTION: 'y',
            NAV_STEP: 1
        }, {
            CLASS_NAME: 'years',
            NAV_FUNCTION: 'y',
            NAV_STEP: 10
        }, {
            CLASS_NAME: 'decades',
            NAV_FUNCTION: 'y',
            NAV_STEP: 100
        }],
        KeyMap = {
            'up': 38,
            38: 'up',
            'down': 40,
            40: 'down',
            'left': 37,
            37: 'left',
            'right': 39,
            39: 'right',
            'tab': 9,
            9: 'tab',
            'escape': 27,
            27: 'escape',
            'enter': 13,
            13: 'enter',
            'pageUp': 33,
            33: 'pageUp',
            'pageDown': 34,
            34: 'pageDown',
            'shift': 16,
            16: 'shift',
            'control': 17,
            17: 'control',
            'space': 32,
            32: 'space',
            't': 84,
            84: 't',
            'delete': 46,
            46: 'delete'
        },
        ViewModes = ['times', 'days', 'months', 'years', 'decades'],
        keyState = {},
        keyPressHandled = {},
        optionsSortMap = {
            timeZone: -39,
            format: -38,
            dayViewHeaderFormat: -37,
            extraFormats: -36,
            stepping: -35,
            minDate: -34,
            maxDate: -33,
            useCurrent: -32,
            collapse: -31,
            locale: -30,
            defaultDate: -29,
            disabledDates: -28,
            enabledDates: -27,
            icons: -26,
            tooltips: -25,
            useStrict: -24,
            sideBySide: -23,
            daysOfWeekDisabled: -22,
            calendarWeeks: -21,
            viewMode: -20,
            toolbarPlacement: -19,
            buttons: -18,
            widgetPositioning: -17,
            widgetParent: -16,
            ignoreReadonly: -15,
            keepOpen: -14,
            focusOnShow: -13,
            inline: -12,
            keepInvalid: -11,
            keyBinds: -10,
            debug: -9,
            allowInputToggle: -8,
            disabledTimeIntervals: -7,
            disabledHours: -6,
            enabledHours: -5,
            viewDate: -4,
            allowMultidate: -3,
            multidateSeparator: -2,
            updateOnlyThroughDateOption: -1,
            date: 1
        },
        defaultFeatherIcons = {
            time: 'clock',
            date: 'calendar',
            up: 'arrow-up',
            down: 'arrow-down',
            previous: 'arrow-left',
            next: 'arrow-right',
            today: 'arrow-down-circle',
            clear: 'trash-2',
            close: 'x'
        };

    function optionsSortFn(optionKeyA, optionKeyB) {
        if (optionsSortMap[optionKeyA] && optionsSortMap[optionKeyB]) {
            if (optionsSortMap[optionKeyA] < 0 && optionsSortMap[optionKeyB] < 0) {
                return Math.abs(optionsSortMap[optionKeyB]) - Math.abs(optionsSortMap[optionKeyA]);
            }
            else if (optionsSortMap[optionKeyA] < 0) {
                return -1;
            }
            else if (optionsSortMap[optionKeyB] < 0) {
                return 1;
            }
            return optionsSortMap[optionKeyA] - optionsSortMap[optionKeyB];
        }
        else if (optionsSortMap[optionKeyA]) {
            return optionsSortMap[optionKeyA];
        }
        else if (optionsSortMap[optionKeyB]) {
            return optionsSortMap[optionKeyB];
        }
        return 0;
    }

    let Default = {
        timeZone: '',
        format: false,
        dayViewHeaderFormat: 'MMMM YYYY',
        extraFormats: false,
        stepping: 1,
        minDate: false,
        maxDate: false,
        useCurrent: true,
        collapse: true,
        locale: moment.locale(),
        defaultDate: false,
        disabledDates: false,
        enabledDates: false,
        icons: {
            type: 'class',
            time: 'fa fa-clock-o',
            date: 'fa fa-calendar',
            up: 'fa fa-arrow-up',
            down: 'fa fa-arrow-down',
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-calendar-check-o',
            clear: 'fa fa-trash',
            close: 'fa fa-times'
        },
        tooltips: {
            today: 'Go to today',
            clear: 'Clear selection',
            close: 'Close the picker',
            selectMonth: 'Select Month',
            prevMonth: 'Previous Month',
            nextMonth: 'Next Month',
            selectYear: 'Select Year',
            prevYear: 'Previous Year',
            nextYear: 'Next Year',
            selectDecade: 'Select Decade',
            prevDecade: 'Previous Decade',
            nextDecade: 'Next Decade',
            prevCentury: 'Previous Century',
            nextCentury: 'Next Century',
            pickHour: 'Pick Hour',
            incrementHour: 'Increment Hour',
            decrementHour: 'Decrement Hour',
            pickMinute: 'Pick Minute',
            incrementMinute: 'Increment Minute',
            decrementMinute: 'Decrement Minute',
            pickSecond: 'Pick Second',
            incrementSecond: 'Increment Second',
            decrementSecond: 'Decrement Second',
            togglePeriod: 'Toggle Period',
            selectTime: 'Select Time',
            selectDate: 'Select Date'
        },
        useStrict: false,
        sideBySide: false,
        daysOfWeekDisabled: false,
        calendarWeeks: false,
        viewMode: 'days',
        toolbarPlacement: 'default',
        buttons: {
            showToday: false,
            showClear: false,
            showClose: false
        },
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
        widgetParent: null,
        readonly: false,
        ignoreReadonly: false,
        keepOpen: false,
        focusOnShow: true,
        inline: false,
        keepInvalid: false,
        keyBinds: {
            up: function () {
                if (!this.widget) {
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(7, 'd'));
                } else {
                    this.date(d.clone().add(this.stepping(), 'm'));
                }
                return true;
            },
            down: function () {
                if (!this.widget) {
                    this.show();
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(7, 'd'));
                } else {
                    this.date(d.clone().subtract(this.stepping(), 'm'));
                }
                return true;
            },
            'control up': function () {
                if (!this.widget) {
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'y'));
                } else {
                    this.date(d.clone().add(1, 'h'));
                }
                return true;
            },
            'control down': function () {
                if (!this.widget) {
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'y'));
                } else {
                    this.date(d.clone().subtract(1, 'h'));
                }
                return true;
            },
            left: function () {
                if (!this.widget) {
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'd'));
                }
                return true;
            },
            right: function () {
                if (!this.widget) {
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'd'));
                }
                return true;
            },
            pageUp: function () {
                if (!this.widget) {
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'M'));
                }
                return true;
            },
            pageDown: function () {
                if (!this.widget) {
                    return false;
                }
                const d = this._dates[0] || this.getMoment();
                if (this.widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'M'));
                }
                return true;
            },
            enter: function () {
                if (!this.widget) {
                    return false;
                }
                this.hide();
                return true;
            },
            escape: function () {
                if (!this.widget) {
                    return false;
                }
                this.hide();
                return true;
            },
            'control space': function () {
                if (!this.widget) {
                    return false;
                }
                if (this.widget.find('.timepicker').is(':visible')) {
                    this.widget.find('.btn[data-action="togglePeriod"]').click();
                }
                return true;
            },
            t: function () {
                if (!this.widget) {
                    return false;
                }
                this.date(this.getMoment());
                return true;
            },
            'delete': function () {
                if (!this.widget) {
                    return false;
                }
                this.clear();
                return true;
            }
        },
        debug: false,
        allowInputToggle: false,
        disabledTimeIntervals: false,
        disabledHours: false,
        enabledHours: false,
        viewDate: false,
        allowMultidate: false,
        multidateSeparator: ', ',
        updateOnlyThroughDateOption: false,
        promptTimeOnDateChange: false,
        promptTimeOnDateChangeTransitionDelay: 200
    };

    // ReSharper restore InconsistentNaming

    // ReSharper disable once DeclarationHides
    // ReSharper disable once InconsistentNaming
    class DateTimePicker {
        /** @namespace eData.dateOptions */
        /** @namespace moment.tz */

        constructor(element, options) {
            this._options = this._getOptions(options);
            this._element = element;
            this._dates = [];
            this._datesFormatted = [];
            this._viewDate = null;
            this.unset = true;
            this.component = false;
            this.widget = false;
            this.use24Hours = null;
            this.actualFormat = null;
            this.parseFormats = null;
            this.currentViewMode = null;
            this.MinViewModeNumber = 0;
            this.isInitFormatting = false;
            this.isInit = false;
            this.isDateUpdateThroughDateOptionFromClientCode = false;
            this.hasInitDate = false;
            this.initDate = void 0;
            this._notifyChangeEventContext = void 0;
            this._currentPromptTimeTimeout = null;

            this._int();
        }

        /**
         * @return {string}
         */
        static get NAME() {
            return NAME;
        }

        /**
         * @return {string}
         */
        static get DATA_KEY() {
            return DATA_KEY;
        }

        /**
         * @return {string}
         */
        static get EVENT_KEY() {
            return EVENT_KEY;
        }

        /**
         * @return {string}
         */
        static get DATA_API_KEY() {
            return DATA_API_KEY;
        }

        static get DatePickerModes() {
            return DatePickerModes;
        }

        static get ViewModes() {
            return ViewModes;
        }

        static get Event() {
            return Event;
        }

        static get Selector() {
            return Selector;
        }

        static get Default() {
            return Default;
        }

        static set Default(value) {
            Default = value;
        }

        static get ClassName() {
            return ClassName;
        }

        //private

        _int() {
            this.isInit = true;
            const targetInput = this._element.data('target-input');
            if (this._element.is('input')) {
                this.input = this._element;
            } else if (targetInput !== undefined) {
                if (targetInput === 'nearest') {
                    this.input = this._element.find('input');
                } else {
                    this.input = $(targetInput);
                }
            }

            this._dates = [];
            this._dates[0] = this.getMoment();
            this._viewDate = this.getMoment().clone();

            $.extend(true, this._options, this._dataToOptions());

            this.hasInitDate = false;
            this.initDate = void 0;
            this.options(this._options);

            this.isInitFormatting = true;
            this._initFormatting();
            this.isInitFormatting = false;

            if (this.input !== undefined && this.input.is('input') && this.input.val().trim().length !== 0) {
                this._setValue(this._parseInputDate(this.input.val().trim()), 0);
            } else if (this._options.defaultDate && this.input !== undefined && this.input.attr('placeholder') === undefined) {
                this._setValue(this._options.defaultDate, 0);
            }
            if (this.hasInitDate) {
                this.date(this.initDate);
            }

            if (this._options.inline) {
                this.show();
            }
            this.isInit = false;
        }

        _update() {
            if (!this.widget) {
                return;
            }
            this._fillDate();
            this._fillTime();
        }

        _setValue(targetMoment, index) {
            const noIndex = (typeof index === 'undefined'),
                isClear = !targetMoment && noIndex,
                isDateUpdateThroughDateOptionFromClientCode = this.isDateUpdateThroughDateOptionFromClientCode,
                isNotAllowedProgrammaticUpdate = !this.isInit && this._options.updateOnlyThroughDateOption && !isDateUpdateThroughDateOptionFromClientCode;
            let outpValue = '', isInvalid = false, oldDate = this.unset ? null : this._dates[index];
            if (!oldDate && !this.unset && noIndex && isClear) {
                oldDate = this._dates[this._dates.length - 1];
            }

            // case of calling setValue(null or false)
            if (!targetMoment) {
                if (isNotAllowedProgrammaticUpdate) {
                    this._notifyEvent({
                        type: DateTimePicker.Event.CHANGE,
                        date: targetMoment,
                        oldDate: oldDate,
                        isClear,
                        isInvalid,
                        isDateUpdateThroughDateOptionFromClientCode,
                        isInit: this.isInit
                    });
                    return;
                }
                if (!this._options.allowMultidate || this._dates.length === 1 || isClear) {
                    this.unset = true;
                    this._dates = [];
                    this._datesFormatted = [];
                } else {
                    outpValue = `${this._element.data('date')}${this._options.multidateSeparator}`;
                    outpValue = (oldDate && outpValue.replace(
                        `${oldDate.format(this.actualFormat)}${this._options.multidateSeparator}`, ''
                    )
                    .replace(`${this._options.multidateSeparator}${this._options.multidateSeparator}`, '')
                    .replace(new RegExp(`${escapeRegExp(this._options.multidateSeparator)}\\s*$`), '')) || '';
                    this._dates.splice(index, 1);
                    this._datesFormatted.splice(index, 1);
                }
                outpValue = trim(outpValue);
                if (this.input !== undefined) {
                    this.input.val(outpValue);
                    this.input.trigger('input');
                }
                this._element.data('date', outpValue);
                this._notifyEvent({
                    type: DateTimePicker.Event.CHANGE,
                    date: false,
                    oldDate: oldDate,
                    isClear,
                    isInvalid,
                    isDateUpdateThroughDateOptionFromClientCode,
                    isInit: this.isInit
                });
                this._update();
                return;
            }

            targetMoment = targetMoment.clone().locale(this._options.locale);

            if (this._hasTimeZone()) {
                targetMoment.tz(this._options.timeZone);
            }

            if (this._options.stepping !== 1) {
                targetMoment.minutes(Math.round(targetMoment.minutes() / this._options.stepping) * this._options.stepping).seconds(0);
            }

            if (this._isValid(targetMoment)) {
                if (isNotAllowedProgrammaticUpdate) {
                    this._notifyEvent({
                        type: DateTimePicker.Event.CHANGE,
                        date: targetMoment.clone(),
                        oldDate: oldDate,
                        isClear,
                        isInvalid,
                        isDateUpdateThroughDateOptionFromClientCode,
                        isInit: this.isInit
                    });
                    return;
                }
                this._dates[index] = targetMoment;
                this._datesFormatted[index] = targetMoment.format('YYYY-MM-DD');
                this._viewDate = targetMoment.clone();
                if (this._options.allowMultidate && this._dates.length > 1) {
                    for (let i = 0; i < this._dates.length; i++) {
                        outpValue += `${this._dates[i].format(this.actualFormat)}${this._options.multidateSeparator}`;
                    }
                    outpValue = outpValue.replace(new RegExp(`${this._options.multidateSeparator}\\s*$`), '');
                } else {
                    outpValue = this._dates[index].format(this.actualFormat);
                }
                outpValue = trim(outpValue)
                if (this.input !== undefined) {
                    this.input.val(outpValue);
                    this.input.trigger('input');
                }
                this._element.data('date', outpValue);

                this.unset = false;
                this._update();
                this._notifyEvent({
                    type: DateTimePicker.Event.CHANGE,
                    date: this._dates[index].clone(),
                    oldDate: oldDate,
                    isClear,
                    isInvalid,
                    isDateUpdateThroughDateOptionFromClientCode,
                    isInit: this.isInit
                });
            } else {
                isInvalid = true;
                if (!this._options.keepInvalid) {
                    if (this.input !== undefined) {
                        this.input.val(`${this.unset ? '' : this._dates[index].format(this.actualFormat)}`);
                        this.input.trigger('input');
                    }
                } else {
                    this._notifyEvent({
                        type: DateTimePicker.Event.CHANGE,
                        date: targetMoment,
                        oldDate: oldDate,
                        isClear,
                        isInvalid,
                        isDateUpdateThroughDateOptionFromClientCode,
                        isInit: this.isInit
                    });
                }
                this._notifyEvent({
                    type: DateTimePicker.Event.ERROR,
                    date: targetMoment,
                    oldDate: oldDate
                });
            }
        }

        _change(e) {
            const val = $(e.target).val().trim(),
                parsedDate = val ? this._parseInputDate(val) : null;
            this._setValue(parsedDate, 0);
            e.stopImmediatePropagation();
            return false;
        }

        //noinspection JSMethodCanBeStatic
        _getOptions(options) {
            options = $.extend(true, {}, Default, (
                options && options.icons && options.icons.type === 'feather' ?
                {
                    icons: defaultFeatherIcons
                }
                :
                {}
            ), options);
            return options;
        }

        _hasTimeZone() {
            return moment.tz !== undefined && this._options.timeZone !== undefined && this._options.timeZone !== null && this._options.timeZone !== '';
        }

        _isEnabled(granularity) {
            if (typeof granularity !== 'string' || granularity.length > 1) {
                throw new TypeError('isEnabled expects a single character string parameter');
            }
            switch (granularity) {
                case 'y':
                    return this.actualFormat.indexOf('Y') !== -1;
                case 'M':
                    return this.actualFormat.indexOf('M') !== -1;
                case 'd':
                    return this.actualFormat.toLowerCase().indexOf('d') !== -1;
                case 'h':
                case 'H':
                    return this.actualFormat.toLowerCase().indexOf('h') !== -1;
                case 'm':
                    return this.actualFormat.indexOf('m') !== -1;
                case 's':
                    return this.actualFormat.indexOf('s') !== -1;
                case 'a':
                case 'A':
                    return this.actualFormat.toLowerCase().indexOf('a') !== -1;
                default:
                    return false;
            }
        }

        _hasTime() {
            return this._isEnabled('h') || this._isEnabled('m') || this._isEnabled('s');
        }

        _hasDate() {
            return this._isEnabled('y') || this._isEnabled('M') || this._isEnabled('d');
        }

        _dataToOptions() {
            const eData = this._element.data();
            let dataOptions = {};

            if (eData.dateOptions && eData.dateOptions instanceof Object) {
                dataOptions = $.extend(true, dataOptions, eData.dateOptions);
            }

            $.each(this._options, function (key) {
                const attributeName = `date${key.charAt(0).toUpperCase()}${key.slice(1)}`; //todo data api key
                if (eData[attributeName] !== undefined) {
                    dataOptions[key] = eData[attributeName];
                } else {
                    delete dataOptions[key];
                }
            });
            return dataOptions;
        }

        _format() {
            return this._options.format || 'YYYY-MM-DD HH:mm';
        }

        _areSameDates(a, b) {
            const format = this._format();
            return a && b && (a.isSame(b) || moment(a.format(format), format).isSame(moment(b.format(format), format)));
        }

        _notifyEvent(e) {
            if (e.type === DateTimePicker.Event.CHANGE) {
                this._notifyChangeEventContext = this._notifyChangeEventContext || 0;
                this._notifyChangeEventContext++;
                if (
                    (e.date && this._areSameDates(e.date, e.oldDate))
                    ||
                    (!e.isClear && !e.date && !e.oldDate)
                    ||
                    (this._notifyChangeEventContext > 1)
                ) {
                    this._notifyChangeEventContext = void 0;
                    return;
                }
                this._handlePromptTimeIfNeeded(e);
            }
            this._element.trigger(e);
            this._notifyChangeEventContext = void 0;
        }

        _handlePromptTimeIfNeeded(e) {
            if (this._options.promptTimeOnDateChange) {
                if (!e.oldDate && this._options.useCurrent) {
                    // First time ever. If useCurrent option is set to true (default), do nothing
                    // because the first date is selected automatically.
                    return;
                }
                else if (
                    e.oldDate &&
                    e.date &&
                    (
                        (e.oldDate.format('YYYY-MM-DD') === e.date.format('YYYY-MM-DD'))
                        ||
                        (
                            e.oldDate.format('YYYY-MM-DD') !== e.date.format('YYYY-MM-DD')
                            &&
                            e.oldDate.format('HH:mm:ss') !== e.date.format('HH:mm:ss')
                        )
                    )
                ) {
                    // Date didn't change (time did) or date changed because time did.
                    return;
                }

                const that = this;
                clearTimeout(this._currentPromptTimeTimeout);
                this._currentPromptTimeTimeout = setTimeout(function() {
                    if (that.widget) {
                        that.widget.find('[data-action="togglePicker"]').click();
                    }
                }, this._options.promptTimeOnDateChangeTransitionDelay);
            }
        }

        _viewUpdate(e) {
            if (e === 'y') {
                e = 'YYYY';
            }
            this._notifyEvent({
                type: DateTimePicker.Event.UPDATE,
                change: e,
                viewDate: this._viewDate.clone()
            });
        }

        _showMode(dir) {
            if (!this.widget) {
                return;
            }
            if (dir) {
                this.currentViewMode = Math.max(this.MinViewModeNumber, Math.min(3, this.currentViewMode + dir));
            }
            this.widget.find('.datepicker > div').hide().filter(`.datepicker-${DatePickerModes[this.currentViewMode].CLASS_NAME}`).show();
        }

        _isInDisabledDates(testDate) {
            return this._options.disabledDates[testDate.format('YYYY-MM-DD')] === true;
        }

        _isInEnabledDates(testDate) {
            return this._options.enabledDates[testDate.format('YYYY-MM-DD')] === true;
        }

        _isInDisabledHours(testDate) {
            return this._options.disabledHours[testDate.format('H')] === true;
        }

        _isInEnabledHours(testDate) {
            return this._options.enabledHours[testDate.format('H')] === true;
        }

        _isValid(targetMoment, granularity) {
            if (!targetMoment || !targetMoment.isValid()) {
                return false;
            }
            if (this._options.disabledDates && granularity === 'd' && this._isInDisabledDates(targetMoment)) {
                return false;
            }
            if (this._options.enabledDates && granularity === 'd' && !this._isInEnabledDates(targetMoment)) {
                return false;
            }
            if (this._options.minDate && targetMoment.isBefore(this._options.minDate, granularity)) {
                return false;
            }
            if (this._options.maxDate && targetMoment.isAfter(this._options.maxDate, granularity)) {
                return false;
            }
            if (this._options.daysOfWeekDisabled && granularity === 'd' && this._options.daysOfWeekDisabled.indexOf(targetMoment.day()) !== -1) {
                return false;
            }
            if (this._options.disabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && this._isInDisabledHours(targetMoment)) {
                return false;
            }
            if (this._options.enabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && !this._isInEnabledHours(targetMoment)) {
                return false;
            }
            if (this._options.disabledTimeIntervals && (granularity === 'h' || granularity === 'm' || granularity === 's')) {
                let found = false;
                $.each(this._options.disabledTimeIntervals, function () {
                    if (targetMoment.isBetween(this[0], this[1])) {
                        found = true;
                        return false;
                    }
                });
                if (found) {
                    return false;
                }
            }
            return true;
        }

        _parseInputDate(inputDate, { isPickerShow = false } = {}) {
            if (this._options.parseInputDate === undefined || isPickerShow) {
                if (!moment.isMoment(inputDate)) {
                    inputDate = this.getMoment(inputDate);
                }
            } else {
                inputDate = this._options.parseInputDate(inputDate);
            }
            //inputDate.locale(this.options.locale);
            return inputDate;
        }

        _keydown(e) {
            let handler = null,
                index,
                index2,
                keyBindKeys,
                allModifiersPressed;
            const pressedKeys = [],
                pressedModifiers = {},
                currentKey = e.which,
                pressed = 'p';

            keyState[currentKey] = pressed;

            for (index in keyState) {
                if (keyState.hasOwnProperty(index) && keyState[index] === pressed) {
                    pressedKeys.push(index);
                    if (parseInt(index, 10) !== currentKey) {
                        pressedModifiers[index] = true;
                    }
                }
            }

            for (index in this._options.keyBinds) {
                if (this._options.keyBinds.hasOwnProperty(index) && typeof this._options.keyBinds[index] === 'function') {
                    keyBindKeys = index.split(' ');
                    if (keyBindKeys.length === pressedKeys.length && KeyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
                        allModifiersPressed = true;
                        for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
                            if (!(KeyMap[keyBindKeys[index2]] in pressedModifiers)) {
                                allModifiersPressed = false;
                                break;
                            }
                        }
                        if (allModifiersPressed) {
                            handler = this._options.keyBinds[index];
                            break;
                        }
                    }
                }
            }

            if (handler) {
                if (handler.call(this)) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }

        //noinspection JSMethodCanBeStatic,SpellCheckingInspection
        _keyup(e) {
            keyState[e.which] = 'r';
            if (keyPressHandled[e.which]) {
                keyPressHandled[e.which] = false;
                e.stopPropagation();
                e.preventDefault();
            }
        }

        _indexGivenDates(givenDatesArray) {
            // Store given enabledDates and disabledDates as keys.
            // This way we can check their existence in O(1) time instead of looping through whole array.
            // (for example: options.enabledDates['2014-02-27'] === true)
            const givenDatesIndexed = {},
                self = this;
            $.each(givenDatesArray, function () {
                const dDate = self._parseInputDate(this);
                if (dDate.isValid()) {
                    givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                }
            });
            return Object.keys(givenDatesIndexed).length ? givenDatesIndexed : false;
        }

        _indexGivenHours(givenHoursArray) {
            // Store given enabledHours and disabledHours as keys.
            // This way we can check their existence in O(1) time instead of looping through whole array.
            // (for example: options.enabledHours['2014-02-27'] === true)
            const givenHoursIndexed = {};
            $.each(givenHoursArray, function () {
                givenHoursIndexed[this] = true;
            });
            return Object.keys(givenHoursIndexed).length ? givenHoursIndexed : false;
        }

        _initFormatting() {
            const format = this._options.format || 'L LT', self = this;

            this.actualFormat = format.replace(/(\[[^\[]*])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput) {
                return ((self.isInitFormatting && self._options.date === null ? self.getMoment() : self._dates[0]).localeData().longDateFormat(formatInput)) || formatInput; //todo taking the first date should be ok
            });

            this.parseFormats = this._options.extraFormats ? this._options.extraFormats.slice() : [];
            if (this.parseFormats.indexOf(format) < 0 && this.parseFormats.indexOf(this.actualFormat) < 0) {
                this.parseFormats.push(this.actualFormat);
            }

            this.use24Hours = this.actualFormat.toLowerCase().indexOf('a') < 1 && this.actualFormat.replace(/\[.*?]/g, '').indexOf('h') < 1;

            if (this._isEnabled('y')) {
                this.MinViewModeNumber = 2;
            }
            if (this._isEnabled('M')) {
                this.MinViewModeNumber = 1;
            }
            if (this._isEnabled('d')) {
                this.MinViewModeNumber = 0;
            }

            this.currentViewMode = Math.max(this.MinViewModeNumber, this.currentViewMode);

            if (!this.unset) {
                this._setValue(this._dates[0], 0);
            }
        }

        _getLastPickedDate() {
            let lastPickedDate = this._dates[this._getLastPickedDateIndex()];
            if (!lastPickedDate && this._options.allowMultidate) {
                lastPickedDate = moment(new Date());
            }
            return lastPickedDate;
        }

        _getLastPickedDateIndex() {
            return this._dates.length - 1;
        }

        //public
        getMoment(d) {
            let returnMoment;

            if (d === undefined || d === null) {
                // TODO: Should this use format?
                returnMoment = moment().clone().locale(this._options.locale);
            } else if (this._hasTimeZone()) {
                // There is a string to parse and a default time zone
                // parse with the tz function which takes a default time zone if it is not in the format string
                returnMoment = moment.tz(d, this.parseFormats, this._options.locale, this._options.useStrict, this._options.timeZone);
            } else {
                returnMoment = moment(d, this.parseFormats, this._options.locale, this._options.useStrict);
            }

            if (this._hasTimeZone()) {
                returnMoment.tz(this._options.timeZone);
            }

            return returnMoment;
        }

        toggle() {
            return this.widget ? this.hide() : this.show();
        }

        readonly(readonly) {
            if (arguments.length === 0) {
                return this._options.readonly;
            }
            if (typeof readonly !== 'boolean') {
                throw new TypeError('readonly() expects a boolean parameter');
            }
            this._options.readonly = readonly;
            if (this.input !== undefined) {
                this.input.prop('readonly', this._options.readonly);
            }
            if (this.widget) {
                this.hide();
                this.show();
            }
        }


        ignoreReadonly(ignoreReadonly) {
            if (arguments.length === 0) {
                return this._options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== 'boolean') {
                throw new TypeError('ignoreReadonly() expects a boolean parameter');
            }
            this._options.ignoreReadonly = ignoreReadonly;
        }

        options(newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, this._options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() this.options parameter should be an object');
            }
            $.extend(true, this._options, newOptions);
            const self = this,
                optionsKeys = Object.keys(this._options).sort(optionsSortFn);
            $.each(optionsKeys, function (i, key) {
                const value = self._options[key];
                if (self[key] !== undefined) {
                    if (self.isInit && key === 'date') {
                        self.hasInitDate = true;
                        self.initDate = value;
                        return;
                    }
                    self[key](value);
                }
            });
        }

        date(newDate, index) {
            index = index || 0;
            if (arguments.length === 0) {
                if (this.unset) {
                    return null;
                }
                if (this._options.allowMultidate) {
                    return this._dates.join(this._options.multidateSeparator);
                }
                else {
                    return this._dates[index].clone();
                }
            }

            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }

            if (typeof newDate === 'string' && isValidDateTimeStr(newDate)) {
                newDate = new Date(newDate);
            }

            this._setValue(newDate === null ? null : this._parseInputDate(newDate), index);
        }

        updateOnlyThroughDateOption(updateOnlyThroughDateOption) {
            if (typeof updateOnlyThroughDateOption !== 'boolean') {
                throw new TypeError('updateOnlyThroughDateOption() expects a boolean parameter');
            }

            this._options.updateOnlyThroughDateOption = updateOnlyThroughDateOption;
        }

        format(newFormat) {
            if (arguments.length === 0) {
                return this._options.format;
            }

            if (typeof newFormat !== 'string' && (typeof newFormat !== 'boolean' || newFormat !== false)) {
                throw new TypeError(`format() expects a string or boolean:false parameter ${newFormat}`);
            }

            this._options.format = newFormat;
            if (this.actualFormat) {
                this._initFormatting(); // reinitialize formatting
            }
        }

        timeZone(newZone) {
            if (arguments.length === 0) {
                return this._options.timeZone;
            }

            if (typeof newZone !== 'string') {
                throw new TypeError('newZone() expects a string parameter');
            }

            this._options.timeZone = newZone;
        }

        dayViewHeaderFormat(newFormat) {
            if (arguments.length === 0) {
                return this._options.dayViewHeaderFormat;
            }

            if (typeof newFormat !== 'string') {
                throw new TypeError('dayViewHeaderFormat() expects a string parameter');
            }

            this._options.dayViewHeaderFormat = newFormat;
        }

        extraFormats(formats) {
            if (arguments.length === 0) {
                return this._options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }

            this._options.extraFormats = formats;
            if (this.parseFormats) {
                this._initFormatting(); // reinit formatting
            }
        }

        disabledDates(dates) {
            if (arguments.length === 0) {
                return this._options.disabledDates ? $.extend({}, this._options.disabledDates) : this._options.disabledDates;
            }

            if (!dates) {
                this._options.disabledDates = false;
                this._update();
                return true;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('disabledDates() expects an array parameter');
            }
            this._options.disabledDates = this._indexGivenDates(dates);
            this._options.enabledDates = false;
            this._update();
        }

        enabledDates(dates) {
            if (arguments.length === 0) {
                return this._options.enabledDates ? $.extend({}, this._options.enabledDates) : this._options.enabledDates;
            }

            if (!dates) {
                this._options.enabledDates = false;
                this._update();
                return true;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('enabledDates() expects an array parameter');
            }
            this._options.enabledDates = this._indexGivenDates(dates);
            this._options.disabledDates = false;
            this._update();
        }

        daysOfWeekDisabled(daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return this._options.daysOfWeekDisabled.splice(0);
            }

            if (typeof daysOfWeekDisabled === 'boolean' && !daysOfWeekDisabled) {
                this._options.daysOfWeekDisabled = false;
                this._update();
                return true;
            }

            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError('daysOfWeekDisabled() expects an array parameter');
            }
            this._options.daysOfWeekDisabled = daysOfWeekDisabled.reduce(function (previousValue, currentValue) {
                currentValue = parseInt(currentValue, 10);
                if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
                    return previousValue;
                }
                if (previousValue.indexOf(currentValue) === -1) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []).sort();
            if (this._options.useCurrent && !this._options.keepInvalid) {
                for (let i = 0; i < this._dates.length; i++) {
                    let tries = 0;
                    while (!this._isValid(this._dates[i], 'd')) {
                        this._dates[i].add(1, 'd');
                        if (tries === 31) {
                            throw 'Tried 31 times to find a valid date';
                        }
                        tries++;
                    }
                    this._setValue(this._dates[i], i);
                }
            }
            this._update();
        }

        maxDate(maxDate) {
            if (arguments.length === 0) {
                return this._options.maxDate ? this._options.maxDate.clone() : this._options.maxDate;
            }

            if (typeof maxDate === 'boolean' && maxDate === false) {
                this._options.maxDate = false;
                this._update();
                return true;
            }

            if (typeof maxDate === 'string') {
                if (maxDate === 'now' || maxDate === 'moment') {
                    maxDate = this.getMoment();
                }
            }

            const parsedDate = this._parseInputDate(maxDate);

            if (!parsedDate.isValid()) {
                throw new TypeError(`maxDate() Could not parse date parameter: ${maxDate}`);
            }
            if (this._options.minDate && parsedDate.isBefore(this._options.minDate)) {
                throw new TypeError(`maxDate() date parameter is before this.options.minDate: ${parsedDate.format(this.actualFormat)}`);
            }
            this._options.maxDate = parsedDate;
            for (let i = 0; i < this._dates.length; i++) {
                if (this._options.useCurrent && !this._options.keepInvalid && this._dates[i].isAfter(maxDate)) {
                    this._setValue(this._options.maxDate, i);
                }
            }
            if (this._viewDate.isAfter(parsedDate)) {
                this._viewDate = parsedDate.clone().subtract(this._options.stepping, 'm');
            }
            this._update();
        }

        minDate(minDate) {
            if (arguments.length === 0) {
                return this._options.minDate ? this._options.minDate.clone() : this._options.minDate;
            }

            if (typeof minDate === 'boolean' && minDate === false) {
                this._options.minDate = false;
                this._update();
                return true;
            }

            if (typeof minDate === 'string') {
                if (minDate === 'now' || minDate === 'moment') {
                    minDate = this.getMoment();
                }
            }

            const parsedDate = this._parseInputDate(minDate);

            if (!parsedDate.isValid()) {
                throw new TypeError(`minDate() Could not parse date parameter: ${minDate}`);
            }
            if (this._options.maxDate && parsedDate.isAfter(this._options.maxDate)) {
                throw new TypeError(`minDate() date parameter is after this.options.maxDate: ${parsedDate.format(this.actualFormat)}`);
            }
            this._options.minDate = parsedDate;
            for (let i = 0; i < this._dates.length; i++) {
                if (this._options.useCurrent && !this._options.keepInvalid && this._dates[i].isBefore(minDate)) {
                    this._setValue(this._options.minDate, i);
                }
            }
            if (this._viewDate.isBefore(parsedDate)) {
                this._viewDate = parsedDate.clone().add(this._options.stepping, 'm');
            }
            this._update();
        }

        defaultDate(defaultDate) {
            if (arguments.length === 0) {
                return this._options.defaultDate ? this._options.defaultDate.clone() : this._options.defaultDate;
            }
            if (!defaultDate) {
                this._options.defaultDate = false;
                return true;
            }

            if (typeof defaultDate === 'string') {
                if (defaultDate === 'now' || defaultDate === 'moment') {
                    defaultDate = this.getMoment();
                } else {
                    defaultDate = this.getMoment(defaultDate);
                }
            }

            const parsedDate = this._parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError(`defaultDate() Could not parse date parameter: ${defaultDate}`);
            }
            if (!this._isValid(parsedDate)) {
                throw new TypeError('defaultDate() date passed is invalid according to component setup validations');
            }

            this._options.defaultDate = parsedDate;

            if (this._options.defaultDate && this._options.inline || this.input !== undefined && this.input.val().trim() === '') {
                this._setValue(this._options.defaultDate, 0);
            }
        }

        locale(locale) {
            if (arguments.length === 0) {
                return this._options.locale;
            }

            if (!moment.localeData(locale)) {
                throw new TypeError(`locale() locale ${locale} is not loaded from moment locales!`);
            }

            this._options.locale = locale;

            for (let i = 0; i < this._dates.length; i++) {
                this._dates[i].locale(this._options.locale);
            }
            this._viewDate.locale(this._options.locale);

            if (this.actualFormat) {
                this._initFormatting(); // reinitialize formatting
            }
            if (this.widget) {
                this.hide();
                this.show();
            }
        }

        stepping(stepping) {
            if (arguments.length === 0) {
                return this._options.stepping;
            }

            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 1;
            }
            this._options.stepping = stepping;
        }

        useCurrent(useCurrent) {
            const useCurrentOptions = ['year', 'month', 'day', 'hour', 'minute'];
            if (arguments.length === 0) {
                return this._options.useCurrent;
            }

            if (typeof useCurrent !== 'boolean' && typeof useCurrent !== 'string') {
                throw new TypeError('useCurrent() expects a boolean or string parameter');
            }
            if (typeof useCurrent === 'string' && useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1) {
                throw new TypeError(`useCurrent() expects a string parameter of ${useCurrentOptions.join(', ')}`);
            }
            this._options.useCurrent = useCurrent;
        }

        collapse(collapse) {
            if (arguments.length === 0) {
                return this._options.collapse;
            }

            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (this._options.collapse === collapse) {
                return true;
            }
            this._options.collapse = collapse;
            if (this.widget) {
                this.hide();
                this.show();
            }
        }

        icons(icons) {
            if (arguments.length === 0) {
                return $.extend({}, this._options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }

            $.extend(this._options.icons, icons);

            if (this.widget) {
                this.hide();
                this.show();
            }
        }

        tooltips(tooltips) {
            if (arguments.length === 0) {
                return $.extend({}, this._options.tooltips);
            }

            if (!(tooltips instanceof Object)) {
                throw new TypeError('tooltips() expects parameter to be an Object');
            }
            $.extend(this._options.tooltips, tooltips);
            if (this.widget) {
                this.hide();
                this.show();
            }
        }

        useStrict(useStrict) {
            if (arguments.length === 0) {
                return this._options.useStrict;
            }

            if (typeof useStrict !== 'boolean') {
                throw new TypeError('useStrict() expects a boolean parameter');
            }
            this._options.useStrict = useStrict;
        }

        sideBySide(sideBySide) {
            if (arguments.length === 0) {
                return this._options.sideBySide;
            }

            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            this._options.sideBySide = sideBySide;
            if (this.widget) {
                this.hide();
                this.show();
            }
        }

        viewMode(viewMode) {
            if (arguments.length === 0) {
                return this._options.viewMode;
            }

            if (typeof viewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }

            if (DateTimePicker.ViewModes.indexOf(viewMode) === -1) {
                throw new TypeError(`viewMode() parameter must be one of (${DateTimePicker.ViewModes.join(', ')}) value`);
            }

            this._options.viewMode = viewMode;
            this.currentViewMode = Math.max(DateTimePicker.ViewModes.indexOf(viewMode) - 1, this.MinViewModeNumber);

            this._showMode();
        }

        calendarWeeks(calendarWeeks) {
            if (arguments.length === 0) {
                return this._options.calendarWeeks;
            }

            if (typeof calendarWeeks !== 'boolean') {
                throw new TypeError('calendarWeeks() expects parameter to be a boolean value');
            }

            this._options.calendarWeeks = calendarWeeks;
            this._update();
        }

        buttons(buttons) {
            if (arguments.length === 0) {
                return $.extend({}, this._options.buttons);
            }

            if (!(buttons instanceof Object)) {
                throw new TypeError('buttons() expects parameter to be an Object');
            }

            $.extend(this._options.buttons, buttons);

            if (typeof this._options.buttons.showToday !== 'boolean') {
                throw new TypeError('buttons.showToday expects a boolean parameter');
            }
            if (typeof this._options.buttons.showClear !== 'boolean') {
                throw new TypeError('buttons.showClear expects a boolean parameter');
            }
            if (typeof this._options.buttons.showClose !== 'boolean') {
                throw new TypeError('buttons.showClose expects a boolean parameter');
            }

            if (this.widget) {
                this.hide();
                this.show();
            }
        }

        keepOpen(keepOpen) {
            if (arguments.length === 0) {
                return this._options.keepOpen;
            }

            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }

            this._options.keepOpen = keepOpen;
        }

        focusOnShow(focusOnShow) {
            if (arguments.length === 0) {
                return this._options.focusOnShow;
            }

            if (typeof focusOnShow !== 'boolean') {
                throw new TypeError('focusOnShow() expects a boolean parameter');
            }

            this._options.focusOnShow = focusOnShow;
        }

        inline(inline) {
            if (arguments.length === 0) {
                return this._options.inline;
            }

            if (typeof inline !== 'boolean') {
                throw new TypeError('inline() expects a boolean parameter');
            }

            this._options.inline = inline;
        }

        clear() {
            this._setValue(null); //todo
        }

        keyBinds(keyBinds) {
            if (arguments.length === 0) {
                return this._options.keyBinds;
            }

            this._options.keyBinds = keyBinds;
        }

        debug(debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }

            this._options.debug = debug;
        }

        allowInputToggle(allowInputToggle) {
            if (arguments.length === 0) {
                return this._options.allowInputToggle;
            }

            if (typeof allowInputToggle !== 'boolean') {
                throw new TypeError('allowInputToggle() expects a boolean parameter');
            }

            this._options.allowInputToggle = allowInputToggle;
        }

        keepInvalid(keepInvalid) {
            if (arguments.length === 0) {
                return this._options.keepInvalid;
            }

            if (typeof keepInvalid !== 'boolean') {
                throw new TypeError('keepInvalid() expects a boolean parameter');
            }
            this._options.keepInvalid = keepInvalid;
        }

        datepickerInput(datepickerInput) {
            if (arguments.length === 0) {
                return this._options.datepickerInput;
            }

            if (typeof datepickerInput !== 'string') {
                throw new TypeError('datepickerInput() expects a string parameter');
            }

            this._options.datepickerInput = datepickerInput;
        }

        parseInputDate(parseInputDate) {
            if (arguments.length === 0) {
                return this._options.parseInputDate;
            }

            if (typeof parseInputDate !== 'function') {
                throw new TypeError('parseInputDate() should be as function');
            }

            this._options.parseInputDate = parseInputDate;
        }

        disabledTimeIntervals(disabledTimeIntervals) {
            if (arguments.length === 0) {
                return this._options.disabledTimeIntervals ? $.extend({}, this._options.disabledTimeIntervals) : this._options.disabledTimeIntervals;
            }

            if (!disabledTimeIntervals) {
                this._options.disabledTimeIntervals = false;
                this._update();
                return true;
            }
            if (!(disabledTimeIntervals instanceof Array)) {
                throw new TypeError('disabledTimeIntervals() expects an array parameter');
            }
            this._options.disabledTimeIntervals = disabledTimeIntervals;
            this._update();
        }

        disabledHours(hours) {
            if (arguments.length === 0) {
                return this._options.disabledHours ? $.extend({}, this._options.disabledHours) : this._options.disabledHours;
            }

            if (!hours) {
                this._options.disabledHours = false;
                this._update();
                return true;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('disabledHours() expects an array parameter');
            }
            this._options.disabledHours = this._indexGivenHours(hours);
            this._options.enabledHours = false;
            if (this._options.useCurrent && !this._options.keepInvalid) {
                for (let i = 0; i < this._dates.length; i++) {
                    let tries = 0;
                    while (!this._isValid(this._dates[i], 'h')) {
                        this._dates[i].add(1, 'h');
                        if (tries === 24) {
                            throw 'Tried 24 times to find a valid date';
                        }
                        tries++;
                    }
                    this._setValue(this._dates[i], i);
                }
            }
            this._update();
        }

        enabledHours(hours) {
            if (arguments.length === 0) {
                return this._options.enabledHours ? $.extend({}, this._options.enabledHours) : this._options.enabledHours;
            }

            if (!hours) {
                this._options.enabledHours = false;
                this._update();
                return true;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('enabledHours() expects an array parameter');
            }
            this._options.enabledHours = this._indexGivenHours(hours);
            this._options.disabledHours = false;
            if (this._options.useCurrent && !this._options.keepInvalid) {
                for (let i = 0; i < this._dates.length; i++) {
                    let tries = 0;
                    while (!this._isValid(this._dates[i], 'h')) {
                        this._dates[i].add(1, 'h');
                        if (tries === 24) {
                            throw 'Tried 24 times to find a valid date';
                        }
                        tries++;
                    }
                    this._setValue(this._dates[i], i);
                }
            }
            this._update();
        }

        viewDate(newDate) {
            if (arguments.length === 0) {
                return this._viewDate.clone();
            }

            if (!newDate) {
                this._viewDate = (this._dates[0] || this.getMoment()).clone();
                return true;
            }

            if (typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('viewDate() parameter must be one of [string, moment or Date]');
            }

            this._viewDate = this._parseInputDate(newDate);
            this._update();
            this._viewUpdate(DatePickerModes[this.currentViewMode] && DatePickerModes[this.currentViewMode].NAV_FUNCTION);
        }

        _fillDate() {}

        _useFeatherIcons() {
            return this._options.icons.type === 'feather';
        }

        allowMultidate(allowMultidate) {
            if (typeof allowMultidate !== 'boolean') {
                throw new TypeError('allowMultidate() expects a boolean parameter');
            }

            this._options.allowMultidate = allowMultidate;
        }

        multidateSeparator(multidateSeparator) {
            if (arguments.length === 0) {
                return this._options.multidateSeparator;
            }

            if (typeof multidateSeparator !== 'string') {
                throw new TypeError('multidateSeparator expects a string parameter');
            }

            this._options.multidateSeparator = multidateSeparator;
        }
    }

    return DateTimePicker;
})(jQuery, moment);

export default DateTimePicker;
