import React from 'react';

import { Post } from '../../components/Blog';
import { Header } from './header';

class Home extends React.Component {
  render() {
    return (
    <div>
      <Header />
      <main role="main" className="container">
        <div className="row">
          <div className="col-md-8 blog-main">
            <h3 className="pb-4 mb-4 font-italic border-bottom">
              From the Firehose
            </h3>
            <Post />
          </div>
        </div>
      </main>
    </div>
    );
  }
}

export default Home;
