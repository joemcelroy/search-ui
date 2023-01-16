import type { AutocompletedResult, SearchResult } from "@elastic/search-ui";
// import { SearchkitHit } from "@searchkit/sdk";

export function fieldResponseMapper(
  item: any
): SearchResult | AutocompletedResult {
  const { _highlightResult = {}, ...fields } = item;

  return Object.keys(fields).reduce(
    (acc, key) => {
      return {
        ...acc,
        [key]: {
          ...(fields[key] ? { raw: fields[key] } : {}),
          ...(_highlightResult[key]
            ? {
                snippet: Array.isArray(_highlightResult[key])
                  ? _highlightResult[key].map(({ value }) => value)
                  : _highlightResult[key].value
              }
            : {})
        }
      };
    },
    {
      id: { raw: item.objectID },
      _meta: {
        id: item.objectID,
        rawHit: item.rawHit
      }
    }
  );
}

export default {};
