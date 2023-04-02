export function renderMarkup(data) {
  return data
    .map(photo => {
      return `<div class="photo-card">
            <a class="photo-link" href="${photo.largeImageURL}"><img src="${photo.webformatURL}" alt="${photo.tags}" width="480" loading="lazy"/></a>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b>
                    <b>${photo.likes}</b>
                </p>
                <p class="info-item">
                    <b>Views</b>
                    <b>${photo.views}</b>
                </p>
                <p class="info-item">
                    <b>Comments</b>
                    <b>${photo.comments}</b>
                </p>
                <p class="info-item">
                    <b>Downloads</b>
                    <b>${photo.downloads}</b>
                </p>
            </div>
            </div>`;
    })
    .join('');
}
