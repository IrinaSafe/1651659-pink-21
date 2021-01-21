let button = document.querySelector('.page-header__toggle');
let nav = document.querySelector('.main-nav');
let color = document.querySelector('.page-header__head-line');
nav.classList.remove('main-nav--opened');

button.addEventListener('click', () => {
  button.classList.toggle('page-header__toggle--opened');
  nav.classList.toggle('main-nav--opened');
  color.classList.toggle('page-header__head-line--opened');
})
