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
    Menu: {
      items(menu) {
        return menu.items;
      },
    },
    MenuItem: {
      navitem(menuItem) {
        return Connectors.getPostById(menuItem.linkedId);
      },
      children(menuItem) {
        return menuItem.children;
      },
    },
    Staff: {
      name(staff) {
        return staff.name;
      },
      email(staff) {
        return staff.email;
      },
      field_of_research(staff) {
        //
        return staff.field_of_research;
      },
      last_education_degree(staff) {
        return staff.last_education_degree;
      },
      last_education_place(staff) {
        return staff.last_education_place;
      },
      position(staff) {
        return staff.position;
      },
    },
    User: {
      id(user) { return user.id; },
      user_login(user) { return user.user_login; },
      user_pass(user) { return user.user_pass; },
      user_nicename(user) { return user.user_nicename; },
      user_email(user) { return user.user_email; },
      user_registered(user) { return user.user_registered; },
      display_name(user) { return user.display_name; },
    },
    Session: {
      ok(obj) { return obj.ok; },
      errors(obj) { return obj.errors; },
      jwt(obj) { return obj.session && obj.session.jwt(); },
      user(obj) { return obj.session && obj.session.getUser(); },
    },
    Field: {
      field(obj) { return obj.field; },
      message(obj) { return obj.message; },
    },
  };
}
