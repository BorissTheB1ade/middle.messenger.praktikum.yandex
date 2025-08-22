# Проект Messenger - Спринт 2

## Описание

На данном этапе реализовано SPA (Single Page Application) на Typescript.
Реализован компонентный поход. Добавлены линтеры кода: *eslint*
и *stylelint*. Сверстана страница с чатами.

*Для просмотра страниц в браузере пользуйтесь навигационными ссылками вверху экрана*

## Функционал

1) Добавлена возможность отправки форм (пока без бекенда)
2) В проекте реализована валидация форм через RegExp при отправке и при снятии фокуса. 
При успешном прохождении валидации данные из формы выводятся в консоль
3) Добавлена возможность прикрепления аватарки в Настройках пользователя
4) Добавлен класс для работы с API через XMLHttpRequest (без использования *fetch* и *axios*)

## Figma

Макеты страниц в [Figma](https://www.figma.com/design/QsRWb0YdpL9gF1JGpR68Ir/Sprint_1?node-id=0-1&t=vrBrbnodClsUejpx-1)

## Запуск проекта

1. Склонируйте репозиторий
2. Установите зависимости:
```bash
   npm install
   ```
3. Запуск в dev режиме:
```bash
   npm run dev
   ```
4. Запуск линтинга кода (опционально):
```bash
   npm run lint
   ```
5. Сборка и автозапуск проекта после сборки:
```bash
   npm run start
   ```

## Netlify
Настроен автодеплой на ресурсе [Netlify](https://scintillating-lamington-ac8ea7.netlify.app)

Netlify Deploy Status: [![Netlify Status](https://api.netlify.com/api/v1/badges/67a4ab37-6f6e-4bc3-b617-027187af389b/deploy-status)](https://app.netlify.com/projects/scintillating-lamington-ac8ea7/deploys)
