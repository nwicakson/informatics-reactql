// it's like router
export default function Resolvers(Connectors, publicSettings) {
  return {
    Query: {
      settings() {
        const obj = publicSettings;
        obj.defaultThumbnail = Connectors.getDefaultThumbnail();
        return obj;
      },
      category(_, { term_id }) {
        return Connectors.getCategoryById(term_id);
      },
      posts(_, args) {
        return Connectors.getPosts(args);
      },
      menu(_, { name }) {
        return Connectors.getMenu(name);
      },
      post(_, { name, id }) {
        if (name) {
          return Connectors.getPostByName(name, id);
        }
        return Connectors.getPostById(id);
      },
      postmeta(_, { postId }) {
        return Connectors.getPostmeta(postId);
      },
      user(_, { id }) {
        return Connectors.getUser(id);
      },
      staffs() {
        return Connectors.getStaffs();
      },
      async session(_, args, ctx) {
        return Connectors.session(args, ctx);
      },
    },
    Mutation: {
      async login(_, args, ctx) {
        return Connectors.login(args, ctx);
      },
    },
    Category: {
      posts(category, args) {
        return Connectors.getPostsInCategory(category.term_id, args);
      },
    },
    Post: {
      layout(post) {
        return Connectors.getPostLayout(post.id);
      },
      post_meta(post, keys) {
        return Connectors.getPostmeta(post.id, keys);
      },
      thumbnail(post) {
        return Connectors.getPostThumbnail(post.id);
      },
      author(post) {
        return Connectors.getUser(post.post_author);
      },
    },
    Postmeta: {
      connecting_post(postmeta) {
        return Connectors.getPostById(postmeta.meta_value);
      },
    },
    MenuItem: {
      navitem(menuItem) {
        return Connectors.getPostById(menuItem.linkedId);
      },
    },
    Session: {
      jwt(obj) {
        return obj.session && obj.session.jwt();
      },
      user(obj) {
        return obj.session && obj.session.user_id && Connectors.getUser(obj.session.user_id);
      },
    },
  };
}
