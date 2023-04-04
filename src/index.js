import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import './sass/index.scss';
import { PixabayApi } from './js/pixabay-api';
import { refs } from './js/refs';
import { renderMarkup } from './js/renderGallery';

const pixabayApi = new PixabayApi();
let isDataRecived = false;
let isAEndCollection = false;

refs.switcher.addEventListener('change', attachScrollListener);
refs.searchFormEl.addEventListener('submit', handleSearchFormSubmit);
refs.searchFormInputEl.addEventListener('input', () =>
  refs.loadMoreBtnEl.classList.add('hidden')
);
refs.loadMoreBtnEl.addEventListener('click', loadMore);

function attachScrollListener() {
  window.addEventListener('scroll', onWindowScroll);
}
function onWindowScroll() {
  refs.loaderEllips.classList.remove('hidden');
  refs.loadMoreBtnEl.classList.add('hidden');
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (
    scrollTop + clientHeight >= scrollHeight - 10 &&
    !isDataRecived &&
    refs.switcher.checked
  ) {
    loadMore();
  }
  if (!refs.switcher.checked && !isAEndCollection) {
    window.removeEventListener('scroll', onWindowScroll);
    refs.loaderEllips.style.display = 'none';
    refs.loadMoreBtnEl.style.display = 'block';
  }
  if (refs.switcher.checked) {
    refs.loaderEllips.style.display = 'block';
    refs.loadMoreBtnEl.style.display = 'none';
  }
}

let galleryLightbox = new SimpleLightbox('.gallery .photo-link', {
  captionDelay: 250,
  captionsData: 'alt',
});

function handleSearchFormSubmit(event) {
  pixabayApi.resetPage();
  event.preventDefault();
  pixabayApi.query = refs.searchFormInputEl.value.trim();

  if (!pixabayApi.query) {
    return;
  }

  getPhotos();
  refs.galleryEl.innerHTML = '';
  refs.searchFormInputEl.value = '';
}

async function loadMore() {
  if (isDataRecived) {
    return;
  }
  isDataRecived = true;

  try {
    pixabayApi.incrementPage();
    const { data } = await pixabayApi.fetchPhoto();
    checkTotalHits(data);
    refs.galleryEl.insertAdjacentHTML('beforeend', renderMarkup(data.hits));
    smoothScrollAfterLoadMore();
    galleryLightbox.refresh();
    isDataRecived = false;
  } catch (error) {
    console.log(error);
    refs.loadMoreBtnEl.classList.add('hidden');
  }
}

async function getPhotos() {
  try {
    const { data } = await pixabayApi.fetchPhoto();
    if (data.hits.length !== 0) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    if (data.hits.length === 0) {
      refs.loadMoreBtnEl.classList.add('hidden');
      throw new Error();
    }
    checkTotalHits(data);

    refs.galleryEl.insertAdjacentHTML('beforeend', renderMarkup(data.hits));
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
  if (data.totalHits / 40 <= pixabayApi.page) {
    window.removeEventListener('scroll', onWindowScroll);
    isAEndCollection = true;
    refs.loaderEllips.style.display = 'none';
    refs.loadMoreBtnEl.style.display = 'none';
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
