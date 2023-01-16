import type {
  QueryConfig,
  RequestState,
  ResponseState
} from "@elastic/search-ui";
import Searchkit from "@searchkit/api";
import type { ClientConfig, AlgoliaMultipleQueriesQuery } from "@searchkit/api";
import { CloudHost, PostProcessRequestBodyFn } from "../../types";
// import buildConfiguration, { buildBaseFilters } from "./Configuration";
// import buildRequest from "./Request";
import buildResponse from "./Response";

interface SearchHandlerConfiguration {
  state: RequestState;
  queryConfig: QueryConfig;
  cloud?: CloudHost;
  host?: string;
  index: string;
  connectionOptions?: {
    apiKey?: string;
    headers?: Record<string, string>;
  };
  postProcessRequestBodyFn?: PostProcessRequestBodyFn;
}

export default async function handleRequest(
  configuration: SearchHandlerConfiguration
): Promise<ResponseState> {
  const {
    state,
    queryConfig,
    host,
    cloud,
    index,
    connectionOptions,
    postProcessRequestBodyFn
  } = configuration;
  const { apiKey, headers } = connectionOptions || {};

  const facetAttributes = Object.keys(queryConfig.facets)
    .map((key) => {
      const config = queryConfig.facets[key];

      if (config.type === "value") {
        return {
          field: key,
          type: "string" as const,
          attribute: key
        };
      }
      return null;
    })
    .filter((x) => x !== null);

  const searchkitConfig: ClientConfig = {
    connection: {
      host: host,
      apiKey: apiKey
    },
    search_settings: {
      search_attributes: Object.keys(queryConfig.search_fields).map((key) => {
        const config = queryConfig.search_fields[key];
        return {
          field: key,
          weight: config.weight
        };
      }),
      result_attributes: Object.keys(queryConfig.result_fields).map((key) => {
        return key;
      }),
      facet_attributes: facetAttributes,
      highlight_attributes: ["*"]
    }
  };

  const request = Searchkit(searchkitConfig);

  const disJunctiveRequests = queryConfig.disjunctiveFacets
    .filter((facet) => state.filters.find(({ field }) => field === facet))
    .map((facet) => {
      return {
        indexName: index,
        params: {
          query: state.searchTerm,
          facets: [facet],
          facetFilters: (state.filters || [])
            .filter((filter) => filter.field !== facet)
            .map((filter) => {
              return filter.values.map((value) => {
                return `${filter.field}:${value}`;
              });
            }),
          hitsPerPage: 0,
          page: 0
        }
      };
    });

  const searchRequests: AlgoliaMultipleQueriesQuery[] = [
    {
      indexName: index,
      params: {
        query: state.searchTerm,
        facets: ["*"],
        facetFilters: (state.filters || []).map((filter) => {
          return filter.values.map((value) => {
            return `${filter.field}:${value}`;
          });
        }),
        hitsPerPage: state.resultsPerPage,
        page: state.current - 1
      }
    },
    ...disJunctiveRequests
  ];

  try {
    console.log(searchRequests);
    const x = await request.handleRequest(searchRequests);
    const [main, ...disjunctive] = x.results;

    disjunctive.forEach((result) => {
      // @ts-ignore
      Object.assign(main.facets, result.facets);
    });

    const y = disjunctive.reduce((acc, result) => {
      // @ts-ignore
      return {
        ...acc,
        facets: {
          ...acc.facets,
          ...result.facets
        }
      };
    }, main);

    return buildResponse(y);
  } catch (e) {
    console.log(e);
  }

  // const searchkitVariables = buildRequest(state, queryConfig);

  // const baseFilters = buildBaseFilters(queryConfig.filters);

  // const results = await request
  //   .query(searchkitVariables.query)
  //   .setFilters(searchkitVariables.filters)
  //   .setSortBy(searchkitVariables.sort)
  //   .execute(
  //     {
  //       facets:
  //         queryConfig.facets && Object.keys(queryConfig.facets).length > 0,
  //       hits: {
  //         from: searchkitVariables.from,
  //         size: searchkitVariables.size,
  //         includeRawHit: true
  //       }
  //     },
  //     baseFilters
  //   );
}
