import React from "react";

export class Sidebar extends React.Component {
  render() {
    return (
      <aside className="col-md-4 blog-sidebar">
        <div className="p-4 mb-3 bg-light rounded">
          <h4 className="font-italic">About</h4>
          <p className="mb-0">
            This blog is a platform for writing about the places traversed, the
            food savoured, the thoughts pondered, and the journies shared.
          </p>
        </div>
        <div className="p-4">
          <h4 className="font-italic">Archives</h4>
          <ol className="list-unstyled mb-0">
            <li>
              <a href="#">March 2014</a>
            </li>
            <li>
              <a href="#">February 2014</a>
            </li>
            <li>
              <a href="#">January 2014</a>
            </li>
          </ol>
        </div>
        <div className="p-4">
          <h4 className="font-italic">Elsewhere</h4>
          <ol className="list-unstyled">
            <li>
              <a href="https://github.com/hjurong">GitHub</a>
            </li>
          </ol>
        </div>
      </aside>
    );
  }
}
