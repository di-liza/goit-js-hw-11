import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import '../sass/index.scss';
import { PixabayApi } from './pixabay-api';
import { refs } from './refs';
import { renderMarkup } from './renderGallery';
const debounce = require('lodash.debounce');

const pixabayApi = new PixabayApi();

refs.switcher.addEventListener('change', switcherOn);

function switcherOn() {
  window.addEventListener('scroll', debounce(onWindowScroll, 300));
}
function onWindowScroll() {
  refs.loaderEllips.classList.remove('hidden');
  refs.loadMoreBtnEl.classList.add('hidden');
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadMore();
  }
}

refs.searchFormEl.addEventListener('submit', handlerSearchFromSubmit);
refs.searchFormInputEl.addEventListener('input', () =>
  refs.loadMoreBtnEl.classList.add('hidden')
);

refs.loadMoreBtnEl.addEventListener('click', loadMore);

let galleryLightbox = new SimpleLightbox('.gallery .photo-link', {
  captionDelay: 250,
  captionsData: 'alt',
});

function handlerSearchFromSubmit(event) {
  pixabayApi.resetPage();
  event.preventDefault();
  if (!refs.searchFormInputEl.value.trim()) {
    return;
  }
  pixabayApi.query = refs.searchFormInputEl.value.trim();

  getPhotos();
  refs.galleryEl.innerHTML = '';
  refs.searchFormInputEl.value = '';
}

async function loadMore() {
  try {
    pixabayApi.incrementPage();
    const { data } = await pixabayApi.fetchPhoto();
    checkTotalHits(data);
    refs.galleryEl.insertAdjacentHTML('beforeend', renderMarkup(data.hits));
    smoothScrollAfterLoadMore();
    galleryLightbox.refresh();
  } catch (error) {
    console.log(error);
    refs.loadMoreBtnEl.classList.add('hidden');
  }
}

async function getPhotos() {
  try {
    const { data } = await pixabayApi.fetchPhoto();
    checkTotalHits(data);
    if (data.hits.length !== 0) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      // refs.loadMoreBtnEl.classList.remove('hidden');
    }

    if (data.hits.length === 0) {
      refs.loadMoreBtnEl.classList.add('hidden');
      throw new Error();
    }

    refs.galleryEl.insertAdjacentHTML('beforeend', renderMarkup(data.hits));
    smoothScrollAfterLoadMore();
    galleryLightbox.refresh();
  } catch (error) {
    console.log(error);
    refs.loadMoreBtnEl.classList.add('hidden');
    refs.loaderEllips.classList.add('hidden');
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function checkTotalHits(data) {
  if (Math.ceil(data.totalHits / 40) <= pixabayApi.page) {
    if (data.hits.length === 0) {
      refs.loadMoreBtnEl.classList.add('hidden');
      throw new Error();
    }
    refs.loadMoreBtnEl.classList.add('hidden');
    refs.loaderEllips.style.display = 'none';
    return Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
  }
  if (data.totalHits >= 40) {
    refs.loadMoreBtnEl.classList.remove('hidden');
  }
}

function smoothScrollAfterLoadMore() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
    scroll: function () {},
  });
}
