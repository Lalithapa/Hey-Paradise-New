class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.searchContainer = document.getElementById(
      'id-header-predictive-search-container',
    );
    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = document.querySelector(
      '#predictive-search-products',
    );
    this.ifsearch_emptyResults = document.querySelector('#emptySearch');
    this.ifsearch_terms = document.querySelector('#empltySearchParam');
    this.input.addEventListener(
      'input',
      this.debounce((event) => {
        this.onChange(event);
      }, 300).bind(this),
    );
  }

  onChange() {
    const searchTerm = encodeURIComponent(this.input.value.trim());
    if (!searchTerm.length) {
      this.searchContainer.style.borderBottomColor = '#FECACA';
      this.close();
      return;
    }
    this.searchContainer.style.borderBottomColor = '#d9d8d8';
    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    fetch(`/search/suggest?q=${searchTerm}&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('#shopify-section-predictive-search').innerHTML;
        this.predictiveSearchResults.innerHTML = `${resultsMarkup}`;
        if (resultsMarkup.length > 1) {
          this.open();
          this.ifsearch_terms.style.display = 'none';
        } else {
          this.close();
          this.ifsearch_terms.style.display = 'block';
        }
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  open() {
    this.predictiveSearchResults.style.display = 'block';
    this.ifsearch_emptyResults.style.setProperty(
      'display',
      'none',
      'important',
    );
  }

  close() {
    this.predictiveSearchResults.style.setProperty(
      'display',
      'none',
      'important',
    );
    this.ifsearch_emptyResults.style.display = 'flex';
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}

customElements.define('predictive-search', PredictiveSearch);
