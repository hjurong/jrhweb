import React from 'react';
import { Map } from '../../components/Blog';

export class Header extends React.Component {
  render() {
    return (
      <div className="container">
        <header className="blog-header py-3">
          <div className="row flex-nowrap justify-content-between align-items-center">
            <div className="col-12 text-center">
              <a className="blog-header-logo text-dark" href="/">The green light</a>
            </div>
          </div>
        </header>
        <div class="nav-scroller py-1 mb-2">
          <nav class="nav d-flex">
            <a class="p-2 text-muted" href="#">Tag 1</a>
            <a class="p-2 text-muted" href="#">Tag 2</a>
          </nav>
        </div>
        <Map />
      </div>
    );
  }
}

