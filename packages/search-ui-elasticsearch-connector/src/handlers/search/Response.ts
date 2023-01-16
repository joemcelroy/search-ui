import type { ResponseState } from "@elastic/search-ui";

import { fieldResponseMapper } from "../common";

function SearchResponse(results: any): ResponseState {
  debugger;
  const facets = Object.keys(results.facets || {}).reduce((acc, key) => {
    const facet = results.facets[key];
    return {
      ...acc,
      [key]: [
        {
          data: Object.keys(facet).map((entryLabel) => ({
            value: entryLabel,
            count: facet[entryLabel]
          })),
          type: "value"
        }
      ]
    };
  }, {});

  const pageEnd = (results.page + 1) * results.hitsPerPage;

  const response: ResponseState = {
    resultSearchTerm: results.query,
    totalPages: Math.ceil(results.nbHits / results.hitsPerPage),
    pagingStart: results.page * results.hitsPerPage + 1,
    pagingEnd: pageEnd > results.nbHits ? results.nbHits : pageEnd,
    wasSearched: false,
    totalResults: results.nbHits,
    facets,
    results: results.hits.map(fieldResponseMapper),
    requestId: null,
    rawResponse: null
  };
  return response;
}

export default SearchResponse;
