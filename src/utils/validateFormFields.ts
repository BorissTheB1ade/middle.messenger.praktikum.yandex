/* eslint-disable no-console */
type ValidationPatternItem = {
    regex: RegExp,
    label: string,
    rules: string
}

const validationPatterns: Record<string, ValidationPatternItem> = {
  first_name: {
    // eslint-disable-next-line no-useless-escape
    regex: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яёЁ\-]*$/,
    label: 'Имя',
    rules: 'Латиница или кириллица, первая буква должна быть заглавной, без пробелов и без цифр, нет спецсимволов (допустим только дефис)',
  },
  second_name: {
    // eslint-disable-next-line no-useless-escape
    regex: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яёЁ\-]*$/,
    label: 'Фамилия',
    rules: 'Латиница или кириллица, первая буква должна быть заглавной, без пробелов и без цифр, нет спецсимволов (допустим только дефис)',
  },
  password: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    label: 'Пароль',
    rules: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
  },
  oldPassword: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    label: 'Старый пароль',
    rules: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
  },
  newPassword: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    label: 'Новый пароль',
    rules: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
  },
  login: {
    regex: /^(?=.*[a-zA-Z])[a-zA-Z0-9\\-_]{3,20}$/,
    label: 'Логин',
    rules: 'от 3 до 20 символов, латиница, может содержать цифры, но не состоять из них, без пробелов, без спецсимволов (допустимы дефис и нижнее подчёркивание)',
  },
  phone: {
    regex: /^(\+[0-9]{9,14}|[0-9]{10,15})$/,
    label: 'Телефон',
    rules: 'От 10 до 15 символов, состоит из цифр, может начинается с плюса.',
  },
  email: {
    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/,
    label: 'E-mail',
    rules: 'Латиница, может включать цифры и спецсимволы вроде дефиса и подчёркивания, обязательно должна быть «собака» (@) и точка после неё, но перед точкой обязательно должны быть буквы',
  },
  message: {
    regex: /^.+$/,
    label: 'Введите сообщение',
    rules: 'Не должно быть пустым',
  },
};
export default function validateFormFields(target: EventTarget | null): void {
  if (target instanceof HTMLFormElement) {
    const formData = new FormData(target);
    const formDataObject = Object.fromEntries(formData.entries());

    Object.entries(formDataObject).forEach(([key, value]) => {
      if (key !== 'avatar' && key !== 'display_name') {
        if (!validationPatterns[key].regex.test(String(value))) {
          throw new Error(`Ошибка валидации. Проверьте поле "${validationPatterns[key].label}" на соответствие правилам: "${validationPatterns[key].rules}"`);
        }
      }
    });
    console.log('Валидация пройдена. Данные: ');
    console.log(formDataObject);
  } else if (target instanceof HTMLInputElement) {
    if (!validationPatterns[target.name].regex.test(target.value)) {
      throw new Error(`Ошибка валидации. Проверьте поле "${validationPatterns[target.name].label}" на соответствие правилам: "${validationPatterns[target.name].rules}"`);
    } else {
      console.log(`Валидация поля пройдена. Данные: ${target.name}: ${target.value}`);
    }
  }
}
