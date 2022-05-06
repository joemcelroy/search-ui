import * as React from "react";
import { Switch, Route } from "react-router-dom";
import Root from "./pages/root";
import Elasticsearch from "./pages/elasticsearch";
import ElasticsearchEcommerce from "./pages/elasticsearch-ecommerce";
import AppSearch from "./pages/app-search";
import SiteSearch from "./pages/site-search";
import WorkplaceSearch from "./pages/workplace-search";
import SearchAsYouType from "./pages/search-as-you-type";

export default function Router() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <Root />
        </Route>
        <Route exact path="/elasticsearch">
          <Elasticsearch />
        </Route>
        <Route exact path="/elasticsearch-ecommerce">
          <ElasticsearchEcommerce />
        </Route>
        <Route exact path="/app-search">
          <AppSearch />
        </Route>
        <Route exact path="/site-search">
          <SiteSearch />
        </Route>
        <Route exact path="/workplace-search">
          <WorkplaceSearch />
        </Route>
        <Route exact path="/search-as-you-type">
          <SearchAsYouType />
        </Route>
      </Switch>
    </div>
  );
}
