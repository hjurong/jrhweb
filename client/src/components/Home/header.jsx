import React from 'react';

export class Header extends React.Component {
  render() {
    return (
      <div className="container">
        <header className="blog-header py-3">
          <div className="row flex-nowrap justify-content-between align-items-center">
            <div className="col-4 pt-1">
            </div>
            <div className="col-4 text-center">
              <a className="blog-header-logo text-dark" href="/">The green light</a>
            </div>
            <div className="col-4 d-flex justify-content-end align-items-center">
            </div>
          </div>
        </header>
      </div>
    );
  }
}

