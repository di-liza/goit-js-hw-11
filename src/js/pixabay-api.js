import axios from 'axios';
import { Notify } from 'notiflix';

export class PixabayApi {
  #API_KEY = '34900910-a3a7207292faa050babd964c9';
  #BASE_URL = 'https://pixabay.com/api/';

  query = null;
  page = 1;
  count = 40;

  async fetchPhoto() {
    return await axios.get(`${this.#BASE_URL}`, {
      params: {
        key: this.#API_KEY,
        q: this.query,
        page: this.page,
        per_page: this.count,
      },
    });
  }

  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
}
