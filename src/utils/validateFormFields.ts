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
    rules: 'От 3 до 20 символов, латиница, может содержать цифры, но не состоять из них, без пробелов, без спецсимволов (допустимы дефис и нижнее подчёркивание)',
  },
  phone: {
    regex: /^(\+[0-9]{9,14}|[0-9]{10,15})$/,
    label: 'Телефон',
    rules: 'От 10 до 15 символов, состоит из цифр, может начинаться с плюса.',
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

function showError(input: HTMLInputElement, message: string): void {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.style.width = '485px';
  errorElement.style.color = 'red';
  errorElement.style.fontSize = '10px';
  errorElement.style.marginTop = '4px';
  errorElement.textContent = message;

  errorElement.classList.add('input-error');

  input.parentNode?.insertBefore(errorElement, input.nextSibling);

  input.classList.add('input-error-field');
}

function clearErrorMessages(form: HTMLFormElement): void {
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach((error) => error.remove());

  const errorInputs = form.querySelectorAll('.input-error-field');
  errorInputs.forEach((input) => input.classList.remove('input-error-field'));
}

function clearErrorMessage(input: HTMLInputElement): void {
  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.remove();
  }
  input.classList.remove('input-error-field');
}

export default function validateFormFields(target: EventTarget | null): void {
  let isValid = true;

  if (target instanceof HTMLFormElement) {
    const formData = new FormData(target);
    const formDataObject = Object.fromEntries(formData.entries());
    clearErrorMessages(target);

    Object.entries(formDataObject).forEach(([key, value]) => {
      if (key !== 'avatar' && key !== 'display_name' && key !== 'message') {
        const input = target.elements.namedItem(key) as HTMLInputElement;
        if (input && !validationPatterns[key]?.regex.test(String(value))) {
          showError(input, validationPatterns[key].rules);
          isValid = false;
        }
      }
    });

    if (isValid) {
      console.log('Валидация пройдена. Данные: ');
      console.log(formDataObject);
    }
  } else if (target instanceof HTMLInputElement) {
    clearErrorMessage(target);
    if (target.name !== 'avatar' && target.name !== 'display_name' && target.name !== 'message') {
      if (!validationPatterns[target.name].regex.test(target.value)) {
        showError(target, validationPatterns[target.name].rules);
        isValid = false;
      }
    }
  }
}
