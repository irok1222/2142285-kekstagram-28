import {isEscapeKey, showAlert} from './util.js';
import {resetScale} from './scale.js';
import {resetEffect} from './effect.js';
import {showSuccessMessage, showErrorMessage} from './message.js';
import { sendPhoto } from './api.js';


const maxTagCount = 5;
const uploadFile = document.querySelector('#upload-file');//загрузки файла
const uploadСancel = document.querySelector('#upload-cancel');// закрытие файла
const imgUploadOverlay = document.querySelector('.img-upload__overlay');
const form = document.querySelector('.img-upload__form');
const hashtageField = document.querySelector('.text__hashtags');
const commentField = document.querySelector('.text__description');
const sendButton = document.querySelector('.img-upload__submit');//кнопка публикации

const SubmitButtonText = {
  IDLE: 'ОПУБЛИКОВАТЬ',
  SENDING: 'ОПУБЛИКОВАТЬ...'
};

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'img-upload__field-wrapper--invalid',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'img-upload__field-wrapper--error',
});

const onDocumentKeydown = (evt) => { // выносим функцию для обработчика
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    closeimgUpload ();
  }
};

const stopFocus = (evt) => {
  if (isEscapeKey(evt)) {
    evt.stopPropagation();
  }
};

function openimgUpload () { // функция для удаления класса и добавления обработчика
  imgUploadOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
}

function closeimgUpload () { // функция для добавления класса и удаления обработчика
  imgUploadOverlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
  form.reset();// сбрасываем поля формы
  pristine.reset();
  resetScale();
  resetEffect();
}

uploadFile.addEventListener('change', () => { //добавляем класс hidden прячем модалку
  openimgUpload();
});

uploadСancel.addEventListener('click', () => {//добавляем класс hidden прячем модалку
  form.reset();// сбрасываем поля формы
  pristine.reset();
  resetScale();
  resetEffect();
  closeimgUpload();
});

hashtageField.addEventListener('keydown',stopFocus);//убираем закрытие через esc
commentField.addEventListener('keydown',stopFocus);//убираем закрытие через esc

const hashtag = /#[a-zа-яё0-9]{1,19}/i;
const getHashTags = (value) => value.replace(/ +/g, ' ').trim().split(' ');

const isValidTag = (value) => {
  if (value.length === 0) {
    return true;
  }
  const hashTags = getHashTags(value);
  return hashTags.every((hashTag) => hashtag.test(hashTag));
};

const validTagCount = (tags) => {// проверяем количество тегов
  const lengthTag = tags.trim().split(' ');
  return lengthTag.length <= maxTagCount;
};

const validTagUnique = (tags) => { //проверяем на уникальность
  const hashtagArray = tags.trim().split(' ');
  const uniqueTags = [];
  for (let i = 0; i < hashtagArray.length; i++) {
    if(!uniqueTags.includes(hashtagArray[i])) {
      uniqueTags.push(hashtagArray[i]);
    }
  }
  return uniqueTags.length === hashtagArray.length;
};

pristine.addValidator(hashtageField, isValidTag, 'Хэштег введен неверно');
pristine.addValidator(hashtageField, validTagCount, 'Количество хэштегов больше 5');
pristine.addValidator(hashtageField, validTagUnique, 'Хэштеги повторяются');


const validateComment = (string) => string.length <= 140; // проверяем длину строки
pristine.addValidator(commentField, validateComment,'Максимальная длина 140 символов');


const blockSubmitButton = () => {
  sendButton.disabled = true;
  sendButton.textContent = SubmitButtonText.SENDING;
};

const unblockSubmitButton = () => {
  sendButton.disabled = false;
  sendButton.textContent = SubmitButtonText.IDLE;
};


const setUserFormSubmit = (onSuccess) => {
  form.addEventListener('submit',(evt) => {
    evt.preventDefault();

    const isValid = pristine.validate();
    if (isValid) {
      blockSubmitButton();

      sendPhoto(new FormData(evt.target))
        .then(onSuccess)
        .catch(
          (err) => {
            showAlert(err.message);
            showErrorMessage();
          }
        )
        .finally(unblockSubmitButton);
    }
  });
};

const loadSussecs = () => {
  showSuccessMessage();
  closeimgUpload();
};

export {openimgUpload, stopFocus, setUserFormSubmit, closeimgUpload, loadSussecs, onDocumentKeydown};
