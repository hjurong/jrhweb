import React from "react";
import { Map } from "../../components/Blog";
import Tags from "./tags";

const Header = () => {
  return (
    <div className="container">
      <header className="blog-header py-3">
        <div className="row flex-nowrap justify-content-between align-items-center">
          <div className="col-12 text-center">
            <a className="blog-header-logo text-dark" href="/">
              The green light
            </a>
          </div>
        </div>
      </header>
      <Tags />
      <Map />
    </div>
  );
}

export default Header;