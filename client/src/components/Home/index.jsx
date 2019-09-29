import React from "react";

import { Post } from "../../components/Blog";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

class Home extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <main role="main" className="container">
          <div className="row">
            <div className="col-md-8 blog-main">
              <h3 className="pb-4 mb-4 font-italic border-bottom">
                Straight from the horse's mouth
              </h3>
              <Post />
            </div>
            <Sidebar />
          </div>
        </main>
      </div>
    );
  }
}

export default Home;
