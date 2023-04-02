import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import '../sass/index.scss';
import { PixabayApi } from './pixabay-api';
import { refs } from './refs';
import { renderMarkup } from './renderGallery';
import InfiniteScroll from 'infinite-scroll';

const pixabayApi = new PixabayApi();

refs.searchFormEl.addEventListener('submit', handlerSearchFromSubmit);
refs.searchFormInputEl.addEventListener('input', handlerSearchInput);
refs.loadMoreBtnEl.addEventListener('click', handleMoreBtnClick);

let galleryLightbox = new SimpleLightbox('.gallery .photo-link', {
  captionDelay: 250,
  captionsData: 'alt',
});

function handlerSearchFromSubmit(event) {
  pixabayApi.resetPage();
  event.preventDefault();
  if (!refs.searchFormInputEl.value.trim()) {
    return Notiflix.Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  refs.loadMoreBtnEl.classList.remove('hidden');
  pixabayApi.query = refs.searchFormInputEl.value.trim();
  getPhotos();
  refs.galleryEl.innerHTML = '';
  refs.searchFormInputEl.value = '';
}

function handleMoreBtnClick() {
  (async () => {
    try {
      pixabayApi.incrementPage();
      const { data } = await pixabayApi.fetchPhoto();
      checkTotalHits(data);

      refs.galleryEl.insertAdjacentHTML('beforeend', renderMarkup(data.hits));
      smoothScrollAfterLoadMore();
      galleryLightbox.refresh();
    } catch (error) {
      console.log(error);
    }
  })();
}

async function getPhotos() {
  try {
    const { data } = await pixabayApi.fetchPhoto();
    checkTotalHits(data);
    if (data.hits.length === 0) {
      return Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    refs.galleryEl.insertAdjacentHTML('beforeend', renderMarkup(data.hits));
    smoothScrollAfterLoadMore();
    galleryLightbox.refresh();
  } catch (error) {
    console.log(error);
  }
}

function handlerSearchInput() {
  refs.loadMoreBtnEl.classList.add('hidden');
}

function checkTotalHits(data) {
  if (data.totalHits < 500) {
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
    refs.loadMoreBtnEl.classList.add('hidden');
    return;
  }
  Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
}

function smoothScrollAfterLoadMore() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
