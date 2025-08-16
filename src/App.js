import Handlebars from "handlebars";
import { LoginPage } from "./pages/login";
import { ErrorPage } from "./pages/error";
import { Header } from "./partials/header";
import { Link } from "./partials/link";
import { RegisterPage } from "./pages/register";
import { SubmitBtn } from "./partials/button";
import { UserSettingsPage } from "./pages/userSettings";
import { ChangePasswordPage } from "./pages/changePassword";
import { ChatPage } from "./pages/chat";

Handlebars.registerPartial('Header', Header)
Handlebars.registerPartial('Link', Link)
Handlebars.registerPartial('SubmitBtn', SubmitBtn)


export default class App {
    constructor() {
        this.appIdEl = document.getElementById('app')
        this.currentPage = 'login'
        this.headerLinks = [
            {
                page: 'login',
                text: 'Вход'
            },
            {
                page: 'register',
                text: 'Регистрация'
            },
            {
                page: 'clientError',
                text: 'Ошибка клиента'
            },
            {
                page: 'serverError',
                text: 'Ошибка сервера'
            },
            {
                page: 'userSettings',
                text: 'Настройки пользователя'
            },
            {
                page: 'changePassword',
                text: 'Смена пароля'
            },
            {
                page: 'chat',
                text: 'Чат'
            },
        ]
    }


    render() {
        let template;
        switch (this.currentPage) {
            case 'login':
                template = Handlebars.compile(LoginPage);
                this.appIdEl.innerHTML = template({
                    headerLinks: this.headerLinks,
                    loginFormTitle: 'Вход',
                    loginFormFields: [
                        {
                            label: 'Логин',
                            name: 'login',
                            placeholder: 'Jazz123'
                        },
                        {
                            label: 'Пароль',
                            name: 'password',
                            placeholder: ''
                        }
                    ]
                })
                break;
            case 'serverError':
                template = Handlebars.compile(ErrorPage);
                this.appIdEl.innerHTML = template({
                    headerLinks: this.headerLinks,
                    errorCode: 500,
                    errorMessage: 'Уже исправляем...'
                });
                break;
            case 'clientError':
                template = Handlebars.compile(ErrorPage);
                this.appIdEl.innerHTML = template({
                    headerLinks: this.headerLinks,
                    errorCode: 404,
                    errorMessage: 'Упс! Не туда попали...'
                });
                break;

            case 'register':
                template = Handlebars.compile(RegisterPage);
                this.appIdEl.innerHTML = template({
                    headerLinks: this.headerLinks,
                    registerFormTitle: 'Регистрация',
                    registerFormFields: [
                        {
                            label: 'Имя',
                            name: 'first_name',
                            placeholder: 'Иван'
                        },
                        {
                            label: 'Фамилия',
                            name: 'second_name',
                            placeholder: 'Иванов'
                        },
                        {
                            label: 'Логин',
                            name: 'login',
                            placeholder: 'Jazz123'
                        },
                        {
                            label: 'E-mail',
                            name: 'email',
                            placeholder: 'email@example.ru'
                        },
                        {
                            label: 'Пароль',
                            name: 'password',
                            placeholder: ''
                        },
                        {
                            label: 'Телефон',
                            name: 'phone',
                            placeholder: '+79999999999'
                        },
                    ]
                })
                break;

                case 'userSettings':
                template = Handlebars.compile(UserSettingsPage);
                this.appIdEl.innerHTML = template({
                    headerLinks: this.headerLinks,
                    userSettingsFormTitle: 'Настройки пользователя',
                    userSettingsFormFields: [
                        {
                            label: 'Имя',
                            name: 'first_name',
                            value: 'Иван'
                        },
                        {
                            label: 'Фамилия',
                            name: 'second_name',
                            value: 'Иванов'
                        },
                        {
                            label: 'Логин',
                            name: 'login',
                            value: 'Jazz123'
                        },
                        {
                            label: 'Отображаемое имя',
                            name: 'display_name',
                            value: 'Иван Иванов'
                        },
                        {
                            label: 'E-mail',
                            name: 'email',
                            value: 'email@example.ru'
                        },
                        {
                            label: 'Телефон',
                            name: 'phone',
                            value: '+79999999999'
                        },
                    ]
                })
                break;

                case 'changePassword':
                template = Handlebars.compile(ChangePasswordPage);
                this.appIdEl.innerHTML = template({
                    headerLinks: this.headerLinks,
                    changePasswordFormTitle: 'Смена пароля',
                    changePasswordFormFields: [
                        {
                            label: 'Старый пароль',
                            name: 'oldPassword',
                            placeholder: ''
                        },
                        {
                            label: 'Новый пароль',
                            name: 'newPassword',
                            placeholder: ''
                        }
                    ]
                })
                break;

                case 'chat':
                template = Handlebars.compile(ChatPage);
                this.appIdEl.innerHTML = template({
                    headerLinks: this.headerLinks,
                    chatsList: [
                        {
                            username: 'Иван Иванов',
                            otherInfo: 'Привет! Когда собираемся на шашлыки?',
                        },
                        {
                            username: 'Петр Петров',
                            otherInfo: 'Добрый день!',
                        },
                    ]
                })
                break;
        }
        this.goToListener()
    }

    goTo(page) {
        this.currentPage = page
        this.render()
    }

    goToListener() {
        const links = document.querySelectorAll('.header-link');
        links.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                console.log(event.target.href)
                this.goTo(event.target.href.split('/')[3])
            })
        })
    }
}
