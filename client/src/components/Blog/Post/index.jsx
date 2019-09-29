import React from "react";

class Post extends React.Component {
  render() {
    return (
      <div className="blog-post">
        <h2 className="blog-post-title">Sample blog post</h2>
        <p className="blog-post-meta">January 1, 2014</p>
        <p>
          This blog post shows a few different types of content that’s supported
          and styled with Bootstrap. Basic typography, images, and code are all
          supported.
        </p>
        <hr></hr>
        <blockquote>
          <p>
            Curabitur blandit tempus porttitor.{" "}
            <strong>Nullam quis risus eget urna mollis</strong> ornare vel eu
            leo. Nullam id dolor id nibh ultricies vehicula ut id elit.
          </p>
        </blockquote>
        <ol>
          <li>Vestibulum id ligula porta felis euismod semper.</li>
          <li>
            Cum sociis natoque penatibus et magnis dis parturient montes,
            nascetur ridiculus mus.
          </li>
          <li>
            Maecenas sed diam eget risus varius blandit sit amet non magna.
          </li>
        </ol>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Sed posuere
          consectetur est at lobortis.
        </p>
      </div>
    );
  }
}

export default Post;
