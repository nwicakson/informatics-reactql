// it's like router
export default function Resolvers(Connectors, publicSettings) {
  return {
    Query: {
      settings() {
        const obj = publicSettings;
        obj.defaultThumbnail = Connectors.getDefaultThumbnail();
        return obj;
      },
      category(_, { term_id: termId, slug }) {
        if (termId) return Connectors.getCategoryById(termId);
        return Connectors.getCategory(slug);
      },
      posts(_, args) {
        return Connectors.getPosts(args);
      },
      total_posts(_, args) {
        return Connectors.getTotalPosts(args);
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
      async my_post(_, { id }, ctx) {
        return Connectors.getMyPost(id, ctx);
      },
      async my_posts(_, args, ctx) {
        return Connectors.getMyPosts(args, ctx);
      },
      async my_total_posts(_, args, ctx) {
        return Connectors.getMyTotalPosts(args, ctx);
      },
      categories() {
        return Connectors.getCategories();
      },
      links() {
        return Connectors.getLinks();
      },
    },
    Mutation: {
      async login(_, args) {
        return Connectors.login(args);
      },
      async create_post(_, args, ctx) {
        return Connectors.createPost(args, ctx);
      },
      async edit_post(_, args, ctx) {
        return Connectors.editPost(args, ctx);
      },
      async delete_post(_, { id }, ctx) {
        return Connectors.deletePost(id, ctx);
      },
    },
    Category: {
      posts(category, args) {
        return Connectors.getPostsInCategory(category.term_id, args);
      },
      total_posts(category, args) {
        return Connectors.getTotalPostsInCategory(category.term_id, args);
      },
    },
    Post: {
      async categories(post) {
        return Connectors.getCategoriesByPostId(post.id);
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
        if (menuItem.object_type !== 'category') return Connectors.getPostById(menuItem.linkedId);
        return null;
      },
      navitemcategory(menuItem) {
        if (menuItem.object_type === 'category') { return Connectors.getCategoryById(menuItem.linkedId); }
        return null;
      },
    },
    Session: {
      jwt(obj) {
        return obj.user && obj.user.jwt();
      },
      user(obj) {
        return obj.user && obj.user.id && Connectors.getUser(obj.user.id);
      },
    },
  };
}
