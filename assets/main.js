'use strict';

//_______________________ констурктор для валидации формы

function Validation(form) {
    var _this = this;
    this.invalid = false;
    this.result = {}; // финальные данные формы

    this.collectionValidation = { // коллекция методов для валидации

        validateRequired: function () { // проверка на заполнение поля
            return this.value !== '';
        },

        validateDigit: function () { // проверка, что поле содержит только цифры
            if (this.value === '') return false;
            return /^\d+$/g.test(this.value);
        },

        validateLength: function () { // количество символов соответствует необходимой длине значения
            return this.value.length === parseInt(this.input.getAttribute('data-len'));
        },

        validateMinLength: function () { // проверка минимальной длины
            return this.value.length >= parseInt(this.input.getAttribute('data-min-length'));
        },

        validateLatin: function () { // проверка, что поле содержит только латинские буквы
            return /^[A-Za-z ]+$/.test(this.value);
        },
        validateRange: function () { // проверка, что поле содержит значение, которое соответствует одному из возможных вариантов
            var self = this;
            var array = [];
            [].slice.call(this.input.parentElement.querySelectorAll('.field__item'), 0).forEach(function (item) {
                array.push(item.getAttribute('data-value'));
            });
            return array.some(function (row) {
                return row === self.value;
            });
        }
    };

    function Input(item) { // констуктор для полей формы
        var self = this;
        this.input = item;
        this.value = this.input.value.trim();
        this.name = this.input.name;

        function cleanValidation() { // очистка классов
            self.input.classList.remove('success');
            self.input.classList.remove('error');
        }

        cleanValidation();

        this.rules = {}; // объект, который будет содержать правила валидации данного инпута

        item.getAttribute('data-validate').split(',').forEach(function (rule) { // запись правил валидации в объект rules

            if (self.input.classList.contains('error')) return; // Если поле не прошло валидацию по одному из правил,
            // то последующие правила не проверяются

            self.input.classList.remove('success'); // очистка класса об усешной валидации

            rule = rule.trim();

            var validationFunctionName = 'validate' + rule.split('-').map(function (row) { // переменная содержит название
                // метода, который проверяет форму соглано текущему правилу
                return row.slice(0, 1).toUpperCase() + row.slice(1);
            }).join('');

            self.rules[rule] = _this.collectionValidation[validationFunctionName].call(self); // вызов методов валидации
            // и запись результатов в соответствующее поле

            if (self.rules[rule]) { //
                self.input.classList.add('success')
            } else {
                self.input.classList.add('error');
                _this.invalid = true;
            }
        });

        function createResult() { // запись данных формы в объект
            if (_this.result[this.name]) { // если в объекте, такое поле уже есть, то его значение конкатенируется с предыдущим

                _this.result[this.name] = _this.result[this.name] + this.value
            } else {
                _this.result[this.name] = this.value;
            }
        }

        if (_this.invalid === false) createResult.call(this); // объект result с данными формы собирается пока при валидации формы нет ошибок
    }

    this.fields = []; // массив полей данной формы

    [].slice.call(form.querySelectorAll('input'), 0).forEach(function (field) { // итерации по каждому полю данной формы и добавление
        // поля, как объекта в массив this.fields

        _this.fields.push(new Input(field));
    });
}

var form = document.querySelector('.payment__card');

document.querySelector('.payment__btn').onclick = function (event) {

    var validationForm = new Validation(form); //
    if (validationForm.invalid) event.preventDefault(); // запрет на отправление формы
};


//_______________________ констурктор для полей с выпадающим списком

function DropDownField(field) {
    var self = this;
    this.field = field;
    this.wrap = this.field.parentElement;
    this.list = this.wrap.querySelector('.field__list');
    this.btn = this.wrap.querySelector('.card__arrow');

    this.hiddenList = function () {
        self.list.classList.remove('full-height');
    };

    this.showList = function () {
        self.list.classList.add('full-height');
    };

    this.toggleClassShow = function () {
        self.list.classList.toggle('full-height');
    };

    this.suggest = [].slice.call(this.field.parentElement.querySelectorAll('.field__item'), 0); // массив с возможными значениями

    this.suggest.forEach(function (item) { // выбор из предложенных вариантов
        item.onclick = function () {
            self.hiddenList();
            self.field.value = this.getAttribute('data-value');
        };
    });

    this.field.onblur = function () {
        // self.hiddenList();
    };

    this.field.onfocus = function () {
        self.showList();
    };
    this.field.onkeyup = function () {
        self.showList();

        if (this.value === '') {
            self.hiddenList();
        }

        self.suggest.forEach(function (item) {
            item.classList.remove('display-none');
            if (item.getAttribute('data-value').indexOf(self.field.value) === -1) {
                item.classList.add('display-none');
            }
        });
    };

    document.body.addEventListener('click', function (e) {
        if (self.field !== e.target && self.btn !== e.target) {
            self.hiddenList();
        }
    });

    this.btn.onclick = this.toggleClassShow;
}

[].slice.call(form.querySelectorAll('.field-drop-down'), 0).forEach(function (item) {
    new DropDownField(item);
});


//_______________________ табуляция между инпутами номера карты

document.querySelector('.card__wrap-number').addEventListener('input', function (e) {
    var inp = e.target;
    var inps = this.querySelectorAll('.card__field-number');
    var value = Array.prototype.map.call(inps, function (x) {
        return x.value
    }).join('');
    var i = +inp.getAttribute('data-start') + inp.selectionStart, pos = value.length;

    for (var q = 0; q < inps.length; ++q) {
        var start = +inps[q].getAttribute('data-start'), len = +inps[q].getAttribute('data-len');
        inps[q].value = value.substr(start, len);

        if (start + len >= i) {
            inp = inps[q];
            pos = i - start;
            i = NaN;
        }
    }
    inp.focus();
    inp.selectionStart = inp.selectionEnd = pos;
});

// _______________________ адаптивное меню

document.querySelector('.header__icon-menu').onclick = function () {
    document.querySelector('.menu').classList.toggle('show-menu');
};

// _______________________ запрет на ввод

[].slice.call(form.querySelectorAll('.card__field-number, .card__field-month, .card__field-year, .card__field-code'), 0).forEach(function (input) {
    input.oninput = function () {
        this.value = this.value.replace(/[^\d]/g, '');
    };

});

// _______________________ появление полного logo при наведении на левую панель

function showFullLogo() {
    var headerLogo = document.querySelector('.header__logo');
    var headerMinLogo = document.querySelector('.header__min-logo');

    document.querySelector('.left-wrap').onmouseenter = function () {
        if (getComputedStyle(headerLogo).display !== 'none') return;
        headerLogo.classList.add('show-full-logo');
        headerMinLogo.classList.add('display-none');
    };

    document.querySelector('.left-wrap').onmouseleave = function () {
        headerLogo.classList.remove('show-full-logo');
        headerMinLogo.classList.remove('display-none');
    };
};

showFullLogo();