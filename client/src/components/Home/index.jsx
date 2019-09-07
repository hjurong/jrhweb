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
              Straight from the horse's mouth
            </h3>
            <Post />
          </div>
          <aside class="col-md-4 blog-sidebar">
            <div class="p-4 mb-3 bg-light rounded">
              <h4 class="font-italic">About</h4>
              <p class="mb-0">
                This blog is a platform for writing about the places traversed, 
                the food savoured, the thoughts pondered, and the journies
                shared.
              </p>
            </div>

            <div class="p-4">
              <h4 class="font-italic">Archives</h4>
              <ol class="list-unstyled mb-0">
                <li><a href="#">March 2014</a></li>
                <li><a href="#">February 2014</a></li>
                <li><a href="#">January 2014</a></li>
              </ol>
            </div>
            <div class="p-4">
              <h4 class="font-italic">Elsewhere</h4>
              <ol class="list-unstyled">
                <li><a href="https://github.com/hjurong">GitHub</a></li>
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
    );
  }
}

export default Home;
