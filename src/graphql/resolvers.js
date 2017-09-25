export default function Resolvers(Connectors, publicSettings) {
  const Resolvers = {
    Query: {
      settings() {
        return publicSettings
      },
      category(_, { term_id }) {
        return Connectors.getCategoryById(term_id)
      },
      posts(_, args) {
        return Connectors.getPosts(args)
      },
      menu(_, {name}) {
        return Connectors.getMenu(name)
      },
      post(_, {name, id}) {
        if (name) {
          return Connectors.getPostByName(name, id)
        }
        return Connectors.getPostById(id)
      },
      postmeta(_, {postId}) {
        return Connectors.getPostmeta(postId)
      },
      user(_, {userId}) {
        return Connectors.getUser(userId)
      },
      staffs(_) {
        return Connectors.getStaffs()
      }
    },
    Category: {
      posts(category, args) {
        return Connectors.getPostsInCategory(category.term_id, args)
      }
    },
    Post: {
      layout(post) {
        return Connectors.getPostLayout(post.id)
      },
      post_meta(post, keys) {
        return Connectors.getPostmeta(post.id, keys)
      },
      thumbnail(post) {
        return Connectors.getPostThumbnail(post.id)
      },
      author(post) {
        return Connectors.getUser(post.post_author)
      }
    },
    Postmeta: {
      connecting_post(postmeta) {
        return Connectors.getPostById(postmeta.meta_value)
      }
    },
    Menu: {
      items(menu) {
        return menu.items
      }
    },
    MenuItem: {
      navitem(menuItem) {
        return Connectors.getPostById(menuItem.linkedId)
      },
      children(menuItem) {
        return menuItem.children
      }
    },
    Staff: {
      name(staff) {
        return staff.name
      },
      email(staff) {
        return staff.email
      },
      field_of_research(staff) {
        return staff.field_of_research
      },
      last_education_degree(staff) {
        return staff.last_education_degree
      },
      last_education_place(staff) {
        return staff.last_education_place
      },
      position(staff) {
        return staff.position
      }
    }
  }

  return Resolvers
}
